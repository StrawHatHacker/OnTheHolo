// Admin can change these settings to their preferences
// Don't forget to build and restart the container after changing these :)

export const SETTINGS = {
  /** The title of the app */
  TITLE: "Holo",

  /** How many days should a token be valid for before needing to login again */
  MAX_TOKEN_AGE_DAYS: 7,
  SHOW_ADMIN_BADGE_IN_CHAT: true,
  PUBLIC_MAX_MESSAGE_LENGTH: 1000
} as const;