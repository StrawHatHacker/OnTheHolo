<script lang="ts">
	import UsersIcon from '@lucide/svelte/icons/users-round';
	import MessageSquareIcon from '@lucide/svelte/icons/message-square';
	import { Button } from '$lib/components/ui/button/index.js';
	import { ScrollArea } from '$lib/components/ui/scroll-area/index.js';
	import { AppState, Categories } from '$lib/stores.svelte';

	let { selectChannel }: { selectChannel: (channelId: number) => void } = $props();
</script>

<aside id="navogation" class="flex h-full min-w-60 flex-col border-r border-border px-2 pt-2">
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
