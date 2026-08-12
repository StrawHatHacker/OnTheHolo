<script lang="ts">
	import { Categories, AppState, Users } from '$lib/stores.svelte';
	import { handleRequestError } from '$lib/utils.js';
	import { CHANNEL_TYPE, USER_PRIVILEGE_STATUS, USER_STATUS } from '$lib/constants.js';
	import { fade } from 'svelte/transition';
	import PageLoading from '$lib/components/page-loading.svelte';
	import TopBar from '$lib/components/app/top-bar.svelte';
	import ServerNav from '$lib/components/app/server-nav.svelte';
	import ChatArea from '$lib/components/app/chat-area.svelte';
	import MemberList from '$lib/components/app/member-list.svelte';

	let { data } = $props();

	// State
	let pageStatus = $state<'init' | 'loading' | 'ready'>('loading');
	let bottomChatDiv = $state<HTMLDivElement>();

	$effect(() => {
		initAppData();
	});

	const initAppData = async () => {
		try {
			pageStatus = 'init';

			await new Promise((resolve) => setTimeout(resolve, 2000));
			// Get users
			Users.set('1', {
				id: 1,
				username: 'Panos',
				email: 'panos@example.com',
				status: USER_STATUS.ACTIVE,
				priviledge_status: USER_PRIVILEGE_STATUS.NORMAL,
				created_at: new Date().toISOString(),
				updated_at: new Date().toISOString(),
			});
			Users.set('2', {
				id: 2,
				username: 'Teo',
				email: 'teo@example.com',
				status: USER_STATUS.ACTIVE,
				priviledge_status: USER_PRIVILEGE_STATUS.NORMAL,
				created_at: new Date().toISOString(),
				updated_at: new Date().toISOString(),
			});
			Users.set('3', {
				id: 3,
				username: 'Titos',
				email: 'titos@example.com',
				status: USER_STATUS.ACTIVE,
				priviledge_status: USER_PRIVILEGE_STATUS.NORMAL,
				created_at: new Date().toISOString(),
				updated_at: new Date().toISOString(),
			});
			// Get channels
			Categories.set('1', {
				id: 1,
				name: 'General',
				created_at: new Date().toISOString(),
				channels: [
					{
						id: 1,
						created_at: new Date().toISOString(),
						type: CHANNEL_TYPE.text,
						name: 'General',
						category_id: 1,
						messages: [
							{
								id: 1,
								created_at: new Date().toISOString(),
								user_id: 1,
								channel_id: 1,
								content: 'Hello world!',
							},
							{
								id: 2,
								created_at: new Date().toISOString(),
								user_id: 1,
								channel_id: 1,
								content: 'Testing testing',
							},
						],
					},
					{
						id: 2,
						created_at: new Date().toISOString(),
						type: CHANNEL_TYPE.text,
						name: 'Memes',
						category_id: 1,
						messages: [],
					},
				],
			});

			let firstChannel = Categories?.firstChannel();
			// Todo if there are no channels we have to show something
			if (!firstChannel) return;

			AppState.currentChannelId = firstChannel.id;

			// Get messages
			bottomChatDiv?.scrollIntoView({
				behavior: 'smooth',
			});
		} catch (e) {
			console.error(e);
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

			<ChatArea bind:bottomChatDiv />

			<MemberList />
		</main>
	</div>
{/if}
