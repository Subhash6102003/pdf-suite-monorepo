export class ValidationService {
  public static validateMagicBytes(buffer: Buffer, expectedMime: string): boolean {
    if (expectedMime === 'application/pdf') {
      return buffer.length >= 4 && buffer.subarray(0, 4).toString('ascii') === '%PDF';
    }
    if (expectedMime === 'image/jpeg') {
      return buffer.length >= 2 && buffer[0] === 0xff && buffer[1] === 0xd8;
    }
    return true; // Default fallback for unsupported strict checks
  }
}
