import { FastifyInstance } from 'fastify';
import { prisma } from '../../../db/client';

export default async function (fastify: FastifyInstance) {
  fastify.get('/jobs/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    const job = await prisma.processingJob.findUnique({ where: { id } });
    
    if (!job) {
      reply.code(404).send({ code: 'NOT_FOUND', message: 'Job not found' });
      return;
    }

    const response: any = {
      job_id: job.id,
      status: job.status,
      created_at: job.createdAt
    };

    if (job.status === 'COMPLETED') {
      const result = await prisma.processingResult.findFirst({ where: { jobId: id } });
      const savings = job.input_size_bytes && job.output_size_bytes
        ? ((job.input_size_bytes - job.output_size_bytes) / job.input_size_bytes) * 100
        : 0;

      response.result = {
        actual_input_size_bytes: job.input_size_bytes,
        actual_output_size_bytes: job.output_size_bytes,
        savings_pct: savings,
        download_token: result?.id
      };
    }

    reply.send(response);
  });
}
