export const ERROR_MAP = {
    generalError: 'Something went wrong',
    invalidEmail: 'Please enter a valid email address',
    invalidPassword: 'Password must be at least 16 characters and include a number and a special character',
    wrongCredentials: 'Incorrect email or password. Please try again',
    accountDeleted: 'Your account has been deleted',
    accountBanned: 'Your account has been banned by a moderator',
} as const;