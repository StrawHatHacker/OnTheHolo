import { CError } from '$lib/utils';
import { error, json } from '@sveltejs/kit';
import { Auth } from '$lib/server/auth';
import { MessageQueries, UserQueries } from '$lib/server/db/queries';
import { ERROR_MAP } from '$lib/errors';
import type { AddMessagePayload, DeleteMessagePayload, EditMessagePayload, SSEMessage } from '$lib/types';
import { getAllSSEUsers, sendSSEToUsers, } from '$lib/server/sse';
import { SETTINGS } from '$lib/settings.js';

const validatePostBody = (body: any) => {
	const channelIdNum = Number(body.channelId);

	if (!body.channelId || Number.isNaN(channelIdNum))
		throw new CError(400, ERROR_MAP.channelNotFound);
	if (!body.content || !(typeof body.content === 'string') || body.content.length < 1 || body.content.length > SETTINGS.PUBLIC_MAX_MESSAGE_LENGTH)
		throw new CError(400, ERROR_MAP.messageLengthFailure);

	const data: AddMessagePayload = {
		channelId: channelIdNum,
		content: body.content
	};

	return data;
};
export const POST = async ({ request, cookies }) => {
	try {
		const session = await Auth.verifySession(cookies);
		const data = validatePostBody(await request.json());

		const msg = await MessageQueries.addMessage({
			channelId: data.channelId,
			content: data.content,
			userId: session.user.id,
		});

		sendSSEToUsers<SSEMessage>(getAllSSEUsers(), 'message:create', {
			message: msg
		});

		return json(msg);
	} catch (e) {
		if (e instanceof CError) throw error(e.status, e.message);
		throw error(500, ERROR_MAP.generalError);
	}
};

const validatePutBody = (body: any) => {
	const messageIdNum = Number(body.messageId);
	const channelIdNum = Number(body.channelId);

	if (Number.isNaN(channelIdNum))
		throw new CError(400, ERROR_MAP.channelNotFound);
	if (Number.isNaN(messageIdNum))
		throw new CError(400, ERROR_MAP.channelNotFound);
	if (!body.content || !(typeof body.content === 'string') || body.content.length < 1 || body.content.length > SETTINGS.PUBLIC_MAX_MESSAGE_LENGTH)
		throw new CError(400, ERROR_MAP.messageLengthFailure);

	const data: EditMessagePayload = {
		channelId: channelIdNum,
		messageId: messageIdNum,
		content: body.content
	};

	return data;
};
export const PUT = async ({ request, cookies }) => {
	try {
		const session = await Auth.verifySession(cookies);
		const data = validatePutBody(await request.json());

		const messageFull = await MessageQueries.getFullMessageById(data.channelId, data.messageId);
		if (!messageFull)
			throw new CError(400, ERROR_MAP.messageNotFound);
		if (messageFull.message.user_id !== session.user.id)
			throw new CError(400, ERROR_MAP.generalError);

		const editedMessage = await MessageQueries.editMessage({
			messageId: messageFull.message.id,
			channelId: messageFull.message.channel_id,
			userId: session.user.id,
			content: data.content
		});

		sendSSEToUsers<SSEMessage>(getAllSSEUsers(), 'message:edit', {
			message: editedMessage
		});

		return json({});
	} catch (e) {
		if (e instanceof CError) throw error(e.status, e.message);
		throw error(500, ERROR_MAP.generalError);
	}
};


const validateDeleteBody = (body: any) => {
	const channelIdNum = Number(body.channelId);
	const messageIdNum = Number(body.messageId);

	if (Number.isNaN(channelIdNum))
		throw new CError(400, ERROR_MAP.channelNotFound);
	if (Number.isNaN(messageIdNum))
		throw new CError(400, ERROR_MAP.messageNotFound);

	const data: DeleteMessagePayload = {
		channelId: channelIdNum,
		messageId: messageIdNum,
	};

	return data;
};
export const DELETE = async ({ request, cookies }) => {
	try {
		const session = await Auth.verifySession(cookies);
		const data = validateDeleteBody(await request.json());

		const messageFull = await MessageQueries.getFullMessageById(data.channelId, data.messageId);
		if (!messageFull)
			throw new CError(400, ERROR_MAP.messageNotFound);
		if (messageFull.message.user_id !== session.user.id)
			throw new CError(400, ERROR_MAP.generalError);

		await MessageQueries.deleteMessage({
			messageId: messageFull.message.id,
			channelId: messageFull.message.channel_id,
			userId: session.user.id,
		});

		sendSSEToUsers<SSEMessage>(getAllSSEUsers(), 'message:delete', {
			message: messageFull.message
		});

		return json({});
	} catch (e) {
		if (e instanceof CError) throw error(e.status, e.message);
		throw error(500, ERROR_MAP.generalError);
	}
};
