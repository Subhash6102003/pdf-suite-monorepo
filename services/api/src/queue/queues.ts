import { Queue } from 'bullmq';
import { config } from '../config';

const connection = {
  url: config.REDIS_URL
};

export const queues = {
  pdfCompress: new Queue('pdf:compress', { connection }),
  pdfMerge: new Queue('pdf:merge', { connection }),
  pdfSplit: new Queue('pdf:split', { connection }),
  pdfJpgToPdf: new Queue('pdf:jpg-to-pdf', { connection }),
  convertPdfToWord: new Queue('convert:pdf-to-word', { connection }),
  cleanup: new Queue('cleanup', { connection })
};

// Initialize cleanup repeatable job
queues.cleanup.add('cleanup-job', {}, { repeat: { every: 5 * 60 * 1000 } });
