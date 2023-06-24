<script lang="ts">
	import { gemoji, nameToEmoji } from 'gemoji';
	import { onMount } from 'svelte';
	import { http } from 'utils/http';
	import type { Destination } from '../app';

	let proposingDestination = false;
	let proposingActivity = false;

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

	$: {
		if (proposingDestination) document.querySelector('html')!.className = 'modal-is-open';
		else if (typeof document !== 'undefined') document.querySelector('html')!.className = '';
	}
	$: {
		if (proposingActivity) document.querySelector('html')!.className = 'modal-is-open';
		else if (typeof document !== 'undefined') document.querySelector('html')!.className = '';
	}
</script>

<main class="container">
	<a href="/api/login">Login to GitHub</a>
	<button on:click={() => (proposingDestination = true)}>Propose Destination</button>
	<button on:click={() => (proposingActivity = true)}>Propose Activity</button>
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

<dialog open={proposingDestination}>
	<article>
		<header>
			<a href="/#" class="close" on:click={() => (proposingDestination = false)} />
			<h2>Propose a Destination</h2>
		</header>
		<form action="/api/destinations" method="POST">
			<label for="location">
				Destination
				<input type="text" id="location" name="location" />
			</label>
			<label for="description">
				Description
				<input type="text" id="description" name="description" />
			</label>
			<button type="submit">Create!</button>
		</form>
	</article>
</dialog>

<dialog open={proposingActivity}>
	<article>
		<header>
			<a href="/#" class="close" on:click={() => (proposingActivity = false)} />
			<h2>Propose an Activity</h2>
		</header>
		<form action="/api/activities" method="POST">
			<label for="location">
				Location
				<input type="text" id="location" name="location" />
			</label>
			<label for="event">
				Event
				<input type="text" id="event" name="event" />
			</label>
			<button type="submit">Create!</button>
		</form>
	</article>
</dialog>

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
