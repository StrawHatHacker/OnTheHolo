<script lang="ts">
	import * as Dialog from '$lib/components/ui/dialog/index.js';
	import { CHANNEL_TYPE } from '$lib/constants';
	import { AppState } from '$lib/stores.svelte';
	import MessageSquareIcon from '@lucide/svelte/icons/message-square';
	import Volume2Icon from '@lucide/svelte/icons/volume-2';
	import Button from '../ui/button/button.svelte';
	import { AppHelper, CError, genericRequest, handleRequestError } from '$lib/utils';
	import type { ChannelWithMessages, DeleteChannelPayload } from '$lib/types';
	import { ERROR_MAP } from '$lib/errors';
	import { toast } from 'svelte-sonner';
	import { untrack } from 'svelte';

	// State
	let loading = $state(false);
	let originalChannel = $state<ChannelWithMessages | null>(null);

	$effect(() => {
		if (AppState.channelToDelete) {
			untrack(() => {
				originalChannel = $state.snapshot(AppState.channelToDelete || null);
			});
		}
	});

	$effect(() => {
		return () => AppHelper.closeDeleteChannelDialog();
	});

	let Icon = $derived.by(() => {
		if (AppState.channelToEdit?.type === CHANNEL_TYPE.text) {
			return MessageSquareIcon;
		} else if (AppState.channelToEdit?.type === CHANNEL_TYPE.voice) {
			return Volume2Icon;
		}
	});

	const submitDeleteChannel = async () => {
		try {
			if (!AppState.channelToDelete) throw new CError(500, ERROR_MAP.generalError);

			loading = true;

			const payload: DeleteChannelPayload = {
				channelId: AppState.channelToDelete.id,
			};

			await genericRequest('/api/channel', {
				method: 'DELETE',
				body: JSON.stringify(payload),
			});

			toast.success(`Channel ${originalChannel?.name} deleted`);
			AppHelper.closeDeleteChannelDialog();
		} catch (e) {
			console.error(e);
			handleRequestError(e);
		} finally {
			loading = false;
		}
	};
</script>

<Dialog.Root bind:open={AppState.isDeleteChannelDialogOpen}>
	<Dialog.Content>
		<Dialog.Header>
			<Dialog.Title>
				<Icon class="size-5"></Icon>
				Delete {originalChannel?.name}
			</Dialog.Title>
			<Dialog.Description>
				Are you sure you want to delete <u>{originalChannel?.name}</u>? This will also delete all
				messages in that channel.
				<b>This action cannot be undone.</b>
			</Dialog.Description>
		</Dialog.Header>
		<Button type="submit" variant="destructive" disabled={loading} onclick={submitDeleteChannel}>
			Delete
		</Button>
	</Dialog.Content>
</Dialog.Root>
