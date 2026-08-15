import type { ChannelTypeValues } from './constants';
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

export type NewMessagePayload = {
	channelId: number;
	content: string;
}

export type AddMessageData = {
	channelId: number;
	content: string;
	userId: number;
}

export type SSEMessage = {
	channelId: number;
	message: Message;
}

export type SSEChannel = {
	categoryId: number;
	channel: Channel;
}