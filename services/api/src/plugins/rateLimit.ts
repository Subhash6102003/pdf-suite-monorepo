import rateLimit from '@fastify/rate-limit';
import { FastifyInstance } from 'fastify';
import Redis from 'ioredis';
import { config } from '../config';

export default async function rateLimitPlugin(fastify: FastifyInstance) {
  const redis = new Redis(config.REDIS_URL);
  
  fastify.register(rateLimit, {
    max: (req) => {
      // @ts-ignore
      if (req.user) return 60;
      return 10;
    },
    timeWindow: '1 minute',
    redis,
    keyGenerator: (req) => {
      // @ts-ignore
      return req.user?.id || req.ip;
    }
  });
}
