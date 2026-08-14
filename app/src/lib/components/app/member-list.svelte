<script lang="ts">
	import { Users } from '$lib/stores.svelte';
	import { Button } from '$lib/components/ui/button/index.js';
</script>

<section
	aria-label="member-list"
	class="flex h-full min-w-60 flex-col border-l-2 border-border px-2 pt-2"
>
	{#each Users.getAll() as user}
		<Button class="w-full justify-start text-sm" variant="ghost" size="xl">
			<div class="size-8 rounded-full bg-muted"></div>
			<div class="flex flex-col items-start leading-none">
				<h4>{user.username}</h4>
				<span class="text-xs text-muted-foreground">Chilling...</span>
			</div>
		</Button>
	{/each}
</section>
