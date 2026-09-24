import * as z from "zod";
import { CError, createCookieSettings } from '$lib/utils';
import { error, json } from '@sveltejs/kit';
import { Auth } from '$lib/server/auth';
import { SessionQueries, UserQueries } from '$lib/server/db/queries';
import { ERROR_MAP } from '$lib/errors';
import type { UserToEdit } from '$lib/types';
import { isRateLimited } from '$lib/server/ratelimits';
import { COOKIE_MAP, USER_PRIVILEGE_STATUS } from "$lib/constants";


const bodySchemaC = z.object({
  password: z.string({ error: ERROR_MAP.invalidPassword })
    .normalize().trim()
    .min(16, ERROR_MAP.invalidPassword)
    .max(128, ERROR_MAP.invalidPassword),
});
const bodySchema = z.compile(bodySchemaC);

export const PUT = async ({ request, cookies, getClientAddress }) => {
  try {
    isRateLimited(Auth.getClientIp(request, getClientAddress), 'auth');
    const session = await Auth.verifySession(cookies);

    if (session.user.privilege_status === USER_PRIVILEGE_STATUS.ADMIN)
      throw new CError(400, ERROR_MAP.adminCannotChangePassword);

    let v = bodySchema.safeParse(await request.json());
    if (!v.success) throw new CError(400, v.error.issues[0]?.message);

    const u = await UserQueries.getUserById(session.user.id);
    if (!u) throw new CError(400, ERROR_MAP.generalError);

    await SessionQueries.deleteUserSessions(session.user.id);

    const userToEdit: Partial<UserToEdit> = {
      password: Auth.hashPassword(v.data.password, u.salt),
      updated_at: new Date(),
    };

    await UserQueries.updateUser(userToEdit, session.user.id);

    cookies.delete(COOKIE_MAP.SESSION, { path: '/' });

    return json({});
  } catch (e) {
    if (e instanceof CError) throw error(e.status, e.message);
    throw error(500, ERROR_MAP.generalError);
  }
};