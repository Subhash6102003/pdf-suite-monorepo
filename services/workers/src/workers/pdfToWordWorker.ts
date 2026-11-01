import { Worker } from 'bullmq';
import { spawn } from 'child_process';
import { PrismaClient } from '@prisma/client';
import path from 'path';

const prisma = new PrismaClient();

export const pdfToWordWorker = new Worker('convert:pdf-to-word', async job => {
  const { jobId, filePath } = job.data;
  const dirPath = path.dirname(filePath);
  const finalPath = path.join(dirPath, 'output.docx');

  return new Promise((resolve, reject) => {
    const pyScript = `from pdf2docx import Converter; cv = Converter('${filePath}'); cv.convert('${finalPath}'); cv.close()`;
    const py = spawn('python3', ['-c', pyScript]);

    py.on('close', async (code) => {
      if (code === 0) {
        await prisma.processingJob.update({ where: { id: jobId }, data: { status: 'COMPLETED' } });
        resolve(null);
      } else {
        await prisma.processingJob.update({ where: { id: jobId }, data: { status: 'FAILED' } });
        reject(new Error('Python conversion failed'));
      }
    });
  });
}, { connection: { url: process.env.REDIS_URL || 'redis://localhost:6379' }, concurrency: 2 });
