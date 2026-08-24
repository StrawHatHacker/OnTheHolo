<script lang="ts">
	import { Badge } from '$lib/components/ui/badge/index.js';
	import { ENTITY_PREFIX, MEDIA_PURPOSE, USER_PRIVILEGE_STATUS, USER_STATUS } from '$lib/constants';
	import { SETTINGS } from '$lib/settings';
	import * as ButtonGroup from '$lib/components/ui/button-group/index.js';
	import TrashIcon from '@lucide/svelte/icons/trash';
	import MessageSquareReplyIcon from '@lucide/svelte/icons/message-square-reply';
	import AtSignIcon from '@lucide/svelte/icons/at-sign';
	import SquarePenIcon from '@lucide/svelte/icons/square-pen';
	import type { Message, SessionWithUser } from '$lib/types';
	import { DateHelper, getMediaUrl } from '$lib/utils.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Users } from '$lib/stores.svelte';
	import { Textarea } from '$lib/components/ui/textarea/index.js';
	import SendIcon from '@lucide/svelte/icons/send';
	import * as ContextMenu from '$lib/components/ui/context-menu/index.js';

	let {
		message,
		session,
		submitEditMessage,
		submitDeleteMessage,
		addToContent,
	}: {
		message: Message;
		session: SessionWithUser;
		submitEditMessage: (message: Message, newContent: string) => void;
		submitDeleteMessage: (message: Message) => void;
		addToContent: (content: string) => void;
	} = $props();

	// State
	let messageMode = $state<'view' | 'edit'>('view');

	// Form
	let newContent = $state('');

	let User = $derived.by(() => {
		return Users.find((u) => u.id === message.user_id);
	});

	$effect(() => {
		// Whenever we switch states we reset the edited message
		messageMode;
		newContent = message.content;
	});

	const handleKeydown = (e: KeyboardEvent) => {
		if (e.key === 'Enter' && !e.shiftKey) {
			e.preventDefault();
			submitEditMessageInternal();
		}
	};

	const submitEditMessageInternal = () => {
		messageMode = 'view';
		submitEditMessage(message, newContent);
	};
</script>

<ContextMenu.Root>
	<ContextMenu.Trigger>
		<div class="group relative flex items-start gap-4 px-4 py-1 hover:bg-muted">
			{#if message.user_id === session?.user.id}
				<div class="absolute top-0 right-1 hidden translate-y-[-50%] group-hover:block">
					<ButtonGroup.Root>
						<Button
							size="icon-xs"
							variant="outline"
							onclick={() =>
								messageMode === 'view' ? (messageMode = 'edit') : (messageMode = 'view')}
						>
							<SquarePenIcon />
						</Button>
						<Button size="icon-xs" variant="outline" onclick={() => submitDeleteMessage(message)}>
							<TrashIcon class="text-destructive" />
						</Button>
					</ButtonGroup.Root>
				</div>
			{/if}
			{#if User?.profile_image}
				<img
					src={getMediaUrl(User.profile_image, MEDIA_PURPOSE.profileImage)}
					alt="profile"
					class="mt-1 size-10 shrink-0 rounded-full object-cover"
				/>
			{:else}
				<div class="size-8 shrink-0 rounded-full bg-muted"></div>
			{/if}
			<div class="flex w-full flex-col">
				<div class="flex w-full items-center gap-2">
					<button
						onclick={() => addToContent(`${ENTITY_PREFIX.user}${User?.username}`)}
						class="hover:underline"
					>
						<h4 class="text-md font-bold">{User?.username}</h4>
					</button>
					{#if User?.privilege_status === USER_PRIVILEGE_STATUS.ADMIN && SETTINGS.SHOW_ADMIN_BADGE_IN_CHAT}
						<Badge variant="secondary">Admin</Badge>
					{/if}
					{#if User?.status === USER_STATUS.DELETED}
						<Badge variant="destructive">Deleted</Badge>
					{/if}
					{#if User?.status === USER_STATUS.BANNED}
						<Badge variant="destructive">Banned</Badge>
					{/if}
					<span class="text-xs text-muted-foreground">
						{DateHelper.toReadable(message.created_at)}
					</span>
				</div>
				{#if messageMode === 'view'}
					<p class="">
						{message.content}
						{#if message.edited}
							<span class="text-xs text-muted-foreground">&ensp;(Edited)</span>
						{/if}
					</p>
				{:else}
					<form class="flex w-full items-center gap-2">
						<Textarea
							class="flex-1 resize-none rounded border p-2 text-sm"
							onkeydown={handleKeydown}
							bind:value={newContent}
						/>
						<Button
							size="icon"
							type="submit"
							class="shrink-0"
							onclick={() => submitEditMessageInternal()}
						>
							<SendIcon />
							<span class="sr-only">Send message</span>
						</Button>
					</form>
				{/if}
			</div>
		</div>
	</ContextMenu.Trigger>
	<ContextMenu.Content>
		{#if session?.user.id === message.user_id}
			<ContextMenu.Item onclick={() => (messageMode = 'edit')}>
				<SquarePenIcon />
				Edit
			</ContextMenu.Item>
		{/if}
		<div class="flex">
			<ContextMenu.Item>
				<MessageSquareReplyIcon />
				Reply
			</ContextMenu.Item>
			<div class="mx-1 h-7 w-px bg-border"></div>
			<ContextMenu.Item onclick={() => addToContent(`${ENTITY_PREFIX.user}${User?.username}`)}>
				<AtSignIcon />
				Mention user
			</ContextMenu.Item>
		</div>
		{#if session?.user.id === message.user_id}
			<ContextMenu.Item variant="destructive" onclick={() => submitDeleteMessage(message)}>
				<TrashIcon />
				Delete
			</ContextMenu.Item>
		{/if}
	</ContextMenu.Content>
</ContextMenu.Root>
