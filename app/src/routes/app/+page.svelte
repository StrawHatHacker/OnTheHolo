<script lang="ts">
	import { Store, AppState, Users } from '$lib/stores.svelte';
	import { genericRequest, handleRequestError } from '$lib/utils.js';
	import { fade } from 'svelte/transition';
	import PageLoading from '$lib/components/page-loading.svelte';
	import TopBar from '$lib/components/app/top-bar.svelte';
	import ServerNav from '$lib/components/app/server-nav.svelte';
	import ChatArea from '$lib/components/app/chatArea/chat-area.svelte';
	import MemberList from '$lib/components/app/member-list.svelte';
	import type {
		InitialServerData,
	} from '$lib/types.js';
	import { registerSSEListeners } from '$lib/sseListeners.js';

	let { data } = $props();

	// State
	let pageStatus = $state<'init' | 'loading' | 'ready'>('init');
	let source: EventSource;

	$effect(() => {
		initApp();
	});

	const initApp = async () => {
		try {
			pageStatus = 'init';

			const initialData = await genericRequest<InitialServerData>('/api/initialData', {
				method: 'GET',
				credentials: 'include',
			});

			source = new EventSource('/api/events');
			registerSSEListeners(source);

			Store.categories.set(initialData.categories);

			let firstChannel = Store.channels.first();
			if (firstChannel) {
				AppState.currentChannelId = firstChannel.id;
			} else {
				AppState.currentChannelId = null;
			}

			Users.set(initialData.users);

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
			<ServerNav {selectChannel} session={data.session} />

			<ChatArea session={data.session} />

			<MemberList />
		</main>
	</div>
{/if}
