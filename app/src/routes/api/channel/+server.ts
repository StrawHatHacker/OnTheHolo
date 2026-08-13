import { CError } from '$lib/utils';
import { error, json } from '@sveltejs/kit';
import { Auth } from '$lib/server/auth';
import { ChannelQueries, MessageQueries, UserQueries } from '$lib/server/db/queries';
import { ERROR_MAP } from '$lib/errors';
import { CHANNEL_TYPE } from '$lib/constants.js';
import type { NewChannelPayload } from '$lib/types';

const validatePostBody = (body: any) => {
	const categoryIdNum = Number(body.categoryId);
	const channelTypeNum = Number(body.channelType);

	if (!body.name || !(typeof body.name === 'string') || body.name.length < 1)
		throw new CError(400, ERROR_MAP.generalError);
	if (Number.isNaN(categoryIdNum))
		throw new CError(400, ERROR_MAP.categoryNotFound);
	if (!body.channelType || Number.isNaN(channelTypeNum) || !Object.values(CHANNEL_TYPE).includes(channelTypeNum as any))
		throw new CError(400, ERROR_MAP.invalidChannelType);

	const d: NewChannelPayload = {
		name: body.name,
		channelType: body.channelType,
		categoryId: Number(body.categoryId),
	};

	return d;
};
export const POST = async ({ request, cookies }) => {
	try {
		const session = await Auth.verifySession(cookies);
		const body = validatePostBody(await request.json());

		await ChannelQueries.addChannel({
			name: body.name,
			channelType: body.channelType,
			categoryId: body.categoryId,
		});

		return json({});
	} catch (e) {
		if (e instanceof CError) throw error(e.status, e.message);
		throw error(500, ERROR_MAP.generalError);
	}
};
