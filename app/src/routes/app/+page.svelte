<script lang="ts">
	import SettingsIcon from '@lucide/svelte/icons/settings';
	import MoonIcon from '@lucide/svelte/icons/moon';
	import SunIcon from '@lucide/svelte/icons/sun';
	import UsersIcon from '@lucide/svelte/icons/users-round';
	import MessageSquareIcon from '@lucide/svelte/icons/message-square';
	import SendIcon from '@lucide/svelte/icons/send';
	import { toggleMode } from 'mode-watcher';
	import { Button } from '$lib/components/ui/button/index.js';
	import { ScrollArea } from '$lib/components/ui/scroll-area/index.js';
	import { Categories, AppState, Users } from '$lib/stores.svelte';
	import { Textarea } from '$lib/components/ui/textarea/index.js';
	import { DateHelper, handleRequestError } from '$lib/utils.js';
	import { CHANNEL_TYPE, USER_PRIVILEGE_STATUS, USER_STATUS } from '$lib/constants.js';
	import { fade } from 'svelte/transition';
	import PageLoading from '$lib/components/page-loading.svelte';

	let { data } = $props();

	// State
	let pageStatus = $state<'init' | 'loading' | 'ready'>('loading');
	let bottom = $state<HTMLDivElement>();

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
			bottom?.scrollIntoView({
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
		<section
			class="flex h-12 w-full shrink-0 items-center justify-between border-b border-border bg-white pr-1 pl-4 dark:bg-black"
		>
			<div class="flex items-center gap-2">
				<img src="/logo.png" alt="logo" class="h-6 w-6" />
				<h1 class="font-heading text-lg">On The Holo</h1>
			</div>

			<div class="flex items-center gap-1">
				<MessageSquareIcon class="size-3.5" />
				<h2 class="text font-bold">
					<!-- TODO calculate this once, maybe in AppState -->
					{Categories.findChannel((c) => c.id === AppState.currentChannelId)?.name}
				</h2>
			</div>

			<div class="flex items-center gap-2">
				<Button onclick={toggleMode} variant="outline" size="icon-sm">
					<SunIcon class="scale-100 rotate-0 transition-all! dark:scale-0 dark:-rotate-90" />
					<MoonIcon
						class="absolute scale-0 rotate-90 transition-all! dark:scale-100 dark:rotate-0"
					/>
					<span class="sr-only">Toggle theme</span>
				</Button>
				<Button variant="outline" size="icon-sm">
					<SettingsIcon />
				</Button>
			</div>
		</section>

		<main class="flex min-h-0 w-full flex-1 items-stretch">
			<aside id="channels" class="flex h-full min-w-60 flex-col border-r border-border px-2 pt-2">
				<Button class="w-full text-base font-bold" variant="outline" size="lg">
					<UsersIcon />
					Friends
				</Button>

				<ScrollArea class="min-h-0 flex-1" orientation="vertical">
					<div class="flex flex-col">
						{#each Categories as [_, category]}
							<h3 class="mt-4 text-sm font-bold text-muted-foreground">{category.name}</h3>
							{#each category.channels as channel}
								{@const currentClasses = AppState.currentChannelId === channel.id ? 'bg-muted' : ''}
								<Button
									class="w-full justify-start text-base font-bold text-foreground/80 {currentClasses}"
									variant="ghost"
									onclick={() => selectChannel(channel.id)}
								>
									<MessageSquareIcon class="inline size-4" />
									{channel.name}
								</Button>
							{/each}
						{/each}
					</div>
				</ScrollArea>
			</aside>

			<section id="chat" class="flex h-full min-w-0 flex-1 flex-col pt-2">
				<ScrollArea class="min-h-0 flex-1" orientation="vertical">
					<div class="flex flex-col gap-4">
						{#each Categories.findChannel((c) => c.id === AppState.currentChannelId)?.messages as message}
							<div class="flex items-start gap-4 px-4">
								<div class="mt-1 size-8 rounded-full bg-muted"></div>
								<div class="flex flex-col">
									<div class="flex items-center gap-2">
										<h4 class="text-md font-bold">Username</h4>
										<span class="text-xs text-muted-foreground">
											{DateHelper.toReadable(message.created_at)}
										</span>
									</div>
									<p class="">
										{message.content}
									</p>
								</div>
							</div>
						{/each}
						<div bind:this={bottom}></div>
					</div>
				</ScrollArea>

				<div class="shrink-0 border-t border-border p-2">
					<div class="flex items-center gap-2">
						<Textarea class="" placeholder="Message #General" />

						<Button size="icon">
							<SendIcon />
							<span class="sr-only">Send message</span>
						</Button>
					</div>
				</div>
			</section>

			<section id="users" class="flex h-full min-w-60 flex-col border-l border-border px-2 pt-2">
				{#each Users as [id, User]}
					<Button class="w-full justify-start text-sm" variant="ghost" size="xl">
						<div class="size-8 rounded-full bg-muted"></div>
						<div class="flex flex-col items-start leading-none">
							<h4>{User.username}</h4>
							<span class="text-xs text-muted-foreground">Chilling...</span>
						</div>
					</Button>
				{/each}
			</section>
		</main>
	</div>
{/if}
