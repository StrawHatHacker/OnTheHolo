import type { LayoutServerLoad } from './$types';
import { COOKIE_MAP } from "$lib/constants";
import type { GlobalLocals } from "$lib/types";
import { Auth } from '$lib/server/auth';

export const load: LayoutServerLoad = async ({ cookies }) => {
    const locals: GlobalLocals = { lastUser: null };

    const sessionCookie = cookies.get(COOKIE_MAP.SESSION);
    if (!sessionCookie) return locals;

    try {
        const payload = await Auth.verifyPrivateKey(sessionCookie);

        locals.lastUser = {
            username: payload.username,
        }
        
        return locals;
    } catch {
        // Clearing expired/invalid token on global page load
        cookies.delete(COOKIE_MAP.SESSION, { path: '/' });
        return locals;
    }
};