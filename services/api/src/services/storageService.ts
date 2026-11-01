import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';
import path from 'path';
import { config } from '../config';

export class StorageService {
  public static async createTempJobDir(): Promise<{ jobId: string; dirPath: string }> {
    const jobId = uuidv4();
    const dirPath = path.join(config.TEMP_DIR, jobId);
    await fs.promises.mkdir(dirPath, { recursive: true });
    return { jobId, dirPath };
  }

  public static async cleanupTempJobDir(jobId: string): Promise<void> {
    const dirPath = path.join(config.TEMP_DIR, jobId);
    try {
      await fs.promises.rm(dirPath, { recursive: true, force: true });
    } catch (error) {
      console.error(`Failed to delete temp dir: ${dirPath}`, error);
    }
  }
}
