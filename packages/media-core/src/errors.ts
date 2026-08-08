import type { MediaError } from './types';

// network connection failed
export function networkError(message: string, cause?: unknown): MediaError {
  return { kind: 'NETWORK_ERROR', message, cause };
}

// rate limit hit
export function rateLimitError(message: string): MediaError {
  return { kind: 'RATE_LIMIT', message, status: 429 };
}

// server error response
export function apiError(status: number, message: string): MediaError {
  return { kind: 'API_ERROR', message, status };
}

// json parse failed
export function parseError(message: string, cause?: unknown): MediaError {
  return { kind: 'PARSE_ERROR', message, cause };
}

// unexpected error catch
export function unknownError(message: string, cause?: unknown): MediaError {
  return { kind: 'UNKNOWN_ERROR', message, cause };
}
