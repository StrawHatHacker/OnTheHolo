<script lang="ts">
	import { onMount } from 'svelte';
	import { Button } from '$lib/components/ui/button/index.js';
	import PlayOffIcon from '@lucide/svelte/icons/play-off';
	import PlayIcon from '@lucide/svelte/icons/play';
	import CheckIcon from '@lucide/svelte/icons/check';
	import ChevronRightIcon from '@lucide/svelte/icons/chevron-right';
	import { Label } from '$lib/components/ui/label/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { ScrollArea } from '$lib/components/ui/scroll-area/index.js';
	import { PUBLIC_TITLE } from '$env/static/public';
	import { genericRequest, handleRequestError } from '$lib/utils';
	import { goto, invalidateAll } from '$app/navigation';
	import { toast } from 'svelte-sonner';

	// State
	let { data } = $props();
	let prefersReducedMotion = $state(false);
	let loading = $state(false);

	// Form
	let email = $state('');
	let password = $state('');

	onMount(() => {
		prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
	});

	const onLogin = async () => {
		try {
			if (!email || !password) return;
			loading = true;

			await genericRequest('/api/auth/login', {
				method: 'POST',
				body: JSON.stringify({
					email: email,
					password: password,
				}),
			});

			goto('/app');
		} catch (e) {
			handleRequestError(e);
		} finally {
			loading = false;
		}
	};

	const continueAsLastLoggedInUser = async () => {
		try {
			loading = false;

			await genericRequest('/api/auth/refreshToken', { method: 'GET', credentials: 'include' });

			goto('/app');
		} catch (e) {
			toast.error(
				'Failed to continue as last logged in user. Login with your email and password instead.'
			);
			invalidateAll();
			handleRequestError(e);
		} finally {
			loading = false;
		}
	};
</script>

{#if prefersReducedMotion}
	<img
		src="/vapowave-bg.jpg"
		alt="vaporwave background"
		class="absolute inset-0 h-full w-full object-cover"
	/>
{:else}
	<video
		src="/vapowave-bg.mp4"
		autoplay
		loop
		muted
		class="absolute inset-0 h-full w-full object-cover"
	></video>
{/if}
<!-- Background overlay -->
<div
	class="pointer-events-none fixed inset-0 bg-linear-to-r from-black/80 via-transparent to-black/80"
></div>

<!-- Reduced motion -->
<Button
	class="absolute bottom-5 left-5 z-30 rounded-full lg:fixed"
	onclick={() => (prefersReducedMotion = !prefersReducedMotion)}
>
	{#if !prefersReducedMotion}
		<PlayOffIcon />
	{:else}
		<PlayIcon />
	{/if}
</Button>

<div
	class="absolute top-[50%] left-[50%] flex h-auto max-h-[90vh] max-w-[99vw] min-w-max -translate-x-1/2 -translate-y-1/2 flex-col gap-6 overflow-y-auto lg:h-150 lg:flex-row"
>
	<!-- LEFT SIDE -->
	<div class="flex h-full min-h-0 w-full flex-col gap-4">
		<div class="rounded-lg bg-card/90 p-6 text-white shadow-2xl backdrop-blur-sm">
			<h2 class="mb-2 text-xl font-black tracking-wide">Features</h2>

			<ul class="text-md flex flex-col gap-2 font-medium">
				<li>
					<CheckIcon class="mr-2 inline h-4 w-4" />
					<span>Zero-knowledge end-to-end encryption</span>
				</li>
				<li>
					<CheckIcon class="mr-2 inline h-4 w-4" />
					<span>Easy to customize</span>
				</li>
				<li>
					<CheckIcon class="mr-2 inline h-4 w-4" />
					<span>Easy to self-host</span>
				</li>
			</ul>
		</div>
		<ScrollArea
			class="min-h-0 flex-1 rounded-lg bg-card/90 p-6 text-white shadow-2xl backdrop-blur-sm"
		>
			<h2 class="mb-4 text-xl font-black tracking-wide">News</h2>

			<div class="flex flex-col gap-2">
				<div>
					<p class="text-sm text-neutral-400">August 2026</p>
					<p class="text-lg font-medium">Development started :)</p>
				</div>
			</div>
		</ScrollArea>
	</div>

	<!-- RIGHT SIDE -->
	<div
		class="flex h-full w-full flex-col justify-between rounded-lg bg-card/90 px-6 py-8 text-white shadow-lg backdrop-blur-sm"
	>
		<div class="relative mb-4 flex flex-col items-center">
			<div
				class="absolute h-30 w-30 rounded-full bg-linear-to-b from-pink-600 via-orange-400 to-white opacity-50 blur-xl"
			></div>

			<img src="/logo.png" alt="on the holo logo" class="relative h-30 w-30" />

			<h1 class="mt-4 text-center text-lg font-black tracking-wide text-balance">
				{PUBLIC_TITLE}
			</h1>
		</div>
		{#if data.lastUser}
			<div class="mb-2 flex items-center justify-between rounded-md bg-muted py-1 pr-1 pl-2">
				<div class="flex flex-col">
					<span class="text-xs font-bold text-muted-foreground">Last login as:</span>
					<span class="font-medium">{data.lastUser?.username}</span>
				</div>
				<div>
					<Button variant="ghost" size="sm" disabled={loading} onclick={continueAsLastLoggedInUser}>
						Continue
						<ChevronRightIcon class="h-4 w-4" />
					</Button>
				</div>
			</div>
		{/if}
		<form class="flex w-full flex-col gap-2" onsubmit={onLogin}>
			<div class="flex w-full flex-col gap-0">
				<Label for="email" class="text-base">Email</Label>

				<Input
					id="email"
					type="email"
					placeholder="vincent@holo.com"
					class="bg-black/30!"
					bind:value={email}
					disabled={loading}
				/>
			</div>

			<div class="flex w-full flex-col">
				<div class="flex items-baseline justify-between gap-2">
					<Label for="password" class="text-base">Password</Label>

					<span class="cursor-pointer text-sm text-muted-foreground hover:text-white">
						Forgot password?
					</span>
				</div>

				<Input
					id="password"
					type="password"
					placeholder="01111001 01101111 01110101 00100000 01101100 01101111 01110011 01110100"
					class="bg-black/30!"
					bind:value={password}
					disabled={loading}
				/>
			</div>

			<Button class="mt-1 w-full font-semibold" size="lg" type="submit" disabled={loading}>
				Login
			</Button>
		</form>
		<div class="flex w-full items-center gap-4">
			<div class="h-px flex-1 bg-muted-foreground"></div>
			<span class="text-md text-muted-foreground">or</span>
			<div class="h-px flex-1 bg-muted-foreground"></div>
		</div>

		<Button
			variant="secondary"
			size="lg"
			class="w-full"
			disabled={loading}
			onclick={() => goto('/register')}
		>
			Create an account
		</Button>
	</div>
</div>
