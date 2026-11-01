import { FastifyInstance } from 'fastify';
import { StorageService } from '../../../services/storageService';
import { QueueProducer } from '../../../queue/producers';
import { JobService } from '../../../services/jobService';
import { EntitlementService } from '../../../services/entitlementService';
import { ValidationService } from '../../../services/validationService';
import fs from 'fs';
import path from 'path';

export default async function (fastify: FastifyInstance) {
  fastify.post('/pdf/compress', async (request, reply) => {
    const data = await request.file();
    if (!data) throw new Error('No file uploaded');

    const { jobId, dirPath } = await StorageService.createTempJobDir();
    const filePath = path.join(dirPath, 'input.pdf');
    const writeStream = fs.createWriteStream(filePath);
    
    let bytesWritten = 0;
    let magicChecked = false;

    for await (const chunk of data.file) {
      if (!magicChecked && bytesWritten === 0) {
        if (!ValidationService.validateMagicBytes(chunk, 'application/pdf')) {
          writeStream.close();
          await StorageService.cleanupTempJobDir(jobId);
          throw new Error('INVALID_PDF: Invalid magic bytes');
        }
        magicChecked = true;
      }
      bytesWritten += chunk.length;
      writeStream.write(chunk);
    }
    writeStream.end();

    const userId = (request as any).user?.id;
    const maxAllowedSize = await EntitlementService.getMaxFileSizeForUser(userId);
    if (bytesWritten > maxAllowedSize) {
      await StorageService.cleanupTempJobDir(jobId);
      throw { code: 'FST_REQ_FILE_TOO_LARGE', message: 'File too large for plan' };
    }

    await JobService.createJob(jobId, 'pdf:compress', bytesWritten, userId);
    
    const priority = userId && !userId.startsWith('anon-') ? 1 : 10;
    
    const targetSizeStr = (data.fields.target_size_bytes as any)?.value;
    const target_size_bytes = targetSizeStr ? parseInt(targetSizeStr, 10) : undefined;
    
    await QueueProducer.enqueueCompressJob(jobId, { filePath, target_size_bytes }, priority);

    reply.code(202).send({ job_id: jobId, status: 'QUEUED' });
  });
}
