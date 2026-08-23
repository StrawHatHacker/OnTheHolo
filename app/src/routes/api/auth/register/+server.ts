import { CError } from '$lib/utils';
import { error, json } from '@sveltejs/kit';
import { ImageGen, isValidEmail } from '$lib/server/utils';
import { Auth } from '$lib/server/auth';
import { UserQueries } from '$lib/server/db/queries';
import { ERROR_MAP } from '$lib/errors';
import { USER_PRIVILEGE_STATUS, USER_STATUS } from '$lib/constants';

const validatePostBody = (body: any) => {
  if (!body.email || !(typeof body.email === 'string') || !isValidEmail(body.email))
    throw new CError(400, ERROR_MAP.invalidEmail);
  if (!body.username || !(typeof body.username === 'string'))
    throw new CError(400, ERROR_MAP.invalidUsername);
  if (!body.password || !(typeof body.password === 'string'))
    throw new CError(400, ERROR_MAP.invalidPassword);

  return {
    email: body.email,
    username: body.username,
    password: body.password,
  };
};
export const POST = async ({ request }) => {
  try {
    const body = validatePostBody(await request.json());

    let [user] = await UserQueries.getUserByEmail(body.email);
    if (user) throw new CError(400, ERROR_MAP.invalidEmail);

    [user] = await UserQueries.getUserByUsername(body.username);
    if (user) throw new CError(400, ERROR_MAP.usernameTaken);

    const salt = Auth.generateRandom(32);
    const pfpFilename = await ImageGen.profileImage(body.email);

    await UserQueries.createUser({
      username: body.username,
      email: body.email,
      password: Auth.hashPassword(body.password, salt),
      salt: salt,
      status: USER_STATUS.ACTIVE,
      privilege_status: USER_PRIVILEGE_STATUS.ADMIN,
      profile_image: pfpFilename,
      created_at: new Date(),
      updated_at: new Date(),
    });

    return json({});
  } catch (e) {
    if (e instanceof CError) throw error(e.status, e.message);
    throw error(500, ERROR_MAP.generalError);
  }
};