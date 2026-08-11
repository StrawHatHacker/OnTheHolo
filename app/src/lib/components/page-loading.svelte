<script lang="ts">
	import { Spinner } from '$lib/components/ui/spinner/index.js';
</script>

<div
	class="absolute top-1/2 left-1/2 flex -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-4"
>
	<img src="logo.png" class="h-30 w-30" alt="logo" />
	<div class="flex items-center gap-2">
		<Spinner class="inline size-6" />
		<span class="text-3xl">Loading...</span>
	</div>
</div>
