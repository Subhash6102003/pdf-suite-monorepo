export interface CompressPdfRequest {
  fileId: string;
  targetSizeMB?: number;
}

export interface CompressPdfResponse {
  jobId: string;
  status: string;
}

export interface MergePdfRequest {
  fileIds: string[];
}

export interface MergePdfResponse {
  jobId: string;
  status: string;
}

export interface SplitPdfRequest {
  fileId: string;
  ranges: string;
}

export interface SplitPdfResponse {
  jobId: string;
  status: string;
}

export interface JpgToPdfRequest {
  imageIds: string[];
}

export interface JpgToPdfResponse {
  jobId: string;
  status: string;
}

export interface PdfToWordRequest {
  fileId: string;
}

export interface PdfToWordResponse {
  jobId: string;
  status: string;
}

export type JobStatus = 'QUEUED' | 'QUEUED_OFFLINE' | 'PROCESSING' | 'VALIDATING' | 'COMPLETED' | 'FAILED' | 'EXPIRED';

export interface JobStatusResponse {
  jobId: string;
  status: JobStatus;
  downloadToken?: string;
  error?: string;
}

export interface DownloadResponse {
  url: string;
  expiresAt: string;
}
