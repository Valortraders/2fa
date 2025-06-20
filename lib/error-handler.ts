export class AppError extends Error {
  public statusCode: number;
  public code: string;

  constructor(message: string, statusCode: number = 400, code: string = 'ERROR') {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.name = 'AppError';
  }
}

export const ErrorCodes = {
  RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',
  INVALID_SECRET: 'INVALID_SECRET',
  INVALID_INPUT: 'INVALID_INPUT',
  INTERNAL_ERROR: 'INTERNAL_ERROR',
} as const;

export function handleError(error: unknown): { message: string; code: string; statusCode: number } {
  if (error instanceof AppError) {
    return {
      message: error.message,
      code: error.code,
      statusCode: error.statusCode,
    };
  }

  // Handle other types of errors
  if (error instanceof Error) {
    return {
      message: error.message,
      code: ErrorCodes.INTERNAL_ERROR,
      statusCode: 500,
    };
  }

  return {
    message: 'An unexpected error occurred',
    code: ErrorCodes.INTERNAL_ERROR,
    statusCode: 500,
  };
}

export function createErrorResponse(error: unknown) {
  const { message, code, statusCode } = handleError(error);
  return {
    error: {
      message,
      code,
    },
    statusCode,
  };
} 