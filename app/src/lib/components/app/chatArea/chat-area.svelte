<script lang="ts">
	import { Textarea } from '$lib/components/ui/textarea/index.js';
	import { genericRequest, handleRequestError } from '$lib/utils.js';
	import { ScrollArea } from '$lib/components/ui/scroll-area/index.js';
	import SendIcon from '@lucide/svelte/icons/send';
	import { AppState, Store } from '$lib/stores.svelte';
	import { Button } from '$lib/components/ui/button/index.js';
	import type {
		Message,
		AddMessagePayload,
		DeleteMessagePayload,
		SessionWithUser,
		EditMessagePayload,
	} from '$lib/types';
	import ChatAreaMessage from './chat-area-message.svelte';
	import { tick, untrack } from 'svelte';

	let { session }: { session: SessionWithUser } = $props();

	// State
	let textarea = $state<HTMLTextAreaElement | null>(null);
	let loading = $state(false);
	let contentToAdd = $state('');

	// Pagination
	let viewport = $state<HTMLElement | null>(null);
	let page = $state(1);
	let loadingMore = $state(false);
	/** True or false for if there are more messages that can be fetched on scroll*/
	let hasMore = $state(true);

	const TOP_THRESHOLD = 10; // px from top that counts as "all the way up"

	// When the current channel changes, set local page and hasMore variables
	$effect(() => {
		AppState.currentChannelId;
		untrack(() => {
			const currentChannel = Store.channels.getCurrent();
			page = currentChannel?.page ?? 1;
			hasMore = currentChannel?.hasMore ?? true;
		});
	});

	// When the current channel changes, restore scroll position or scroll to the bottom
	$effect(() => {
		if (!viewport) return;

		untrack(() => {
			const saved = Store.channels.getCurrent()?.pxFromBottom;

			if (saved == null) {
				scrollDown(); // first visit
			} else {
				viewport!.scrollTop = viewport!.scrollHeight - viewport!.clientHeight - saved;
			}
		});
	});

	const scrollDown = () => {
		AppState.bottomChatDiv?.scrollIntoView({
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
			if (contentToAdd.trim().length === 0) return;

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
			await tick();
			textarea?.focus();
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

	const loadMoreMessages = async (page: number) => {
		try {
			const chId = $state.snapshot(AppState.currentChannelId);
			if (!chId) return false;

			loadingMore = true;

			const res = await genericRequest<{ messages: Message[]; hasMore: boolean }>(
				`/api/message?channelId=${chId}&page=${page}`,
				{
					method: 'GET',
				}
			);

			Store.channels.prependMessages(chId, res.messages);
			return res.hasMore;
		} catch (e) {
			handleRequestError(e);
		} finally {
			loadingMore = false;
		}
		return true;
	};

	const handleScroll = async () => {
		if (!viewport || loadingMore || !hasMore) return;

		// Check if we're at the top
		if (viewport.scrollTop > TOP_THRESHOLD) return;

		loadingMore = true;
		const prevHeight = viewport.scrollHeight;
		const prevTop = viewport.scrollTop;

		try {
			// Fetch new messages and update the hasMore messages
			hasMore = await loadMoreMessages(page + 1);

			// Update the current channel
			if (AppState.currentChannelId) {
				Store.channels.setHasMore(AppState.currentChannelId, hasMore);
				if (hasMore) {
					Store.channels.incrementPage(AppState.currentChannelId);
					page += 1;
				}
			}

			// Keep the user's position after older messages are prepended
			await tick();
			viewport.scrollTop = viewport.scrollHeight - prevHeight + prevTop;
		} catch (e) {
			handleRequestError(e);
		} finally {
			loadingMore = false;
		}
	};

	$effect(() => {
		if (!viewport) return;
		viewport.addEventListener('scroll', handleScroll, { passive: true });
		return () => viewport?.removeEventListener('scroll', handleScroll);
	});

	// Save position of the channel we're leaving
	$effect.pre(() => {
		const id = AppState.currentChannelId;
		if (!id) return;

		return () => {
			if (!viewport) return;
			Store.channels.setPxFromBottom(
				id,
				viewport.scrollHeight - viewport.scrollTop - viewport.clientHeight
			);
		};
	});
</script>

<section aria-label="chat-area" class="flex h-full min-w-0 flex-1 flex-col pt-2">
	{#if !Store.channels.getCurrent()}
		<div
			class="mx-auto flex h-full max-w-[40ch] items-center justify-center text-center text-balance"
		>
			Create your first category, then your first channel on the left side
		</div>
	{:else}
		<ScrollArea class="min-h-0 flex-1" orientation="vertical" bind:viewportRef={viewport}>
			<div class="flex min-h-full flex-col justify-end gap-2">
				{#each Store.channels.getCurrent()?.messages as message (message.id)}
					<ChatAreaMessage
						{message}
						{session}
						{submitDeleteMessage}
						{submitEditMessage}
						{addToContent}
					/>
				{/each}

				<div bind:this={AppState.bottomChatDiv}></div>
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
					bind:ref={textarea}
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
