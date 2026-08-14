<script lang="ts">
	import UsersIcon from '@lucide/svelte/icons/users-round';
	import PlusIcon from '@lucide/svelte/icons/plus';
	import MessageSquareIcon from '@lucide/svelte/icons/message-square';
	import SquarePenIcon from '@lucide/svelte/icons/square-pen';
	import Volume2Icon from '@lucide/svelte/icons/volume-2';
	import ListPlusIcon from '@lucide/svelte/icons/list-plus';
	import { Button } from '$lib/components/ui/button/index.js';
	import { ScrollArea } from '$lib/components/ui/scroll-area/index.js';
	import { AppState, Store } from '$lib/stores.svelte';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu/index.js';
	import { AppHelper } from '$lib/utils';
	import { CHANNEL_TYPE } from '$lib/constants';

	let { selectChannel }: { selectChannel: (channelId: number) => void } = $props();
</script>

<aside id="navogation" class="flex h-full max-w-60 min-w-60 flex-col border-r-2 border-border pt-2">
	<Button class="w-full text-base font-bold" variant="outline" size="lg">
		<UsersIcon />
		Friends
	</Button>

	<ScrollArea class="min-h-0 flex-1 px-2" orientation="vertical">
		<div class="flex flex-col">
			{#if Store.categories.length === 0}
				<Button class="mt-4 w-full" size="lg" onclick={() => AppHelper.openAddCategoryDialog()}>
					Create your first category
				</Button>
			{:else}
				{#each Store.categories.getAll() as category}
					<div class="group flex items-end justify-between">
						<h3 class="mt-4 truncate text-sm font-bold text-muted-foreground">
							{category.name}gregergegregergergegegerge
						</h3>
						<div class="flex items-center gap-1">
							<Button size="icon-xs" variant="outline" class="hidden group-hover:flex">
								<SquarePenIcon />
							</Button>
							<DropdownMenu.Root>
								<DropdownMenu.Trigger class="m-0! p-0!">
									<Button size="icon-xs" variant="outline" class="hidden group-hover:flex">
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
											onclick={() => AppHelper.openAddChannelDialog(CHANNEL_TYPE.text, category.id)}
										>
											<MessageSquareIcon />
											Text channel
										</DropdownMenu.Item>
										<DropdownMenu.Item
											onclick={() =>
												AppHelper.openAddChannelDialog(CHANNEL_TYPE.voice, category.id)}
										>
											<Volume2Icon />
											Voice channel
										</DropdownMenu.Item>
									</DropdownMenu.Group>
									<DropdownMenu.Separator />
									<DropdownMenu.Group>
										<DropdownMenu.Item onclick={() => AppHelper.openAddCategoryDialog()}>
											<ListPlusIcon />
											Create a category
										</DropdownMenu.Item>
									</DropdownMenu.Group>
								</DropdownMenu.Content>
							</DropdownMenu.Root>
						</div>
					</div>
					{#each category.channels.values() as channel}
						{@const currentClasses = AppState.currentChannelId === channel.id ? 'bg-muted' : ''}
						<Button
							class=" w-full justify-start text-base font-bold text-foreground/80 {currentClasses}"
							variant="ghost"
							onclick={() => selectChannel(channel.id)}
						>
							<MessageSquareIcon class="inline size-4" />
							<span class="min-w-0 truncate">
								{channel.name}
							</span>
						</Button>
					{/each}
				{/each}
			{/if}
		</div>
	</ScrollArea>

	<div class="h-14 border-t-2 border-border"></div>
</aside>
