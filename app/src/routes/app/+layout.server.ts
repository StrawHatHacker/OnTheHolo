import { redirect } from "@sveltejs/kit";
import type { LayoutServerLoad } from './$types';
import { COOKIE_MAP } from "$lib/constants";
import { SessionQueries } from "$lib/server/db/queries";

export const load: LayoutServerLoad = async ({ cookies }) => {
    const sessionCookie = cookies.get(COOKIE_MAP.SESSION);
    if (!sessionCookie) throw redirect(302, '/');

    const session = await SessionQueries.getSession(sessionCookie);
    if (!session) throw redirect(302, '/');

    return { session };
};