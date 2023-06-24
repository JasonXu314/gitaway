<script lang="ts">
	import { gemoji, nameToEmoji } from 'gemoji';
	import Cookies from 'js-cookie';
	import { onMount } from 'svelte';
	import { http } from 'utils/http';
	import type { Destination } from '../app';
	import type { PageData } from './$types';

	export let data: PageData;

	let proposingDestination = false,
		proposingActivity = false,
		isLoggedIn = data.loggedIn,
		hasInstalledApp = data.installedApp;

	onMount(() => {
		getDestinations().then((data) => {
			console.log(data);
		});
		const token = Cookies.get('ghToken'),
			username = Cookies.get('ghName'),
			appInstalled = Cookies.get('ghAppInstalled');

		if (token && username) {
			isLoggedIn = true;
		}

		if (appInstalled) {
			hasInstalledApp = true;
		}
	});

	async function getDestinations() {
		return http.get<Destination[]>('/api/destinations').then((res) => res.data);
	}

	function silenceWarning() {
		hasInstalledApp = true;
		Cookies.set('ghAppInstalled', 'true', { expires: 365 });
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

<svelte:head>
	<title>Wafflehacks Travel</title>
</svelte:head>

<main class="container">
	{#if isLoggedIn}
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
	{:else}
		{#if !hasInstalledApp}
			<div class="warning">
				<h1>
					Please make sure to <a
						href="https://github.com/apps/wafflehacks-travel/installations/new"
						rel="noreferrer noopener"
						target="_blank"
						on:click={silenceWarning}>install the GitHub app</a
					>, otherwise proposing destinations and activities will not work!
				</h1>
			</div>
		{/if}
		Please <a href="/api/login">Login to GitHub</a> to continue.
	{/if}
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
			<label for="date"
				>Date
				<input type="date" id="date" name="date" />
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
