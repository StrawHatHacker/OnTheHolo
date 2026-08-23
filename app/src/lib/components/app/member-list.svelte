<script lang="ts">
	import { Users } from '$lib/stores.svelte';
	import { Button } from '$lib/components/ui/button/index.js';
	import { getProfileImageUrl } from '$lib/utils';
	import UserProfileCmenu from '$lib/components/menus/user-profile-cmenu.svelte';
	import type { SessionWithUser } from '$lib/types';

	let { session }: { session: SessionWithUser } = $props();
</script>

<section
	aria-label="member-list"
	class="flex h-full max-w-60 min-w-60 flex-col border-l border-border px-2 pt-2"
>
	{#if session}
		{#each Users.getAll() as user}
			<UserProfileCmenu {user} align="start" side="left">
				<Button class="w-full justify-start text-sm" variant="ghost" size="xl">
					{#if user.profile_image}
						<img
							src={getProfileImageUrl(user.profile_image)}
							alt="profile"
							class="size-8 rounded-full bg-cover"
						/>
					{:else}
						<div class="size-8 rounded-full bg-muted"></div>
					{/if}
					<div class="flex flex-col items-start leading-none">
						<h4>{user.username}</h4>
						{#if user.activity_name}
							<span class="text-xs text-muted-foreground">{user.activity_name}</span>
						{/if}
					</div>
				</Button>
			</UserProfileCmenu>
		{/each}
	{/if}
</section>
