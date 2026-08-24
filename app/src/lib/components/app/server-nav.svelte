<script lang="ts">
	import UsersIcon from '@lucide/svelte/icons/users-round';
	import PlusIcon from '@lucide/svelte/icons/plus';
	import MessageSquareIcon from '@lucide/svelte/icons/message-square';
	import SquarePenIcon from '@lucide/svelte/icons/square-pen';
	import FaceSmileIcon from '@lucide/svelte/icons/face-slightly-smiling';
	import Volume2Icon from '@lucide/svelte/icons/volume-2';
	import ListPlusIcon from '@lucide/svelte/icons/list-plus';
	import TrashIcon from '@lucide/svelte/icons/trash';
	import FingerprintPatternIcon from '@lucide/svelte/icons/fingerprint-pattern';
	import { Button } from '$lib/components/ui/button/index.js';
	import { ScrollArea } from '$lib/components/ui/scroll-area/index.js';
	import { AppState, Store } from '$lib/stores.svelte';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu/index.js';
	import * as ContextMenu from '$lib/components/ui/context-menu/index.js';
	import { AppHelper, getMediaUrl } from '$lib/utils';
	import { CHANNEL_TYPE, ENTITY_PREFIX, MEDIA_PURPOSE } from '$lib/constants';
	import type { SessionWithUser } from '$lib/types';
	import UserProfileCmenu from '$lib/components/menus/user-profile-cmenu.svelte';

	let {
		selectChannel,
		session,
	}: {
		selectChannel: (channelId: number) => void;
		session: SessionWithUser;
	} = $props();

	let currentUser = $derived.by(() => {
		return Store.users.findById(session!.user.id);
	});
</script>

<aside id="navogation" class="flex h-full max-w-60 min-w-60 flex-col border-r border-border pt-2">
	<div class="px-2">
		<Button class="w-full text-base font-bold" variant="outline" size="lg">
			<UsersIcon />
			Friends
		</Button>
	</div>

	<ScrollArea class="min-h-0 flex-1 px-2" orientation="vertical">
		<div class="flex flex-col">
			{#if Store.categories.length === 0}
				<Button class="mt-4 w-full" size="lg" onclick={() => AppHelper.openAddCategoryDialog()}>
					Add your first category
				</Button>
			{:else}
				{#each Store.categories.getAll() as category}
					<div class="group flex items-end justify-between">
						<h3 class="mt-4 truncate text-sm font-bold text-muted-foreground">
							{category.name}
						</h3>
						<div class="flex items-center gap-1">
							<DropdownMenu.Root>
								<DropdownMenu.Trigger class="m-0! p-0!">
									<Button size="icon-xs" variant="outline" class="hidden group-hover:flex">
										<SquarePenIcon />
									</Button>
								</DropdownMenu.Trigger>
								<DropdownMenu.Content class="w-56" align="start">
									<DropdownMenu.Label>
										{category.name}
									</DropdownMenu.Label>
									<DropdownMenu.Group>
										<DropdownMenu.Item
											onclick={() => AppHelper.openEditCategoryDialog($state.snapshot(category))}
										>
											<SquarePenIcon />
											Edit
										</DropdownMenu.Item>
										<DropdownMenu.Item
											variant="destructive"
											onclick={() => AppHelper.openDeleteCategoryDialog($state.snapshot(category))}
										>
											<TrashIcon />
											Delete
										</DropdownMenu.Item>
									</DropdownMenu.Group>
								</DropdownMenu.Content>
							</DropdownMenu.Root>

							<DropdownMenu.Root>
								<DropdownMenu.Trigger class="m-0! p-0!">
									<Button size="icon-xs" variant="outline" class="hidden group-hover:flex">
										<PlusIcon />
									</Button>
								</DropdownMenu.Trigger>
								<DropdownMenu.Content class="w-56" align="start">
									<DropdownMenu.Label>
										{category.name}
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
						<ContextMenu.Root>
							<ContextMenu.Trigger>
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
							</ContextMenu.Trigger>
							<ContextMenu.Content class="w-56" align="start">
								<ContextMenu.Label>
									<MessageSquareIcon class="mr-1 inline size-3" />
									{channel.name}
								</ContextMenu.Label>
								<ContextMenu.Group>
									<ContextMenu.Item
										onclick={() => AppHelper.openEditChannelDialog($state.snapshot(channel))}
									>
										<SquarePenIcon />
										Edit
									</ContextMenu.Item>
									<ContextMenu.Item
										variant="destructive"
										onclick={() => AppHelper.openDeleteChannelDialog($state.snapshot(channel))}
									>
										<TrashIcon />
										Delete
									</ContextMenu.Item>

									<ContextMenu.Item
										class="flex-1"
										onclick={() =>
											navigator.clipboard.writeText(ENTITY_PREFIX.channel + channel.id)}
									>
										<FingerprintPatternIcon />
										Copy Ref
									</ContextMenu.Item>
								</ContextMenu.Group>
							</ContextMenu.Content>
						</ContextMenu.Root>
					{/each}
				{/each}
			{/if}
		</div>
	</ScrollArea>

	{#if currentUser}
		<UserProfileCmenu user={currentUser} {session}>
			<button
				class="flex h-14 w-full items-center gap-2 border-t border-border px-2 hover:bg-muted"
			>
				{#if currentUser.profile_image}
					<img
						src={getMediaUrl(currentUser.profile_image, MEDIA_PURPOSE.profileImage)}
						alt="profile"
						class="mb-1 size-8 shrink-0 rounded-full object-cover"
					/>
				{:else}
					<FaceSmileIcon class="size-8 shrink-0 rounded-full bg-muted"></FaceSmileIcon>
				{/if}
				<div class="flex flex-col items-start leading-none">
					<h4 class="text-sm font-bold">{currentUser.username}</h4>
					{#if currentUser.activity_name}
						<span class="text-xs text-muted-foreground">{currentUser.activity_name}</span>
					{:else}
						<!-- svelte-ignore node_invalid_placement_ssr -->
						<button class="text-xs text-muted-foreground hover:underline">Set status</button>
					{/if}
				</div>
			</button>
		</UserProfileCmenu>
	{/if}
</aside>
