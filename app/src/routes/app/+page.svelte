<script lang="ts">
	import SettingsIcon from '@lucide/svelte/icons/settings';
	import MoonIcon from '@lucide/svelte/icons/moon';
	import SunIcon from '@lucide/svelte/icons/sun';
	import UsersIcon from '@lucide/svelte/icons/users-round';
	import MessageSquareIcon from '@lucide/svelte/icons/message-square';
	import Volume2Icon from '@lucide/svelte/icons/volume-2';
	import { toggleMode } from 'mode-watcher';
	import { Button } from '$lib/components/ui/button/index.js';
	import { ScrollArea } from '$lib/components/ui/scroll-area/index.js';

	let { data } = $props();
</script>

<div class="flex h-screen flex-col">
	<section
		class="flex h-14 w-full shrink-0 items-center justify-between border-b border-border bg-white pr-1 pl-4 dark:bg-black"
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
		<div class="flex h-full w-60 flex-col border-r border-border px-2 pt-2">
			<Button class="w-full text-base font-bold" variant="outline" size="lg">
				<UsersIcon />
				Friends
			</Button>

			<ScrollArea class="min-h-0 flex-1" orientation="vertical">
				<div class="flex flex-col">
					<span class="mt-4 text-sm font-bold text-muted-foreground">Text channels</span>
					<Button class="w-full justify-start text-base font-bold text-foreground/80" variant="ghost">
						<MessageSquareIcon class="inline size-4" /> General
					</Button>
					<Button class="w-full justify-start text-base font-bold text-foreground/80" variant="ghost">
						<MessageSquareIcon class="inline size-4" /> Memes
					</Button>
					<Button class="w-full justify-start text-base font-bold text-foreground/80" variant="ghost">
						<MessageSquareIcon class="inline size-4" /> Selfies
					</Button>
					<Button class="w-full justify-start text-base font-bold text-foreground/80" variant="ghost">
						<MessageSquareIcon class="inline size-4" /> Artworks
					</Button>

					<span class="mt-4 text-sm font-bold text-muted-foreground">Voice channels</span>
					<Button class="w-full justify-start text-base font-bold text-foreground/80" variant="ghost">
						<Volume2Icon class="inline size-4" /> General
					</Button>
					<Button class="w-full justify-start text-base font-bold text-foreground/80" variant="ghost">
						<Volume2Icon class="inline size-4" /> Gaming
					</Button>
				</div>
			</ScrollArea>
		</div>
	</main>
</div>
