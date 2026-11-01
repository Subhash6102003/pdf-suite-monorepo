/**
 * Browser-side PDF split using pdf-lib.
 * Runs entirely in the browser for input files <= 100MB.
 *
 * Modes:
 * - all_pages: one output PDF per page
 * - page_range: one output PDF containing the specified pages (1-indexed, inclusive)
 * - multi_range: multiple output PDFs for an array of page ranges
 * - every_n_pages: split into chunks of N pages
 *
 * Verification: for each output file, verify its page count matches expectation.
 */

import { PDFDocument } from 'pdf-lib';

export interface PageRange {
  start: number; // 1-indexed, inclusive
  end: number;   // 1-indexed, inclusive
  label?: string;
}

export interface SplitOutputFile {
  blob: Blob;
  size: number;      // exact: outputBytes.byteLength
  pageRange: PageRange;
  filename: string;
}

export interface SplitClientResult {
  files: SplitOutputFile[];
  inputSize: number;        // exact: File.size
  inputPageCount: number;
}

export async function splitPdfInBrowser(
  file: File,
  mode: 'all_pages' | 'page_range' | 'multi_range' | 'every_n_pages',
  options?: {
    range?: PageRange;
    ranges?: PageRange[];
    nPages?: number;
  }
): Promise<SplitClientResult> {
  const inputSize = file.size;

  const inputBytes = await file.arrayBuffer();
  let sourceDoc: PDFDocument;
  try {
    sourceDoc = await PDFDocument.load(inputBytes, { throwOnInvalidObject: false });
  } catch {
    throw new Error("This file doesn't appear to be a valid PDF.");
  }

  const inputPageCount = sourceDoc.getPageCount();
  if (inputPageCount === 0) {
    throw new Error('This PDF contains no pages.');
  }

  let ranges: PageRange[] = [];

  switch (mode) {
    case 'all_pages':
      ranges = Array.from({ length: inputPageCount }, (_, i) => ({
        start: i + 1,
        end: i + 1,
        label: `page${i + 1}`,
      }));
      break;

    case 'page_range': {
      const r = options?.range;
      if (!r) throw new Error('page_range mode requires a range option.');
      validateRange(r, inputPageCount);
      ranges = [r];
      break;
    }

    case 'multi_range': {
      const rs = options?.ranges;
      if (!rs || rs.length === 0) throw new Error('multi_range mode requires ranges array.');
      for (const r of rs) validateRange(r, inputPageCount);
      ranges = rs;
      break;
    }

    case 'every_n_pages': {
      const n = options?.nPages ?? 1;
      if (n < 1) throw new Error('nPages must be >= 1');
      for (let start = 1; start <= inputPageCount; start += n) {
        const end = Math.min(start + n - 1, inputPageCount);
        ranges.push({ start, end, label: `pages${start}-${end}` });
      }
      break;
    }
  }

  const outputFiles: SplitOutputFile[] = [];
  const baseName = file.name.replace(/\.pdf$/i, '');

  for (const range of ranges) {
    const newDoc = await PDFDocument.create();
    const pageCount = range.end - range.start + 1;

    const pageIndices = Array.from({ length: pageCount }, (_, i) => range.start - 1 + i);
    const copiedPages = await newDoc.copyPages(sourceDoc, pageIndices);
    for (const page of copiedPages) {
      newDoc.addPage(page);
    }

    const outputBytes = await newDoc.save({ useObjectStreams: true });

    let verifiedDoc: PDFDocument;
    try {
      verifiedDoc = await PDFDocument.load(outputBytes);
    } catch {
      throw new Error(`Splitting range ${range.start}–${range.end} produced an invalid PDF.`);
    }

    const actualPageCount = verifiedDoc.getPageCount();
    if (actualPageCount !== pageCount) {
      throw new Error(
        `Split verification failed for range ${range.start}–${range.end}: ` +
        `expected ${pageCount} pages, got ${actualPageCount}.`
      );
    }

    const label = range.label ?? `pages${range.start}-${range.end}`;
    outputFiles.push({
      blob: new Blob([outputBytes.buffer as ArrayBuffer], { type: 'application/pdf' }),
      size: outputBytes.byteLength,
      pageRange: range,
      filename: ranges.length === 1
        ? `${baseName}_split.pdf`
        : `${baseName}_${label}.pdf`,
    });
  }

  return {
    files: outputFiles,
    inputSize,
    inputPageCount,
  };
}

function validateRange(range: PageRange, totalPages: number): void {
  if (range.start < 1) throw new Error(`Start page must be >= 1, got ${range.start}`);
  if (range.end > totalPages) {
    throw new Error(`End page ${range.end} exceeds the document's ${totalPages} pages.`);
  }
  if (range.start > range.end) {
    throw new Error(`Start page (${range.start}) must be <= end page (${range.end}).`);
  }
}