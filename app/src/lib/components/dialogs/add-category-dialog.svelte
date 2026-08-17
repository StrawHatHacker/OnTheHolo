<script lang="ts">
	import * as Dialog from '$lib/components/ui/dialog/index.js';
	import ListPlusIcon from '@lucide/svelte/icons/list-plus';
	import { AppState } from '$lib/stores.svelte';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Label } from '$lib/components/ui/label/index.js';
	import Button from '../ui/button/button.svelte';
	import { AppHelper, genericRequest, handleRequestError } from '$lib/utils';
	import type { AddCategoryPayload } from '$lib/types';
	import { toast } from 'svelte-sonner';

	// State
	let loading = $state(false);
	let newCategoryName = $state('');

	$effect(() => {
		return () => AppHelper.closeAddCategoryDialog();
	});

	const submitAddCategory = async () => {
		try {
			loading = true;

			const payload: AddCategoryPayload = {
				name: newCategoryName,
			};

			await genericRequest('/api/category', {
				method: 'POST',
				body: JSON.stringify(payload),
			});

			toast.success('Category added');
			AppHelper.closeAddCategoryDialog();
			resetForm();
		} catch (e) {
			handleRequestError(e);
		} finally {
			loading = false;
		}
	};

	const resetForm = () => {
		newCategoryName = '';
	}
</script>

<Dialog.Root bind:open={AppState.isAddCategoryDialogOpen}>
	<Dialog.Content>
		<Dialog.Header>
			<Dialog.Title>
				<ListPlusIcon class="size-5"></ListPlusIcon>
				Add a category
			</Dialog.Title>
		</Dialog.Header>
		<form class="flex flex-col gap-4" onsubmit={submitAddCategory}>
			<div class="flex flex-col gap-1">
				<Label for="category-name">Category name</Label>
				<Input
					id="category-name"
					class="w-full"
					disabled={loading}
					required
					bind:value={newCategoryName}
				/>
			</div>

			<Button type="submit" disabled={loading}>Add</Button>
		</form>
	</Dialog.Content>
</Dialog.Root>
