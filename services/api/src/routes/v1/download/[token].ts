import { FastifyInstance } from 'fastify';
import { prisma } from '../../../db/client';
import fs from 'fs';
import path from 'path';

export default async function (fastify: FastifyInstance) {
  fastify.get('/download/:token', async (request, reply) => {
    const { token } = request.params as { token: string };
    const result = await prisma.processingResult.findUnique({ where: { id: token } });
    
    if (!result || result.expiresAt < new Date()) {
      reply.code(404).send({ code: 'NOT_FOUND', message: 'Download not found or expired' });
      return;
    }

    if (result.downloadCount >= 5) { // e.g. max_downloads
      reply.code(403).send({ code: 'FORBIDDEN', message: 'Download limit reached' });
      return;
    }

    await prisma.processingResult.update({
      where: { id: token },
      data: { downloadCount: { increment: 1 } }
    });

    const stream = fs.createReadStream(result.filePath);
    reply
      .header('Content-Disposition', 'attachment; filename="output.pdf"')
      .header('X-Content-Type-Options', 'nosniff')
      .type('application/pdf')
      .send(stream);
  });
}
