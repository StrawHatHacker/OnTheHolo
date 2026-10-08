import { CError } from '$lib/utils';
import { error, json } from '@sveltejs/kit';
import { Auth } from '$lib/server/auth';
import { SessionQueries, UserQueries } from '$lib/server/db/queries';
import { ERROR_MAP } from '$lib/errors';
import { isRateLimited } from '$lib/server/ratelimits';
import { COOKIE_MAP } from "$lib/constants";
import { unregisterUserConnection } from "$lib/server/sse";

export const DELETE = async ({ request, cookies, getClientAddress }) => {
  try {
    isRateLimited(Auth.getClientIp(request, getClientAddress), 'auth');
    const session = await Auth.verifySession(cookies);

    await SessionQueries.deleteSessionById(session.session.id);
    
    unregisterUserConnection(session.user.id, session.session.id);

    cookies.delete(COOKIE_MAP.SESSION, { path: '/' });

    return json({});
  } catch (e) {
    console.log(e);
    if (e instanceof CError) throw error(e.status, e.message);
    throw error(500, ERROR_MAP.generalError);
  }
};