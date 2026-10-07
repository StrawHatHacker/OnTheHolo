<script lang="ts">
	import { cn } from '$lib/utils';
	import X from '@lucide/svelte/icons/x';
	import LoaderCircle from '@lucide/svelte/icons/loader-circle';
	import Check from '@lucide/svelte/icons/check';
	import ShieldCheck from '@lucide/svelte/icons/shield-check';
	import { onMount } from 'svelte';

	let {
		class: className,
		onVerify,
		verified = $bindable(false),
	}: {
		class?: string;
		onVerify?: () => void;
		verified?: boolean;
	} = $props();

	let status = $state<'idle' | 'verifying' | 'verified' | 'failed'>('idle');
	let mountTime = 0;
	let humanInteraction = false;
	let honeypot = $state(false);

	onMount(() => {
		mountTime = Date.now();

		const markHuman = () => {
			humanInteraction = true;
		};
		window.addEventListener('mousemove', markHuman, { once: true });
		window.addEventListener('touchstart', markHuman, { once: true });
		window.addEventListener('keydown', markHuman, { once: true });

		return () => {
			window.removeEventListener('mousemove', markHuman);
			window.removeEventListener('touchstart', markHuman);
			window.removeEventListener('keydown', markHuman);
		};
	});

	function runHeuristics(e: MouseEvent | TouchEvent | KeyboardEvent) {
		if (honeypot) return false;

		if (Date.now() - mountTime < 500) return false;

		if (!humanInteraction) return false;

		if (!e.isTrusted) return false;

		return true;
	}

	async function handleClick(e: any) {
		if (status !== 'idle' && status !== 'failed') return;

		status = 'verifying';

		await new Promise((r) => setTimeout(r, 800));

		if (runHeuristics(e)) {
			status = 'verified';
			verified = true;
			onVerify?.();
		} else {
			status = 'failed';
			verified = false;
			setTimeout(() => {
				status = 'idle';
			}, 2000);
		}
	}
</script>

<input
	type="checkbox"
	class="absolute -z-10 h-0 w-0 opacity-0"
	tabindex="-1"
	bind:checked={honeypot}
	autocomplete="off"
/>

<button
	onclick={handleClick}
	class={cn(
		'group flex h-16 w-75 items-center justify-between rounded-md border bg-card px-4 text-card-foreground shadow-sm transition-all select-none',
		status === 'idle' && 'cursor-pointer hover:bg-accent/5',
		status === 'failed' && 'cursor-not-allowed border-red-500/50 bg-red-500/5',
		(status === 'verifying' || status === 'verified') && 'cursor-default',
		className
	)}
	type="button"
>
	<div class="flex items-center gap-3">
		<div
			class={cn(
				'relative flex h-7 w-7 items-center justify-center rounded border-2 bg-background transition-all duration-300',
				status === 'idle' && 'border-muted-foreground/30 group-hover:border-muted-foreground/50',
				status === 'verifying' && 'border-transparent',
				status === 'verified' && 'border-primary bg-primary',
				status === 'failed' && 'border-destructive'
			)}
		>
			{#if status === 'verifying'}
				<LoaderCircle class="absolute h-8 w-8 animate-spin text-primary" />
			{/if}

			{#if status === 'verified'}
				<Check
					class="h-4 w-4 animate-in text-primary-foreground duration-300 zoom-in"
					strokeWidth={3}
				/>
			{/if}

			{#if status === 'failed'}
				<X class="h-4 w-4 animate-in text-destructive duration-300 zoom-in" strokeWidth={3} />
			{/if}
		</div>

		<div class="flex flex-col items-start">
			<span class="text-sm leading-none font-medium">
				{#if status === 'verified'}
					I am human
				{:else if status === 'failed'}
					Verification failed
				{:else if status === 'verifying'}
					Verifying...
				{:else}
					Verify you are human
				{/if}
			</span>
			{#if status === 'failed'}
				<span class="mt-1 text-[10px] text-destructive">Please try again</span>
			{/if}
		</div>
	</div>

	<div class="flex flex-col items-center justify-center gap-0.5 opacity-50">
		<ShieldCheck class="h-6 w-6 text-muted-foreground" />
		<span class="text-[9px] leading-none text-muted-foreground">Secure</span>
	</div>
</button>
