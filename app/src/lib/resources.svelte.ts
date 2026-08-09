import { SvelteMap } from 'svelte/reactivity';

export interface User {
	id: string;
	username: string;
	email: string;
}

export class UserCollection extends SvelteMap<string, User> {
	find(callback: (user: User) => boolean): User | undefined {
		for (const user of this.values()) {
			if (callback(user)) {
				return user;
			}
		}

		return undefined;
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

	first(): User | undefined {
		return this.values().next().value;
	}

	last(): User | undefined {
		return [...this.values()].at(-1);
	}
}
