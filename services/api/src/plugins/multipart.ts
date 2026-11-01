import fastifyMultipart from '@fastify/multipart';
import { FastifyInstance } from 'fastify';
import fs from 'fs';
import path from 'path';
import { StorageService } from '../services/storageService';
import { ValidationService } from '../services/validationService';

export default async function multipartPlugin(fastify: FastifyInstance) {
  fastify.register(fastifyMultipart, {
    limits: {
      fileSize: 200 * 1024 * 1024 // Set to max possible, validate per-route
    }
  });
}
