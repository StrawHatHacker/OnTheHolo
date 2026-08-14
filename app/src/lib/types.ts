import type { ChannelTypeValues } from './constants';
import type { categoriesTable, channelsTable, messagesTable, usersTable } from './server/db/schema';

export type User = Omit<typeof usersTable.$inferSelect, 'password' | 'salt'>;

export type Message = typeof messagesTable.$inferSelect;

export type Channel = typeof channelsTable.$inferSelect;

export type Category = typeof categoriesTable.$inferSelect;

export type ChannelWithMessages = Channel & {
	messages: Message[];
	typedMessage: string;
};

export type CategoryFull = Category & {
	channels: ChannelWithMessages[];
};

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

export type NewUser = {
	username: string;
	email: string;
	password: string;
	salt: string;
};

export type NewCategoryPayload = {
	name: string;
}

export type AddCategoryData = {
	name: string;
}

export type NewChannelPayload = {
	name: string;
	channelType: ChannelTypeValues;
	categoryId: number;
}

export type AddChannelData = {
	name: string;
	channelType: ChannelTypeValues;
	categoryId: number;
}

export type NewMessagePayload = {
	channelId: number;
	content: string;
}

export type AddMessageData = {
	channelId: number;
	content: string;
	userId: number;
}
