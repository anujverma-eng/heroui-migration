import { ApiResponse } from '@/types';

export function unwrapResponse<T>(response: ApiResponse<T>): T {
  if (response.success && response.data !== null) {
    return response.data;
  }
  throw new Error(response?.message || 'API request failed');
}

export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (typeof error === 'string') return error;
  return 'An unexpected error occurred';
}
