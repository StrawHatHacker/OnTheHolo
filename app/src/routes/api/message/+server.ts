import { CError } from '$lib/utils';
import { error, json } from '@sveltejs/kit';
import { Auth } from '$lib/server/auth';
import { MessageQueries, UserQueries } from '$lib/server/db/queries';
import { ERROR_MAP } from '$lib/errors';
import type { NewMessagePayload } from '$lib/types';
import { PUBLIC_MAX_MESSAGE_LENGTH } from '$env/static/public';

const validatePostBody = (body: any) => {
	const channelIdNum = Number(body.channel_id);

	if (!body.channel_id || Number.isNaN(channelIdNum))
		throw new CError(400, ERROR_MAP.channelNotFound);
	if (!body.content || !(typeof body.content === 'string') || body.content.length < 1 || body.content.length > PUBLIC_MAX_MESSAGE_LENGTH)
		throw new CError(400, ERROR_MAP.invalidUsername);

	const data: NewMessagePayload = {
		channelId: channelIdNum,
		content: body.content
	};

	return data;
};
export const POST = async ({ request, cookies }) => {
	try {
		const body = validatePostBody(await request.json());
		const session = await Auth.verifySession(cookies);

		await MessageQueries.addMessage({
			channelId: body.channelId,
			content: body.content,
			userId: session.user.id,
		});

		return json({});
	} catch (e) {
		if (e instanceof CError) throw error(e.status, e.message);
		throw error(500, ERROR_MAP.generalError);
	}
};
