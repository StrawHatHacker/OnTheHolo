import { USER_PRIVILEGE_STATUS, USER_STATUS } from '$lib/constants';
import type { AddCategoryData, AddChannelData, AddMessageData, CategoryFull, Message, NewUser } from '$lib/types';
import { db } from '$lib/server/db';
import { categoriesTable, channelsTable, messagesTable, safeUserFields, sessionsTable, usersTable } from '$lib/server/db/schema';
import { eq, and } from 'drizzle-orm';

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

	static async getUsers() {
		return await db.select(safeUserFields).from(usersTable).where(eq(usersTable.status, USER_STATUS.ACTIVE));
	}
}

export class SessionQueries {
	static async createSession(userId: number, token: string) {
		return await db.insert(sessionsTable).values({
			user_id: userId,
			token,
			created_at: new Date().toISOString(),
		});
	}

	static async deleteSession(userId: number, token: string) {
		return await db
			.delete(sessionsTable)
			.where(and(eq(sessionsTable.user_id, userId), eq(sessionsTable.token, token)));
	}

	static async getSession(token?: string) {
		if (!token) return null;

		return (
			(
				await db
					.select({
						session: {
							id: sessionsTable.id,
							createdAt: sessionsTable.created_at,
						},
						user: safeUserFields,
					})
					.from(sessionsTable)
					.innerJoin(
						usersTable,
						and(eq(sessionsTable.user_id, usersTable.id), eq(usersTable.status, USER_STATUS.ACTIVE))
					)
					.where(eq(sessionsTable.token, token))
					.limit(1)
			)?.[0] || null
		);
	}
}

export class ChannelQueries {
	static async getCategoryFull(): Promise<CategoryFull[]> {
		const rows = await db
			.select({
				category: categoriesTable,
				channel: channelsTable,
				message: messagesTable,
			})
			.from(categoriesTable)
			.leftJoin(
				channelsTable,
				eq(categoriesTable.id, channelsTable.category_id)
			)
			.leftJoin(
				messagesTable,
				eq(channelsTable.id, messagesTable.channel_id)
			);

		const categories = new Map<number, CategoryFull>();

		for (const row of rows) {
			let category = categories.get(row.category.id);

			if (!category) {
				category = {
					...row.category,
					channels: [],
				};

				categories.set(category.id, category);
			}

			if (!row.channel) {
				continue;
			}

			let channel = category.channels.find(
				(channel) => channel.id === row.channel!.id
			);

			if (!channel) {
				channel = {
					...row.channel,
					messages: [],
					typedMessage: '',
				};

				category.channels.push(channel);
			}

			if (row.message) {
				channel.messages.push(row.message);
			}
		}

		return [...categories.values()];
	}

	static async addCategory(data: AddCategoryData) {
		return await db.insert(categoriesTable).values({
			name: data.name,
			created_at: new Date().toISOString(),
		});
	}

	static async getChannels() {
		return await db.select().from(channelsTable);
	}

	static async addChannel(data: AddChannelData) {
		return await db.insert(channelsTable).values({
			name: data.name,
			type: data.channelType,
			category_id: data.categoryId,
			created_at: new Date().toISOString(),
		});
	}
}

export class MessageQueries {
	static async addMessage(data: AddMessageData): Promise<Message> {
		return (await db.insert(messagesTable).values({
			channel_id: data.channelId,
			user_id: data.userId,
			content: data.content,
			created_at: new Date().toISOString(),
		}).returning())?.[0];
	}
}