import { USER_STATUS } from "$lib/constants";
import { db } from ".";
import { sessionTable, usersTable } from "./schema";
import { eq, and, getColumns } from "drizzle-orm";

const { password: _, ...safeUserFields } = getColumns(usersTable);

export class UserQueries {
    static async getUserByEmail(email: string) {
        return await db.select().from(usersTable).where(eq(usersTable.email, email)).limit(1);
    }
}

export class SessionQueries {
    static async createSession(userId: number, token: string) {
        return await db.insert(sessionTable).values({
            user_id: userId,
            token,
            created_at: new Date().toISOString(),
            last_refreshed_at: new Date().toISOString()
        });
    }

    static async getSession(token: string) {
        return (await db
            .select({
                session: {
                    id: sessionTable.id,
                    createdAt: sessionTable.created_at,
                    lastRefreshedAt: sessionTable.last_refreshed_at,
                },
                user: safeUserFields,
            })
            .from(sessionTable)
            .innerJoin(usersTable,
                and(
                    eq(sessionTable.user_id, usersTable.id),
                    eq(usersTable.status, USER_STATUS.ACTIVE)
                ))
            .where(eq(sessionTable.token, token))
            .limit(1))?.[0] || null;
    }
}