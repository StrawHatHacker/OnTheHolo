import { USER_PRIVILEGE_STATUS, USER_STATUS } from '$lib/constants';
import { Auth } from '$lib/server/auth';
import { db } from '$lib/server/db';
import { usersTable } from '$lib/server/db/schema';
import type { ServerInit } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';
import { ADMIN_EMAIL, ADMIN_PASSWORD, ADMIN_SALT, ADMIN_USERNAME, SECRET_PASETO_KEY } from '$env/static/private';
import { PUBLIC_PASETO_KEY } from '$env/static/public';
import { report } from '$lib/utils';

export const init: ServerInit = async () => {
	// Check if PASETO keys are generated
	if (!PUBLIC_PASETO_KEY || !SECRET_PASETO_KEY) {
		report.error('PASETO keys are not generated. Refer to README.md');
		process.exit(1);
	}

	// Check if the database is connected and initialize it
	try {
		// Drizzle does not support raw SQL execution for connection checks,
		// but we can perform a simple query to verify the DB is responding.
		await db.select().from(usersTable).limit(1);
		report.success('Database connection successful');
	} catch (e) {
		report.error('Database connection failed: ' + (e instanceof Error ? e.message : JSON.stringify(e)));
		report.error('You probably forgot to initialize the database with drizzle. Refer to README.md');
		process.exit(1);
	}

	const [adminUser] = await db
		.select()
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
		report.success('Admin user created');
	}
};
