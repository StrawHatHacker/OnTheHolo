<script lang="ts">
	import * as Dialog from '$lib/components/ui/dialog/index.js';
	import { AppState } from '$lib/stores.svelte';
	import ListPlusIcon from '@lucide/svelte/icons/list-plus';
	import Button from '../ui/button/button.svelte';
	import { AppHelper, CError, genericRequest, handleRequestError } from '$lib/utils';
	import type { CategoryFull, DeleteCategoryPayload } from '$lib/types';
	import { ERROR_MAP } from '$lib/errors';
	import { toast } from 'svelte-sonner';
	import { untrack } from 'svelte';

	// State
	let loading = $state(false);
	let originalCategory = $state<CategoryFull | null>(null);

	$effect(() => {
		if (AppState.categoryToDelete) {
			untrack(() => {
				originalCategory = $state.snapshot(AppState.categoryToDelete || null);
			});
		}
	});

	$effect(() => {
		return () => AppHelper.closeDeleteCategoryDialog();
	});

	const submitDeleteCategory = async () => {
		try {
			if (!AppState.categoryToDelete) throw new CError(500, ERROR_MAP.generalError);

			loading = true;

			const payload: DeleteCategoryPayload = {
				categoryId: AppState.categoryToDelete.id,
			};

			await genericRequest('/api/category', {
				method: 'DELETE',
				body: JSON.stringify(payload),
			});

			toast.success(`Category ${originalCategory?.name} deleted`);
			AppHelper.closeDeleteCategoryDialog();
		} catch (e) {
			console.error(e);
			handleRequestError(e);
		} finally {
			loading = false;
		}
	};
</script>

<Dialog.Root bind:open={AppState.isDeleteCategoryDialogOpen}>
	<Dialog.Content>
		<Dialog.Header>
			<Dialog.Title>
				<ListPlusIcon class="size-5"></ListPlusIcon>
				Delete {originalCategory?.name}
			</Dialog.Title>
			<Dialog.Description>
				Are you sure you want to delete <u>{originalCategory?.name}</u>? This will also delete all
				channels and all messages in that category.
				<b>This action cannot be undone.</b>
			</Dialog.Description>
		</Dialog.Header>
		<Button type="submit" variant="destructive" disabled={loading} onclick={submitDeleteCategory}>
			Delete
		</Button>
	</Dialog.Content>
</Dialog.Root>
