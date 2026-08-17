import { CHANNEL_TYPE, MEDIA_FOLDERS, USER_PRIVILEGE_STATUS, USER_STATUS } from '$lib/constants';
import { Auth } from '$lib/server/auth';
import { db } from '$lib/server/db';
import { categoriesTable, channelsTable, usersTable } from '$lib/server/db/schema';
import type { ServerInit } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';
import { ADMIN_EMAIL, ADMIN_PASSWORD, ADMIN_SALT, ADMIN_USERNAME, SECRET_PASETO_KEY } from '$env/static/private';
import { PUBLIC_PASETO_KEY } from '$env/static/public';
import { report } from '$lib/utils';
import { existsSync } from 'fs';
import { mkdir } from 'fs/promises';
import { ImageGen } from '$lib/server/utils';

export const init: ServerInit = async () => {
	// Check if PASETO keys are generated
	if (!PUBLIC_PASETO_KEY || !SECRET_PASETO_KEY) {
		report.error('PASETO keys are not generated. Refer to README.md');
		process.exit(1);
	}

	if (!existsSync(MEDIA_FOLDERS.profileImages)) {
		await mkdir('static/' + MEDIA_FOLDERS.profileImages, { recursive: true });
		report.success('Profile images folder created');
	}

	// Check if the database is connected and initialize it
	try {
		// Drizzle does not support raw SQL execution for connection checks,
		// but we can perform a simple query to verify the DB is responding.
		await db.select().from(usersTable).limit(1);
		report.success('Database connection successful');
	} catch (e) {
		report.error('Database connection failed: ' + (e instanceof Error ? e.message : JSON.stringify(e)));
		report.error('You probably forgot to start docker or initialize the database with drizzle. Refer to README.md');
		process.exit(1);
	}

	const [adminUser] = await db
		.select()
		.from(usersTable)
		.where(eq(usersTable.email, ADMIN_EMAIL))
		.limit(1);

	if (!adminUser) {
		const filename = await ImageGen.profileImage(ADMIN_EMAIL);

		await db.insert(usersTable).values({
			username: ADMIN_USERNAME,
			email: ADMIN_EMAIL,
			password: Auth.hashPassword(ADMIN_PASSWORD, ADMIN_SALT),
			salt: ADMIN_SALT,
			status: USER_STATUS.ACTIVE,
			privilege_status: USER_PRIVILEGE_STATUS.ADMIN,
			profile_image: filename,
			created_at: new Date(),
			updated_at: new Date(),
		});

		report.success('Admin user created');
	}

	const categories = await db.select().from(categoriesTable).limit(1);
	if (categories.length === 0) {
		const cat = await db.insert(categoriesTable).values({
			name: 'General',
			order: 1,
			created_at: new Date(),
			updated_at: new Date(),
		}).returning();
		report.success('Default category created');

		await db.insert(channelsTable).values({
			category_id: cat[0].id,
			name: 'General',
			type: CHANNEL_TYPE.text,
			created_at: new Date(),
			updated_at: new Date(),
		});
		report.success('Default channel created');
	}

	
};
