/**
 * Browser-side PDF compression using pdf-lib.
 * Runs in the browser — no server upload needed for files <= 40MB at Level 1.
 *
 * What we do:
 * 1. Load the PDF with pdf-lib
 * 2. Strip unnecessary metadata (creator, producer, creation date)
 * 3. Re-save with object stream compression enabled
 * 4. Re-parse the output to verify structural validity + page count
 * 5. Measure outputBytes.byteLength (exact) — NEVER estimated
 * 6. Return { blob, inputSize, outputSize, savingsPct }
 *
 * LIMITATION: pdf-lib Level 1 performs structural compression only (metadata
 * stripping + object stream optimization). It does NOT resample embedded images.
 * For image downsampling (Level 2/3) or target-size mode, the backend workers are used.
 */

import { PDFDocument } from 'pdf-lib';

export interface CompressClientResult {
  blob: Blob;
  inputSize: number;   // exact: File.size (browser File API, always accurate)
  outputSize: number;  // exact: outputBytes.byteLength
  savingsPct: number;  // ((inputSize - outputSize) / inputSize) * 100
  pageCount: number;
}

export async function compressPdfInBrowser(
  file: File
): Promise<CompressClientResult> {
  // Step 1: Get exact input size from the File object
  const inputSize = file.size;

  // Step 2: Load PDF bytes
  const inputArrayBuffer = await file.arrayBuffer();
  const pdfDoc = await PDFDocument.load(inputArrayBuffer, {
    updateMetadata: false,
    throwOnInvalidObject: false,
  });

  const inputPageCount = pdfDoc.getPageCount();

  // Step 3: Clear standard document metadata
  pdfDoc.setTitle('');
  pdfDoc.setAuthor('');
  pdfDoc.setSubject('');
  pdfDoc.setKeywords([]);
  pdfDoc.setProducer('');
  pdfDoc.setCreator('');

  // Step 4: Save with object stream compression
  const outputBytes = await pdfDoc.save({
    useObjectStreams: true,
    addDefaultPage: false,
  });

  // Step 5: Verify the output by re-parsing it
  let verifiedDoc: PDFDocument;
  try {
    verifiedDoc = await PDFDocument.load(outputBytes, { updateMetadata: false });
  } catch {
    throw new Error(
      'Compression produced an invalid PDF. Please try again or use a different file.'
    );
  }

  const outputPageCount = verifiedDoc.getPageCount();
  if (outputPageCount !== inputPageCount) {
    throw new Error(
      `Page count mismatch after compression: input had ${inputPageCount} pages, output has ${outputPageCount} pages.`
    );
  }

  // Step 6: Measure exact output size from the actual byte array
  const outputSize = outputBytes.byteLength;

  const savingsPct = inputSize > 0
    ? ((inputSize - outputSize) / inputSize) * 100
    : 0;

  return {
    blob: new Blob([outputBytes.buffer as ArrayBuffer], { type: 'application/pdf' }),
    inputSize,
    outputSize,
    savingsPct: Math.max(0, savingsPct),
    pageCount: outputPageCount,
  };
}

/**
 * Format bytes for display.
 * Uses 1 MB = 1,000,000 bytes (SI prefix, not binary MiB).
 */
export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  if (bytes < 1_000) return `${bytes} B`;
  if (bytes < 1_000_000) return `${(bytes / 1_000).toFixed(1)} KB`;
  if (bytes < 1_000_000_000) return `${(bytes / 1_000_000).toFixed(2)} MB`;
  return `${(bytes / 1_000_000_000).toFixed(2)} GB`;
}