<script lang="ts">
	import { Textarea } from '$lib/components/ui/textarea/index.js';
	import {
		DateHelper,
		genericRequest,
		getProfileImageUrl,
		handleRequestError,
	} from '$lib/utils.js';
	import { ScrollArea } from '$lib/components/ui/scroll-area/index.js';
	import SendIcon from '@lucide/svelte/icons/send';
	import { AppState, Store, Users } from '$lib/stores.svelte';
	import { Button } from '$lib/components/ui/button/index.js';
	import type { Message, NewMessagePayload } from '$lib/types';
	import { Badge } from '$lib/components/ui/badge/index.js';
	import { USER_PRIVILEGE_STATUS, USER_STATUS } from '$lib/constants';
	import { SETTINGS } from '$lib/settings';

	let newMessage = $state('');
	let bottomChatDiv = $state<HTMLDivElement>();
	let loading = $state(false);

	$effect(() => {
		// When the page is initialized or a channel is selected
		if (AppState.initialized && AppState.currentChannelId) {
			scrollDown();
		}
	});

	const scrollDown = () => {
		bottomChatDiv?.scrollIntoView({
			behavior: 'instant',
		});
	};

	const handleKeydown = (e: KeyboardEvent) => {
		if (e.key === 'Enter' && !e.shiftKey) {
			e.preventDefault();
			sendMessage();
		}
	};

	const sendMessage = async () => {
		try {
			const channel = Store.channels.getCurrent();
			if (!channel) return;

			loading = true;

			const p: NewMessagePayload = {
				channelId: channel.id,
				content: newMessage,
			};

			const msg = await genericRequest<Message>('/api/message', {
				method: 'POST',
				body: JSON.stringify(p),
			});

			newMessage = '';
			scrollDown();
		} catch (e) {
			handleRequestError(e);
		} finally {
			loading = false;
		}
	};
</script>

<section aria-label="chat-area" class="flex h-full min-w-0 flex-1 flex-col pt-2">
	{#if !Store.channels.getCurrent()}
		<div class="mx-auto flex h-full max-w-[40ch] items-center text-balance justify-center text-center">
			Create your first category, then your first channel on the left side
		</div>
	{:else}
		<ScrollArea class="min-h-0 flex-1" orientation="vertical">
			<div class="flex flex-col gap-4">
				{#each Store.channels.getCurrent()?.messages as message}
					{@const user = Users.find((u) => u.id === message.user_id)}
					<div class="flex items-start gap-4 px-4">
						{#if user?.profile_image_url}
							<img
								src={getProfileImageUrl(user.profile_image_url)}
								alt="profile"
								class="size-8 rounded-full bg-cover"
							/>
						{:else}
							<div class="size-8 rounded-full bg-muted"></div>
						{/if}
						<div class="flex flex-col">
							<div class="flex items-center gap-2">
								<h4 class="text-md font-bold">{user?.username}</h4>
								{#if user?.privilege_status === USER_PRIVILEGE_STATUS.ADMIN && SETTINGS.SHOW_ADMIN_BADGE_IN_CHAT}
									<Badge>Admin</Badge>
								{/if}
								{#if user?.status === USER_STATUS.DELETED}
									<Badge variant="destructive">Deleted</Badge>
								{/if}
								{#if user?.status === USER_STATUS.BANNED}
									<Badge variant="destructive">Banned</Badge>
								{/if}
								<span class="text-xs text-muted-foreground">
									{DateHelper.toReadable(message.created_at)}
								</span>
							</div>
							<p>
								{message.content}
							</p>
						</div>
					</div>
				{/each}
				<div bind:this={bottomChatDiv}></div>
			</div>
		</ScrollArea>

		<div class="flex h-14 w-full shrink-0 items-center border-t-2 border-border p-2">
			<form
				onsubmit={(e) => {
					e.preventDefault();
					sendMessage();
				}}
				class="flex w-full items-center gap-2"
			>
				<Textarea
					placeholder={`Message #${Store.channels.getCurrent()?.name}`}
					bind:value={newMessage}
					onkeydown={handleKeydown}
					disabled={loading}
					class="w-full flex-1"
				/>

				<Button size="icon" type="submit" disabled={loading}>
					<SendIcon />
					<span class="sr-only">Send message</span>
				</Button>
			</form>
		</div>
	{/if}
</section>
