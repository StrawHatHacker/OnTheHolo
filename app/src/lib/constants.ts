// Constants is our main source of truth

export const COOKIE_MAP = {
  SESSION: 'ss_id',
} as const;

export const USER_STATUS = {
  ACTIVE: 1,
  DELETED: 2,
  BANNED: 3,
} as const;

export const USER_PRIVILEGE_STATUS = {
  NORMAL: 1,
  ADMIN: 2,
} as const;

export const CHANNEL_TYPE = {
  text: 1,
  voice: 2,
  news: 3,
} as const;
export type ChannelTypeKeys = keyof typeof CHANNEL_TYPE;
export type ChannelTypeValues = typeof CHANNEL_TYPE[ChannelTypeKeys];

export const MAX_TOKEN_AGE_DAYS = 7 as const;

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