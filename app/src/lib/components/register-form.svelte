<script lang="ts">
	import { goto } from '$app/navigation';
	import { Button } from '$lib/components/ui/button/index.js';
	import { FieldGroup, Field, FieldDescription, Label } from '$lib/components/ui/field/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { cn, genericRequest, handleRequestError, type WithElementRef } from '$lib/utils.js';
	import { toast } from 'svelte-sonner';
	import type { HTMLAttributes } from 'svelte/elements';

	let {
		ref = $bindable(null),
		class: className,
		...restProps
	}: WithElementRef<HTMLAttributes<HTMLDivElement>> = $props();

	// State
	const id = $props.id();
	let loading = $state(false);

	// Form
	let email = $state('');
	let password = $state('');
	let username = $state('');

	const onRegister = async () => {
		try {
			if (!email || !password || !username) return;
			await genericRequest('/api/auth/register', {
				method: 'POST',
				body: JSON.stringify({ email, password, username }),
			});

			toast.success('Account created. Please login.');
			goto('/');
		} catch (e) {
			handleRequestError(e);
		} finally {
			loading = false;
		}
	};
</script>

<div class={cn('flex flex-col gap-6', className)} bind:this={ref} {...restProps}>
	<form onsubmit={onRegister}>
		<FieldGroup class="gap-4">
			<div class="flex flex-col items-center gap-2 text-center">
				<img src="/logo.png" alt="logo" class="h-30 w-30" />
				<h1 class="text-xl font-bold">Welcome to the Holo</h1>
				<FieldDescription>
					Already have an account? <a href="/">Login</a>
				</FieldDescription>
			</div>
			<Field>
				<Label for="username-{id}" class="text-base">Username</Label>
				<Input id="username-{id}" type="username" placeholder="V" bind:value={username} required />
			</Field>
			<Field>
				<Label for="email-{id}" class="text-base">Email</Label>
				<Input
					id="email-{id}"
					type="email"
					placeholder="valerie@holo.com"
					bind:value={email}
					required
				/>
			</Field>
			<Field>
				<Label for="password-{id}" class="text-base">Password</Label>
				<Input
					id="password-{id}"
					type="password"
					placeholder="***"
					bind:value={password}
					required
				/>
			</Field>
			<Field>
				<Button type="submit">Create my account</Button>
			</Field>
		</FieldGroup>
	</form>
	<FieldDescription class="px-6 text-center">
		By clicking continue, you agree to our <br />
		<a href="##">Terms of Service</a> and
		<a href="##">Privacy Policy</a>.
	</FieldDescription>
</div>
