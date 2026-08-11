import { CategoryCollection, UserCollection } from '$lib/resources.svelte';

export const Users = new UserCollection();

export const Categories = new CategoryCollection();

export const AppState = $state({
	currentChannelId: null as number | null
});
