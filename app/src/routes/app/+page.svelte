<script lang="ts">
	import { Store, AppState, Users } from '$lib/stores.svelte';
	import { genericRequest, handleRequestError } from '$lib/utils.js';
	import { fade } from 'svelte/transition';
	import PageLoading from '$lib/components/app/page-loading.svelte';
	import TopBar from '$lib/components/app/top-bar.svelte';
	import ServerNav from '$lib/components/app/server-nav.svelte';
	import ChatArea from '$lib/components/app/chatArea/chat-area.svelte';
	import MemberList from '$lib/components/app/member-list.svelte';
	import type { InitialServerData } from '$lib/types.js';
	import { connectSSE, disconnectSSE } from '$lib/sseListeners.js';

	let { data } = $props();

	// State
	let pageStatus = $state<'init' | 'loading' | 'ready' | 'error'>('init');

	$effect(() => {
		initApp();

		return () => {
			disconnectSSE();
		};
	});

	const initApp = async () => {
		try {
			pageStatus = 'init';

			const initialData = await genericRequest<InitialServerData>('/api/initialData', {
				method: 'GET',
				credentials: 'include',
			});

			connectSSE();

			Store.categories.set(initialData.categories);

			let firstChannel = Store.channels.first();
			if (firstChannel) {
				AppState.currentChannelId = firstChannel.id;
			} else {
				AppState.currentChannelId = null;
			}

			Users.set(initialData.users);

			AppState.initialized = true;
			pageStatus = 'ready';
		} catch (e) {
			pageStatus = 'error';
			handleRequestError(e);
		}
	};

	const selectChannel = (channelId: number) => {
		AppState.currentChannelId = channelId;
	};
</script>

{#if pageStatus === 'init' || pageStatus === 'error'}
	<PageLoading {pageStatus} />
{:else}
	<div class="flex h-screen flex-col" in:fade>
		<TopBar />

		<main class="flex min-h-0 w-full flex-1 items-stretch">
			<ServerNav {selectChannel} session={data.session} />

			<ChatArea session={data.session} />

			<MemberList session={data.session} />
		</main>
	</div>
{/if}
