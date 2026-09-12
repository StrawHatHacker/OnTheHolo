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
	import { AppHelper, genericRequest, handleRequestError } from '$lib/utils';
	import { toast } from 'svelte-sonner';
	import { Separator } from '$lib/components/ui/separator/index.js';
	import type { SessionWithUser } from '$lib/types';

	let { session }: { session: SessionWithUser } = $props();

	// State
	let loading = $state(false);
</script>

<Dialog.Root bind:open={AppState.isSettingsDialogOpen}>
	<Dialog.Content class="flex gap-4 max-h-[70vh] min-h-[70vh] w-full sm:max-w-4xl">
		<ul class="flex w-fit max-w-min flex-col border-r border-muted pr-4">
			<li class="mb-6 ml-2">
				<h2 class="text-lg font-bold break-all leading-4">{session?.user.username}</h2>
			</li>
			<li class="flex gap-1">
				<Button variant="ghost" disabled={loading} class="w-full justify-start">
					<UserKeyIcon />
					Account
				</Button>
			</li>
			<li class="flex gap-1">
				<Button variant="ghost" disabled={loading} class="w-full justify-start">
					<MessageSquareIcon />
					Messages
				</Button>
			</li>
			<li class="flex gap-1">
				<Button variant="ghost" disabled={loading} class="w-full justify-start">
					<ImagePlayIcon />
					Media
				</Button>
			</li>
			<li class="flex gap-1">
				<Button variant="ghost" disabled={loading} class="w-full justify-start">
					<LockIcon />
					Privacy
				</Button>
			</li>
			<Separator class="my-1" />
			<li class="flex gap-1">
				<Button variant="ghost" disabled={loading} class="w-full justify-start">
					<ShieldCogCornerIcon />
					Admin options
				</Button>
			</li>
		</ul>
		<div>Content</div>
	</Dialog.Content>
</Dialog.Root>
