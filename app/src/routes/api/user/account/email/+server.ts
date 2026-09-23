import * as z from "zod";
import { CError } from '$lib/utils';
import { error, json } from '@sveltejs/kit';
import { Auth } from '$lib/server/auth';
import { UserQueries } from '$lib/server/db/queries';
import { ERROR_MAP } from '$lib/errors';
import type { UserToEdit } from '$lib/types';
import { isRateLimited } from '$lib/server/ratelimits';
import { USER_PRIVILEGE_STATUS } from "$lib/constants";


const vs = z.object({
  email: z.email({ error: ERROR_MAP.invalidEmail }),
});

export const PUT = async ({ request, cookies, getClientAddress }) => {
  try {
    isRateLimited(Auth.getClientIp(request, getClientAddress), 'auth');
    const session = await Auth.verifySession(cookies);

    if (session.user.privilege_status === USER_PRIVILEGE_STATUS.ADMIN) 
      throw new CError(400, ERROR_MAP.adminCannotChangeEmail);

    let v = vs.safeParse(await request.json());
    if (!v.success) throw new CError(400, v.error.issues[0]?.message);

    let [userExists] = await UserQueries.getUserByEmail(v.data.email);
    if (userExists) throw new CError(400, ERROR_MAP.invalidEmail);

    const userToEdit: UserToEdit = {
      username: session.user.username,
      email: v.data.email.toLocaleLowerCase(),
      status: session.user.status,
      bio: session.user.bio,
      activity_name: session.user.activity_name,
      activity_status: session.user.activity_status,
      profile_image: session.user.profile_image,
      banner_image: session.user.banner_image,
      updated_at: new Date(),
    };

    await UserQueries.updateUser(userToEdit, session.user.id);

    return json({});
  } catch (e) {
    if (e instanceof CError) throw error(e.status, e.message);
    throw error(500, ERROR_MAP.generalError);
  }
};