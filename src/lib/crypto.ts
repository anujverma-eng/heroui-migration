import { ENV } from '@/constants';
import CryptoJs from 'crypto-js';

const SECRET = ENV.TOKEN_ENCRYPTION_KEY;

export const crypto = {
  encrypt(plainText: string): string {
    return CryptoJs.AES.encrypt(plainText, SECRET).toString();
  },
  decrypt(cipherText: string): string {
    try {
      const bytes = CryptoJs.AES.decrypt(cipherText, SECRET);
      return bytes.toString(CryptoJs.enc.Utf8);
    } catch (error) {
      console.error('Error decrypting token:', error);
      return '';
    }
  },
};
