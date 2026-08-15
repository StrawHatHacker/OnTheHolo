<script lang="ts">
	import * as Dialog from '$lib/components/ui/dialog/index.js';
	import { CHANNEL_TYPE } from '$lib/constants';
	import { AppState } from '$lib/stores.svelte';
	import MessageSquareIcon from '@lucide/svelte/icons/message-square';
	import Volume2Icon from '@lucide/svelte/icons/volume-2';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Label } from '$lib/components/ui/label/index.js';
	import Button from '$lib/components/ui/button/button.svelte';
	import { AppHelper, CError, genericRequest, handleRequestError } from '$lib/utils';
	import type { ChannelWithMessages, EditChannelPayload } from '$lib/types';
	import { ERROR_MAP } from '$lib/errors';
	import { toast } from 'svelte-sonner';
	import { untrack } from 'svelte';

	// State
	let loading = $state(false);
	let originalChannel = $state<ChannelWithMessages | null>(null);

	$effect(() => {
		if (AppState.channelToEdit) {
			untrack(() => {
				originalChannel = $state.snapshot(AppState.channelToEdit || null);
			});
		}
	});

	$effect(() => {
		return () => AppHelper.closeEditChannelDialog();
	});

	let Icon = $derived.by(() => {
		if (AppState.channelToEdit?.type === CHANNEL_TYPE.text) {
			return MessageSquareIcon;
		} else if (AppState.channelToEdit?.type === CHANNEL_TYPE.voice) {
			return Volume2Icon;
		}
	});

	const submitEditChannel = async () => {
		try {
			if (!AppState.channelToEdit) throw new CError(500, ERROR_MAP.generalError);

			loading = true;

			const payload: EditChannelPayload = {
				channelId: AppState.channelToEdit.id,
				name: AppState.channelToEdit.name,
			};

			await genericRequest('/api/channel', {
				method: 'PUT',
				body: JSON.stringify(payload),
			});

			toast.success('Channel edited');
			AppHelper.closeEditChannelDialog();
		} catch (e) {
			handleRequestError(e);
		} finally {
			loading = false;
		}
	};
</script>

<Dialog.Root bind:open={AppState.isEditChannelDialogOpen}>
	<Dialog.Content>
		<Dialog.Header>
			<Dialog.Title>
				<Icon class="size-5"></Icon>
				Edit channel {originalChannel?.name}
			</Dialog.Title>
		</Dialog.Header>
		{#if AppState.channelToEdit}
			<form class="flex flex-col gap-4" onsubmit={submitEditChannel}>
				<div class="flex flex-col gap-1">
					<Label for="edit-channel-name">Channel name</Label>
					<Input
						id="edit-channel-name"
						class="w-full"
						disabled={loading}
						required
						bind:value={AppState.channelToEdit.name}
					/>
				</div>

				<Button type="submit" disabled={loading}>Save</Button>
			</form>
		{/if}
	</Dialog.Content>
</Dialog.Root>
