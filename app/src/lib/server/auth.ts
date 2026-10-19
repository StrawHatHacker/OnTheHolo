import type { PasetoSignPayload, PasetoVerifiedPayload } from '$lib/types';
import { SECRET_PASETO_KEY } from '$env/static/private';
import { PUBLIC_PASETO_KEY } from '$env/static/public';
import crypto from 'node:crypto';
import { V4 } from 'paseto';
import type { Cookies } from '@sveltejs/kit';
import { COOKIE_MAP, USER_PRIVILEGE_STATUS } from '$lib/constants';
import { CError } from '$lib/utils';
import { ERROR_MAP } from '$lib/errors';
import { SessionQueries } from '$lib/server/db/queries';

export class Auth {
	static hashPassword = (password: string, salt: string) => {
		return crypto.pbkdf2Sync(password, salt, 100000, 64, 'sha512').toString('hex');
	};

	static generateRandom = (length = 32) => {
		return crypto.randomBytes(length).toString('hex');
	};

	static async createPrivateKey(user: PasetoSignPayload) {
		return await V4.sign({ sub: user.sub, username: user.username }, SECRET_PASETO_KEY, {
			expiresIn: '30 days',
		});
	}

	static async verifyPrivateKey(token: string): Promise<PasetoVerifiedPayload> {
		return await V4.verify(token, PUBLIC_PASETO_KEY);
	}

	/**
	 * First verify the cookie, then check the db.
	 * Throws CError if the session is invalid.
	 */
	static async verifySession(cookies: Cookies, requireAdmin = false) {
		const sessionCookie = cookies.get(COOKIE_MAP.SESSION);
		if (!sessionCookie) throw new CError(401, ERROR_MAP.invalidSession);

		this.verifyPrivateKey(sessionCookie);

		const session = await SessionQueries.getSessionByToken(sessionCookie);
		if (!session) throw new CError(401, ERROR_MAP.invalidSession);

		if (requireAdmin && session.user.privilege_status !== USER_PRIVILEGE_STATUS.ADMIN)
			throw new CError(403, ERROR_MAP.generalError);

		return session;
	}

	static getClientIp(request: Request, getClientAddress: () => string) {
		const xff = request.headers.get('x-forwarded-for');
		if (xff) {
			return xff.split(',')[0].trim();
		}
		return getClientAddress();
	}
}
