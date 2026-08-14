// USE CLIENT-SIDE ONLY

import type { ChannelTypeValues } from '$lib/constants';
import type { CategoryFull, Channel, ChannelWithMessages, Message, User } from './types';

let UsersC = $state<User[]>([]);

export const Users = {
	find(callback: (user: User) => boolean): User | null {
		return UsersC.find(callback) ?? null;
	},
	filter(callback: (user: User) => boolean): User[] {
		return UsersC.filter(callback);
	},
	first(): User | null {
		return UsersC.at(0) ?? null;
	},
	last(): User | null {
		return UsersC.at(-1) ?? null;
	},
	set(users: User[]) {
		UsersC.splice(0, UsersC.length, ...users);
	},
	getAll(): User[] {
		return UsersC;
	}
};

const CategoryC = $state<CategoryFull[]>([]);

export const Store = {
	categories: {
		set(categories: CategoryFull[]) {
			CategoryC.splice(
				0,
				CategoryC.length,
				...categories.map((category) => ({
					...category,
					channels: category.channels.map((channel) => ({
						...channel,
						messages: [...channel.messages],
					})),
				}))
			);
		},
		get length() {
			return CategoryC.length;
		},
		getAll() {
			return CategoryC;
		},
		find(callback: (category: CategoryFull) => boolean) {
			return CategoryC.find(callback) ?? null;
		},
	},

	channels: {
		find(
			callback: (channel: Channel) => boolean
		) {
			for (const category of CategoryC) {
				const channel = category.channels.find(callback);
				if (channel) return channel;
			}

			return null;
		},
		first() {
			return CategoryC.at(0)?.channels.at(0) ?? null;
		},
		getCurrent() {
			return this.find(
				channel => channel.id === AppState.currentChannelId
			);
		},
		sendMessage(channel: ChannelWithMessages, message: Message) {
			if (channel) channel.messages.push(message);
		}
	}

};

export const AppState = $state({
	initialized: false,

	currentChannelId: null as number | null,

	isCreateCategoryDialogOpen: false,

	isAddChannelDialogOpen: false,
	addChannelDialogOptions: null as {
		channelType: ChannelTypeValues;
		forCategoryId: number;
	} | null,
});
