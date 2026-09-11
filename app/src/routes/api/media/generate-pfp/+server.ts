import { CError } from '$lib/utils';
import { error, json } from '@sveltejs/kit';
import { Auth } from '$lib/server/auth';
import { ERROR_MAP } from '$lib/errors';
import { ImageGen } from '$lib/server/utils.js';
import { isRateLimited } from '$lib/server/ratelimits';

export const GET = async ({ request, cookies, getClientAddress }) => {
	try {
		isRateLimited(Auth.getClientIp(request, getClientAddress), 'media');
		const session = await Auth.verifySession(cookies);

		const filename = await ImageGen.profileImage(Auth.generateRandom(16) + session.user.id);

		return json({ filename });
	} catch (e) {
		if (e instanceof CError) throw error(e.status, e.message);
		throw error(500, ERROR_MAP.generalError);
	}
};

