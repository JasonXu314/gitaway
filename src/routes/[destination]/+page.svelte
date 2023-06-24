<script lang="ts">
	import { page } from '$app/stores';
	import { onMount } from 'svelte';
	import { http } from 'utils/http';
	import type { Destination } from '../../app';

	let destination: Destination,
		promise: Promise<void> = Promise.resolve();

	onMount(() => {
		console.log($page.params.destination);

		promise = getDestination().then((dest) => {
			destination = dest;
		});
	});

	async function getDestination() {
		return http.get<Destination[]>('/api/destinations').then((res) => res.data.find((dest) => dest.title === $page.params.destination)!);
	}
</script>

<main class="container">
	{#await promise}
		Loading destination data...
	{:then}
		<h1>Destination... {destination.title}!</h1>
		<div class="destination">
			<pre>{JSON.stringify(destination, null, 4)}</pre>
		</div>
	{:catch err}
		<h1 class="error">An error ocurred...</h1>
		<pre>{JSON.stringify(err, null, 4)}</pre>
	{/await}
</main>
