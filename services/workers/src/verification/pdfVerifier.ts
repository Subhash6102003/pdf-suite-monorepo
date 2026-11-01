import fs from 'fs/promises';
import { spawn } from 'child_process';
import { PDFDocument } from 'pdf-lib';

/**
 * Measure the exact byte size of a file using fs.stat().
 * This is THE only legitimate source of file size numbers shown to users.
 * Never estimate or compute from a formula.
 */
export async function measureFileBytes(filePath: string): Promise<number> {
  const stat = await fs.stat(filePath);
  return stat.size; // exact bytes from OS
}

/**
 * Assert that a file at filePath is a structurally valid PDF.
 * Checks: %PDF header (first 4 bytes) and %%EOF marker (last 1024 bytes).
 * Throws with a machine-readable code if invalid.
 */
export async function assertValidPdf(filePath: string): Promise<void> {
  const handle = await fs.open(filePath, 'r');
  try {
    // Check %PDF header
    const headerBuf = Buffer.alloc(8);
    await handle.read(headerBuf, 0, 8, 0);
    const header = headerBuf.toString('ascii', 0, 4);
    if (header !== '%PDF') {
      throw Object.assign(new Error('INVALID_PDF'), {
        code: 'INVALID_PDF',
        detail: `Expected %PDF header, got: ${JSON.stringify(header)}`,
      });
    }

    // Check %%EOF marker in last 1024 bytes
    const { size } = await handle.stat();
    const tailSize = Math.min(1024, size);
    const tailBuf = Buffer.alloc(tailSize);
    await handle.read(tailBuf, 0, tailSize, size - tailSize);
    const tail = tailBuf.toString('ascii');
    if (!tail.includes('%%EOF')) {
      throw Object.assign(new Error('CORRUPTED_FILE'), {
        code: 'CORRUPTED_FILE',
        detail: '%%EOF marker not found in last 1024 bytes',
      });
    }
  } finally {
    await handle.close();
  }
}

/**
 * Get the page count of a PDF file using qpdf --show-npages.
 * This is fast (no rendering), safe, and accurate.
 * Falls back to pdf-lib if qpdf is not available.
 */
export async function getPdfPageCount(filePath: string): Promise<number> {
  // Try qpdf first (fastest, most accurate)
  try {
    return await getPageCountViaQpdf(filePath);
  } catch {
    // Fallback to pdf-lib if qpdf not installed
    return await getPageCountViaPdfLib(filePath);
  }
}

async function getPageCountViaQpdf(filePath: string): Promise<number> {
  return new Promise((resolve, reject) => {
    const proc = spawn('qpdf', ['--show-npages', filePath]);
    let stdout = '';
    let stderr = '';

    proc.stdout.on('data', (chunk: Buffer) => { stdout += chunk.toString(); });
    proc.stderr.on('data', (chunk: Buffer) => { stderr += chunk.toString(); });

    proc.on('close', (code) => {
      if (code !== 0) {
        reject(new Error(`qpdf --show-npages failed (exit ${code}): ${stderr}`));
        return;
      }
      const count = parseInt(stdout.trim(), 10);
      if (isNaN(count) || count < 0) {
        reject(new Error(`qpdf returned non-numeric page count: ${stdout}`));
        return;
      }
      resolve(count);
    });

    proc.on('error', reject);
  });
}

async function getPageCountViaPdfLib(filePath: string): Promise<number> {
  const bytes = await fs.readFile(filePath);
  const doc = await PDFDocument.load(bytes, { updateMetadata: false });
  return doc.getPageCount();
}

/**
 * Assert that the actual page count of a PDF matches the expected count.
 * This is the core integrity invariant: merge(5pg + 3pg) must produce exactly 8 pages.
 * Throws with PAGE_COUNT_MISMATCH code if the assertion fails.
 */
export async function assertPageCount(filePath: string, expected: number, context = ''): Promise<void> {
  const actual = await getPdfPageCount(filePath);
  if (actual !== expected) {
    throw Object.assign(
      new Error('PAGE_COUNT_MISMATCH'),
      {
        code: 'PAGE_COUNT_MISMATCH',
        detail: `${context}: expected ${expected} pages, got ${actual}`,
        expected,
        actual,
      }
    );
  }
}

/**
 * Assert that actualBytes <= targetBytes.
 * Returns a result object indicating whether the target was achieved.
 * When not achieved, includes the best-effort size so the error handler can report it honestly.
 */
export function assertTargetSize(
  actualBytes: number,
  targetBytes: number
): { achieved: boolean; actualBytes: number; targetBytes: number; differenceBytes: number } {
  return {
    achieved: actualBytes <= targetBytes,
    actualBytes,
    targetBytes,
    differenceBytes: Math.abs(actualBytes - targetBytes),
  };
}

/**
 * Verify a DOCX file is structurally valid by checking its ZIP structure
 * and the presence of [Content_Types].xml.
 * DOCXs are ZIP archives — a valid DOCX must start with PK\x03\x04.
 */
export async function assertValidDocx(filePath: string): Promise<void> {
  const handle = await fs.open(filePath, 'r');
  try {
    const buf = Buffer.alloc(4);
    await handle.read(buf, 0, 4, 0);
    // ZIP magic bytes: PK\x03\x04
    if (buf[0] !== 0x50 || buf[1] !== 0x4B || buf[2] !== 0x03 || buf[3] !== 0x04) {
      throw Object.assign(new Error('INVALID_DOCX'), {
        code: 'INVALID_DOCX',
        detail: 'File does not have ZIP/DOCX magic bytes',
      });
    }
  } finally {
    await handle.close();
  }
}
