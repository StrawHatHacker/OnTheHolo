<script lang="ts">
	import * as Dialog from '$lib/components/ui/dialog/index.js';
	import { CHANNEL_TYPE } from '$lib/constants';
	import { AppState } from '$lib/stores.svelte';
	import MessageSquareIcon from '@lucide/svelte/icons/message-square';
	import Volume2Icon from '@lucide/svelte/icons/volume-2';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Label } from '$lib/components/ui/label/index.js';
	import Button from '../ui/button/button.svelte';
	import { CError, genericRequest, handleRequestError } from '$lib/utils';
	import type { NewChannelPayload } from '$lib/types';
	import { ERROR_MAP } from '$lib/errors';

	// State
	let loading = $state(false);
	let newChannelName = $state('');

	$effect(() => {
		if (!AppState.isCreateChannelDialogOpen) {
			AppState.createChannelDialogOptions = null;
		}
	});

	/**
	 * 'text' | 'voice' etc.
	 */
	let channelTypeString = $derived.by(() => {
		return (
			Object.entries(CHANNEL_TYPE).find(
				([key, value]) => value === AppState.createChannelDialogOptions?.channelType
			)?.[0] || null
		);
	});
	let Icon = $derived.by(() => {
		if (AppState.createChannelDialogOptions?.channelType === CHANNEL_TYPE.text) {
			return MessageSquareIcon;
		} else if (AppState.createChannelDialogOptions?.channelType === CHANNEL_TYPE.voice) {
			return Volume2Icon;
		}
	});

	const submitAddChannel = async () => {
		try {
			if (!AppState.createChannelDialogOptions) throw new CError(500, ERROR_MAP.generalError);

			loading = true;

			const payload: NewChannelPayload = {
				name: newChannelName,
				channelType: AppState.createChannelDialogOptions.channelType,
				categoryId: AppState.createChannelDialogOptions.forCategoryId,
			};

			await genericRequest('/api/channel', {
				method: 'POST',
				body: JSON.stringify(payload),
			});
		} catch (e) {
			handleRequestError(e);
		} finally {
			loading = false;
		}
	};
</script>

<Dialog.Root bind:open={AppState.isCreateChannelDialogOpen}>
	<Dialog.Content>
		<Dialog.Header>
			<Dialog.Title>
				<Icon class="mr-1 inline size-5"></Icon>
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
