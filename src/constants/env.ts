export const ENV = {
  API_BASE_URL: import.meta.env.VITE_API_BASE_URL as string,
  COGNITO_REGION: import.meta.env.VITE_COGNITO_REGION as string,
  COGNITO_USER_POOL_ID: import.meta.env.VITE_COGNITO_USER_POOL_ID as string,
  COGNITO_APP_CLIENT_ID: import.meta.env.VITE_COGNITO_APP_CLIENT_ID as string,
  TOKEN_ENCRYPTION_KEY: import.meta.env.VITE_TOKEN_ENC_KEY as string,
} as const;
