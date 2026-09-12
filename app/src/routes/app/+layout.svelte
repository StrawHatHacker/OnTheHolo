<script lang="ts">
	import { invalidateAll } from '$app/navigation';
	import AddCategoryDialog from '$lib/components/dialogs/add-category-dialog.svelte';
	import AddChannelDialog from '$lib/components/dialogs/add-channel-dialog.svelte';
	import DeleteChannelDialog from '$lib/components/dialogs/delete-channel-dialog.svelte';
	import EditChannelDialog from '$lib/components/dialogs/edit-channel-dialog.svelte';
	import EditCategoryDialog from '$lib/components/dialogs/edit-category-dialog.svelte';
	import DeleteCategoryDialog from '$lib/components/dialogs/delete-category-dialog.svelte';
	import { onMount } from 'svelte';
	import { genericRequest } from '$lib/utils';
	import EditUserDialog from '$lib/components/dialogs/edit-user-dialog.svelte';
	import SettingsDialog from '$lib/components/dialogs/settings/settings-dialog.svelte';

	let { children, data } = $props();

	let authTokenRefreshTimer: ReturnType<typeof setInterval>;

	onMount(() => {
		authTokenRefreshTimer = setInterval(
			async () => {
				await genericRequest('/api/auth/refreshToken', { method: 'GET', credentials: 'include' });
				await invalidateAll();
			},
			1000 * 60 * 10 // 10 minutes
		);

		return () => {
			clearInterval(authTokenRefreshTimer);
		};
	});
</script>

{@render children()}

<EditUserDialog session={data.session} />

<AddCategoryDialog />
<EditCategoryDialog />
<DeleteCategoryDialog />

<AddChannelDialog />
<EditChannelDialog />
<DeleteChannelDialog />

<SettingsDialog session={data.session} />
