import type { LayoutServerLoad } from './$types';
import { Auth } from '$lib/server/auth';

export const load: LayoutServerLoad = async ({ cookies }) => {
	const session = await Auth.verifySession(cookies);

	return { session };
};
