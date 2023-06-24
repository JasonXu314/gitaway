<script lang="ts">
	import { onMount } from 'svelte';
	import { http } from 'utils/http';

	onMount(() => {
		http.get('/api/destinations').then((res) => {
			console.log(res.data);
		});
	});
</script>

<main class="container">
	<a href="/api/login">Login to GitHub</a>
</main>
