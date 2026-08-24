<script lang="ts">
	import * as Dialog from '$lib/components/ui/dialog/index.js';
	import { AppState } from '$lib/stores.svelte';
	import SquarePenIcon from '@lucide/svelte/icons/square-pen';
	import UploadIcon from '@lucide/svelte/icons/upload';
	import Undo2Icon from '@lucide/svelte/icons/undo-2';
	import Trash2Icon from '@lucide/svelte/icons/trash-2';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Label } from '$lib/components/ui/label/index.js';
	import Button from '$lib/components/ui/button/button.svelte';
	import * as Select from '$lib/components/ui/select/index.js';
	import { Textarea } from '$lib/components/ui/textarea/index.js';
	import {
		AppHelper,
		CError,
		createMediaFormdata,
		genericRequest,
		getMediaUrl,
		getUserActivityColor,
		handleRequestError,
	} from '$lib/utils';
	import type { MediaUploadResponse, SessionWithUser, User } from '$lib/types';
	import { ERROR_MAP } from '$lib/errors';
	import { toast } from 'svelte-sonner';
	import { untrack } from 'svelte';
	import { MEDIA_PURPOSE, USER_ACTIVITY_STATUS } from '$lib/constants';
	import { SETTINGS } from '$lib/settings';

	let { session }: { session: SessionWithUser } = $props();

	// State
	let loading = $state(false);
	let clonedUser = $state<User | null>(null);
	let pfpInput = $state<HTMLInputElement | null>(null);
	let bannerInput = $state<HTMLInputElement | null>(null);
	let newPfp = $state<FileList | null>(null);
	let newBanner = $state<FileList | null>(null);
	let activityStatus = $state<string>();

	$effect(() => {
		untrack(() => {
			clonedUser = $state.snapshot(session?.user || null);
			activityStatus = session?.user?.activity_status + '';
		});
	});

	$effect(() => {
		return () => {
			clonedUser = null;
			AppHelper.closeEditUserDialog();
		};
	});

	const activityStatusStr = $derived.by(() => {
		return (
			Object.entries(USER_ACTIVITY_STATUS).find(
				([_, value]) => value + '' === activityStatus
			)?.[0] || null
		);
	});

	const generatePfp = async () => {
		try {
			loading = true;
			const res = await genericRequest<MediaUploadResponse>('/api/media/generate-pfp', {
				method: 'GET',
			});

			clonedUser && (clonedUser.profile_image = res.filename);
		} catch (e) {
			handleRequestError(e);
		} finally {
			loading = false;
		}
	};

	const submitEditUser = async () => {
		try {
			if (!clonedUser) throw new CError(500, ERROR_MAP.generalError);
			loading = true;

			if (newPfp?.[0]) {
				const formdata = createMediaFormdata(newPfp[0], MEDIA_PURPOSE.profileImage);
				const res = await genericRequest<MediaUploadResponse>('/api/media', {
					method: 'PUT',
					body: formdata,
				});
				clonedUser.profile_image = res.filename || clonedUser.profile_image;
			}
			if (newBanner?.[0]) {
				const formdata = createMediaFormdata(newBanner[0], MEDIA_PURPOSE.bannerImage);
				const res = await genericRequest<MediaUploadResponse>('/api/media', {
					method: 'PUT',
					body: formdata,
				});
				clonedUser.banner_image = res.filename || clonedUser.banner_image;
			}

			clonedUser.activity_status =
				Object.entries(USER_ACTIVITY_STATUS).find(
					([_, value]) => value + '' === activityStatus
				)?.[1] ?? USER_ACTIVITY_STATUS.Offline;

			await genericRequest('/api/user', {
				method: 'PUT',
				body: JSON.stringify(clonedUser),
			});

			toast.success('Your profile has been updated');
			AppHelper.closeEditUserDialog();
		} catch (e) {
			handleRequestError(e);
		} finally {
			loading = false;
		}
	};
</script>

<Dialog.Root bind:open={AppState.isEditUserDialogOpen}>
	<Dialog.Content class="max-w-xl!">
		<Dialog.Header>
			<Dialog.Title>
				<SquarePenIcon />
				Edit your profile
			</Dialog.Title>
		</Dialog.Header>
		{#if clonedUser}
			<form onsubmit={submitEditUser} class="flex flex-col gap-4">
				<div class="flex items-start justify-between gap-0">
					<div class="flex flex-1 flex-col items-center gap-2">
						<div class="group relative w-fit">
							{#if newPfp?.[0]}
								<img
									src={URL.createObjectURL(newPfp[0])}
									alt=""
									class="size-22 rounded-full border border-border object-cover"
								/>
							{:else}
								<img
									src={getMediaUrl(clonedUser.profile_image, MEDIA_PURPOSE.profileImage)}
									alt=""
									class="size-22 rounded-full border border-border object-cover"
								/>
							{/if}
							<Button
								size="icon-sm"
								class="absolute top-0 right-0 hidden rounded-full group-hover:flex"
								onclick={() => pfpInput?.click()}
								disabled={loading}
								type="button"
							>
								<UploadIcon />
							</Button>

							{#if newPfp?.[0]}
								<Button
									size="icon-sm"
									variant="outline"
									class="absolute top-0 -left-4 hidden rounded-full group-hover:flex"
									onclick={() => (newPfp = null)}
									disabled={loading}
									type="button"
								>
									<Undo2Icon />
								</Button>
							{/if}
						</div>
						<span class="text-muted-foreground">
							Max file size: {SETTINGS.MAX_PFP_FILE_SIZE / 1024 / 1024}MBs
						</span>
						<Button
							variant="outline"
							size="sm"
							onclick={generatePfp}
							disabled={loading}
							type="button"
						>
							Generate new pfp
						</Button>
					</div>
					<div class="flex-2">
						<div
							class="group relative ml-auto flex aspect-19/9 max-w-xs shrink-0 flex-col items-center justify-center rounded bg-accent"
						>
							{#if newBanner?.[0]}
								<Button
									size="icon-sm"
									variant="outline"
									class="absolute -top-3 -left-3 hidden rounded-full group-hover:flex"
									onclick={() => (newBanner = null)}
									disabled={loading}
									type="button"
								>
									<Undo2Icon />
								</Button>

								<img src={URL.createObjectURL(newBanner[0])} alt="" class="h-full w-full" />
							{:else if clonedUser && clonedUser.banner_image}
								<Button
									size="icon-sm"
									variant="destructive"
									class="absolute -top-3 -right-3 hidden rounded-full group-hover:flex"
									onclick={() => ((newBanner = null), (clonedUser!.banner_image = null))}
									disabled={loading}
									type="button"
								>
									<Trash2Icon />
								</Button>
								<img
									src={getMediaUrl(clonedUser.banner_image, MEDIA_PURPOSE.bannerImage)}
									alt=""
									class="h-full w-full rounded object-cover"
								/>
							{:else}
								<Button
									variant="outline"
									size="sm"
									onclick={() => bannerInput?.click()}
									type="button"
								>
									Upload banner
								</Button>
								<span class="block text-muted-foreground">
									Max file size: {SETTINGS.MAX_BANNER_FILE_SIZE / 1024 / 1024}MBs
								</span>
							{/if}
						</div>
					</div>
				</div>
				<div>
					<Label for="username" class="mb-1">Username</Label>
					<div class="flex items-center gap-2">
						<Input id="username" type="text" bind:value={clonedUser.username} disabled={loading} />
						{#if clonedUser.username !== session?.user.username}
							<Button
								variant="outline"
								size="icon"
								disabled={loading}
								onclick={() => (clonedUser!.username = session?.user.username ?? '')}
								type="button"
							>
								<Undo2Icon />
							</Button>
						{/if}
					</div>
				</div>
				<div>
					<Label for="bio" class="mb-1">Bio</Label>
					<div class="flex items-center gap-2">
						<Textarea id="bio" bind:value={clonedUser.bio} disabled={loading} />
						{#if clonedUser.bio !== session?.user.bio}
							<Button
								variant="outline"
								size="icon"
								disabled={loading}
								onclick={() => (clonedUser!.bio = session?.user.bio ?? '')}
								type="button"
							>
								<Undo2Icon />
							</Button>
						{/if}
					</div>
				</div>
				<div>
					<Label class="mb-1">Status</Label>
					<Select.Root type="single" bind:value={activityStatus}>
						<Select.Trigger class="w-full">
							<div class="flex items-center gap-2">
								{@render activityDot(activityStatus)}
								{activityStatusStr?.replaceAll('_', ' ')}
							</div>
						</Select.Trigger>
						<Select.Content>
							<Select.Item value={USER_ACTIVITY_STATUS.Online + ''}>
								<div class="flex items-center gap-2">
									{@render activityDot(USER_ACTIVITY_STATUS.Online)}
									Online
								</div>
							</Select.Item>
							<Select.Item value={USER_ACTIVITY_STATUS.Away + ''}>
								<div class="flex items-center gap-2">
									{@render activityDot(USER_ACTIVITY_STATUS.Away)}
									Away
								</div>
							</Select.Item>
							<Select.Item value={USER_ACTIVITY_STATUS.Do_Not_Disturb + ''}>
								<div class="flex items-center gap-2">
									{@render activityDot(USER_ACTIVITY_STATUS.Do_Not_Disturb)}
									Do not disturb
								</div>
							</Select.Item>
							<Select.Item value={USER_ACTIVITY_STATUS.Offline + ''}>
								<div class="flex items-center gap-2">
									{@render activityDot(USER_ACTIVITY_STATUS.Offline)}
									Offline
								</div>
							</Select.Item>
						</Select.Content>
					</Select.Root>
				</div>
				<div>
					<Label for="activity" class="mb-1">Activity</Label>
					<div class="flex items-center gap-2">
						<Input
							id="activity"
							type="text"
							bind:value={clonedUser.activity_name}
							disabled={loading}
						/>
					</div>
				</div>
				<Button type="submit" disabled={loading}>Save</Button>
			</form>
		{/if}
	</Dialog.Content>
</Dialog.Root>

<input
	type="file"
	class="hidden"
	bind:this={pfpInput}
	bind:files={newPfp}
	disabled={loading}
	accept="image/*"
/>
<input
	type="file"
	class="hidden"
	bind:this={bannerInput}
	bind:files={newBanner}
	disabled={loading}
	accept="image/*"
/>

{#snippet activityDot(activityStatus: string | number | undefined)}
	<div class="size-4 rounded-full {getUserActivityColor(Number(activityStatus))}"></div>
{/snippet}
