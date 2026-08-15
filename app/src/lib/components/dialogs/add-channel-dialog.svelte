<script lang="ts">
	import * as Dialog from '$lib/components/ui/dialog/index.js';
	import { CHANNEL_TYPE } from '$lib/constants';
	import { AppState } from '$lib/stores.svelte';
	import MessageSquareIcon from '@lucide/svelte/icons/message-square';
	import Volume2Icon from '@lucide/svelte/icons/volume-2';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Label } from '$lib/components/ui/label/index.js';
	import Button from '../ui/button/button.svelte';
	import { AppHelper, CError, genericRequest, handleRequestError } from '$lib/utils';
	import type { AddChannelPayload } from '$lib/types';
	import { ERROR_MAP } from '$lib/errors';
	import { toast } from 'svelte-sonner';

	// State
	let loading = $state(false);
	let newChannelName = $state('');

	$effect(() => {
		return () => AppHelper.closeAddChannelDialog();
	});

	/**
	 * 'text' | 'voice' etc.
	 */
	let channelTypeString = $derived.by(() => {
		return (
			Object.entries(CHANNEL_TYPE).find(
				([key, value]) => value === AppState.addChannelDialogOptions?.channelType
			)?.[0] || null
		);
	});
	let Icon = $derived.by(() => {
		if (AppState.addChannelDialogOptions?.channelType === CHANNEL_TYPE.text) {
			return MessageSquareIcon;
		} else if (AppState.addChannelDialogOptions?.channelType === CHANNEL_TYPE.voice) {
			return Volume2Icon;
		}
	});

	const submitAddChannel = async () => {
		try {
			if (!AppState.addChannelDialogOptions) throw new CError(500, ERROR_MAP.generalError);

			loading = true;

			const payload: AddChannelPayload = {
				name: newChannelName,
				channelType: AppState.addChannelDialogOptions.channelType,
				categoryId: AppState.addChannelDialogOptions.forCategoryId,
			};

			await genericRequest('/api/channel', {
				method: 'POST',
				body: JSON.stringify(payload),
			});

			toast.success('Channel added');
			AppHelper.closeAddChannelDialog();
		} catch (e) {
			handleRequestError(e);
		} finally {
			loading = false;
		}
	};
</script>

<Dialog.Root bind:open={AppState.isAddChannelDialogOpen}>
	<Dialog.Content>
		<Dialog.Header>
			<Dialog.Title>
				<Icon class="size-5"></Icon>
				Add a {channelTypeString} channel
			</Dialog.Title>
		</Dialog.Header>
		<form class="flex flex-col gap-4" onsubmit={submitAddChannel}>
			<div class="flex flex-col gap-1">
				<Label for="channel-name">Channel name</Label>
				<Input
					id="channel-name"
					class="w-full"
					disabled={loading}
					required
					bind:value={newChannelName}
				/>
			</div>

			<Button type="submit" disabled={loading}>Add</Button>
		</form>
	</Dialog.Content>
</Dialog.Root>
