import { FastifyInstance } from 'fastify';

export default async function (fastify: FastifyInstance) {
  fastify.post('/pdf/merge', async (request, reply) => {
    // Similar to compress route
    reply.code(202).send({ job_id: 'mock-uuid', status: 'QUEUED' });
  });
}
