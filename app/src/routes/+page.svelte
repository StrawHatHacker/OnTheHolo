<script lang="ts">
	import { onMount } from 'svelte';
	import { Button } from '$lib/components/ui/button/index.js';
	import PlayOffIcon from '@lucide/svelte/icons/play-off';
	import PlayIcon from '@lucide/svelte/icons/play';
	import CheckIcon from '@lucide/svelte/icons/check';
	import { Label } from '$lib/components/ui/label/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { ScrollArea } from '$lib/components/ui/scroll-area/index.js';
	import { PUBLIC_TITLE } from '$env/static/public';
	import { genericRequest, handleRequestError } from '$lib/utils';
	import { goto } from '$app/navigation';

	// State
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
			loading = true;

			await genericRequest('/api/auth/login', {
				method: 'POST',
				body: JSON.stringify({
					email: email,
					password: password
				})
			});

			goto('/app');
		} catch (e) {
			handleRequestError(e);
		} finally {
			loading = false;
		}
	};
</script>

<main class="relative h-screen w-screen overflow-hidden bg-black">
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
	<div class="absolute inset-0 bg-linear-to-r from-black/80 via-transparent to-black/80"></div>

	<Button
		class="absolute bottom-5 left-5 z-20 rounded-full"
		onclick={() => (prefersReducedMotion = !prefersReducedMotion)}
	>
		{#if !prefersReducedMotion}
			<PlayOffIcon />
		{:else}
			<PlayIcon />
		{/if}
	</Button>

	<!-- Left information -->
	<section class="absolute top-10 left-10 flex w-100 flex-col gap-6">
		<div class="rounded-xl bg-black/40 p-6 text-white shadow-2xl backdrop-blur-xl">
			<h2 class="mb-2 text-xl font-bold tracking-wide">Features</h2>

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

		<ScrollArea class="h-52 rounded-xl bg-black/40 p-6 text-white shadow-2xl backdrop-blur-xl">
			<h2 class="mb-4 text-xl font-bold tracking-wide">News</h2>

			<div class="flex flex-col gap-2">
				<div>
					<p class="text-sm text-neutral-400">August 2026</p>
					<p class="text-lg font-medium">Development started :)</p>
				</div>
			</div>
		</ScrollArea>
	</section>

	<!-- Login -->
	<section
		class="absolute right-0 flex h-full w-full max-w-120 flex-col justify-between bg-black/40 text-white shadow-2xl backdrop-blur-2xl"
	>
		<div class="flex flex-1 flex-col items-center justify-center gap-5 px-12">
			<div class="relative mb-6 flex flex-col items-center">
				<div
					class="absolute h-42 w-42 rounded-full bg-linear-to-b from-pink-600 via-orange-400 to-white opacity-50 blur-2xl"
				></div>

				<img src="/logo.png" alt="on the holo logo" class="relative h-36 w-36" />

				<h1 class="mt-4 text-center font-heading text-xl tracking-wide text-balance">
					{PUBLIC_TITLE}
				</h1>
			</div>

			<form class="flex w-full flex-col gap-4" onsubmit={onLogin}>
				<div class="flex w-full flex-col gap-1">
					<Label for="username">Username</Label>
					<Input id="username" type="text" placeholder="Vincent, Valerie etc." bind:value={email} />
				</div>

				<div class="flex w-full flex-col">
					<div class="flex items-baseline justify-between">
						<Label for="password">Password</Label>
						<span class="cursor-pointer text-sm text-muted-foreground hover:text-white">
							Forgot password?
						</span>
					</div>

					<Input
						id="password"
						type="password"
						placeholder="01111001 01101111 01110101 00100000 01101100 01101111 01110011 01110100 00100000 01110100 01101000 01100101 00100000 01100111 01100001 01101101 01100101"
						bind:value={password}
					/>
				</div>

				<Button class="w-full font-semibold" size="lg" type="submit">Login</Button>
			</form>

			<div class="flex w-full items-center gap-4">
				<div class="h-px flex-1 bg-muted-foreground"></div>
				<span class="text-md text-muted-foreground">or</span>
				<div class="h-px flex-1 bg-muted-foreground"></div>
			</div>

			<Button variant="secondary" size="lg" class="w-full">Create an account</Button>
		</div>

		<div class="pb-2 text-center text-xs tracking-wide text-muted-foreground">
			Made by StrawHatHacker aka Skillers3
		</div>
	</section>
</main>
