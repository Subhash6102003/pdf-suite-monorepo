import { queues } from './queues';

export class QueueProducer {
  public static async enqueueCompressJob(jobId: string, payload: any, priority: number) {
    await queues.pdfCompress.add('compress', { jobId, ...payload }, { priority });
  }

  public static async enqueueMergeJob(jobId: string, payload: any, priority: number) {
    await queues.pdfMerge.add('merge', { jobId, ...payload }, { priority });
  }

  public static async enqueueSplitJob(jobId: string, payload: any, priority: number) {
    await queues.pdfSplit.add('split', { jobId, ...payload }, { priority });
  }

  public static async enqueueJpgToPdfJob(jobId: string, payload: any, priority: number) {
    await queues.pdfJpgToPdf.add('jpg-to-pdf', { jobId, ...payload }, { priority });
  }

  public static async enqueuePdfToWordJob(jobId: string, payload: any, priority: number) {
    await queues.convertPdfToWord.add('pdf-to-word', { jobId, ...payload }, { priority });
  }
}
