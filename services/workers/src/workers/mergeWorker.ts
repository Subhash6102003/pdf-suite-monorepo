import { Worker } from 'bullmq';
import { PrismaClient } from '@prisma/client';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs/promises';

const prisma = new PrismaClient();

export const mergeWorker = new Worker('pdf:merge', async job => {
  const { jobId, filePaths } = job.data;
  const dirPath = path.dirname(filePaths[0]);
  const finalPath = path.join(dirPath, 'final.pdf');

  try {
    // Implement merging logic
    await fs.writeFile(finalPath, '%PDF-1.4 Mock Merged PDF');
    const finalSize = (await fs.stat(finalPath)).size;

    const downloadToken = uuidv4();
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1h

    await prisma.processingResult.create({
      data: { id: downloadToken, jobId, filePath: finalPath, expiresAt }
    });

    await prisma.processingJob.update({
      where: { id: jobId },
      data: { status: 'COMPLETED', output_size_bytes: finalSize }
    });
  } catch (error: any) {
    await prisma.processingJob.update({ where: { id: jobId }, data: { status: 'FAILED' } });
    throw error;
  }
}, { connection: { url: process.env.REDIS_URL || 'redis://localhost:6379' }, concurrency: 10 });
