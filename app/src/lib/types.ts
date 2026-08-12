// ONLY IMPORT TYPES FROM $lib/server/*
import type { categoriesTable, channelsTable, messagesTable, usersTable } from "$lib/server/db/schema";
import type { ChannelTypeValues } from "$lib/constants";

export type User = Omit<typeof usersTable.$inferSelect, 'password' | 'salt'>;
export type Messages = typeof messagesTable.$inferSelect;
export type Channel = typeof channelsTable.$inferSelect;
export type Category = typeof categoriesTable.$inferSelect;
export type ChannelWithMessages = Channel & {
	messages: Messages[];
	typedMessage: string;
}
export type CategoryWithChannels = Category & {
	channels: ChannelWithMessages[];
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

export type NewMessagePayload = {
	channelId: number;
	content: string;
}

export type AddMessageData = {
	channelId: number;
	content: string;
	userId: number;
}

export type NewChannelPayload = {
	name: string;
	channelType: ChannelTypeValues;
	categoryId: number;
}