import { USER_PRIVILEGE_STATUS, USER_STATUS } from '$lib/constants';
import type { NewUser } from '$lib/types';
import { db } from '.';
import { sessionTable, usersTable } from './schema';
import { eq, and, getColumns } from 'drizzle-orm';

const { password: _, ...safeUserFields } = getColumns(usersTable);

export class UserQueries {
	static async getUserByEmail(email: string) {
		return await db.select().from(usersTable).where(eq(usersTable.email, email)).limit(1);
	}

	static async getUserByUsername(username: string) {
		return await db.select().from(usersTable).where(eq(usersTable.username, username)).limit(1);
	}

	static async createUser(newUser: NewUser) {
		return await db.insert(usersTable).values({
			username: newUser.username,
			email: newUser.email,
			password: newUser.password,
			salt: newUser.salt,
			status: USER_STATUS.ACTIVE,
			priviledge_status: USER_PRIVILEGE_STATUS.NORMAL,
			created_at: new Date().toISOString(),
			updated_at: new Date().toISOString(),
		});
	}
}

export class SessionQueries {
	static async createSession(userId: number, token: string) {
		return await db.insert(sessionTable).values({
			user_id: userId,
			token,
			created_at: new Date().toISOString(),
		});
	}

	static async deleteSession(userId: number, token: string) {
		return await db
			.delete(sessionTable)
			.where(and(eq(sessionTable.user_id, userId), eq(sessionTable.token, token)));
	}

	static async getSession(token?: string) {
		if (!token) return null;

		return (
			(
				await db
					.select({
						session: {
							id: sessionTable.id,
							createdAt: sessionTable.created_at,
						},
						user: safeUserFields,
					})
					.from(sessionTable)
					.innerJoin(
						usersTable,
						and(eq(sessionTable.user_id, usersTable.id), eq(usersTable.status, USER_STATUS.ACTIVE))
					)
					.where(eq(sessionTable.token, token))
					.limit(1)
			)?.[0] || null
		);
	}
}
