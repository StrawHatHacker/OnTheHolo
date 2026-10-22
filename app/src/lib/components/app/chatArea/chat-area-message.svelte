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
	import UserProfileCmenu from '$lib/components/menus/user-profile-cmenu.svelte';
	import { tick, untrack } from 'svelte';

	let {
		message,
		session,
		isGroupStart,
		replyMessage,
		onReplyClick,
		submitEditMessage,
		submitDeleteMessage,
		addToContent,
	}: {
		message: Message;
		session: SessionWithUser;
		isGroupStart: boolean;
		replyMessage: Message | null;
		onReplyClick: (message: Message) => void;
		submitEditMessage: (message: Message, newContent: string) => void;
		submitDeleteMessage: (message: Message) => void;
		addToContent: (content: string) => void;
	} = $props();

	// State
	let messageMode = $state<'view' | 'edit'>('view');
	let editTextArea = $state<HTMLTextAreaElement | null>(null);

	// Form
	let newContent = $state('');

	// Derived
	let User = $derived.by(() => {
		return Users.find((u) => u.id === message.user_id);
	});
	let ReplyUser = $derived(
		replyMessage ? Users.find((u) => u.id === replyMessage.user_id) : undefined
	);

	$effect(() => {
		// Whenever we switch states we reset the edited message
		messageMode;
		untrack(() => {
			newContent = message.content;
		});
	});

	const handleKeydown = (e: KeyboardEvent) => {
		if (e.key === 'Enter' && !e.shiftKey) {
			e.preventDefault();
			submitEditMessageInternal();
		} else if (e.key === 'Escape') messageMode = 'view';
	};

	const submitEditMessageInternal = () => {
		messageMode = 'view';
		submitEditMessage(message, newContent);
	};

	const goToEditMode = () => {
		messageMode = 'edit';
		tick().then(() => editTextArea?.focus());
	};

	let isReplyToSelf = $derived(isGroupStart && replyMessage?.user_id === session?.user.id);
</script>

<ContextMenu.Root>
	<ContextMenu.Trigger>
		<div
			class="group relative flex flex-col items-start px-4 py-0.5 hover:bg-foreground/5"
			class:message-is-reply={isReplyToSelf}
		>
			{#if replyMessage}
				<div class="ml-5 flex min-w-0 items-center gap-2 text-xs text-muted-foreground">
					<div
						class="mt-2 h-3 w-7 shrink-0 rounded-tl-sm border-t-2 border-l-2 border-muted-foreground/40"
					></div>
					<span class="shrink-0 font-bold">@{ReplyUser?.username ?? 'Unknown'}</span>
					<span class="truncate">{replyMessage.content}</span>
				</div>
			{/if}

			<div class="flex w-full items-start gap-4">
				<div class="absolute top-0 right-2 hidden translate-y-[-50%] group-hover:block">
					<ButtonGroup.Root>
						{#if message.user_id === session?.user.id}
							<Button
								size="icon-xs"
								variant="outline"
								onclick={() => (messageMode === 'view' ? goToEditMode() : (messageMode = 'view'))}
							>
								<SquarePenIcon />
							</Button>
						{/if}
						{#if message.user_id === session?.user.id || session?.user.privilege_status === USER_PRIVILEGE_STATUS.ADMIN}
							<Button size="icon-xs" variant="outline" onclick={() => submitDeleteMessage(message)}>
								<TrashIcon class="text-destructive" />
							</Button>
						{/if}
					</ButtonGroup.Root>
				</div>

				{#if isGroupStart}
					{#if User?.profile_image}
						<UserProfileCmenu user={User} align="center" side="bottom" {session}>
							<img
								src={getMediaUrl(User.profile_image, MEDIA_PURPOSE.profileImage)}
								alt="profile"
								class="mt-1 size-10 shrink-0! rounded-full object-cover"
							/>
						</UserProfileCmenu>
					{:else}
						<div class="size-10 shrink-0 rounded-full bg-muted"></div>
					{/if}
				{:else}
					<div class="w-10 shrink-0"></div>
				{/if}

				<div class="flex w-full flex-col">
					{#if isGroupStart}
						<div class="flex w-full items-center gap-2">
							<button
								onclick={() => addToContent(`${ENTITY_PREFIX.user}${User?.username}`)}
								class="hover:underline"
							>
								<h4 class="text-md font-bold">{User?.username ?? 'Unknown'}</h4>
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
							<span class="hidden text-xs text-muted-foreground group-hover:block">
								{DateHelper.toReadable(message.created_at)}
							</span>
						</div>
					{/if}
					{#if messageMode === 'view'}
						<p class="text-sm whitespace-pre-wrap">
							{message.content}
							{#if message.edited}
								<span class="text-xs text-muted-foreground">&ensp;(Edited)</span>
							{/if}
						</p>
					{:else}
						<form class="flex w-full items-center gap-2">
							<Textarea
								class="max-h-full! w-full! flex-1 resize-none rounded border p-2 text-sm"
								onkeydown={handleKeydown}
								bind:value={newContent}
								bind:ref={editTextArea}
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
		</div>
	</ContextMenu.Trigger>
	<ContextMenu.Content>
		{#if session?.user.id === message.user_id}
			<ContextMenu.Item onclick={() => goToEditMode()}>
				<SquarePenIcon />
				Edit
			</ContextMenu.Item>
		{/if}
		<div class="flex">
			<ContextMenu.Item onclick={() => onReplyClick(message)}>
				<MessageSquareReplyIcon />
				Reply
			</ContextMenu.Item>
			<div class="mx-1 h-7 w-px bg-border"></div>
			<ContextMenu.Item onclick={() => addToContent(`${ENTITY_PREFIX.user}${User?.username}`)}>
				<AtSignIcon />
				Mention user
			</ContextMenu.Item>
		</div>
		{#if session?.user.id === message.user_id || session?.user.privilege_status === USER_PRIVILEGE_STATUS.ADMIN}
			<ContextMenu.Item variant="destructive" onclick={() => submitDeleteMessage(message)}>
				<TrashIcon />
				Delete
			</ContextMenu.Item>
		{/if}
	</ContextMenu.Content>
</ContextMenu.Root>
