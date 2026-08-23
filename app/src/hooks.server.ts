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
import { CronJob } from 'cron';
import fs from 'node:fs';
import path from 'node:path';

export const init: ServerInit = async () => {
	// Check if PASETO keys are generated
	if (!PUBLIC_PASETO_KEY || !SECRET_PASETO_KEY) {
		report.error('PASETO keys are not generated. Refer to README.md');
		process.exit(1);
	}

	for (const folder of Object.values(MEDIA_FOLDERS)) {
		if (!existsSync('uploads/' + folder)) {
			await mkdir('uploads/' + folder, { recursive: true });
			report.success(`${folder} folder created`);
		}
	}

	// Check if the database is connected and initialize it
	try {
		// Drizzle does not support raw SQL execution for connection checks,
		// but we can perform a simple query to verify the DB is responding.
		await db.select().from(usersTable).limit(1);
		report.success('Database connection successful');
	} catch (e) {
		report.error('Database connection failed: ' + (e instanceof Error ? e.message : JSON.stringify(e)));
		report.error('You probably forgot to start docker or sync the database with drizzle. Refer to README.md');
		process.exit(1);
	}

	const [adminUser] = await db
		.select()
		.from(usersTable)
		.where(eq(usersTable.email, ADMIN_EMAIL))
		.limit(1);

	if (!adminUser) {
		const pfpFilename = await ImageGen.profileImage(ADMIN_EMAIL);

		await db.insert(usersTable).values({
			username: ADMIN_USERNAME,
			email: ADMIN_EMAIL,
			password: Auth.hashPassword(ADMIN_PASSWORD, ADMIN_SALT),
			salt: ADMIN_SALT,
			status: USER_STATUS.ACTIVE,
			privilege_status: USER_PRIVILEGE_STATUS.ADMIN,
			profile_image: pfpFilename,
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

	const job = new CronJob(
		'0 * * * *', // At 0 of every hour
		async function () {
			cleanupHangingImages();
		},
		null, // onComplete
		true, // start
	);

	cleanupHangingImages();
};

const cleanupHangingImages = async () => {
	const allUsers = await db.select().from(usersTable);
	const allPfps = fs.readdirSync(ImageGen.profileImagePath);
	const allBanners = fs.readdirSync(ImageGen.bannerImagePath);

	const usedPfps = new Set(allUsers.map((u) => u.profile_image).filter(Boolean));
	const usedBanners = new Set(allUsers.map((u) => u.banner_image).filter(Boolean));

	const hangingPfps = allPfps.filter((filename) => !usedPfps.has(filename));
	const hangingBanners = allBanners.filter((filename) => !usedBanners.has(filename));

	await Promise.all(
		hangingPfps.map((filename) =>
			fs.promises.unlink(path.join(ImageGen.profileImagePath, filename))
		),
	);
	await Promise.all(
		hangingBanners.map((filename) =>
			fs.promises.unlink(path.join(ImageGen.bannerImagePath, filename))
		)
	);
};