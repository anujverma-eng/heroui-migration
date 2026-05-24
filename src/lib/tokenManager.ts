// Single Source of truth for reading/writing auth tokens.
// All other code that needs token goes through this - never touches sessionStorage directly.

import { crypto } from './crypto';

const STORAGE_KEY = 'app.session';

export interface StoredTokens {
  accessToken: string;
  idToken: string;
  refreshToken: string;
  expiresAt: number;
  email: string;
}

export const tokenManager = {
  // Save token to sessionStorage, encrypted
  save(tokens: StoredTokens): void {
    const encrypted = crypto.encrypt(JSON.stringify(tokens));
    sessionStorage.setItem(STORAGE_KEY, encrypted);
  },
  load(): StoredTokens | null {
    const encrypted = sessionStorage.getItem(STORAGE_KEY);
    if (!encrypted) return null;

    const decrypted = crypto.decrypt(encrypted);
    if (!decrypted) return null;

    try {
      return JSON.parse(decrypted) as StoredTokens;
    } catch (error) {
      this.clear();
      return null;
    }
  },
  clear(): void {
    sessionStorage.removeItem(STORAGE_KEY);
  },
  isExpired(): boolean {
    const tokens = this.load();
    if (!tokens) return true;
    const nowInSeconds = Math.floor(Date.now() / 1000);
    return tokens.expiresAt - 60 < nowInSeconds;
  },
  updateTokens(accessToken: string, idToken: string, expiresAt: number): void {
    const existing = this.load();
    if (!existing) return;
    this.save({
      ...existing,
      accessToken,
      idToken,
      expiresAt,
    });
  },
};
