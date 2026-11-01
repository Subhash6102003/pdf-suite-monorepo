import { Worker } from 'bullmq';
import { PrismaClient } from '@prisma/client';
import fs from 'fs/promises';

const prisma = new PrismaClient();

export const cleanupWorker = new Worker('cleanup', async job => {
  const now = new Date();
  const expiredResults = await prisma.processingResult.findMany({
    where: { expiresAt: { lt: now } }
  });

  for (const res of expiredResults) {
    try {
      await fs.rm(res.filePath, { force: true });
      await prisma.processingResult.delete({ where: { id: res.id } });
      await prisma.processingJob.update({
        where: { id: res.jobId },
        data: { status: 'EXPIRED' }
      });
    } catch (err) {
      console.error('Cleanup failed for result', res.id, err);
    }
  }
}, { connection: { url: process.env.REDIS_URL || 'redis://localhost:6379' } });
