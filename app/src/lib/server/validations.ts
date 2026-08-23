import { USER_ACTIVITY_STATUS, USER_STATUS } from "$lib/constants";
import { ERROR_MAP } from "$lib/errors";
import * as z from "zod";

const statusValues = Object.values(USER_STATUS) as number[];
const activityStatusValues = Object.values(USER_ACTIVITY_STATUS) as number[];

const zUser = z.object({
  username: z.string(ERROR_MAP.invalidUsername).min(3, ERROR_MAP.invalidUsername),
  email: z.email(ERROR_MAP.invalidEmail),
  status: z.union(
    statusValues.map((v) => z.literal(v)) as [z.ZodLiteral<number>, ...z.ZodLiteral<number>[]],
    ERROR_MAP.generalError
  ),
  bio: z.string(ERROR_MAP.generalError).nullish(),
  activity_name: z.string(ERROR_MAP.generalError).min(1, ERROR_MAP.generalError).nullish(),
  activity_status: z.union(
    activityStatusValues.map((v) => z.literal(v)) as [z.ZodLiteral<number>, ...z.ZodLiteral<number>[]],
    ERROR_MAP.generalError
  ),
  profile_image: z.string(ERROR_MAP.generalError),
  banner_image: z.string(ERROR_MAP.generalError).nullish(),
});
export const validateUserPayload = (user: unknown) => {
  return zUser.safeParse(user);
}