<script lang="ts">
	import type { SessionWithUser } from '$lib/types';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Label } from '$lib/components/ui/label/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { genericRequest, handleRequestError } from '$lib/utils';
	import { invalidateAll } from '$app/navigation';
	import { toast } from 'svelte-sonner';
	import { Separator } from '$lib/components/ui/separator/index.js';

	let { session }: { session: SessionWithUser } = $props();

	// State
	let loading = $state(false);

	// Email state
	let newEmail = $state(''),
		emailDisabled = $state(true);

	// Password state
	let newPassword = $state(''),
		passwordDisabled = $state(true);

	$effect(() => {
		newEmail = session?.user.email || '';

		return () => {
			newEmail = '';
			newPassword = '';
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

	const onSubmitPassword = async () => {
		try {
			loading = true;

			await genericRequest('/api/user/account/password', {
				method: 'PUT',
				body: JSON.stringify({ password: newPassword }),
			});

			passwordDisabled = true;
			toast.success('Password edited successfully');

			// InvalidateAll reruns the load function,
			// The load function will fail because the session token is invalid
			// And the user will be redirected to the login page
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
					onclick={() => ((emailDisabled = !emailDisabled), (newEmail = session?.user.email || ''))}
					disabled={loading}
				>
					{emailDisabled ? 'Edit' : 'Cancel'}
				</button>
			</div>
			<Input id="email" class="w-full" bind:value={newEmail} disabled={emailDisabled || loading} />
			{#if !emailDisabled}
				<Button
					disabled={emailDisabled || loading || newEmail === session?.user.email}
					class="ml-auto w-fit"
					onclick={onSubmitEmail}
				>
					Edit email
				</Button>
			{/if}
		</div>
		<div class="flex flex-col gap-1">
			<div class="flex items-center justify-between">
				<Label for="password">Password</Label>
				<button
					class="text-sm text-muted-foreground hover:underline"
					onclick={() => ((passwordDisabled = !passwordDisabled), (newPassword = ''))}
					disabled={loading}
				>
					{passwordDisabled ? 'Edit' : 'Cancel'}
				</button>
			</div>
			<Input
				id="password"
				class="w-full"
				type="password"
				bind:value={newPassword}
				disabled={passwordDisabled || loading}
			/>
			{#if !passwordDisabled}
				<span class="ml-auto text-sm text-destructive">
					You will be logged out from all devices
				</span>
				<Button
					class="ml-auto w-fit"
					onclick={onSubmitPassword}
					disabled={passwordDisabled || loading}
					{loading}
				>
					Edit password
				</Button>
			{/if}
		</div>
		<Separator class="my-2" />
		<div>
			<Button variant="destructive">Delete account</Button>
		</div>
	</div>
</section>
