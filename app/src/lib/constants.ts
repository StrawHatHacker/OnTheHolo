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
};

export const MAX_TOKEN_AGE_DAYS = 7;
