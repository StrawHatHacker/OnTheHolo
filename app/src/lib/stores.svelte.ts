// USE CLIENT-SIDE ONLY

import { CategoryCollection, UserCollection } from '$lib/resources.svelte';
import type { ChannelTypeValues } from '$lib/constants';

export const Users = new UserCollection();

export const Categories = new CategoryCollection();

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
