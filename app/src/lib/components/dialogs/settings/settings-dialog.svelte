<script lang="ts">
	import * as Dialog from '$lib/components/ui/dialog/index.js';
	import UserKeyIcon from '@lucide/svelte/icons/user-key';
	import MessageSquareIcon from '@lucide/svelte/icons/message-square';
	import ImagePlayIcon from '@lucide/svelte/icons/image-play';
	import LockIcon from '@lucide/svelte/icons/lock';
	import ShieldCogCornerIcon from '@lucide/svelte/icons/shield-cog-corner';
	import { AppState } from '$lib/stores.svelte';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Label } from '$lib/components/ui/label/index.js';
	import Button from '$lib/components/ui/button/button.svelte';
	import { AppHelper, genericRequest, getMediaUrl, handleRequestError } from '$lib/utils';
	import { toast } from 'svelte-sonner';
	import { Separator } from '$lib/components/ui/separator/index.js';
	import type { SessionWithUser } from '$lib/types';
	import { MEDIA_PURPOSE } from '$lib/constants';
	import FaceSmileIcon from '@lucide/svelte/icons/face-slightly-smiling';
	import SettingsAccount from './settings-account.svelte';

	let { session }: { session: SessionWithUser } = $props();

	let selectedTab: 'account' | 'messages' | 'media' | 'privacy' | 'adminOptions' =
		$state('account');

	// State
	let loading = $state(false);
</script>

<Dialog.Root bind:open={AppState.isSettingsDialogOpen}>
	<Dialog.Content class="flex max-h-[70vh] min-h-[70vh] w-full gap-4 sm:max-w-4xl">
		<ul class="flex w-fit max-w-min flex-col border-r border-muted pr-4">
			<li class="mb-6 ml-2 flex items-center gap-2">
				{#if session?.user.profile_image}
					<img
						src={getMediaUrl(session.user.profile_image, MEDIA_PURPOSE.profileImage)}
						alt="profile"
						class="mb-1 size-6 shrink-0 rounded-full object-cover"
					/>
				{:else}
					<FaceSmileIcon class="size-6 shrink-0 rounded-full bg-muted"></FaceSmileIcon>
				{/if}
				<h2 class="text-lg leading-4 font-bold break-all">{session?.user.username}</h2>
			</li>
			<li class="flex gap-1">
				<Button
					variant="ghost"
					disabled={loading}
					class="w-full justify-start"
					onclick={() => (selectedTab = 'account')}
				>
					<UserKeyIcon />
					Account
				</Button>
			</li>
			<li class="flex gap-1">
				<Button
					variant="ghost"
					disabled={loading}
					class="w-full justify-start"
					onclick={() => (selectedTab = 'messages')}
				>
					<MessageSquareIcon />
					Messages
				</Button>
			</li>
			<li class="flex gap-1">
				<Button
					variant="ghost"
					disabled={loading}
					class="w-full justify-start"
					onclick={() => (selectedTab = 'media')}
				>
					<ImagePlayIcon />
					Media
				</Button>
			</li>
			<li class="flex gap-1">
				<Button
					variant="ghost"
					disabled={loading}
					class="w-full justify-start"
					onclick={() => (selectedTab = 'privacy')}
				>
					<LockIcon />
					Privacy
				</Button>
			</li>
			<Separator class="my-1" />
			<li class="flex gap-1">
				<Button
					variant="ghost"
					disabled={loading}
					class="w-full justify-start"
					onclick={() => (selectedTab = 'adminOptions')}
				>
					<ShieldCogCornerIcon />
					Admin options
				</Button>
			</li>
		</ul>
		{#if selectedTab === 'account'}
			<SettingsAccount {session} />
		{/if}
	</Dialog.Content>
</Dialog.Root>
