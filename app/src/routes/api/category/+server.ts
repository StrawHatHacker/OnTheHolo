import { CError } from '$lib/utils';
import { error, json } from '@sveltejs/kit';
import { Auth } from '$lib/server/auth';
import { ChannelQueries } from '$lib/server/db/queries';
import { ERROR_MAP } from '$lib/errors';
import type { Category, CategoryFull, NewChannelPayload } from '$lib/types';
import { getAllSSEUsers, sendSSEToUsers } from '$lib/server/sse';

const validatePostBody = (body: any) => {
	if (!body.name || !(typeof body.name === 'string') || body.name.length < 1)
		throw new CError(400, ERROR_MAP.generalError);

	const d: NewChannelPayload = {
		name: body.name,
		channelType: body.channelType,
		categoryId: Number(body.categoryId),
	};

	return d;
};
export const POST = async ({ request, cookies }) => {
	try {
		await Auth.verifySession(cookies);
		const body = validatePostBody(await request.json());

		const category = await ChannelQueries.addCategory({
			name: body.name,
		});

		sendSSEToUsers<Category>(getAllSSEUsers(), 'category:create', category);

		return json({});
	} catch (e) {
		if (e instanceof CError) throw error(e.status, e.message);
		throw error(500, ERROR_MAP.generalError);
	}
};
