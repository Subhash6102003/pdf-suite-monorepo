import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { v4 as uuidv4 } from 'uuid';

export default async function authPlugin(fastify: FastifyInstance) {
  fastify.decorateRequest('user', null);
  
  fastify.addHook('preHandler', async (req: FastifyRequest, reply: FastifyReply) => {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      // Simple mock JWT validation
      req.user = { id: 'mock-user-id' };
    } else {
      // Anonymous session
      req.user = { id: `anon-${uuidv4()}` };
    }
  });
}
