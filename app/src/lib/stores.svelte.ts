// USE CLIENT-SIDE ONLY

import { CategoryCollection, UserCollection } from '$lib/resources.svelte';
import type { ChannelTypeValues } from '$lib/constants';

export const Users = new UserCollection();

export const Categories = new CategoryCollection();

export const AppState = $state({
	currentChannelId: null as number | null,
	isCreateChannelDialogOpen: false,
	createChannelDialogOptions: null as {
		channelType: ChannelTypeValues;
		forCategoryId: number;
	} | null,
});
