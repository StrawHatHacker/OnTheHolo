import { CError, createCookieSettings } from '$lib/utils';
import { error, json } from '@sveltejs/kit';
import { isValidEmail } from '$lib/server/utils';
import { COOKIE_MAP, USER_STATUS } from '$lib/constants';
import { Auth } from '$lib/server/auth';
import { SessionQueries, UserQueries } from '$lib/server/db/queries';
import { ERROR_MAP } from '$lib/errors';

const validatePostBody = (body: any) => {
	if (!body.email || !(typeof body.email === 'string') || !isValidEmail(body.email))
		throw new CError(400, ERROR_MAP.invalidEmail);
	if (!body.password || !(typeof body.password === 'string'))
		throw new CError(400, ERROR_MAP.invalidPassword);

	return {
		email: body.email,
		password: body.password,
	};
};
export const POST = async ({ request, cookies }) => {
	try {
		const body = validatePostBody(await request.json());

		const [user] = await UserQueries.getUserByEmail(body.email);
		if (!user) throw new CError(400, ERROR_MAP.wrongCredentials);

		if (user.status === USER_STATUS.DELETED) throw new CError(403, ERROR_MAP.accountDeleted);
		if (user.status === USER_STATUS.BANNED) throw new CError(403, ERROR_MAP.accountBanned);

		if (Auth.hashPassword(body.password, user.salt) !== user.password)
			throw new CError(400, ERROR_MAP.wrongCredentials);

		const token = await Auth.createPrivateKey({
			sub: user.id + '',
			username: user.username,
		});

		cookies.set(COOKIE_MAP.SESSION, token, createCookieSettings());

		await SessionQueries.createSession(user.id, token);

		return json({});
	} catch (e) {
		if (e instanceof CError) throw error(e.status, e.message);
		throw error(500, ERROR_MAP.generalError);
	}
};
