import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { AuthState, AuthUser } from './types';
import { getErrorMessage } from '@/utils';
import { tokenManager } from '@/lib/tokenManager';
import * as cognitoClient from '@/lib/auth/cognitoClient';

const initialState: AuthState = {
  status: 'idle',
  user: null,
  error: null,
  pendingConfirmation: false,
  pendingEmail: null,
};

// ─── Async Thunks ─────────────────────────────────────────────────────────────
// initializeAuth: runs once when the app loads.
// Checks if there are valid saved tokens and restores the session.

export const initializeAuth = createAsyncThunk(
  'auth/initialize',
  async (_, { rejectWithValue }) => {
    try {
      // First, check our encrypted storage for saved tokens
      const savedTokens = tokenManager.load();

      if (savedTokens && !tokenManager.isExpired()) {
        // we have valid tokens - user still logged in
        return {
          email: savedTokens.email,
          sub: '', // we'll extract the sub from the token if needed
        } as AuthUser;
      }

      // No valid saved tokens — check if Cognito has a cached session
      // (This handles cases where the user is on a fresh tab but
      // Cognito's SDK still has session data in its own storage)
      const cognitoTokens = await cognitoClient.validateCurrentSession();
      if (cognitoTokens) {
        tokenManager.save(cognitoTokens);
        return {
          email: cognitoTokens.email,
          sub: '', // we'll extract the sub from the token if needed
        } as AuthUser;
      }

      // No valid tokens or session - user is logged out
      return rejectWithValue('NO_SESSION');
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  },
);

// login: authenticates the user with cognito
interface LoginPayload {
  email: string;
  password: string;
}
export const login = createAsyncThunk(
  'auth/login',
  async ({ email, password }: LoginPayload, { rejectWithValue }) => {
    try {
      const { tokens } = await cognitoClient.signIn(email, password);
      console.log('tokens', tokens);
      return { email: tokens.email, sub: '' } as AuthUser;
    } catch (error: unknown) {
      // Map Cognito error codes to user-friendly messages
      const cognitoError = error as { code?: string; message?: string };

      switch (cognitoError.code) {
        case cognitoClient.COGNITO_ERROR_CODES.USER_NOT_CONFIRMED:
          return rejectWithValue('USER_NOT_CONFIRMED:' + email);
        case cognitoClient.COGNITO_ERROR_CODES.NOT_AUTHORIZED:
          return rejectWithValue('Incorrect email or password.');
        case cognitoClient.COGNITO_ERROR_CODES.USER_NOT_FOUND:
          return rejectWithValue('Incorrect email or password.');
        case cognitoClient.COGNITO_ERROR_CODES.TOO_MANY_REQUESTS:
          return rejectWithValue(
            'Too many attempts. Please wait a moment and try again.',
          );
        default:
          return rejectWithValue(
            cognitoError.message || 'Login failed. Please try again.',
          );
      }
    }
  },
);

// logout: clears tokens and signs out of Cognito
export const logout = createAsyncThunk(
  'auth/logout',
  async (_, { getState }) => {
    const state = getState() as { auth: AuthState };
    const email = state.auth.user?.email;

    // Clear our encrypted token storage first
    tokenManager.clear();

    // Then clear Cognito's local session cache
    if (email) {
      cognitoClient.signOut(email);
    }

    // Hard redirect — destroys all in-memory state cleanly
    // We use window.location instead of React Router's navigate
    // because we want to guarantee a full page reload, clearing
    // all Redux state, component state, and any cached data
    window.location.href = '/login';
  },
);

interface RegisterPayload {
  email: string;
  password: string;
}

export const register = createAsyncThunk(
  'auth/register',
  async ({ email, password }: RegisterPayload, { rejectWithValue }) => {
    try {
      const { userSub, userConfirmed } = await cognitoClient.signUp(
        email,
        password,
      );
      return {
        email: email,
        sub: userSub,
        confirmed: userConfirmed,
      } as AuthUser;
    } catch (error: unknown) {
      const cognitoError = error as { code?: string; message?: string };

      switch (cognitoError.code) {
        case cognitoClient.COGNITO_ERROR_CODES.USER_NAME_EXISTS:
          return rejectWithValue('An account with this email already exists.');
        case cognitoClient.COGNITO_ERROR_CODES.INVALID_PASSWORD_EXCEPTION:
          return rejectWithValue('Password does not meet requirements.');
        default:
          return rejectWithValue(
            cognitoError.message || 'Registration failed. Please try again.',
          );
      }
    }
  },
);

// confirmOtp: verifies the OTP code sent to the user's email
export const confirmOtp = createAsyncThunk(
  'auth/confirmOtp',
  async (
    { email, code }: { email: string; code: string },
    { rejectWithValue },
  ) => {
    try {
      await cognitoClient.confirmSignUp(email, code);
      return { email };
    } catch (error: unknown) {
      const cognitoError = error as { code?: string; message?: string };
      switch (cognitoError.code) {
        case cognitoClient.COGNITO_ERROR_CODES.CODE_MISMATCH:
          return rejectWithValue('Invalid code. Please try again.');
        case cognitoClient.COGNITO_ERROR_CODES.EXPIRED_CODE:
          return rejectWithValue('Code has expired. Please request a new one.');
        default:
          return rejectWithValue(
            cognitoError.message || 'Confirmation failed.',
          );
      }
    }
  },
);

// resendOtp: requests a new OTP code
export const resendOtp = createAsyncThunk(
  'auth/resendOtp',
  async (email: string, { rejectWithValue }) => {
    try {
      await cognitoClient.resendConfirmationCode(email);
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  },
);

// forgotPassword: initiates the password reset flow
export const forgotPassword = createAsyncThunk(
  'auth/forgotPassword',
  async (email: string, { rejectWithValue }) => {
    try {
      await cognitoClient.forgotPassword(email);
      return { email };
    } catch (error: unknown) {
      const cognitoError = error as { code?: string; message?: string };
      if (
        cognitoError.code === cognitoClient.COGNITO_ERROR_CODES.USER_NOT_FOUND
      ) {
        // Security: don't reveal if email exists
        return { email };
      }
      return rejectWithValue(getErrorMessage(error));
    }
  },
);

// resetPassword: sets a new password using the reset code
export const resetPassword = createAsyncThunk(
  'auth/resetPassword',
  async (
    {
      email,
      code,
      newPassword,
    }: { email: string; code: string; newPassword: string },
    { rejectWithValue },
  ) => {
    try {
      await cognitoClient.confirmForgot(email, code, newPassword);
    } catch (error: unknown) {
      const cognitoError = error as { code?: string; message?: string };
      switch (cognitoError.code) {
        case cognitoClient.COGNITO_ERROR_CODES.CODE_MISMATCH:
          return rejectWithValue('Invalid reset code.');
        case cognitoClient.COGNITO_ERROR_CODES.EXPIRED_CODE:
          return rejectWithValue(
            'Reset code has expired. Please request a new one.',
          );
        default:
          return rejectWithValue(
            cognitoError.message || 'Reset password failed.',
          );
      }
    }
  },
);

// Slice

const authSlice = createSlice({
  name: 'auth',
  initialState,
  // Synchronous reducers - for direct state updates
  reducers: {
    clearError(state: AuthState) {
      state.error = null;
    },
    clearPendingConfirmation(state: AuthState) {
      state.pendingConfirmation = false;
      state.pendingEmail = null;
    },
  },
  // extraReducers handles the three states of every async thunk:
  // pending (loading), fulfilled (success), rejected (error)
  extraReducers: (builder) => {
    // ── initializeAuth ──────────────────────────────────────────────────────
    builder
      .addCase(initializeAuth.pending, (state: AuthState) => {
        state.status = 'loading';
      })
      .addCase(
        initializeAuth.fulfilled,
        (state: AuthState, action: PayloadAction<AuthUser>) => {
          state.status = 'authenticated';
          state.user = action.payload;
        },
      )
      .addCase(initializeAuth.rejected, (state: AuthState) => {
        // Not an error - just means no session found
        state.status = 'unauthenticated';
      });

    // ── login ───────────────────────────────────────────────────────────────
    builder
      .addCase(login.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.status = 'authenticated';
        state.user = action.payload;
        state.error = null;
      })
      .addCase(login.rejected, (state: AuthState, action) => {
        const payload = action.payload as string;

        // check if this is the "user not confirmed" special case?
        if (payload?.startsWith('USER_NOT_CONFIRMED:')) {
          const email = payload.split(':')[1];
          state.status = 'unauthenticated';
          state.pendingConfirmation = true;
          state.pendingEmail = email;
          state.error = null;
        } else {
          state.status = 'unauthenticated';
          state.error = payload ?? 'Login failed.';
        }
      });

    // ── logout ──────────────────────────────────────────────────────────────
    builder.addCase(logout.fulfilled, (state) => {
      state.status = 'unauthenticated';
      state.user = null;
      state.error = null;
    });

    // ── register ─────────────────────────────────────────────────────────────
    builder
      .addCase(register.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(
        register.fulfilled,
        (
          state,
          action: PayloadAction<{ email: string; confirmed: boolean }>,
        ) => {
          state.status = 'unauthenticated';
          if (!action.payload.confirmed) {
            // User registered but needs OTP confirmation
            state.pendingConfirmation = true;
            state.pendingEmail = action.payload.email;
          }
        },
      )
      .addCase(register.rejected, (state, action) => {
        state.status = 'unauthenticated';
        state.error = action.payload as string;
      });

    // ── confirmOtp ───────────────────────────────────────────────────────────
    builder
      .addCase(confirmOtp.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(confirmOtp.fulfilled, (state) => {
        // OTP confirmed — clear pending state.
        // User still needs to log in after confirmation.
        state.status = 'unauthenticated';
        state.pendingConfirmation = false;
        state.pendingEmail = null;
      })
      .addCase(confirmOtp.rejected, (state, action) => {
        state.status = 'unauthenticated';
        state.error = action.payload as string;
      });

    // ── resendOtp ─────────────────────────────────────────────────────────────
    builder.addCase(resendOtp.rejected, (state, action) => {
      state.error = action.payload as string;
    });

    // ── forgotPassword ────────────────────────────────────────────────────────
    builder
      .addCase(forgotPassword.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(forgotPassword.fulfilled, (state, action) => {
        state.status = 'unauthenticated';
        // Store email so the reset password page knows where to send the code
        state.pendingEmail = action.payload.email;
      })
      .addCase(forgotPassword.rejected, (state, action) => {
        state.status = 'unauthenticated';
        state.error = action.payload as string;
      });

    // ── resetPassword ─────────────────────────────────────────────────────────
    builder
      .addCase(resetPassword.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(resetPassword.fulfilled, (state) => {
        state.status = 'unauthenticated';
        state.pendingEmail = null;
      })
      .addCase(resetPassword.rejected, (state, action) => {
        state.status = 'unauthenticated';
        state.error = action.payload as string;
      });
  },
});

export const { clearError, clearPendingConfirmation } = authSlice.actions;
export default authSlice.reducer;

// ─── Selectors ────────────────────────────────────────────────────────────────

export const selectAuthStatus = (state: { auth: AuthState }) =>
  state.auth.status;
export const selectAuthUser = (state: { auth: AuthState }) => state.auth.user;
export const selectAuthError = (state: { auth: AuthState }) => state.auth.error;
export const selectPendingConfirmation = (state: { auth: AuthState }) =>
  state.auth.pendingConfirmation;
export const selectPendingEmail = (state: { auth: AuthState }) =>
  state.auth.pendingEmail;
export const selectIsAuthenticated = (state: { auth: AuthState }) =>
  state.auth.status === 'authenticated';
export const selectIsAuthLoading = (state: { auth: AuthState }) =>
  state.auth.status === 'loading';
