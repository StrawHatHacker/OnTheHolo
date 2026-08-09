<script lang="ts">
	import { invalidateAll } from '$app/navigation';
	import { genericRequest } from '$lib/utils';
	import { onMount } from 'svelte';

	let { children } = $props();

	let authTokenRefreshTimer: ReturnType<typeof setInterval>;

	onMount(() => {
		authTokenRefreshTimer = setInterval(
			async () => {
				await genericRequest('/api/auth/refreshToken', { method: 'GET', credentials: 'include' });
				await invalidateAll();
			},
			1000 * 60 * 10 // 10 minutes
		);

		return () => {
			clearInterval(authTokenRefreshTimer);
		};
	});
</script>

{@render children()}
