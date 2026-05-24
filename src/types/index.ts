export type OrgRole = 'OWNER' | 'ADMIN' | 'MEMBER' | 'VIEWER';

export interface ApiResponse<T> {
  status: number;
  success: boolean;
  message: string;
  data: T | null;
  from: 'cloudaccess-backend';
  error: unknown | null;
  pagination?: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export type LoadingState = 'idle' | 'loading' | 'succeeded' | 'failed';

export interface AsyncState<T> {
  data: T | null;
  status: LoadingState;
  error: string | null;
}

export function createInitialAsyncState<T>(): AsyncState<T> {
  return {
    data: null,
    status: 'idle',
    error: null,
  };
}
