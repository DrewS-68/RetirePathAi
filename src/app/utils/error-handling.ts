/**
 * Centralized error handling utilities for RetirePath
 */

export interface ErrorState {
  message: string;
  type: 'error' | 'warning' | 'info';
  code?: string;
  retryable?: boolean;
}

/**
 * Parse and format API errors into user-friendly messages
 */
export function parseApiError(error: unknown): ErrorState {
  // Network errors
  if (error instanceof TypeError && error.message.includes('fetch')) {
    return {
      message: 'Unable to connect to the server. Please check your internet connection and try again.',
      type: 'error',
      code: 'NETWORK_ERROR',
      retryable: true,
    };
  }

  // HTTP errors
  if (error instanceof Response) {
    if (error.status === 401) {
      return {
        message: 'Your session has expired. Please sign in again.',
        type: 'error',
        code: 'AUTH_ERROR',
        retryable: false,
      };
    }
    if (error.status === 403) {
      return {
        message: 'You do not have permission to perform this action.',
        type: 'error',
        code: 'PERMISSION_ERROR',
        retryable: false,
      };
    }
    if (error.status === 404) {
      return {
        message: 'The requested information could not be found.',
        type: 'error',
        code: 'NOT_FOUND',
        retryable: false,
      };
    }
    if (error.status === 429) {
      return {
        message: 'Too many requests. Please wait a moment and try again.',
        type: 'warning',
        code: 'RATE_LIMIT',
        retryable: true,
      };
    }
    if (error.status >= 500) {
      return {
        message: 'Server error. Our team has been notified. Please try again later.',
        type: 'error',
        code: 'SERVER_ERROR',
        retryable: true,
      };
    }
  }

  // Error objects with message
  if (error instanceof Error) {
    return {
      message: error.message || 'An unexpected error occurred. Please try again.',
      type: 'error',
      code: 'UNKNOWN_ERROR',
      retryable: true,
    };
  }

  // String errors
  if (typeof error === 'string') {
    return {
      message: error,
      type: 'error',
      code: 'UNKNOWN_ERROR',
      retryable: true,
    };
  }

  // Unknown error type
  return {
    message: 'An unexpected error occurred. Please try again.',
    type: 'error',
    code: 'UNKNOWN_ERROR',
    retryable: true,
  };
}

/**
 * Retry logic for API calls with exponential backoff
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  options: {
    maxRetries?: number;
    initialDelay?: number;
    maxDelay?: number;
    onRetry?: (attempt: number, error: unknown) => void;
  } = {}
): Promise<T> {
  const {
    maxRetries = 3,
    initialDelay = 1000,
    maxDelay = 10000,
    onRetry,
  } = options;

  let lastError: unknown;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;

      // Don't retry on the last attempt
      if (attempt === maxRetries) {
        break;
      }

      // Check if error is retryable
      const errorState = parseApiError(error);
      if (!errorState.retryable) {
        throw error;
      }

      // Calculate delay with exponential backoff
      const delay = Math.min(initialDelay * Math.pow(2, attempt), maxDelay);

      // Notify about retry
      if (onRetry) {
        onRetry(attempt + 1, error);
      }

      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  // If we get here, all retries failed
  throw lastError;
}

/**
 * Safe API call wrapper with error handling
 */
export async function safeApiCall<T>(
  apiCall: () => Promise<T>,
  options: {
    fallbackValue?: T;
    onError?: (error: ErrorState) => void;
    retry?: boolean;
  } = {}
): Promise<{ data: T | null; error: ErrorState | null }> {
  const { fallbackValue, onError, retry = false } = options;

  try {
    const apiFunction = retry
      ? () => retryWithBackoff(apiCall)
      : apiCall;

    const data = await apiFunction();
    return { data, error: null };
  } catch (error) {
    const errorState = parseApiError(error);
    
    if (onError) {
      onError(errorState);
    }

    return {
      data: fallbackValue ?? null,
      error: errorState,
    };
  }
}

/**
 * Format error message for display to users
 */
export function formatErrorMessage(error: ErrorState): string {
  let message = error.message;

  if (error.retryable) {
    message += ' You can try again.';
  }

  return message;
}

/**
 * Log errors to console with context
 */
export function logError(
  component: string,
  action: string,
  error: unknown,
  context?: Record<string, unknown>
): void {
  const errorState = parseApiError(error);
  
  console.error(`[${component}] Error during ${action}:`, {
    error: errorState,
    originalError: error,
    context,
    timestamp: new Date().toISOString(),
  });
}

/**
 * Check if error is a specific type
 */
export function isErrorType(error: ErrorState, code: string): boolean {
  return error.code === code;
}

/**
 * Validation error helper
 */
export function createValidationError(message: string): ErrorState {
  return {
    message,
    type: 'warning',
    code: 'VALIDATION_ERROR',
    retryable: false,
  };
}

/**
 * Success state helper
 */
export function createSuccessMessage(message: string): ErrorState {
  return {
    message,
    type: 'info',
    code: 'SUCCESS',
    retryable: false,
  };
}
