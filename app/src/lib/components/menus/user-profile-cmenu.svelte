<script lang="ts">
	import * as Popover from '$lib/components/ui/popover/index.js';
	import type { SessionWithUser, User } from '$lib/types';
	import { AppHelper, getMediaUrl, getUserActivityColor } from '$lib/utils';
	import type { Snippet } from 'svelte';
	import { Badge } from '$lib/components/ui/badge/index.js';
	import { MEDIA_PURPOSE, USER_PRIVILEGE_STATUS } from '$lib/constants';
	import { Button } from '../ui/button/index.js';
	import PencilIcon from '@lucide/svelte/icons/pencil';
	import MessageSquareIcon from '@lucide/svelte/icons/message-square';
	import SvelteMarkdown from '@humanspeak/svelte-markdown';
	import { ScrollArea } from '$lib/components/ui/scroll-area/index.js';

	let {
		children,
		session,
		user,
		align,
		side,
	}: {
		children: Snippet;
		session: SessionWithUser;
		user: User;
		align?: 'start' | 'center' | 'end' | undefined;
		side?: 'top' | 'right' | 'bottom' | 'left' | undefined;
	} = $props();

	let open = $state(false);
</script>

<Popover.Root bind:open>
	<Popover.Trigger>
		{@render children?.()}
	</Popover.Trigger>
	<Popover.Content
		class="group relative h-94 w-64 gap-0 overflow-clip border border-border bg-background p-0 shadow ring-0"
		{align}
		{side}
	>
		{#if !user.banner_image}
			<div class="z-50 aspect-19/9 w-full bg-accent"></div>
		{:else}
			<img
				src={getMediaUrl(user.banner_image, MEDIA_PURPOSE.bannerImage)}
				alt=""
				class="z-50 aspect-19/9 object-cover"
			/>
		{/if}
		<div class="absolute top-18 left-2 z-50 rounded-full bg-muted">
			<img
				src={getMediaUrl(user.profile_image, MEDIA_PURPOSE.profileImage)}
				alt=""
				class="size-18 rounded-full border-2 border-muted object-cover"
			/>
			<!-- TODO Fix this this when we have activity statuses -->
			<div
				class="absolute right-0.5 bottom-0.5 size-4 rounded-full border-2 border-muted {getUserActivityColor(
					user.activity_status
				)}"
			></div>
		</div>
		{#if user.activity_name}
			<div class="absolute top-28 left-22 isolate z-50">
				<div class="absolute -top-2 left-4 z-0 size-4 rounded-full bg-muted"></div>
				<div class="absolute -top-4 left-2 z-0 size-2.5 rounded-full bg-muted"></div>
				<div class="absolute -top-5 -left-0.5 z-0 size-2 rounded-full bg-muted"></div>
				<!-- TODO Fix this this when we have activity statuses -->
				<div
					class="relative z-10 max-w-40 truncate rounded-full bg-muted px-2 py-1 text-xs tracking-tight"
				>
					{user.activity_name}
				</div>
			</div>
		{/if}
		{#if session?.user.id === user.id}
			<Button
				size="icon-xs"
				variant="outline"
				class="absolute top-1 right-1 z-60 hidden group-hover:flex"
				onclick={() => {
					open = false;
					AppHelper.openEditUserDialog();
				}}
			>
				<PencilIcon />
			</Button>
		{/if}
		<ScrollArea class="relative z-0 min-h-0 flex-1" orientation="vertical">
			<div class="mt-9 flex flex-col gap-2 px-2">
				<h4 class="flex items-center gap-2 text-lg font-bold">
					{user.username}
					{#if user.privilege_status === USER_PRIVILEGE_STATUS.ADMIN}
						<Badge variant="secondary">Admin</Badge>
					{/if}
				</h4>
			</div>
			<div class="flex items-center justify-between gap-2 px-2">
				<Button size="icon-xs">
					<MessageSquareIcon />
				</Button>
			</div>
			<div class="mt-4 gap-2 px-2">
				<h5 class="text-sm font-medium text-muted-foreground">Bio</h5>
				<p class="leading-none">
					<SvelteMarkdown source={user.bio ?? ''} />
				</p>
			</div>
			<!-- <div class="mt-4 gap-2 px-2">
				<h5 class="text-sm font-medium text-muted-foreground">Roles</h5>
				<div class="flex flex-wrap gap-1">
					<Badge variant="outline">Noob</Badge>
					<Badge variant="outline">Noob</Badge>
					<Badge variant="outline">Noob</Badge>
				</div>
			</div> -->
		</ScrollArea>
	</Popover.Content>
</Popover.Root>
