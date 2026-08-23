<script lang="ts">
	import { Textarea } from '$lib/components/ui/textarea/index.js';
	import { genericRequest, handleRequestError } from '$lib/utils.js';
	import { ScrollArea } from '$lib/components/ui/scroll-area/index.js';
	import SendIcon from '@lucide/svelte/icons/send';
	import { AppState, Store, Users } from '$lib/stores.svelte';
	import { Button } from '$lib/components/ui/button/index.js';
	import type {
		Message,
		AddMessagePayload,
		DeleteMessagePayload,
		SessionWithUser,
		EditMessagePayload,
	} from '$lib/types';
	import ChatAreaMessage from './chat-area-message.svelte';

	let { session }: { session: SessionWithUser } = $props();

	// State
	let bottomChatDiv = $state<HTMLDivElement>();
	let loading = $state(false);
	let contentToAdd = $state('');

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
			submitSendMessage();
		}
	};

	const submitSendMessage = async () => {
		try {
			const channel = Store.channels.getCurrent();
			if (!channel) return;

			loading = true;

			const p: AddMessagePayload = {
				channelId: channel.id,
				content: contentToAdd,
			};

			await genericRequest<Message>('/api/message', {
				method: 'POST',
				body: JSON.stringify(p),
			});

			contentToAdd = '';
			scrollDown();
		} catch (e) {
			handleRequestError(e);
		} finally {
			loading = false;
		}
	};

	const submitEditMessage = async (message: Message, newContent: string) => {
		try {
			const payload: EditMessagePayload = {
				channelId: message.channel_id,
				messageId: message.id,
				content: newContent,
			};

			await genericRequest(`/api/message`, {
				method: 'PUT',
				body: JSON.stringify(payload),
			});
		} catch (e) {
			handleRequestError(e);
		}
	};

	const submitDeleteMessage = async (message: Message) => {
		try {
			const payload: DeleteMessagePayload = {
				channelId: message.channel_id,
				messageId: message.id,
			};

			await genericRequest(`/api/message`, {
				method: 'DELETE',
				body: JSON.stringify(payload),
			});
		} catch (e) {
			handleRequestError(e);
		}
	};

	const addToContent = (str: string) => {
		contentToAdd += ' ' + str + ' ';
	};
</script>

<section aria-label="chat-area" class="flex h-full min-w-0 flex-1 flex-col pt-2">
	{#if !Store.channels.getCurrent()}
		<div
			class="mx-auto flex h-full max-w-[40ch] items-center justify-center text-center text-balance"
		>
			Create your first category, then your first channel on the left side
		</div>
	{:else}
		<ScrollArea class="min-h-0 flex-1" orientation="vertical">
			<div class="flex flex-col gap-2">
				{#each Store.channels.getCurrent()?.messages as message}
					<ChatAreaMessage
						{message}
						{session}
						{submitDeleteMessage}
						{submitEditMessage}
						{addToContent}
					/>
				{/each}
				<div bind:this={bottomChatDiv}></div>
			</div>
		</ScrollArea>

		<div class="flex min-h-14 w-full shrink-0 items-center border-t border-border p-2">
			<form
				onsubmit={(e) => {
					e.preventDefault();
					submitSendMessage();
				}}
				class="flex w-full items-center gap-2"
			>
				<Textarea
					placeholder={`Message #${Store.channels.getCurrent()?.name}`}
					bind:value={contentToAdd}
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
