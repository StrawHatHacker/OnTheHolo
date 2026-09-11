import { CError } from '$lib/utils';
import { error, json } from '@sveltejs/kit';
import { Auth } from '$lib/server/auth';
import { ChannelQueries } from '$lib/server/db/queries';
import { ERROR_MAP } from '$lib/errors';
import type { Category, CategoryFull, EditCategoryPayload, AddChannelPayload, DeleteCategoryPayload } from '$lib/types';
import { getAllSSEUsers, sendSSEToUsers } from '$lib/server/sse';
import { isRateLimited } from '$lib/server/ratelimits';

const validatePostBody = (body: any) => {
	if (!body.name || !(typeof body.name === 'string') || body.name.length < 1)
		throw new CError(400, ERROR_MAP.generalError);

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

const validatePutBody = (body: any) => {
	let categoryId = Number(body.categoryId);

	if (!body.name || !(typeof body.name === 'string') || body.name.length < 1)
		throw new CError(400, ERROR_MAP.generalError);
	if (Number.isNaN(categoryId))
		throw new CError(400, ERROR_MAP.categoryNotFound);

	const data: EditCategoryPayload = {
		categoryId: categoryId,
		name: body.name,
	};

	return data;
};
export const PUT = async ({ request, cookies, getClientAddress }) => {
	try {
		isRateLimited(Auth.getClientIp(request, getClientAddress), 'normal');
		await Auth.verifySession(cookies);
		const data = validatePutBody(await request.json());

		const category = await ChannelQueries.editCategory({
			categoryId: data.categoryId,
			name: data.name,
		});

		sendSSEToUsers<Category>(getAllSSEUsers(), 'category:edit', category);

		return json({});
	} catch (e) {
		if (e instanceof CError) throw error(e.status, e.message);
		throw error(500, ERROR_MAP.generalError);
	}
};

const validateDeleteBody = (body: any) => {
	let categoryId = Number(body.categoryId);

	if (Number.isNaN(categoryId))
		throw new CError(400, ERROR_MAP.categoryNotFound);

	const data: DeleteCategoryPayload = {
		categoryId: categoryId,
	};

	return data;
};
export const DELETE = async ({ request, cookies, getClientAddress }) => {
	try {
		isRateLimited(Auth.getClientIp(request, getClientAddress), 'normal');
		await Auth.verifySession(cookies);
		const data = validateDeleteBody(await request.json());

		const category = await ChannelQueries.deleteCategory({
			categoryId: data.categoryId,
		});

		sendSSEToUsers<Category>(getAllSSEUsers(), 'category:delete', category);

		return json({});
	} catch (e) {
		if (e instanceof CError) throw error(e.status, e.message);
		throw error(500, ERROR_MAP.generalError);
	}
};
