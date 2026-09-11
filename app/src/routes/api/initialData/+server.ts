import { CError } from '$lib/utils';
import { error, json } from '@sveltejs/kit';
import { Auth } from '$lib/server/auth';
import { ERROR_MAP } from '$lib/errors';
import type { InitialServerData } from '$lib/types';
import { ChannelQueries, UserQueries } from '$lib/server/db/queries';
import { isRateLimited } from '$lib/server/ratelimits';

export const GET = async ({ request, cookies, getClientAddress }) => {
	try {
		isRateLimited(Auth.getClientIp(request, getClientAddress), 'initialData');
		await Auth.verifySession(cookies);

		let initData: InitialServerData = {
			categories: await ChannelQueries.getCategoryFull(),
			users: await UserQueries.getUsers(),
		};

		return json(initData);
	} catch (e) {
		if (e instanceof CError) throw error(e.status, e.message);
		throw error(500, ERROR_MAP.generalError);
	}
};
