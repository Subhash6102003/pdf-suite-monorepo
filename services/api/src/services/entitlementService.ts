import { prisma } from '../db/client';
import { config } from '../config';

export class EntitlementService {
  public static async getMaxFileSizeForUser(userId?: string): Promise<number> {
    if (!userId) return config.MAX_FILE_SIZE_FREE;
    // In a real app, query user plan from DB
    return config.MAX_FILE_SIZE_PRO;
  }
}
