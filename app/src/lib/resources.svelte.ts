/**
 * - WOAH WHAT'S ALL THIS?
 * - Calm down little bro, I tried making something similar to discord.js' Collection
 * - It doesn't have circular references yet and it doesn't need to for now
 */

import { SvelteMap } from 'svelte/reactivity';
import type {
	User,
	Message,
	Channel,
	Category,
	ChannelWithMessages,
	CategoryFull,
} from '$lib/types';
import { AppState } from './stores.svelte';

export type ResourceMessage = Message & {

};

export type ResourceChannel = Channel & {
	messages: MessageCollection;
	typedMessage: string;
};

export type ResourceCategory = Category & {
	channels: ChannelCollection;
};

export class UserCollection extends SvelteMap<string, User> {
	find(callback: (user: User) => boolean): User | null {
		for (const user of this.values()) {
			if (callback(user)) {
				return user;
			}
		}

		return null;
	}

	filter(callback: (user: User) => boolean): UserCollection {
		const collection = new UserCollection();

		for (const [id, user] of this) {
			if (callback(user)) {
				collection.set(id, user);
			}
		}

		return collection;
	}

	first(): User | null {
		return this.values().next().value ?? null;
	}

	last(): User | null {
		return [...this.values()].at(-1) ?? null;
	}
}

export class MessageCollection extends SvelteMap<string, ResourceMessage> {
	constructor(messages: Message[] = []) {
		super(messages.map((message) => [String(message.id), message]));
	}

	add(message: ResourceMessage) {
		this.set(String(message.id), message);
		return this.size;
	}

	remove(id: string) {
		this.delete(id);
		return this.size;
	}

	first(): ResourceMessage | null {
		return this.values().next().value ?? null;
	}

	last(): ResourceMessage | null {
		return [...this.values()].at(-1) ?? null;
	}


}

export class ChannelCollection extends SvelteMap<string, ResourceChannel> {
	constructor(channels: ChannelWithMessages[] = []) {
		super(
			channels.map((channel) => [
				String(channel.id),
				{
					...channel,
					messages: new MessageCollection(channel.messages),
					typedMessage: channel.typedMessage,
				},
			])
		);
	}

	add(channel: ResourceChannel) {
		this.set(String(channel.id), channel);
		return this.size;
	}

	remove(id: string) {
		this.delete(id);
		return this.size;
	}

	first(): ResourceChannel | null {
		return this.values().next().value ?? null;
	}

	last(): ResourceChannel | null {
		return [...this.values()].at(-1) ?? null;
	}
}

export class CategoryCollection extends SvelteMap<string, ResourceCategory> {
	constructor(categories: CategoryFull[] = []) {
		super(
			categories.map((category) => [
				String(category.id),
				{
					...category,
					channels: new ChannelCollection(category.channels),
				},
			])
		);
	}

	init(categories: CategoryFull[]) {
		for (const category of categories) {
			this.addCategory(category);
		}
	}

	add(category: ResourceCategory) {
		this.set(String(category.id), category);
		return this.size;
	}

	addCategory(category: CategoryFull) {
		this.set(String(category.id), {
			...category,
			channels: new ChannelCollection(category.channels),
		});

		return this.size;
	}

	remove(id: string) {
		this.delete(id);
		return this.size;
	}

	getCurrentChannel(): ResourceChannel | null {
		for (const category of this.values()) {
			for (const channel of category.channels.values()) {
				if (channel.id === AppState.currentChannelId) {
					return channel;
				}
			}
		}

		return null;
	}

	findCategory(
		callback: (category: ResourceCategory) => boolean
	): ResourceCategory | null {
		for (const category of this.values()) {
			if (callback(category)) {
				return category;
			}
		}

		return null;
	}

	findChannel(
		callback: (channel: ResourceChannel) => boolean
	): ResourceChannel | null {
		for (const category of this.values()) {
			for (const channel of category.channels.values()) {
				if (callback(channel)) {
					return channel;
				}
			}
		}

		return null;
	}

	first(): ResourceCategory | null {
		return this.values().next().value ?? null;
	}

	firstChannel(): ResourceChannel | null {
		return this.first()?.channels.first() ?? null;
	}

	last(): ResourceCategory | null {
		return [...this.values()].at(-1) ?? null;
	}
}