<script lang="ts">
	import { Textarea } from '$lib/components/ui/textarea/index.js';
	import { DateHelper, genericRequest, handleRequestError } from '$lib/utils.js';
	import { ScrollArea } from '$lib/components/ui/scroll-area/index.js';
	import SendIcon from '@lucide/svelte/icons/send';
	import { AppState, Categories } from '$lib/stores.svelte';
	import { Button } from '$lib/components/ui/button/index.js';
	import type { Message, NewMessagePayload } from '$lib/types';

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
			const channel = Categories.findChannel((c) => c.id === AppState.currentChannelId);
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

			channel.messages.add(msg);

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
	<ScrollArea class="min-h-0 flex-1" orientation="vertical">
		<div class="flex flex-col gap-4">
			{#each Categories.getCurrentChannel()?.messages.values() as message}
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
			<div bind:this={bottomChatDiv}></div>
		</div>
	</ScrollArea>

	<div class="shrink-0 border-t-2 border-border p-2">
		<form
			onsubmit={(e) => {
				e.preventDefault();
				sendMessage();
			}}
			class="flex items-center gap-2"
		>
			<Textarea
				placeholder={`Message #${Categories.findChannel((c) => c.id === AppState.currentChannelId)?.name}`}
				bind:value={newMessage}
				onkeydown={handleKeydown}
			/>

			<Button size="icon" type="submit">
				<SendIcon />
				<span class="sr-only">Send message</span>
			</Button>
		</form>
	</div>
</section>
