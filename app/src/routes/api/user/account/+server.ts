import * as z from "zod";
import { CError } from '$lib/utils';
import { error, json } from '@sveltejs/kit';
import { Auth } from '$lib/server/auth';
import { SessionQueries, UserQueries } from '$lib/server/db/queries';
import { ERROR_MAP } from '$lib/errors';
import { isRateLimited } from '$lib/server/ratelimits';
import { COOKIE_MAP, USER_PRIVILEGE_STATUS } from "$lib/constants";
import { getAllSSEUsers, sendSSEToUsers, unregisterUserConnections } from "$lib/server/sse";
import type { SSEUserDeleted } from "$lib/types";

const bodySchemaC = z.object({
  deleteAllTraces: z.boolean(),
  password: z.string({ error: ERROR_MAP.invalidPassword })
});
const bodySchema = z.compile(bodySchemaC);

export const DELETE = async ({ request, cookies, getClientAddress }) => {
  try {
    isRateLimited(Auth.getClientIp(request, getClientAddress), 'auth');
    const session = await Auth.verifySession(cookies);

    if (session.user.privilege_status === USER_PRIVILEGE_STATUS.ADMIN)
      throw new CError(400, ERROR_MAP.adminCannotDeleteSelfAccount);

    let v = bodySchema.safeParse(await request.json());
    if (!v.success) throw new CError(400, v.error.issues[0]?.message);

    const u = await UserQueries.getUserById(session.user.id);
    if (!u) throw new CError(400, ERROR_MAP.generalError);

    console.log(v.data);

    if (v.data.deleteAllTraces) {
      await UserQueries.deleteAllUserMessages(session.user.id);
    }
    
    await SessionQueries.deleteUserSessions(session.user.id);
    await UserQueries.deleteUser(u.id);

    cookies.delete(COOKIE_MAP.SESSION, { path: '/' });

    unregisterUserConnections(u.id);

    sendSSEToUsers<SSEUserDeleted>(getAllSSEUsers(), 'user:delete', {
      userId: u.id,
      deleteAllTraces: v.data.deleteAllTraces
    });

    return json({});
  } catch (e) {
    console.log(e);
    if (e instanceof CError) throw error(e.status, e.message);
    throw error(500, ERROR_MAP.generalError);
  }
};