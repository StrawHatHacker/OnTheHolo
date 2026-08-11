import { SvelteMap } from 'svelte/reactivity';
import type { Channel, CategoryWithChannels, User, ChannelWithMessages } from '$lib/types';

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
		return this.values().next().value || null;
	}

	last(): User | null {
		return [...this.values()].at(-1) || null;
	}
}

export class CategoryCollection extends SvelteMap<
	string,
	CategoryWithChannels
> {
	constructor(categories: CategoryWithChannels[] = []) {
		super(
			categories.map((category) => [
				String(category.id),
				category,
			])
		);
	}

	findCategory(
		callback: (category: CategoryWithChannels) => boolean
	): CategoryWithChannels | null {
		for (const category of this.values()) {
			if (callback(category)) {
				return category;
			}
		}

		return null;
	}

	findChannel(
		callback: (channel: ChannelWithMessages) => boolean
	): ChannelWithMessages | null {
		for (const category of this.values()) {
			for (const channel of category.channels) {
				if (callback(channel)) {
					return channel;
				}
			}
		}

		return null;
	}

	first(): CategoryWithChannels | null {
		return this.values().next().value ?? null;
	}

	firstChannel(): ChannelWithMessages | null {
		return this.first()?.channels[0] ?? null;
	}

	last(): CategoryWithChannels | null {
		return [...this.values()].at(-1) ?? null;
	}
}