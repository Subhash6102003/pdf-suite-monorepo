import { Worker, Job } from 'bullmq';
import { PrismaClient } from '@prisma/client';
import path from 'path';
import fs from 'fs/promises';
import { v4 as uuidv4 } from 'uuid';
import { QpdfProcessor } from '../processing/qpdfProcessor';
import { SharpProcessor } from '../processing/sharpProcessor';
import {
  measureFileBytes,
  assertValidPdf,
  assertPageCount,
  getPdfPageCount,
} from '../verification/pdfVerifier';

const prisma = new PrismaClient();

const RESULTS_TMP_DIR = process.env.RESULTS_TMP_DIR ?? '/tmp/pdf-suite-results';

interface CompressJobData {
  jobId: string;
  inputPath: string;
  level: 'recommended' | 'balanced' | 'maximum';
  target_size_bytes?: number;
  inputPageCount: number; // passed from API route when job is created
}

export const compressWorker = new Worker<CompressJobData>(
  'pdf:compress',
  async (job: Job<CompressJobData>) => {
    const { jobId, inputPath, level, target_size_bytes, inputPageCount } = job.data;
    const jobDir = path.dirname(inputPath);
    const stage1Path = path.join(jobDir, 'stage1.pdf');
    const finalPath = path.join(jobDir, 'final.pdf');

    let bestEffortSizeBytes: number | undefined;
    let iterationsUsed = 0;

    try {
      // === STAGE: PROCESSING ===
      await prisma.processingJob.update({
        where: { id: jobId },
        data: { status: 'PROCESSING', processingStartedAt: new Date() },
      });

      // Measure exact input size from disk — never trust client-reported size
      const inputSize = await measureFileBytes(inputPath);

      // Stage 1: Structural compression via qpdf
      // Using args array (never shell string) — prevents command injection
      await QpdfProcessor.compress(inputPath, stage1Path);
      const stage1Size = await measureFileBytes(stage1Path);

      let currentOutputPath = stage1Path;
      let currentSize = stage1Size;

      // Stage 2: Image downsampling if target size specified or level requires it
      if (target_size_bytes && currentSize > target_size_bytes) {
        const result = await SharpProcessor.downsampleIterative(
          stage1Path,
          finalPath,
          target_size_bytes
        );
        iterationsUsed = result.iterations;
        bestEffortSizeBytes = result.actualSizeBytes;

        if (!result.targetAchieved) {
          // Clean up and report TARGET_UNREACHABLE with the best effort size
          await cleanup([inputPath, stage1Path, finalPath], jobDir);

          const err = Object.assign(
            new Error('TARGET_UNREACHABLE'),
            { bestEffortSizeBytes: result.actualSizeBytes }
          );

          await prisma.processingJob.update({
            where: { id: jobId },
            data: {
              status: 'FAILED',
              errorCode: 'TARGET_UNREACHABLE',
              errorMessageInternal: `Target ${target_size_bytes} bytes not achieved. Best: ${result.actualSizeBytes} bytes after ${iterationsUsed} iterations.`,
              completedAt: new Date(),
            },
          });
          throw err;
        }

        currentOutputPath = finalPath;
        currentSize = result.actualSizeBytes;
      } else if (level === 'balanced' || level === 'maximum') {
        // Balanced/Maximum: apply image downsampling even without specific target
        const targetForLevel = level === 'maximum'
          ? Math.floor(stage1Size * 0.5)  // aim for 50% reduction
          : Math.floor(stage1Size * 0.7); // aim for 30% reduction

        const result = await SharpProcessor.downsampleIterative(
          stage1Path,
          finalPath,
          targetForLevel
        );

        currentOutputPath = finalPath;
        currentSize = result.actualSizeBytes;
      } else {
        // Recommended level: structural compression only (stage1 is final)
        await fs.copyFile(stage1Path, finalPath);
        currentOutputPath = finalPath;
        currentSize = stage1Size;
      }

      // === STAGE: VALIDATING ===
      await prisma.processingJob.update({
        where: { id: jobId },
        data: { status: 'VALIDATING' },
      });

      // Validate output PDF structure
      await assertValidPdf(currentOutputPath);

      // Assert page count has not changed — this must never change during compression
      await assertPageCount(currentOutputPath, inputPageCount, 'compression');

      // Measure final output size from disk (EXACT — this is what we display to the user)
      const finalOutputSize = await measureFileBytes(currentOutputPath);

      // === STAGE: COMPLETED ===
      const downloadToken = uuidv4() + uuidv4(); // 72-char random token
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

      // Store result with randomized storage_key (never expose to client)
      const storageKey = `jobs/${jobId}/final.pdf`;
      await fs.mkdir(path.join(RESULTS_TMP_DIR, jobId), { recursive: true });
      await fs.copyFile(currentOutputPath, path.join(RESULTS_TMP_DIR, jobId, 'output.pdf'));

      await prisma.processingResult.create({
        data: {
          jobId,
          storageKey,
          downloadToken,
          tokenExpiresAt: expiresAt,
          maxDownloads: 5,
        },
      });

      const processingDurationMs = Date.now() - (job.timestamp ?? Date.now());

      await prisma.processingJob.update({
        where: { id: jobId },
        data: {
          status: 'COMPLETED',
          actualOutputSizeBytes: BigInt(finalOutputSize),
          outputPageCount: inputPageCount,
          processingDurationMs,
          completedAt: new Date(),
          expiresAt,
        },
      });

      // Clean up input + intermediate files (results stored separately)
      await cleanup([inputPath, stage1Path, finalPath], jobDir);

      return {
        jobId,
        actualInputSizeBytes: inputSize,
        actualOutputSizeBytes: finalOutputSize,
        downloadToken,
        savingsPct: ((inputSize - finalOutputSize) / inputSize) * 100,
      };

    } catch (error: unknown) {
      const err = error as Error & { code?: string; bestEffortSizeBytes?: number };

      // Don't double-update if we already set FAILED above
      if (err.message !== 'TARGET_UNREACHABLE') {
        await prisma.processingJob.update({
          where: { id: jobId },
          data: {
            status: 'FAILED',
            errorCode: err.code ?? 'PROCESSING_ERROR',
            // IMPORTANT: errorMessageInternal is NEVER sent to clients
            errorMessageInternal: err.message,
            completedAt: new Date(),
          },
        }).catch(() => { /* ignore DB errors during error handling */ });
      }

      // Clean up temp files
      await cleanup([inputPath, stage1Path, finalPath], jobDir);

      throw error;
    }
  },
  {
    connection: { url: process.env.REDIS_URL ?? 'redis://localhost:6379' },
    concurrency: 8,
    removeOnComplete: { age: 3600 }, // keep completed job records for 1h
    removeOnFail: { age: 86400 },    // keep failed job records for 24h
  }
);

async function cleanup(files: string[], jobDir: string): Promise<void> {
  // Remove individual temp files
  await Promise.all(
    files.map(f => fs.unlink(f).catch(() => { /* file may not exist */ }))
  );
  // Remove the job directory if empty
  await fs.rmdir(jobDir).catch(() => { /* may not be empty or may not exist */ });
}

// Log worker errors (never surface to user)
compressWorker.on('failed', (job, err) => {
  console.error(`Compress job ${job?.data.jobId} failed:`, {
    error_code: (err as Error & { code?: string }).code,
    // Never log: file contents, document text, user data
  });
});
