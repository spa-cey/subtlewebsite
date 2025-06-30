import { ApiResponse } from '@/types';

/**
 * Creates a standardized API response
 */
export function createApiResponse<T>(
  success: boolean,
  data?: T,
  message?: string,
  error?: string
): ApiResponse<T> {
  return {
    success,
    data,
    message,
    error
  };
}

/**
 * Creates a success response
 */
export function successResponse<T>(data: T, message?: string): ApiResponse<T> {
  return createApiResponse(true, data, message);
}

/**
 * Creates an error response
 */
export function errorResponse(error: string, message?: string): ApiResponse {
  return createApiResponse(false, undefined, message, error);
}

/**
 * Validates environment variables
 */
export function validateEnvironment(): void {
  const required = ['PORT'];
  const missing = required.filter(key => !process.env[key]);
  
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }
}

/**
 * Safely parse JSON with error handling
 */
export function safeJsonParse<T>(json: string, fallback: T): T {
  try {
    return JSON.parse(json);
  } catch {
    return fallback;
  }
}

/**
 * Generate timestamp
 */
export function timestamp(): number {
  return Date.now();
}

/**
 * Format date for logging
 */
export function formatDate(date: Date = new Date()): string {
  return date.toISOString();
}