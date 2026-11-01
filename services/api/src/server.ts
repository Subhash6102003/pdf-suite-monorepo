import fastify from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import multipartPlugin from './plugins/multipart';
import rateLimitPlugin from './plugins/rateLimit';
import authPlugin from './plugins/auth';
import errorHandlerPlugin from './plugins/errorHandler';
import { config } from './config';

import compressRoute from './routes/v1/pdf/compress';
import mergeRoute from './routes/v1/pdf/merge';
import splitRoute from './routes/v1/pdf/split';
import jpgToPdfRoute from './routes/v1/pdf/jpg-to-pdf';
import pdfToWordRoute from './routes/v1/convert/pdf-to-word';
import jobRoute from './routes/v1/jobs/[id]';
import downloadRoute from './routes/v1/download/[token]';

const server = fastify({ logger: true });

server.register(cors, { origin: config.CORS_ORIGINS });
server.register(helmet);

server.register(authPlugin);
server.register(rateLimitPlugin);
server.register(multipartPlugin);
server.register(errorHandlerPlugin);

// Routes
server.register(compressRoute, { prefix: '/api/v1' });
server.register(mergeRoute, { prefix: '/api/v1' });
server.register(splitRoute, { prefix: '/api/v1' });
server.register(jpgToPdfRoute, { prefix: '/api/v1' });
server.register(pdfToWordRoute, { prefix: '/api/v1' });
server.register(jobRoute, { prefix: '/api/v1' });
server.register(downloadRoute, { prefix: '/api/v1' });

server.listen({ port: config.API_PORT, host: '0.0.0.0' }, (err, address) => {
  if (err) {
    server.log.error(err);
    process.exit(1);
  }
  console.log(`API listening at ${address}`);
});

process.on('SIGINT', async () => {
  console.log('Gracefully shutting down...');
  await server.close();
  process.exit(0);
});
