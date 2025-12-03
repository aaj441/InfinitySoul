/**
 * Browser Fingerprint Generator
 *
 * Generates randomized but realistic browser fingerprints to distribute
 * scanning load and appear as normal traffic.
 *
 * IMPORTANT: This is for legitimate load distribution, not malicious evasion.
 * Always identify your bot appropriately and respect robots.txt.
 */

import { logger } from '../../../utils/logger';

export interface BrowserFingerprint {
  userAgent: string;
  viewport: {
    width: number;
    height: number;
  };
  locale: string;
  timezone: string;
  platform: string;
  languages: string[];
  hardwareConcurrency: number;
  deviceMemory: number;
  geolocation?: {
    latitude: number;
    longitude: number;
    accuracy: number;
  };
  plugins?: any[];
  screenResolution: {
    width: number;
    height: number;
  };
  colorDepth: number;
  touchSupport: boolean;
}

interface DeviceProfile {
  name: string;
  userAgents: string[];
  viewports: Array<{ width: number; height: number }>;
  hardwareConcurrency: number;
  deviceMemory: number;
  platform: string;
  touchSupport: boolean;
}

/**
 * Common device profiles
 */
const DEVICE_PROFILES: DeviceProfile[] = [
  {
    name: 'Desktop - Windows',
    userAgents: [
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:121.0) Gecko/20100101 Firefox/121.0',
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 Edg/120.0.0.0'
    ],
    viewports: [
      { width: 1920, height: 1080 },
      { width: 1366, height: 768 },
      { width: 1440, height: 900 },
      { width: 2560, height: 1440 }
    ],
    hardwareConcurrency: 8,
    deviceMemory: 8,
    platform: 'Win32',
    touchSupport: false
  },
  {
    name: 'Desktop - macOS',
    userAgents: [
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Safari/605.1.15',
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:121.0) Gecko/20100101 Firefox/121.0'
    ],
    viewports: [
      { width: 1920, height: 1080 },
      { width: 2560, height: 1440 },
      { width: 1440, height: 900 }
    ],
    hardwareConcurrency: 8,
    deviceMemory: 16,
    platform: 'MacIntel',
    touchSupport: false
  },
  {
    name: 'Desktop - Linux',
    userAgents: [
      'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:121.0) Gecko/20100101 Firefox/121.0'
    ],
    viewports: [
      { width: 1920, height: 1080 },
      { width: 1366, height: 768 }
    ],
    hardwareConcurrency: 4,
    deviceMemory: 8,
    platform: 'Linux x86_64',
    touchSupport: false
  },
  {
    name: 'Mobile - iPhone',
    userAgents: [
      'Mozilla/5.0 (iPhone; CPU iPhone OS 17_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Mobile/15E148 Safari/604.1',
      'Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Mobile/15E148 Safari/604.1'
    ],
    viewports: [
      { width: 390, height: 844 },  // iPhone 14
      { width: 428, height: 926 },  // iPhone 14 Plus
      { width: 375, height: 812 }   // iPhone 13 mini
    ],
    hardwareConcurrency: 6,
    deviceMemory: 4,
    platform: 'iPhone',
    touchSupport: true
  },
  {
    name: 'Mobile - Android',
    userAgents: [
      'Mozilla/5.0 (Linux; Android 13; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36',
      'Mozilla/5.0 (Linux; Android 12; SM-G998B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36'
    ],
    viewports: [
      { width: 412, height: 915 },  // Pixel 7
      { width: 360, height: 800 },  // Common Android
      { width: 384, height: 854 }   // Galaxy
    ],
    hardwareConcurrency: 8,
    deviceMemory: 6,
    platform: 'Linux armv8l',
    touchSupport: true
  }
];

/**
 * Common locales
 */
const LOCALES = [
  'en-US',
  'en-GB',
  'en-CA',
  'en-AU',
  'fr-FR',
  'de-DE',
  'es-ES',
  'it-IT',
  'pt-BR',
  'ja-JP',
  'zh-CN',
  'ko-KR'
];

/**
 * Common timezones
 */
const TIMEZONES = [
  'America/New_York',
  'America/Chicago',
  'America/Los_Angeles',
  'America/Denver',
  'America/Toronto',
  'Europe/London',
  'Europe/Paris',
  'Europe/Berlin',
  'Asia/Tokyo',
  'Asia/Shanghai',
  'Australia/Sydney'
];

/**
 * Generate a random but realistic browser fingerprint
 */
export function generateFingerprint(preferredProfile?: string): BrowserFingerprint {
  // Select device profile
  let profile: DeviceProfile;

  if (preferredProfile) {
    const found = DEVICE_PROFILES.find(p => p.name.toLowerCase().includes(preferredProfile.toLowerCase()));
    profile = found || randomItem(DEVICE_PROFILES);
  } else {
    profile = randomItem(DEVICE_PROFILES);
  }

  // Select random user agent from profile
  const userAgent = randomItem(profile.userAgents);

  // Select random viewport from profile
  const viewport = randomItem(profile.viewports);

  // Select random locale
  const locale = randomItem(LOCALES);

  // Select random timezone
  const timezone = randomItem(TIMEZONES);

  // Extract language from locale
  const language = locale.split('-')[0];
  const languages = [locale, language];

  // Screen resolution (slightly larger than viewport)
  const screenResolution = {
    width: viewport.width,
    height: viewport.height + (profile.touchSupport ? 0 : 100) // Add space for browser chrome
  };

  // Color depth (most common)
  const colorDepth = 24;

  // Generate geolocation based on timezone (approximate)
  const geolocation = generateGeolocation(timezone);

  const fingerprint: BrowserFingerprint = {
    userAgent,
    viewport,
    locale,
    timezone,
    platform: profile.platform,
    languages,
    hardwareConcurrency: profile.hardwareConcurrency,
    deviceMemory: profile.deviceMemory,
    screenResolution,
    colorDepth,
    touchSupport: profile.touchSupport,
    geolocation
  };

  logger.debug(`Generated fingerprint: ${profile.name}, ${userAgent.substring(0, 50)}...`);

  return fingerprint;
}

/**
 * Generate geolocation coordinates based on timezone
 */
function generateGeolocation(timezone: string): BrowserFingerprint['geolocation'] {
  const locations: Record<string, { lat: number; lon: number }> = {
    'America/New_York': { lat: 40.7128, lon: -74.0060 },
    'America/Chicago': { lat: 41.8781, lon: -87.6298 },
    'America/Los_Angeles': { lat: 34.0522, lon: -118.2437 },
    'America/Denver': { lat: 39.7392, lon: -104.9903 },
    'America/Toronto': { lat: 43.6532, lon: -79.3832 },
    'Europe/London': { lat: 51.5074, lon: -0.1278 },
    'Europe/Paris': { lat: 48.8566, lon: 2.3522 },
    'Europe/Berlin': { lat: 52.5200, lon: 13.4050 },
    'Asia/Tokyo': { lat: 35.6762, lon: 139.6503 },
    'Asia/Shanghai': { lat: 31.2304, lon: 121.4737 },
    'Australia/Sydney': { lat: -33.8688, lon: 151.2093 }
  };

  const location = locations[timezone] || locations['America/New_York'];

  // Add some randomness (within ~10km radius)
  const latOffset = (Math.random() - 0.5) * 0.1;
  const lonOffset = (Math.random() - 0.5) * 0.1;

  return {
    latitude: location.lat + latOffset,
    longitude: location.lon + lonOffset,
    accuracy: 50 + Math.random() * 50 // 50-100m accuracy
  };
}

/**
 * Get a random item from an array
 */
function randomItem<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

/**
 * Generate fingerprint for specific device type
 */
export function generateDesktopFingerprint(): BrowserFingerprint {
  return generateFingerprint('desktop');
}

export function generateMobileFingerprint(): BrowserFingerprint {
  return generateFingerprint('mobile');
}

/**
 * Generate multiple unique fingerprints
 */
export function generateFingerprintBatch(count: number): BrowserFingerprint[] {
  const fingerprints: BrowserFingerprint[] = [];

  for (let i = 0; i < count; i++) {
    fingerprints.push(generateFingerprint());
  }

  return fingerprints;
}

/**
 * Validate fingerprint consistency
 */
export function validateFingerprint(fingerprint: BrowserFingerprint): boolean {
  // Check required fields
  if (!fingerprint.userAgent || !fingerprint.viewport) {
    return false;
  }

  // Check viewport dimensions
  if (fingerprint.viewport.width <= 0 || fingerprint.viewport.height <= 0) {
    return false;
  }

  // Check screen resolution
  if (fingerprint.screenResolution.width < fingerprint.viewport.width ||
      fingerprint.screenResolution.height < fingerprint.viewport.height) {
    return false;
  }

  // Check hardware specs
  if (fingerprint.hardwareConcurrency <= 0 || fingerprint.deviceMemory <= 0) {
    return false;
  }

  return true;
}
