<script lang="ts">
	import * as Dialog from '$lib/components/ui/dialog/index.js';
	import UserKeyIcon from '@lucide/svelte/icons/user-key';
	import MessageSquareIcon from '@lucide/svelte/icons/message-square';
	import ImagePlayIcon from '@lucide/svelte/icons/image-play';
	import LockIcon from '@lucide/svelte/icons/lock';
	import ShieldCogCornerIcon from '@lucide/svelte/icons/shield-cog-corner';
	import { AppState } from '$lib/stores.svelte';
	import Button from '$lib/components/ui/button/button.svelte';
	import { genericRequest, getMediaUrl, handleRequestError } from '$lib/utils';
	import { Separator } from '$lib/components/ui/separator/index.js';
	import type { SessionWithUser } from '$lib/types';
	import { MEDIA_PURPOSE } from '$lib/constants';
	import FaceSmileIcon from '@lucide/svelte/icons/face-slightly-smiling';
	import SettingsAccount from './settings-account.svelte';
	import { ScrollArea } from '$lib/components/ui/scroll-area/index.js';
	import LogOutIcon from '@lucide/svelte/icons/log-out';
	import { invalidateAll } from '$app/navigation';
	import { disconnectSSE } from '$lib/sseListeners';

	let { session }: { session: SessionWithUser } = $props();

	let selectedTab: 'account' | 'messages' | 'media' | 'privacy' | 'adminOptions' =
		$state('account');

	// State
	let loading = $state(false);

	const logout = async () => {
		try {
			loading = true;

			disconnectSSE();
			await genericRequest('/api/auth/logout', {
				method: 'DELETE',
			});

			// InvalidateAll reruns the load function,
			// The load function will fail because the session token is invalid
			// And the user will be redirected to the login page
			invalidateAll();
			AppState.isSettingsDialogOpen = false;
		} catch (error) {
			loading = false;
			handleRequestError(error);
		} finally {
			loading = false;
		}
	};
</script>

<Dialog.Root bind:open={AppState.isSettingsDialogOpen}>
	<Dialog.Content class="flex h-[70vh] max-h-[70vh] min-h-[70vh] w-full gap-4 pr-0 sm:max-w-4xl">
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

			<li class="mt-auto">
				<Button class="w-full text-destructive!" variant="outline" onclick={logout}>
					<LogOutIcon />
					Logout
				</Button>
			</li>
		</ul>
		<ScrollArea class="w-full pr-4">
			{#if selectedTab === 'account'}
				<SettingsAccount {session} />
			{/if}
		</ScrollArea>
	</Dialog.Content>
</Dialog.Root>
