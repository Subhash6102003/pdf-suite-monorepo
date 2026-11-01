/**
 * Browser-side JPG/PNG/image → PDF conversion using pdf-lib.
 * Runs entirely in the browser — no server upload needed for <= 50MB total.
 * Privacy: files never leave the user's device for this operation.
 *
 * Verification: output page count MUST equal the number of input images.
 * Each image occupies exactly one page.
 */

import { PDFDocument, PDFImage } from 'pdf-lib';

export interface JpgToPdfClientResult {
  blob: Blob;
  outputSize: number;      // exact: outputBytes.byteLength
  totalInputSize: number;  // exact: sum of File.size
  pageCount: number;       // must equal input image count
}

export type PageOrientation = 'portrait' | 'landscape' | 'auto';
export type PageSize = 'a4' | 'letter' | 'match_image';

const PAGE_SIZES = {
  a4: { width: 595.28, height: 841.89 },
  letter: { width: 612, height: 792 },
} as const;

export async function jpgToPdfInBrowser(
  files: File[],
  options: {
    pageSize?: PageSize;
    orientation?: PageOrientation;
    margin?: number;
  } = {}
): Promise<JpgToPdfClientResult> {
  if (files.length === 0) {
    throw new Error('At least one image file is required.');
  }

  const { pageSize = 'match_image', orientation = 'auto', margin = 0 } = options;
  const totalInputSize = files.reduce((sum, f) => sum + f.size, 0);

  const pdfDoc = await PDFDocument.create();

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    let imageBytes: ArrayBuffer;
    try {
      imageBytes = await file.arrayBuffer();
    } catch {
      throw new Error(`Failed to read image "${file.name}".`);
    }

    const byteArray = new Uint8Array(imageBytes);
    const isJpeg = byteArray[0] === 0xFF && byteArray[1] === 0xD8 && byteArray[2] === 0xFF;
    const isPng = byteArray[0] === 0x89 && byteArray[1] === 0x50 &&
                  byteArray[2] === 0x4E && byteArray[3] === 0x47;

    if (!isJpeg && !isPng) {
      throw new Error(
        `"${file.name}" is not a valid JPEG or PNG image.`
      );
    }

    let embeddedImage: PDFImage;
    try {
      embeddedImage = isJpeg
        ? await pdfDoc.embedJpg(imageBytes)
        : await pdfDoc.embedPng(imageBytes);
    } catch {
      throw new Error(
        `Failed to embed "${file.name}" into the PDF. The image may be corrupted.`
      );
    }

    const imgWidth = embeddedImage.width;
    const imgHeight = embeddedImage.height;

    let pageWidth: number;
    let pageHeight: number;

    if (pageSize === 'match_image') {
      pageWidth = imgWidth;
      pageHeight = imgHeight;
    } else {
      const dims = PAGE_SIZES[pageSize];
      const isLandscape =
        orientation === 'landscape' ||
        (orientation === 'auto' && imgWidth > imgHeight);

      pageWidth = isLandscape ? dims.height : dims.width;
      pageHeight = isLandscape ? dims.width : dims.height;
    }

    const page = pdfDoc.addPage([pageWidth, pageHeight]);

    const contentWidth = pageWidth - margin * 2;
    const contentHeight = pageHeight - margin * 2;
    const scale = Math.min(contentWidth / imgWidth, contentHeight / imgHeight);
    const drawWidth = imgWidth * scale;
    const drawHeight = imgHeight * scale;

    const x = margin + (contentWidth - drawWidth) / 2;
    const y = margin + (contentHeight - drawHeight) / 2;

    page.drawImage(embeddedImage, { x, y, width: drawWidth, height: drawHeight });
  }

  const outputBytes = await pdfDoc.save({ useObjectStreams: true });

  let verifiedDoc: PDFDocument;
  try {
    verifiedDoc = await PDFDocument.load(outputBytes);
  } catch {
    throw new Error('Image-to-PDF conversion produced an invalid PDF. Please try again.');
  }

  const actualPageCount = verifiedDoc.getPageCount();
  if (actualPageCount !== files.length) {
    throw new Error(
      `Page count mismatch: expected ${files.length} pages (one per image), got ${actualPageCount}.`
    );
  }

  return {
    blob: new Blob([outputBytes.buffer as ArrayBuffer], { type: 'application/pdf' }),
    outputSize: outputBytes.byteLength,
    totalInputSize,
    pageCount: actualPageCount,
  };
}