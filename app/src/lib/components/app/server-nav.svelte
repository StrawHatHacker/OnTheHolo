<script lang="ts">
	import UsersIcon from '@lucide/svelte/icons/users-round';
	import PlusIcon from '@lucide/svelte/icons/plus';
	import MessageSquareIcon from '@lucide/svelte/icons/message-square';
	import Volume2Icon from '@lucide/svelte/icons/volume-2';
	import ListPlusIcon from '@lucide/svelte/icons/list-plus';
	import { Button } from '$lib/components/ui/button/index.js';
	import { ScrollArea } from '$lib/components/ui/scroll-area/index.js';
	import { AppState, Categories } from '$lib/stores.svelte';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu/index.js';
	import { AppHelper } from '$lib/utils';
	import { CHANNEL_TYPE } from '$lib/constants';

	let { selectChannel }: { selectChannel: (channelId: number) => void } = $props();
</script>

<aside id="navogation" class="flex h-full min-w-60 flex-col border-r-2 border-border px-2 pt-2">
	<Button class="w-full text-base font-bold" variant="outline" size="lg">
		<UsersIcon />
		Friends
	</Button>

	<ScrollArea class="min-h-0 flex-1" orientation="vertical">
		<div class="group flex flex-col">
			{#each Categories as [_, category]}
				<div class="flex items-end justify-between">
					<h3 class="mt-4 text-sm font-bold text-muted-foreground">{category.name}</h3>
					<DropdownMenu.Root>
						<DropdownMenu.Trigger>
							<Button size="icon-xs" variant="ghost" class="hidden group-hover:inline-flex">
								<PlusIcon />
							</Button>
						</DropdownMenu.Trigger>
						<DropdownMenu.Content class="w-56" align="start">
							<DropdownMenu.Label>
								<PlusIcon class="mr-1 inline size-3" />
								Add a channel
							</DropdownMenu.Label>
							<DropdownMenu.Group>
								<DropdownMenu.Item
									onclick={() => AppHelper.openCreateChannelDialog(CHANNEL_TYPE.text, category.id)}
								>
									<MessageSquareIcon />
									Text channel
								</DropdownMenu.Item>
								<DropdownMenu.Item
									onclick={() => AppHelper.openCreateChannelDialog(CHANNEL_TYPE.voice, category.id)}
								>
									<Volume2Icon />
									Voice channel
								</DropdownMenu.Item>
							</DropdownMenu.Group>
							<DropdownMenu.Separator />
							<DropdownMenu.Group>
								<DropdownMenu.Item>
									<ListPlusIcon />
									Create a category
								</DropdownMenu.Item>
							</DropdownMenu.Group>
						</DropdownMenu.Content>
					</DropdownMenu.Root>
				</div>
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
