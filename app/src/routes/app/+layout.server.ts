import type { LayoutServerLoad } from './$types';
import { Auth } from '$lib/server/auth';
import { redirect } from '@sveltejs/kit';

export const load: LayoutServerLoad = async ({ cookies }) => {
	let session = null;
	try {
		session = await Auth.verifySession(cookies);
	} catch {
		session = null;
	}

	if (!session) {
		return redirect(302, '/');
	}

	return { session };
};