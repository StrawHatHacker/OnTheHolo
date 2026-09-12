<script lang="ts">
	import SettingsIcon from '@lucide/svelte/icons/settings';
	import MoonIcon from '@lucide/svelte/icons/moon';
	import SunIcon from '@lucide/svelte/icons/sun';
	import MessageSquareIcon from '@lucide/svelte/icons/message-square';
	import { toggleMode } from 'mode-watcher';
	import { Store } from '$lib/stores.svelte';
	import { Button } from '$lib/components/ui/button/index.js';
	import { SETTINGS } from '$lib/settings';
	import { AppHelper } from '$lib/utils';

	let currentChannel = $derived.by(() => {
		return Store.channels.getCurrent();
	});
</script>

<header
	class="flex h-12 w-full shrink-0 items-center justify-between bg-white pr-1 pl-4 dark:bg-black"
>
	<div class="flex items-center gap-3">
		<h1 class="logo-gradient font-heading text-2xl">{SETTINGS.TITLE}</h1>
	</div>

	<div class="flex items-center gap-1">
		{#if currentChannel}
			<MessageSquareIcon class="size-3.5" />
			<h2 class="text font-bold">
				{currentChannel.name}
			</h2>
		{/if}
	</div>

	<div class="flex items-center gap-2">
		<Button onclick={toggleMode} variant="outline" size="icon-sm">
			<SunIcon class="scale-100 rotate-0 transition-all! dark:scale-0 dark:-rotate-90" />
			<MoonIcon class="absolute scale-0 rotate-90 transition-all! dark:scale-100 dark:rotate-0" />
			<span class="sr-only">Toggle theme</span>
		</Button>
		<Button variant="outline" size="icon-sm" onclick={AppHelper.openSettingsDialog}>
			<SettingsIcon />
			<span class="sr-only">Settings</span>
		</Button>
	</div>
</header>
