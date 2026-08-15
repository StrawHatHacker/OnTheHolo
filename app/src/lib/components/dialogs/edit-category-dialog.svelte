<script lang="ts">
	import * as Dialog from '$lib/components/ui/dialog/index.js';
	import ListPlusIcon from '@lucide/svelte/icons/list-plus';
	import { AppState } from '$lib/stores.svelte';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Label } from '$lib/components/ui/label/index.js';
	import Button from '../ui/button/button.svelte';
	import { AppHelper, CError, genericRequest, handleRequestError } from '$lib/utils';
	import type { CategoryFull, EditCategoryPayload } from '$lib/types';
	import { ERROR_MAP } from '$lib/errors';
	import { toast } from 'svelte-sonner';
	import { untrack } from 'svelte';

	// State
	let loading = $state(false);
	let originalCategory = $state<CategoryFull | null>(null);

	$effect(() => {
		if (AppState.categoryToEdit) {
			untrack(() => {
				originalCategory = $state.snapshot(AppState.categoryToEdit || null);
			});
		}
	});

	$effect(() => {
		if (!AppState.isEditCategoryDialogOpen) {
			AppState.categoryToEdit = null;
		}
	});

	const submitEditCategory = async () => {
		try {
			if (!AppState.categoryToEdit) throw new CError(500, ERROR_MAP.generalError);

			loading = true;

			const payload: EditCategoryPayload = {
				categoryId: AppState.categoryToEdit.id,
				name: AppState.categoryToEdit.name,
			};

			await genericRequest('/api/category', {
				method: 'PUT',
				body: JSON.stringify(payload),
			});

			toast.success('Category edited');
			AppHelper.closeEditCategoryDialog();
		} catch (e) {
			handleRequestError(e);
		} finally {
			loading = false;
		}
	};
</script>

<Dialog.Root bind:open={AppState.isEditCategoryDialogOpen}>
	<Dialog.Content>
		<Dialog.Header>
			<Dialog.Title>
				<ListPlusIcon class="size-5"></ListPlusIcon>
				Edit category {originalCategory?.name}
			</Dialog.Title>
		</Dialog.Header>
		{#if AppState.categoryToEdit}
			<form class="flex flex-col gap-4" onsubmit={submitEditCategory}>
				<div class="flex flex-col gap-1">
					<Label for="category-name">Category name</Label>
					<Input
						id="category-name"
						class="w-full"
						disabled={loading}
						required
						bind:value={AppState.categoryToEdit.name}
					/>
				</div>
				<Button type="submit" disabled={loading}>Save</Button>
			</form>
		{/if}
	</Dialog.Content>
</Dialog.Root>
