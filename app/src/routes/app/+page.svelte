<script lang="ts">
	import SettingsIcon from '@lucide/svelte/icons/settings';
	import MoonIcon from '@lucide/svelte/icons/moon';
	import SunIcon from '@lucide/svelte/icons/sun';
	import UsersIcon from '@lucide/svelte/icons/users-round';
	import MessageSquareIcon from '@lucide/svelte/icons/message-square';
	import Volume2Icon from '@lucide/svelte/icons/volume-2';
	import SendIcon from '@lucide/svelte/icons/send';
	import { toggleMode } from 'mode-watcher';
	import { Button } from '$lib/components/ui/button/index.js';
	import { ScrollArea } from '$lib/components/ui/scroll-area/index.js';
	import { Users } from '$lib/stores.svelte.js';
	import { Textarea } from '$lib/components/ui/textarea/index.js';

	let { data } = $props();

	let bottom = $state<HTMLDivElement>();

	$effect(() => {
		// Read whatever reactive value represents your messages here

		// messages;

		bottom?.scrollIntoView({
			behavior: 'smooth',
		});
	});
</script>

<div class="flex h-screen flex-col">
	<section
		class="flex h-12 w-full shrink-0 items-center justify-between border-b border-border bg-white pr-1 pl-4 dark:bg-black"
	>
		<div class="flex items-center gap-2">
			<img src="/logo.png" alt="logo" class="h-6 w-6" />
			<h1 class="font-heading text-lg">On The Holo</h1>
		</div>

		<h2 class="text font-bold">#General</h2>

		<div class="flex items-center gap-2">
			<Button onclick={toggleMode} variant="outline" size="icon-sm">
				<SunIcon class="scale-100 rotate-0 transition-all! dark:scale-0 dark:-rotate-90" />
				<MoonIcon class="absolute scale-0 rotate-90 transition-all! dark:scale-100 dark:rotate-0" />
				<span class="sr-only">Toggle theme</span>
			</Button>
			<Button variant="outline" size="icon-sm">
				<SettingsIcon />
			</Button>
		</div>
	</section>

	<main class="flex min-h-0 w-full flex-1 items-stretch">
		<aside id="channels" class="flex h-full min-w-60 flex-col border-r border-border px-2 pt-2">
			<Button class="w-full text-base font-bold" variant="outline" size="lg">
				<UsersIcon />
				Friends
			</Button>

			<ScrollArea class="min-h-0 flex-1" orientation="vertical">
				<div class="flex flex-col">
					<span class="mt-4 text-sm font-bold text-muted-foreground">Text channels</span>
					<Button
						class="w-full justify-start text-base font-bold text-foreground/80"
						variant="ghost"
					>
						<MessageSquareIcon class="inline size-4" /> General
					</Button>
					<Button
						class="w-full justify-start text-base font-bold text-foreground/80"
						variant="ghost"
					>
						<MessageSquareIcon class="inline size-4" /> Memes
					</Button>
					<Button
						class="w-full justify-start text-base font-bold text-foreground/80"
						variant="ghost"
					>
						<MessageSquareIcon class="inline size-4" /> Selfies
					</Button>
					<Button
						class="w-full justify-start text-base font-bold text-foreground/80"
						variant="ghost"
					>
						<MessageSquareIcon class="inline size-4" /> Artworks
					</Button>

					<span class="mt-4 text-sm font-bold text-muted-foreground">Voice channels</span>
					<Button
						class="w-full justify-start text-base font-bold text-foreground/80"
						variant="ghost"
					>
						<Volume2Icon class="inline size-4" /> General
					</Button>
					<Button
						class="w-full justify-start text-base font-bold text-foreground/80"
						variant="ghost"
					>
						<Volume2Icon class="inline size-4" /> Gaming
					</Button>
				</div>
			</ScrollArea>
		</aside>

		<section id="chat" class="flex h-full min-w-0 flex-1 flex-col pt-2">
			<ScrollArea class="min-h-0 flex-1" orientation="vertical">
				<div class="flex flex-col gap-4 p-2">
					{#each Array(100) as message}
						<div class="flex flex-col gap-1">
							<div class="flex items-center gap-2">
								<div class="size-6 rounded-full bg-muted"></div>
								<h4 class="text-md font-bold">Username</h4>
							</div>
							<p class="">
								Lorem ipsum dolor sit amet consectetur adipisicing elit. Aspernatur, ipsam veritatis
								dolores voluptatibus sed sunt ducimus neque! Atque saepe qui beatae eum
								reprehenderit. Reprehenderit eligendi minima perspiciatis animi vero alias.
							</p>
						</div>
					{/each}
					<div bind:this={bottom}></div>
				</div>
			</ScrollArea>

			<div class="shrink-0 border-t border-border p-2">
				<div class="flex items-center gap-2">
					<Textarea class="" placeholder="Message #General" />

					<Button size="icon">
						<SendIcon />
						<span class="sr-only">Send message</span>
					</Button>
				</div>
			</div>
		</section>

		<section id="users" class="flex h-full min-w-60 flex-col border-l border-border px-2 pt-2">
			{#each Users as [id, User]}
				<Button class="w-full justify-start text-sm" variant="ghost" size="xl">
					<div class="size-8 rounded-full bg-muted"></div>
					<div class="flex flex-col items-start leading-none">
						<h4>{User.username}</h4>
						<span class="text-xs text-muted-foreground">Chilling...</span>
					</div>
				</Button>
			{/each}
		</section>
	</main>
</div>
