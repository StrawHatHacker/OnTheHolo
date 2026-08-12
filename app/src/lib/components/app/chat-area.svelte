<script lang="ts">
	import { Textarea } from '$lib/components/ui/textarea/index.js';
	import { DateHelper } from '$lib/utils.js';
	import { ScrollArea } from '$lib/components/ui/scroll-area/index.js';
	import SendIcon from '@lucide/svelte/icons/send';
	import { AppState, Categories } from '$lib/stores.svelte';
	import { Button } from '$lib/components/ui/button/index.js';

	let {
		bottomChatDiv = $bindable(),
		newMessage = $bindable(),
		sendMessage,
	}: {
		bottomChatDiv?: HTMLDivElement;
		newMessage: string;
		sendMessage: () => void;
	} = $props();

	const handleKeydown = (e: KeyboardEvent) => {
		console.log(e.key);
		if (e.key === 'Enter' && !e.shiftKey) {
			e.preventDefault();
			sendMessage();
		}
	};
</script>

<section aria-label="chat-area" class="flex h-full min-w-0 flex-1 flex-col pt-2">
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
