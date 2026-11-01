/**
 * Browser-side PDF merge using pdf-lib.
 * Runs entirely in the browser for total input sizes <= 200MB.
 * No server upload needed — maximum privacy.
 *
 * Verification: output page count MUST equal the sum of all input page counts.
 * This is the core invariant: merge(5pg + 3pg) always produces exactly 8 pages.
 */

import { PDFDocument } from 'pdf-lib';

export interface MergeClientResult {
  blob: Blob;
  outputSize: number;       // exact: outputBytes.byteLength
  totalInputSize: number;   // exact: sum of File.size for each input
  outputPageCount: number;
  inputPageCounts: number[];
}

/**
 * Merge multiple PDF files in the browser using pdf-lib.
 * The order of files in the array determines the page order in the output.
 */
export async function mergePdfsInBrowser(files: File[]): Promise<MergeClientResult> {
  if (files.length < 2) {
    throw new Error('At least 2 PDF files are required to merge.');
  }

  const totalInputSize = files.reduce((sum, f) => sum + f.size, 0);
  const mergedDoc = await PDFDocument.create();
  const inputPageCounts: number[] = [];

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    let inputBytes: ArrayBuffer;
    try {
      inputBytes = await file.arrayBuffer();
    } catch {
      throw new Error(`Failed to read file "${file.name}". The file may be corrupted or inaccessible.`);
    }

    let sourceDoc: PDFDocument;
    try {
      sourceDoc = await PDFDocument.load(inputBytes, { throwOnInvalidObject: false });
    } catch {
      throw new Error(
        `"${file.name}" doesn't appear to be a valid PDF. Please check the file and try again.`
      );
    }

    const pageCount = sourceDoc.getPageCount();
    if (pageCount === 0) {
      throw new Error(`"${file.name}" contains no pages.`);
    }
    inputPageCounts.push(pageCount);

    const pageIndices = Array.from({ length: pageCount }, (_, idx) => idx);
    const copiedPages = await mergedDoc.copyPages(sourceDoc, pageIndices);
    for (const page of copiedPages) {
      mergedDoc.addPage(page);
    }
  }

  const outputBytes = await mergedDoc.save({ useObjectStreams: true });

  let verifiedDoc: PDFDocument;
  try {
    verifiedDoc = await PDFDocument.load(outputBytes, { updateMetadata: false });
  } catch {
    throw new Error('Merging produced an invalid PDF. Please try again.');
  }

  const expectedPageCount = inputPageCounts.reduce((sum, n) => sum + n, 0);
  const actualPageCount = verifiedDoc.getPageCount();

  if (actualPageCount !== expectedPageCount) {
    throw new Error(
      `Merge failed: expected ${expectedPageCount} pages (sum of inputs), got ${actualPageCount} pages. Please try again.`
    );
  }

  return {
    blob: new Blob([outputBytes.buffer as ArrayBuffer], { type: 'application/pdf' }),
    outputSize: outputBytes.byteLength,
    totalInputSize,
    outputPageCount: actualPageCount,
    inputPageCounts,
  };
}