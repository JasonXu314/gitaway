<script lang="ts">
	import { gemoji, nameToEmoji } from 'gemoji';
	import { onMount } from 'svelte';
	import { http } from 'utils/http';
	import type { Destination } from '../app';

	onMount(() => {
		getDestinations().then((data) => {
			console.log(data);
		});
	});

	async function getDestinations() {
		return http.get<Destination[]>('/api/destinations').then((res) => res.data);
	}

	const REACTIONS = ['+1', '-1', 'confused', 'eyes', 'heart', 'hooray', 'laugh', 'rocket'] as const;
	type ElemOf<T> = T extends readonly (infer E)[] ? E : T extends (infer E)[] ? E : T;

	function emoji(reaction: ElemOf<typeof REACTIONS>): string {
		return nameToEmoji[reaction] || gemoji.find(({ tags }) => tags.includes('laugh'))!.emoji;
	}
</script>

<main class="container">
	<a href="/api/login">Login to GitHub</a>
	{#await getDestinations()}
		Loading Destinations...
	{:then destinations}
		{#each destinations as destination}
			<section class="destination">
				<h2 class="title">{destination.title}</h2>
				<p class="description">{destination.body}</p>
				<div class="reactions">
					{#each REACTIONS as reaction}
						<div class="reaction-pill">
							<span class="reaction-contents">
								{emoji(reaction)}
								{destination.reactions[reaction]}
							</span>
						</div>
					{/each}
				</div>
			</section>
		{/each}
	{:catch err}
		<h1 class="error">An error ocurred...</h1>
		<pre>{JSON.stringify(err, null, 4)}</pre>
	{/await}
</main>

<style lang="scss">
	main {
		section.destination {
			h2 {
				margin-bottom: 0;
			}
		}

		.reactions {
			display: flex;
			flex-direction: row;
			gap: 1em;

			.reaction-pill {
				background-color: var(--contrast);
				color: var(--contrast-inverse);
				position: relative;
				height: 1.5em;
				width: 3em;
				border-radius: 0.75em;
				cursor: pointer;

				.reaction-contents {
					font-size: medium;
					position: absolute;
					width: 3em;
					top: 50%;
					left: 50%;
					transform: translate(-40%, -50%);
				}
			}
		}
	}
</style>
