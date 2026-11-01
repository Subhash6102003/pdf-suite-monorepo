import { Worker } from 'bullmq';

export const splitWorker = new Worker('pdf:split', async job => {
  // Split logic
}, { connection: { url: process.env.REDIS_URL || 'redis://localhost:6379' }, concurrency: 10 });
