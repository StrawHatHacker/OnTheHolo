// Relative path required here because of drizzle-orm
import { USER_ACTIVITY_STATUS } from '../../constants';
import { getColumns } from 'drizzle-orm';
import { boolean, index, integer, pgTable, text, timestamp, uniqueIndex, varchar } from 'drizzle-orm/pg-core';

export const usersTable = pgTable('users', {
	id: integer().primaryKey().generatedAlwaysAsIdentity(),
	username: varchar({ length: 255 }).notNull().unique(),
	email: varchar({ length: 255 }).notNull().unique(),
	password: text().notNull().unique(),
	salt: text().notNull(),
	status: integer().notNull(),
	privilege_status: integer().notNull(),
	profile_image_url: text(),
	activity_name: varchar({ length: 255 }),
	activity_status: integer().notNull().default(USER_ACTIVITY_STATUS.ONLINE),
	created_at: timestamp().notNull(),
	updated_at: timestamp().notNull(),
});
export const { password: _1, salt: _2, ...safeUserFields } = getColumns(usersTable);

export const sessionsTable = pgTable('sessions', {
	id: integer().primaryKey().generatedAlwaysAsIdentity(),
	user_id: integer()
		.notNull()
		.references(() => usersTable.id),
	token: text().notNull(),
	created_at: timestamp().notNull(),
}, (table) => [
	// Used in `getSessionByToken` and `deleteSession`
	uniqueIndex('sessions_token_idx').on(table.token),
	// Foreign key index for the join in `getSessionByToken` and `deleteSession`
	index('sessions_user_id_idx').on(table.user_id),
]);

export const categoriesTable = pgTable('channel_categories', {
	id: integer().primaryKey().generatedAlwaysAsIdentity(),
	name: text().notNull(),
	order: integer().notNull(),
	created_at: timestamp().notNull(),
	updated_at: timestamp().notNull(),
})

export const channelsTable = pgTable('channels', {
	id: integer().primaryKey().generatedAlwaysAsIdentity(),
	category_id: integer()
		.notNull()
		.references(() => categoriesTable.id),
	name: text().notNull(),
	type: integer().notNull(),
	created_at: timestamp().notNull(),
	updated_at: timestamp().notNull(),
}, (table) => [
	// Crucial for `deleteCategory`, `getCategoryByChannelId`, and `getCategoryFull` joins
	index('channels_category_id_idx').on(table.category_id),
])

export const messagesTable = pgTable('messages', {
	id: integer().primaryKey().generatedAlwaysAsIdentity(),
	channel_id: integer()
		.notNull()
		.references(() => channelsTable.id),
	user_id: integer()
		.notNull()
		.references(() => usersTable.id),
	content: text().notNull(),
	edited: boolean().notNull().default(false),
	created_at: timestamp().notNull(),
}, (table) => [
	// Crucial for the join in `getCategoryFull` and the bulk deletion in `deleteChannel`
	index('messages_channel_id_idx').on(table.channel_id),
	// Optimizes user lookups when fetching a specific user's messages
	index('messages_user_id_idx').on(table.user_id),
])
