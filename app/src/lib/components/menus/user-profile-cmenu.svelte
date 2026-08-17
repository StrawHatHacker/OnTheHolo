<script lang="ts">
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu/index.js';
	import type { Snippet } from 'svelte';

	let { children }: { children: Snippet } = $props();
</script>

<DropdownMenu.Root>
	<DropdownMenu.Trigger>
		{@render children?.()}
	</DropdownMenu.Trigger>
	<DropdownMenu.Content class="w-56" align="end">
		
	</DropdownMenu.Content>
</DropdownMenu.Root>
