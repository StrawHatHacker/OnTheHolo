import { USER_PRIVILEGE_STATUS, USER_STATUS } from "$lib/constants";
import { Auth } from "$lib/server/auth";
import { db } from "$lib/server/db";
import { usersTable } from "$lib/server/db/schema";
import type { ServerInit } from "@sveltejs/kit";
import { eq } from "drizzle-orm";
import { ADMIN_EMAIL, ADMIN_PASSWORD, ADMIN_SALT, ADMIN_USERNAME } from "$env/static/private";

export const init: ServerInit = async () => {
    try {
        // Drizzle does not support raw SQL execution for connection checks,
        // but we can perform a simple query to verify the DB is responding.
        await db.select().from(usersTable).limit(1);
        console.info('✅ Database connection successful!');
    } catch (error) {
        console.error('❌ Database connection failed:', error);
        throw new Error('Failed to connect to the database.');
    }

    const [adminUser] = await db.select()
        .from(usersTable)
        .where(eq(usersTable.email, ADMIN_EMAIL))
        .limit(1);

    if (!adminUser) {
        await db.insert(usersTable).values({
            username: ADMIN_USERNAME,
            email: ADMIN_EMAIL,
            password: Auth.hashPassword(ADMIN_PASSWORD, ADMIN_SALT),
            salt: ADMIN_SALT,
            status: USER_STATUS.ACTIVE,
            priviledge_status: USER_PRIVILEGE_STATUS.ADMIN,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        });
        console.info('✅ Admin user created!');
    }
};