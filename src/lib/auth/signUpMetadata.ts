import { UAParser } from 'ua-parser-js';

export type SignupMetadata = {
  platform?: string;
  browser?: string;
  browserVersion?: string;
  os?: string;
  deviceType?: string;
  language?: string;
  timezone?: string;
  screenResolution?: string;
  userAgent?: string;
};

export function getSignupMetadata(): SignupMetadata {
  try {
    const parser = new UAParser();
    const result = parser.getResult();

    return {
      platform: 'web',

      browser: result.browser.name,
      browserVersion: result.browser.version,

      os: result.os.name,

      deviceType: result.device.type || 'desktop',

      language: navigator.language,

      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,

      screenResolution: `${window.screen.width}x${window.screen.height}`,

      userAgent: navigator.userAgent,
    };
  } catch (error) {
    console.error('Failed to collect signup metadata', error);

    return {
      platform: 'web',
    };
  }
}
