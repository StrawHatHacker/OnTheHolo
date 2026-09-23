<script lang="ts">
	import type { SessionWithUser } from '$lib/types';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Label } from '$lib/components/ui/label/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { genericRequest, handleRequestError } from '$lib/utils';
	import { invalidateAll } from '$app/navigation';
	import { toast } from 'svelte-sonner';

	let { session }: { session: SessionWithUser } = $props();

	// State
	let loading = $state(false);

	// Email state
	let newEmail = $state('');
	let emailDisabled = $state(true);

	$effect(() => {
		newEmail = session?.user.email || '';

		return () => {
			newEmail = '';
		};
	});

	const onSubmitEmail = async () => {
		if (newEmail === session?.user.email) return;

		try {
			loading = true;
			await genericRequest('/api/user/account/email', {
				method: 'PUT',
				body: JSON.stringify({ email: newEmail }),
			});

      emailDisabled = true;
      toast.success('Email edited successfully');

      // InvalidateAll reruns the load function, fetching the updated session
      invalidateAll();
		} catch (e) {
			handleRequestError(e);
		} finally {
			loading = false;
		}
	};
</script>

<section aria-labelledby="account-settings" class="w-full">
	<h2 id="account-settings" class="text-lg font-bold">Account</h2>

	<div class="mt-8 flex flex-col gap-4">
		<div class="flex flex-col gap-1">
			<div class="flex items-center justify-between">
				<Label for="email">Email</Label>
				<button
					class="text-sm text-muted-foreground hover:underline"
					onclick={() => (emailDisabled = !emailDisabled)}
					disabled={loading}
				>
					{emailDisabled ? 'Edit' : 'Cancel'}
				</button>
			</div>
			<Input id="email" class="w-full" bind:value={newEmail} disabled={emailDisabled || loading} />
			{#if !emailDisabled}
				<Button disabled={emailDisabled || loading} class="ml-auto w-fit" onclick={onSubmitEmail}>
					Edit email
				</Button>
			{/if}
		</div>
	</div>
</section>
