// Admin can change these settings to their preferences
// Don't forget to build and restart the container after changing these :)

export const SETTINGS = {
  /** The title of the app */
  TITLE: "Holo",

  /** How many days should a token be valid for before needing to login again */
  MAX_TOKEN_AGE_DAYS: 7,
  SHOW_ADMIN_BADGE_IN_CHAT: true,
  PUBLIC_MAX_MESSAGE_LENGTH: 1000,

  MAX_PFP_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  MAX_BANNER_FILE_SIZE: 20 * 1024 * 1024, // 20MB
} as const;