import { Worker } from 'bullmq';

export const jpgToPdfWorker = new Worker('pdf:jpg-to-pdf', async job => {
  // JPG to PDF logic
}, { connection: { url: process.env.REDIS_URL || 'redis://localhost:6379' }, concurrency: 8 });
