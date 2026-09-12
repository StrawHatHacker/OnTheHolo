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
	users: {
		findById(id: number) {
			return Users.find((u) => u.id === id);
		},
		edit(user: User) {
			const index = UsersC.findIndex((u) => u.id === user.id);
			if (index === -1) return;
			UsersC[index] = user;
		}
	},
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
		add(category: CategoryFull) {
			// New categories don't have channels
			CategoryC.push(
				category
			);
		},
		replace(category: CategoryFull) {
			const cat = CategoryC.find((c) => c.id === category.id);
			if (!cat) return;
			const index = CategoryC.indexOf(cat);
			CategoryC[index] = category;
		},
		delete(categoryId: number) {
			const cat = CategoryC.find((c) => c.id === categoryId);
			if (!cat) return;
			const index = CategoryC.indexOf(cat);
			CategoryC.splice(index, 1);
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
		findById(id: number) {
			return this.find((category) => category.id === id);
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
		findById(id: number) {
			return this.find((channel) => channel.id === id);
		},
		add(categoryId: number, channel: ChannelWithMessages) {
			CategoryC.find((c) => c.id === categoryId)?.channels.push(channel);
		},
		replace(categoryId: number, channel: ChannelWithMessages) {
			const cat = CategoryC.find((c) => c.id === categoryId);
			if (!cat) return;
			const index = cat.channels.findIndex((c) => c.id === channel.id);
			if (index === -1) return;
			cat.channels[index] = channel;
		},
		delete(categoryId: number, channelId: number) {
			const cat = CategoryC.find((c) => c.id === categoryId);
			if (!cat) return;
			const index = cat.channels.findIndex((c) => c.id === channelId);
			if (index === -1) return;
			cat.channels.splice(index, 1);
		},
		first() {
			return CategoryC.at(0)?.channels.at(0) ?? null;
		},
		getCurrent() {
			return this.find(
				channel => channel.id === AppState.currentChannelId
			);
		},
		sendMessage(message: Message) {
			const channel = this.findById(message.channel_id);
			if (!channel) return;
			channel.messages.push(message);
		}
	},
	messages: {
		edit(message: Message) {
			const channel = Store.channels.findById(message.channel_id);
			if (!channel) return;
			const index = channel.messages.findIndex((m) => m.id === message.id);
			if (index === -1) return;
			channel.messages[index] = message;
		},
		delete(channelId: number, messageId: number) {
			const channel = Store.channels.findById(channelId);
			if (!channel) return;
			const index = channel.messages.findIndex((m) => m.id === messageId);
			if (index === -1) return;
			channel.messages.splice(index, 1);
		}
	}

};

export const AppState = $state({
	// General
	initialized: false,
	currentChannelId: null as number | null,

	// User
	isEditUserDialogOpen: false,

	// Categoies
	isAddCategoryDialogOpen: false,
	isEditCategoryDialogOpen: false,
	categoryToEdit: null as CategoryFull | null,
	isDeleteCategoryDialogOpen: false,
	categoryToDelete: null as CategoryFull | null,

	// Channels
	isAddChannelDialogOpen: false,
	addChannelDialogOptions: null as {
		channelType: ChannelTypeValues;
		forCategoryId: number;
	} | null,
	isEditChannelDialogOpen: false,
	channelToEdit: null as ChannelWithMessages | null,
	isDeleteChannelDialogOpen: false,
	channelToDelete: null as ChannelWithMessages | null,

	// Other dialogs
	isSettingsDialogOpen: false
});
