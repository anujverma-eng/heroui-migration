import { OrgRole } from '@/types';

export type AuthStatus =
  | 'idle'
  | 'loading'
  | 'authenticated'
  | 'unauthenticated'
  | 'error';

export interface AuthUser {
  email: string;
  sub: string;
  role?: OrgRole;
  confirmed: boolean;
}

export interface AuthState {
  status: AuthStatus;
  user: AuthUser | null;
  error: string | null;

  // Tracks whether the user needs to complete OTP confirmation
  // If they registered but haven't confirmed, this stays true.
  pendingConfirmation: boolean;
  pendingEmail: string | null;
}
