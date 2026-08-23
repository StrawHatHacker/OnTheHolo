// Constants is our main source of truth

import { SETTINGS } from "./settings";

export const COOKIE_MAP = {
  SESSION: 'ss_id',
} as const;

export const USER_STATUS = {
  ACTIVE: 1,
  DELETED: 2,
  BANNED: 3,
} as const;
export type USER_STATUS_VALUES = typeof USER_STATUS[keyof typeof USER_STATUS];

export const USER_PRIVILEGE_STATUS = {
  NORMAL: 1,
  ADMIN: 2,
} as const;

export const USER_ACTIVITY_STATUS = {
  Online: 1,
  Offline: 2,
  Away: 3,
  Do_Not_Disturb: 4
} as const;
export type USER_ACTIVITY_STATUS_VALUES = typeof USER_ACTIVITY_STATUS[keyof typeof USER_ACTIVITY_STATUS];

export const ENTITY_PREFIX = {
  channel: '#',
  user: '@'
} as const;

export const CHANNEL_TYPE = {
  text: 1,
  voice: 2,
  news: 3,
} as const;
export type ChannelTypeKeys = keyof typeof CHANNEL_TYPE;
export type ChannelTypeValues = typeof CHANNEL_TYPE[ChannelTypeKeys];

export const MEDIA_FOLDERS = {
  profileImages: 'profileImages',
  bannerImages: 'bannerImages',
} as const;

export const MEDIA_PURPOSE = {
  profileImage: 1,
  bannerImage: 2,
} as const;
export type MediaPurposeKeys = keyof typeof MEDIA_PURPOSE;
export type MediaPurposeValues = typeof MEDIA_PURPOSE[MediaPurposeKeys];

export const MAX_TOKEN_AGE_SECONDS = SETTINGS.MAX_TOKEN_AGE_DAYS * 24 * 60 * 60;

export const TERMINAL_COLORS = {
  reset: "\x1b[0m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  magenta: "\x1b[35m",
  cyan: "\x1b[36m",
  white: "\x1b[37m",
  gray: "\x1b[90m",
  bold: "\x1b[1m",
  dim: "\x1b[2m",
} as const;