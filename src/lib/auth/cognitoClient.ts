// All Cognito SDK interactions live here.
// No other file should import amazon-cognito-identity-js directly.
// This isolation means if we ever switch auth providers,
// we only change this one file.

import { ENV } from '@/constants';
import {
  CognitoUserPool,
  CognitoUser,
  AuthenticationDetails,
  CognitoUserSession,
  ISignUpResult,
  CognitoRefreshToken,
  CognitoUserAttribute,
  ICognitoUserAttributeData,
} from 'amazon-cognito-identity-js';
import { getSignupMetadata } from './signUpMetadata';

const userPool = new CognitoUserPool({
  UserPoolId: ENV.COGNITO_USER_POOL_ID,
  ClientId: ENV.COGNITO_APP_CLIENT_ID,
});

// Create a new CognitoUser for a given email
function createCognitoUser(email: string): CognitoUser {
  return new CognitoUser({
    Username: email,
    Pool: userPool,
  });
}

export interface CognitoTokens {
  accessToken: string;
  idToken: string;
  refreshToken: string;
  expiresAt: number;
  email: string;
}

function extractTokens(session: CognitoUserSession): CognitoTokens {
  // The ID token contains user attributes (email, sub, custom claims)
  // The access token is used to authorize API calls to Cognito
  // The refresh token is used to get new access/id tokens when they expire
  return {
    accessToken: session.getAccessToken().getJwtToken(),
    idToken: session.getIdToken().getJwtToken(),
    refreshToken: session.getRefreshToken().getToken(),
    expiresAt: session.getAccessToken().getExpiration(),
    email: session.getIdToken().payload.email as string,
  };
}

// Sign In

export interface SignInResult {
  tokens: CognitoTokens;
}

export function signIn(email: string, password: string): Promise<SignInResult> {
  return new Promise((resolve, reject) => {
    const user = createCognitoUser(email);
    const authDetails = new AuthenticationDetails({
      Username: email,
      Password: password,
    });

    user.authenticateUser(authDetails, {
      onSuccess(session) {
        resolve({ tokens: extractTokens(session) });
      },
      onFailure(err) {
        // Cognito returns error codes we can check:
        // 'NotAuthorizedException' — wrong password
        // 'UserNotFoundException' — email not found
        // 'UserNotConfirmedException' — registered but not confirmed
        reject(err);
      },
      newPasswordRequired() {
        reject(new Error('NEW_PASSWORD_REQUIRED'));
      },
    });
  });
}

// Sign Up

export interface SignUpResult {
  userSub: string;
  userConfirmed: boolean;
}

export function signUp(email: string, password: string): Promise<SignUpResult> {
  return new Promise((resolve, reject) => {
    const metadata = getSignupMetadata();

    const userAttributes: ICognitoUserAttributeData[] = [
      {
        Name: 'email',
        Value: email,
      },
      // {
      //   Name: 'custom:platform',
      //   Value: metadata.platform || 'web',
      // },

      // {
      //   Name: 'custom:browser',
      //   Value: metadata.browser || 'unknown',
      // },

      // {
      //   Name: 'custom:os',
      //   Value: metadata.os || 'unknown',
      // },

      // {
      //   Name: 'custom:device_type',
      //   Value: metadata.deviceType || 'desktop',
      // },

      // {
      //   Name: 'custom:timezone',
      //   Value: metadata.timezone || 'unknown',
      // },
    ];

    userPool.signUp(
      email,
      password,
      [],
      userAttributes.map((attr) => new CognitoUserAttribute(attr)),
      (err, result?: ISignUpResult) => {
        if (err) {
          reject(err);
          return;
        }
        resolve({
          userSub: result?.userSub ?? '',
          userConfirmed: result?.userConfirmed ?? false,
        });
      },
    );
  });
}

// Confirm Sign Up (OTP)

export function confirmSignUp(email: string, code: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const user = createCognitoUser(email);
    user.confirmRegistration(code, true, (err) => {
      if (err) {
        reject(err);
        return;
      }
      resolve();
    });
  });
}

// Resend Confirmation Code

export function resendConfirmationCode(email: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const user = createCognitoUser(email);
    user.resendConfirmationCode((err) => {
      if (err) {
        reject(err);
        return;
      }
      resolve();
    });
  });
}

// Forgot Password

export function forgotPassword(email: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const user = createCognitoUser(email);
    user.forgotPassword({
      onSuccess: () => {
        resolve();
      },
      onFailure: (err) => {
        reject(err);
      },
      inputVerificationCode: () => resolve(),
    });
  });
}

// confirm new password

export function confirmForgot(
  email: string,
  code: string,
  newPassword: string,
): Promise<void> {
  return new Promise((resolve, reject) => {
    const user = createCognitoUser(email);
    user.confirmPassword(code, newPassword, {
      onSuccess: () => resolve(),
      onFailure: (err) => reject(err),
    });
  });
}

// Refresh Session

export interface RefreshSessionResult {
  accessToken: string;
  idToken: string;
  expiresAt: number;
}

export function refreshSession(
  email: string,
  refreshToken: string,
): Promise<RefreshSessionResult> {
  return new Promise((resolve, reject) => {
    const user = createCognitoUser(email);
    const token = new CognitoRefreshToken({ RefreshToken: refreshToken });
    user.refreshSession(token, (err, session: CognitoUserSession) => {
      if (err) {
        reject(err);
        return;
      }
      resolve({
        accessToken: session.getAccessToken().getJwtToken(),
        idToken: session.getIdToken().getJwtToken(),
        expiresAt: session.getAccessToken().getExpiration(),
      });
    });
  });
}

// ─── Validate Existing Session ────────────────────────────────────────────────
// This is called on app load to check if the user has an existing
// valid session without requiring them to log in again.

export function validateCurrentSession(): Promise<CognitoTokens | null> {
  return new Promise((resolve) => {
    const user = userPool.getCurrentUser();
    if (!user) {
      resolve(null);
      return;
    }

    user.getSession((err: Error | null, session: CognitoUserSession | null) => {
      if (err || !session || !session.isValid()) {
        resolve(null);
        return;
      }
      resolve(extractTokens(session));
    });
  });
}

// Sign Out
export function signOut(email: string): void {
  const user = createCognitoUser(email);
  user.signOut();
}

// Global Sign Out
export function globalSignOut(email: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const user = createCognitoUser(email);
    user.globalSignOut({
      onSuccess: () => resolve(),
      onFailure: (err) => reject(err),
    });
  });
}

export const COGNITO_ERROR_CODES = {
  USER_NOT_CONFIRMED: 'UserNotConfirmedException',
  USER_NAME_EXISTS: 'UsernameExistsException',
  INVALID_PASSWORD_EXCEPTION: 'InvalidPasswordException',
  USER_NOT_FOUND: 'UserNotFoundException',
  NOT_AUTHORIZED: 'NotAuthorizedException',
  NEW_PASSWORD_REQUIRED: 'NewPasswordRequiredException',
  USER_DELETED: 'UserDeletedException',
  USER_DISABLED: 'UserDisabledException',
  USER_NOT_AUTHORIZED: 'UserNotAuthorizedException',
  TOO_MANY_REQUESTS: 'TooManyRequestsException',
  CODE_MISMATCH: 'CodeMismatchException',
  EXPIRED_CODE: 'ExpiredCodeException',
};
