<script lang="ts">
	import { Categories, AppState } from '$lib/stores.svelte';
	import { genericRequest, handleRequestError } from '$lib/utils.js';
	import { fade } from 'svelte/transition';
	import PageLoading from '$lib/components/page-loading.svelte';
	import TopBar from '$lib/components/app/top-bar.svelte';
	import ServerNav from '$lib/components/app/server-nav.svelte';
	import ChatArea from '$lib/components/app/chat-area.svelte';
	import MemberList from '$lib/components/app/member-list.svelte';
	import type { InitialServerData } from '$lib/types.js';
	import AddChannelDialog from '$lib/components/dialogs/add-channel-dialog.svelte';
	import AddCategoryDialog from '$lib/components/dialogs/add-category-dialog.svelte';

	let { data } = $props();

	// State
	let pageStatus = $state<'init' | 'loading' | 'ready'>('loading');

	$effect(() => {
		initAppData();
	});

	const initAppData = async () => {
		try {
			pageStatus = 'init';

			const initialData = await genericRequest<InitialServerData>('/api/initialData', {
				method: 'GET',
				credentials: 'include',
			});

			// Initializes everything
			Categories.init(initialData.categories);

			let firstChannel = Categories?.firstChannel();
			if (firstChannel) {
				AppState.currentChannelId = firstChannel.id;
			} else {
				AppState.currentChannelId = null;
			}

			AppState.initialized = true;
		} catch (e) {
			handleRequestError(e);
		} finally {
			pageStatus = 'ready';
		}
	};

	const selectChannel = (channelId: number) => {
		AppState.currentChannelId = channelId;
	};
</script>

{#if pageStatus === 'init'}
	<PageLoading />
{:else}
	<div class="flex h-screen flex-col" in:fade>
		<TopBar />

		<main class="flex min-h-0 w-full flex-1 items-stretch">
			<ServerNav {selectChannel} />

			<ChatArea />

			<MemberList />
		</main>
	</div>
{/if}

<AddChannelDialog />
<AddCategoryDialog />
