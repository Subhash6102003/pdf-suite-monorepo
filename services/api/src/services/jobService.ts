import { prisma } from '../db/client';

export class JobService {
  public static async createJob(jobId: string, type: string, inputSize: number, userId?: string) {
    return prisma.processingJob.create({
      data: {
        id: jobId,
        type,
        status: 'QUEUED',
        input_size_bytes: inputSize,
        userId: userId
      }
    });
  }

  public static async getJob(jobId: string) {
    const job = await prisma.processingJob.findUnique({ where: { id: jobId } });
    if (!job) throw new Error(`Job not found: ${jobId}`);
    return job;
  }
  
  public static async updateJobStatus(jobId: string, status: string, outputSize?: number) {
     return prisma.processingJob.update({
        where: { id: jobId },
        data: { status, output_size_bytes: outputSize }
     });
  }
}
