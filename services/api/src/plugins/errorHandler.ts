import { FastifyInstance, FastifyError } from 'fastify';
import { v4 as uuidv4 } from 'uuid';

// Internal error codes → user-safe messages + HTTP status codes
const ERROR_MAP: Record<string, { message: string; statusCode: number; canRetry: boolean }> = {
  FILE_TOO_LARGE: {
    message: 'This file exceeds the maximum allowed size for your account. Upgrade to Pro for larger files.',
    statusCode: 413,
    canRetry: false,
  },
  INVALID_PDF: {
    message: "This file doesn't appear to be a valid PDF. Please check the file and try again.",
    statusCode: 400,
    canRetry: false,
  },
  PASSWORD_PROTECTED: {
    message: 'This PDF is password-protected. Please remove the password first and try again.',
    statusCode: 400,
    canRetry: false,
  },
  CORRUPTED_FILE: {
    message: "We couldn't read this file. It may be corrupted or incomplete.",
    statusCode: 400,
    canRetry: false,
  },
  UNSUPPORTED_FORMAT: {
    message: 'This file format is not supported. Please upload a valid PDF or image file.',
    statusCode: 400,
    canRetry: false,
  },
  TARGET_UNREACHABLE: {
    message: "We couldn't reduce this PDF to your target size without significant quality loss.",
    statusCode: 422,
    canRetry: false,
  },
  PROCESSING_TIMEOUT: {
    message: 'Processing took too long. Please try again with a smaller file.',
    statusCode: 408,
    canRetry: true,
  },
  RATE_LIMITED: {
    message: "You've reached the processing limit. Please wait a moment before trying again.",
    statusCode: 429,
    canRetry: true,
  },
  PLAN_LIMIT_EXCEEDED: {
    message: "You've reached your daily processing limit. Upgrade to Pro for higher limits.",
    statusCode: 429,
    canRetry: false,
  },
  NOT_FOUND: {
    message: "We couldn't find this job. It may have expired.",
    statusCode: 404,
    canRetry: false,
  },
  TOKEN_EXPIRED: {
    message: 'This download link has expired. Please process the file again.',
    statusCode: 410,
    canRetry: false,
  },
  UNAUTHORIZED: {
    message: 'You need to sign in to access this resource.',
    statusCode: 401,
    canRetry: false,
  },
  INTERNAL_ERROR: {
    message: "Something went wrong on our end. Please try again in a moment.",
    statusCode: 500,
    canRetry: true,
  },
};

// Map Fastify built-in error codes to our error codes
function mapFastifyErrorCode(error: FastifyError): string {
  if (error.statusCode === 413 || error.code === 'FST_REQ_FILE_TOO_LARGE') return 'FILE_TOO_LARGE';
  if (error.statusCode === 429 || error.code === 'FST_TOO_MANY_REQUESTS') return 'RATE_LIMITED';
  if (error.statusCode === 401) return 'UNAUTHORIZED';
  if (error.statusCode === 404) return 'NOT_FOUND';
  if (error.statusCode === 410) return 'TOKEN_EXPIRED';
  return 'INTERNAL_ERROR';
}

export default async function errorHandlerPlugin(fastify: FastifyInstance): Promise<void> {
  fastify.setErrorHandler((error, request, reply) => {
    const errorId = uuidv4();

    // Always log the full internal error with error_id for debugging
    // Never log document content — only metadata
    fastify.log.error({
      error_id: errorId,
      code: error.code,
      message: error.message,
      statusCode: error.statusCode,
      url: request.url,
      method: request.method,
      // Deliberately omit: request body, file content, user files
    }, 'Request error');

    // Determine user-safe error code
    // Custom errors thrown by our code use error.message as the code
    let errorCode = 'INTERNAL_ERROR';

    if (error.message && ERROR_MAP[error.message]) {
      // Our code throws `throw new Error('PASSWORD_PROTECTED')` style errors
      errorCode = error.message;
    } else if (error.code && ERROR_MAP[error.code]) {
      errorCode = error.code;
    } else {
      errorCode = mapFastifyErrorCode(error);
    }

    const mapped = ERROR_MAP[errorCode] ?? ERROR_MAP['INTERNAL_ERROR'];

    // Build safe response — NEVER include:
    // - Stack traces
    // - Internal file paths
    // - Raw error.message (unless it's our own safe code)
    // - Database error details
    // - External service error details
    const response: {
      code: string;
      message: string;
      can_retry: boolean;
      error_id: string;
      best_effort_size_bytes?: number;
    } = {
      code: errorCode,
      message: mapped.message,
      can_retry: mapped.canRetry,
      error_id: errorId,
    };

    // For TARGET_UNREACHABLE: include the best effort size if the error carries it
    if (errorCode === 'TARGET_UNREACHABLE' && (error as FastifyError & { bestEffortSizeBytes?: number }).bestEffortSizeBytes) {
      response.best_effort_size_bytes = (error as FastifyError & { bestEffortSizeBytes?: number }).bestEffortSizeBytes;
    }

    reply.status(mapped.statusCode).send(response);
  });

  // Handle 404 for undefined routes
  fastify.setNotFoundHandler((request, reply) => {
    reply.status(404).send({
      code: 'NOT_FOUND',
      message: 'This endpoint does not exist.',
      can_retry: false,
      error_id: uuidv4(),
    });
  });
}
