import { CError } from '$lib/utils';
import { error, json } from '@sveltejs/kit';
import { Auth } from '$lib/server/auth';
import { UserQueries } from '$lib/server/db/queries';
import { ERROR_MAP } from '$lib/errors';
import { type USER_ACTIVITY_STATUS_VALUES, type USER_STATUS_VALUES } from '$lib/constants';
import { validateUserPayload } from '$lib/server/validations.js';
import type { SSEMessage, SSEUser, User, UserToEdit } from '$lib/types';
import { getAllSSEUsers, sendSSEToUsers } from '$lib/server/sse';
import { isRateLimited } from '$lib/server/ratelimits';


const validatePutBody = (body: any) => {
	const result = validateUserPayload(body);
	if (!result.success) throw new CError(400, result.error.issues[0].message);

	const data: UserToEdit = {
		username: result.data.username,
		email: result.data.email.toLocaleLowerCase(),
		status: Number(result.data.status) as USER_STATUS_VALUES,
		bio: result.data.bio || null,
		activity_name: result.data.activity_name || null,
		activity_status: Number(result.data.activity_status) as USER_ACTIVITY_STATUS_VALUES,
		profile_image: result.data.profile_image,
		banner_image: result.data.banner_image || null,
		updated_at: new Date(),
	}

	return data;
};
export const PUT = async ({ request, cookies, getClientAddress }) => {
	try {
		isRateLimited(Auth.getClientIp(request, getClientAddress), 'normal');
		const session = await Auth.verifySession(cookies);
		let newUser = validatePutBody(await request.json());

		const u = await UserQueries.updateUser(newUser, session.user.id);

		sendSSEToUsers<SSEUser>(getAllSSEUsers(), 'user:edit', {
			user: u
		});

		return json({});
	} catch (e) {
		console.log(e);
		if (e instanceof CError) throw error(e.status, e.message);
		throw error(500, ERROR_MAP.generalError);
	}
};

