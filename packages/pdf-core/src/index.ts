import * as fs from 'fs/promises';

export interface TargetSizeResult {
    isWithinTarget: boolean;
    differenceBytes: number;
}

export function assertValidPdf(bytes: Uint8Array | Buffer): void {
    if (bytes.length < 10) {
        throw new Error("Invalid PDF: File too small");
    }
    
    const header = String.fromCharCode(...bytes.subarray(0, 5));
    if (header !== "%PDF-") {
        throw new Error("Invalid PDF: Missing %PDF- header");
    }

    const tailLength = Math.min(1024, bytes.length);
    const tailBytes = bytes.subarray(bytes.length - tailLength);
    const tailString = String.fromCharCode(...tailBytes);
    
    if (!tailString.includes("%%EOF")) {
        throw new Error("Invalid PDF: Missing %%EOF marker");
    }
}

export function assertPageCount(actual: number, expected: number, context: string): void {
    if (actual !== expected) {
        throw new Error(`Page count mismatch in ${context}: Expected ${expected}, got ${actual}`);
    }
}

export function assertTargetSize(actualBytes: number, targetBytes: number): TargetSizeResult {
    return {
        isWithinTarget: actualBytes <= targetBytes,
        differenceBytes: Math.abs(actualBytes - targetBytes)
    };
}

export async function measureFileBytes(filePath: string): Promise<number> {
    const stats = await fs.stat(filePath);
    return stats.size;
}

export function formatBytes(bytes: number): string {
    if (bytes === 0) return '0 B';
    if (bytes < 1000) return `${bytes} B`;
    if (bytes < 1000000) return `${(bytes / 1000).toFixed(2)} KB`;
    if (bytes < 1000000000) return `${(bytes / 1000000).toFixed(2)} MB`;
    return `${(bytes / 1000000000).toFixed(2)} GB`;
}

export function computeSavingsPct(inputBytes: number, outputBytes: number): number {
    if (inputBytes === 0) return 0;
    if (outputBytes >= inputBytes) return 0;
    const savings = inputBytes - outputBytes;
    return (savings / inputBytes) * 100;
}
