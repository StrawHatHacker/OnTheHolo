import { ERROR_MAP } from "$lib/errors";
import { CError } from "$lib/utils";

type RateLimitEntry = {
  count: number;
  resetAt: number;
};

// Define specific limits and windows for each level
const RATE_LIMIT_CONFIG = {
  normal: { limit: 30, windowMs: 30_000 },   // 50 requests per 30 seconds
  auth: { limit: 5, windowMs: 30_000 },  // 5 requests per 30 seconds
  initialData: { limit: 5, windowMs: 60_000 },    // 5 requests per 60 seconds
  media: { limit: 5, windowMs: 20_000 }    // 5 requests per 20 seconds
};

const rateLimitMapAuth = new Map<string, RateLimitEntry>();
const rateLimitMapNormal = new Map<string, RateLimitEntry>();
const rateLimitMapInitialData = new Map<string, RateLimitEntry>();
const rateLimitMapMedia = new Map<string, RateLimitEntry>();

export const isRateLimited = (ip: string, level: keyof typeof RATE_LIMIT_CONFIG) => {
  let map: Map<string, RateLimitEntry>;

  if (level === 'normal') {
    map = rateLimitMapNormal;
  } else if (level === 'auth') {
    map = rateLimitMapAuth;
  } else if (level === 'initialData') {
    map = rateLimitMapInitialData;
  } else if (level === 'media') {
    map = rateLimitMapMedia;
  } else {
    throw new CError(500, ERROR_MAP.generalError);
  }

  // Retrieve the configuration for the requested level
  const config = RATE_LIMIT_CONFIG[level];
  const now = Date.now();
  const entry = map.get(ip);

  if (!entry || entry.resetAt < now) {
    map.set(ip, {
      count: 1,
      resetAt: now + config.windowMs
    });
    return;
  }

  entry.count++;

  if (entry.count > config.limit) {
    throw new CError(429, ERROR_MAP.tooManyRequests);
  }
}