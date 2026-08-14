// Relative path required here because of drizzle-orm
import { USER_ACTIVITY_STATUS } from '../../constants';
import { getColumns } from 'drizzle-orm';
import { integer, pgTable, text } from 'drizzle-orm/pg-core';

export const usersTable = pgTable('users', {
	id: integer().primaryKey().generatedAlwaysAsIdentity(),
	username: text().notNull(),
	email: text().notNull().unique(),
	password: text().notNull(),
	salt: text().notNull(),
	status: integer().notNull(),
	privilege_status: integer().notNull(),
	profile_image_url: text(),
	activity_name: text(),
	activity_status: integer().notNull().default(USER_ACTIVITY_STATUS.ONLINE),
	created_at: text().notNull(),
	updated_at: text().notNull(),
});
export const { password: _1, salt: _2, ...safeUserFields } = getColumns(usersTable);

export const sessionsTable = pgTable('sessions', {
	id: integer().primaryKey().generatedAlwaysAsIdentity(),
	user_id: integer()
		.notNull()
		.references(() => usersTable.id),
	token: text().notNull(),
	created_at: text().notNull(),
});

export const categoriesTable = pgTable('channel_categories', {
	id: integer().primaryKey().generatedAlwaysAsIdentity(),
	name: text().notNull(),
	order: integer().notNull(),
	created_at: text().notNull(),
})

export const channelsTable = pgTable('channels', {
	id: integer().primaryKey().generatedAlwaysAsIdentity(),
	category_id: integer()
		.notNull()
		.references(() => categoriesTable.id),
	name: text().notNull(),
	type: integer().notNull(),
	created_at: text().notNull(),
})

export const messagesTable = pgTable('messages', {
	id: integer().primaryKey().generatedAlwaysAsIdentity(),
	channel_id: integer()
		.notNull()
		.references(() => channelsTable.id),
	user_id: integer()
		.notNull()
		.references(() => usersTable.id),
	content: text().notNull(),
	created_at: text().notNull(),
})
