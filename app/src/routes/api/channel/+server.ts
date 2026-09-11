import { CError } from '$lib/utils';
import { error, json } from '@sveltejs/kit';
import { Auth } from '$lib/server/auth';
import { ChannelQueries } from '$lib/server/db/queries';
import { ERROR_MAP } from '$lib/errors';
import { CHANNEL_TYPE } from '$lib/constants.js';
import type { DeleteChannelPayload, EditChannelPayload, AddChannelPayload, SSEChannel } from '$lib/types';
import { getAllSSEUsers, sendSSEToUsers } from '$lib/server/sse';
import { isRateLimited } from '$lib/server/ratelimits';

const validatePostBody = (body: any) => {
	const categoryIdNum = Number(body.categoryId);
	const channelTypeNum = Number(body.channelType);

	if (!body.name || !(typeof body.name === 'string') || body.name.length < 1)
		throw new CError(400, ERROR_MAP.generalError);
	if (Number.isNaN(categoryIdNum))
		throw new CError(400, ERROR_MAP.categoryNotFound);
	if (!body.channelType || Number.isNaN(channelTypeNum) || !Object.values(CHANNEL_TYPE).includes(channelTypeNum as any))
		throw new CError(400, ERROR_MAP.invalidChannelType);

	const d: AddChannelPayload = {
		name: body.name,
		channelType: body.channelType,
		categoryId: Number(body.categoryId),
	};

	return d;
};
export const POST = async ({ request, cookies, getClientAddress }) => {
	try {
		isRateLimited(Auth.getClientIp(request, getClientAddress), 'normal');
		const session = await Auth.verifySession(cookies);
		const body = validatePostBody(await request.json());

		const channel = await ChannelQueries.addChannel({
			name: body.name,
			channelType: body.channelType,
			categoryId: body.categoryId,
		});

		sendSSEToUsers<SSEChannel>(getAllSSEUsers(), 'channel:create', {
			categoryId: body.categoryId,
			channel
		});

		return json({});
	} catch (e) {
		if (e instanceof CError) throw error(e.status, e.message);
		throw error(500, ERROR_MAP.generalError);
	}
};

const validatePutBody = (body: any) => {
	const channelId = Number(body.channelId);

	if (!body.name || !(typeof body.name === 'string') || body.name.length < 1)
		throw new CError(400, ERROR_MAP.generalError);
	if (Number.isNaN(channelId))
		throw new CError(400, ERROR_MAP.channelNotFound);

	const d: EditChannelPayload = {
		name: body.name,
		channelId: channelId,
	};

	return d;
}
export const PUT = async ({ request, cookies, getClientAddress }) => {
	try {
		isRateLimited(Auth.getClientIp(request, getClientAddress), 'normal');
		const session = await Auth.verifySession(cookies);
		const body = validatePutBody(await request.json());

		const category = await ChannelQueries.getCategoryByChannelId(body.channelId);
		if (!category) throw new CError(400, ERROR_MAP.categoryNotFound);

		const channel = await ChannelQueries.editChannel({
			channelId: body.channelId,
			name: body.name
		});

		sendSSEToUsers<SSEChannel>(getAllSSEUsers(), 'channel:edit', {
			categoryId: category.id,
			channel
		});

		return json({});
	} catch (e) {
		console.log(e);
		if (e instanceof CError) throw error(e.status, e.message);
		throw error(500, ERROR_MAP.generalError);
	}
};

const validateDeleteBody = (body: any) => {
	const channelId = Number(body.channelId);

	if (Number.isNaN(channelId))
		throw new CError(400, ERROR_MAP.channelNotFound);

	const d: DeleteChannelPayload = {
		channelId: channelId,
	};

	return d;
}
export const DELETE = async ({ request, cookies, getClientAddress }) => {
	try {
		isRateLimited(Auth.getClientIp(request, getClientAddress), 'normal');
		const session = await Auth.verifySession(cookies);
		const body = validateDeleteBody(await request.json());

		const category = await ChannelQueries.getCategoryByChannelId(body.channelId);
		if (!category) throw new CError(400, ERROR_MAP.categoryNotFound);

		const channel = await ChannelQueries.deleteChannel(body.channelId);

		sendSSEToUsers<SSEChannel>(getAllSSEUsers(), 'channel:delete', {
			categoryId: category.id,
			channel: channel
		});

		return json({});
	} catch (e) {
		console.log(e);
		if (e instanceof CError) throw error(e.status, e.message);
		throw error(500, ERROR_MAP.generalError);
	}
};