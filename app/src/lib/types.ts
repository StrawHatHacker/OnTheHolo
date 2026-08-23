import type { ChannelTypeValues, USER_ACTIVITY_STATUS_VALUES } from './constants';
import type { SessionQueries } from './server/db/queries';
import type { categoriesTable, channelsTable, messagesTable, usersTable } from './server/db/schema';

export type User = Omit<typeof usersTable.$inferSelect, 'password' | 'salt'>;

export type Message = typeof messagesTable.$inferSelect;

export type Channel = typeof channelsTable.$inferSelect;

export type Category = typeof categoriesTable.$inferSelect;

export type SessionWithUser = Awaited<ReturnType<typeof SessionQueries.getSessionByToken>>;

export type ChannelWithMessages = Channel & {
	messages: Message[];
	typedMessage: string;
};

export type CategoryFull = Category & {
	channels: ChannelWithMessages[];
};

export type UserToEdit = Omit<User, 'id' | 'privilege_status'| 'created_at'>;

export type InitialServerData = {
	categories: CategoryFull[];
	users: User[];
};

export type GlobalLocals = {
	lastUser: {
		username: string;
	} | null;
};

export type PasetoSignPayload = {
	sub: string;
	username: string;
};

export type PasetoVerifiedPayload = PasetoSignPayload & {
	iat: number;
	exp: number;
};

export type AddCategoryPayload = {
	name: string;
}

export type AddCategoryData = {
	name: string;
}

export type EditCategoryPayload = {
	categoryId: number;
	name: string;
}

export type EditCategoryData = {
	categoryId: number;
	name: string;
}

export type DeleteCategoryPayload = {
	categoryId: number;
}

export type DeleteCategoryData = {
	categoryId: number;
}

export type AddChannelPayload = {
	name: string;
	channelType: ChannelTypeValues;
	categoryId: number;
}

export type AddChannelData = {
	name: string;
	channelType: ChannelTypeValues;
	categoryId: number;
}

export type EditChannelPayload = {
	channelId: number;
	name: string;
}

export type EditChannelData = {
	channelId: number;
	name: string;
}

export type DeleteChannelPayload = {
	channelId: number;
}

export type AddMessagePayload = {
	channelId: number;
	content: string;
}

export type AddMessageData = {
	channelId: number;
	content: string;
	userId: number;
}

export type EditMessagePayload = {
	channelId: number;
	messageId: number;
	content: string;
}

export type EditMessageData = {
	channelId: number;
	messageId: number;
	userId: number;
	content: string;
}

export type DeleteMessagePayload = {
	channelId: number;
	messageId: number;
}

export type DeleteMessageData = {
	messageId: number;
	channelId: number;
	userId: number;
}

export type EditUserPayload = {
	pfpFilename: string | null;
}

export type MediaUploadResponse = {
	filename: string;
}

export type SSEMessage = {
	message: Message;
}

export type SSEChannel = {
	// TODO channel already has category_id
	categoryId: number;
	channel: Channel;
}

export type SSEUser = {
	user: User;
}