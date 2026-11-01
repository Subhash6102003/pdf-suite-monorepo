import { z } from 'zod';

const configSchema = z.object({
  DATABASE_URL: z.string().default('postgresql://user:pass@localhost:5432/pdfsuite'),
  REDIS_URL: z.string().default('redis://localhost:6379'),
  TEMP_DIR: z.string().default('/tmp/pdf-suite-jobs'),
  MAX_FILE_SIZE_FREE: z.coerce.number().default(10 * 1024 * 1024),
  MAX_FILE_SIZE_PRO: z.coerce.number().default(50 * 1024 * 1024),
  MAX_FILE_SIZE_BUSINESS: z.coerce.number().default(200 * 1024 * 1024),
  API_PORT: z.coerce.number().default(3000),
  CORS_ORIGINS: z.string().default('*'),
  JWT_SECRET: z.string().default('supersecret')
});

export const config = configSchema.parse(process.env);
