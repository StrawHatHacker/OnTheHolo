import { CError, createCookieSettings } from '$lib/utils';
import { error, json } from '@sveltejs/kit';
import { COOKIE_MAP } from '$lib/constants';
import { Auth } from '$lib/server/auth';
import { SessionQueries } from '$lib/server/db/queries';
import { ERROR_MAP } from '$lib/errors';

export const GET = async ({ cookies }) => {
    try {
        const sessionToken = cookies.get(COOKIE_MAP.SESSION);
        if (!sessionToken) throw new CError(401, '');

        const session = await SessionQueries.getSession(sessionToken);
        if (!session) throw new CError(401, '');

        const token = await Auth.createPrivateKey({
            sub: session.user.id + '',
            username: session.user.username,
        });

        cookies.set(COOKIE_MAP.SESSION, token, createCookieSettings());

        await SessionQueries.deleteSession(session.user.id, sessionToken);
        await SessionQueries.createSession(session.user.id, token);

        return json({});
    } catch (e) {
        if (e instanceof CError) throw error(e.status, e.message);
        throw error(500, ERROR_MAP.generalError);
    }
};