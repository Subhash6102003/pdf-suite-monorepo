import { FastifyInstance } from 'fastify';

export default async function (fastify: FastifyInstance) {
  fastify.post('/convert/pdf-to-word', async (request, reply) => {
    reply.code(202).send({ job_id: 'mock-uuid', status: 'QUEUED' });
  });
}
