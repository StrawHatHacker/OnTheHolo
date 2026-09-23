import { SETTINGS } from "./settings";

export const ERROR_MAP = {
	generalError: 'Something went wrong. Try again later',
	invalidSession: 'Invalid session. Please log in again',
	invalidEmail: 'Please enter a valid email address',
	invalidPassword:
		'Password must be at least 16 characters and include a number and a special character',
	invalidUsername: 'Username must be at least 3 characters',
	invalidChannelType: 'Invalid channel type',
	channelNotFound: 'Channel not found',
	categoryNotFound: 'Category not found',
	messageNotFound: 'Message not found',
	messageLengthFailure: `Messages should less than ${SETTINGS.PUBLIC_MAX_MESSAGE_LENGTH} characters`,
	usernameTaken: 'Username is already taken',
	wrongCredentials: 'Incorrect email or password. Please try again',
	accountDeleted: 'Your account has been deleted',
	accountBanned: 'Your account has been banned by a moderator',
	fileTooLarge: 'File is too large',
	tooManyRequests: 'Too many requests. Please try again later',
	adminCannotChangeEmail: 'Admins cannot change their email',
} as const;
