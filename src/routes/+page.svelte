<script lang="ts">
	import Cookies from 'js-cookie';
	import { onMount } from 'svelte';
	import { http } from 'utils/http';
	import type { Issue } from '../app';
	import Modal from '../components/modal.svelte';
	import Reactions from '../components/reactions.svelte';
	import type { PageData } from './$types';

	export let data: PageData;

	let proposingDestination = false,
		proposingActivity = false,
		isLoggedIn = data.loggedIn,
		hasInstalledApp = data.installedApp,
		// TODO: use ssr to pre-fetch destinations (smoother experience)
		destinations: Issue[] = [],
		destinationRequest: Promise<void>,
		locationId = 0,
		submitting = false;

	onMount(() => {
		destinationRequest = getDestinations().then((data) => {
			console.log(data);
			destinations = data;
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
		return http.get<Issue[]>('/api/destinations').then((res) => res.data);
	}

	function silenceWarning() {
		hasInstalledApp = true;
		Cookies.set('ghAppInstalled', 'true', { expires: 365 });
	}

	function syncLocationId(evt: any): void {
		locationId = destinations.find((dest) => dest.title === evt.target!.value)!.number;
	}

	$: {
		if (proposingDestination || proposingActivity) document.querySelector('html')!.className = 'modal-is-open';
		else if (typeof document !== 'undefined') document.querySelector('html')!.className = '';
	}
</script>

<svelte:head>
	<title>JourneyHub</title>
</svelte:head>

<main class="container">
	<hgroup>
		<h1>JourneyHub</h1>
		<h2>Connecting travelers through GitHub :D</h2>
	</hgroup>
	{#if isLoggedIn}
		<div class="control-row">
			<button on:click={() => (proposingDestination = true)}>Add Destination</button>
			<button on:click={() => (proposingActivity = true)}>Propose Activity</button>
		</div>
		{#await destinationRequest}
			Loading Destinations...
		{:then}
			{#each destinations as destination}
				<section class="destination">
					<h2 class="title">
						<a href="/{destination.title}">{destination.title}</a>
					</h2>
					<p class="description">{destination.body}</p>
					<Reactions id={destination.number} reactions={destination.reactions} names={['+1', '-1']} />
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
						href="https://github.com/apps/journeyhub/installations/new"
						rel="noreferrer noopener"
						target="_blank"
						on:click={silenceWarning}>install the GitHub app</a
					> AND enable access for all repositories, otherwise proposing destinations and activities will not work!
				</h1>
			</div>
		{/if}
		<div>
			<img src="/gh-icon.png" alt="Github" />
			Please <a href="/api/login">Login to GitHub</a> to continue.
		</div>
	{/if}
</main>

<Modal open={proposingDestination} title="Propose a Destination" on:close={() => (proposingDestination = false)}>
	<form action="/api/destinations" method="POST" on:submit={() => (submitting = true)}>
		<label for="location">
			Destination
			<input type="text" id="location" name="location" />
		</label>
		<label for="description">
			Description
			<input type="text" id="description" name="description" />
		</label>
		<div class="controls">
			<button type="reset" class="secondary" disabled={submitting} on:click={() => (proposingDestination = false)}>Cancel</button>
			<button type="submit" disabled={submitting}>Create!</button>
		</div>
	</form>
</Modal>

<Modal open={proposingActivity} title="Propose an Activity" on:close={() => (proposingActivity = false)}>
	<form action="/api/activities" method="POST" on:submit={() => (submitting = true)}>
		<label for="location">
			Location
			<select name="location" id="location" on:change={syncLocationId}>
				{#each destinations as destination}
					<option>{destination.title}</option>
				{/each}
			</select>
			<input type="hidden" name="locationId" value={locationId} />
		</label>
		<label for="event">
			Event
			<input type="text" id="event" name="event" />
		</label>
		<label for="date">
			Date
			<input type="date" id="date" name="date" />
		</label>
		<div class="grid">
			<label for="wheelchair">
				♿ Accessible
				<input type="checkbox" name="wheelchair" id="wheelchair" />
			</label>
			<label for="cash">
				💵 Cash Only
				<input type="checkbox" name="cash" id="cash" />
			</label>
			<label for="children">
				🧒 Child Friendly
				<input type="checkbox" name="children" id="children" />
			</label>
		</div>
		<div class="grid">
			<fieldset>
				<legend>Cost</legend>
				<label for="inexpensive">
					<input type="radio" id="inexpensive" name="cost" value="inexpensive" />
					💲 Inexpensive
				</label>
				<label for="moderate">
					<input type="radio" id="moderate" name="cost" value="moderate" />
					💳 Moderate Cost
				</label>
				<label for="expensive">
					<input type="radio" id="expensive" name="cost" value="expensive" />
					💰 Expensive
				</label>
			</fieldset>
			<fieldset>
				<legend>Activity Rigor</legend>
				<label for="low">
					<input type="radio" id="low" name="exertion" value="low" />
					🚶 Low Exertion
				</label>
				<label for="medium">
					<input type="radio" id="medium" name="exertion" value="medium" />
					🚴‍♂️ Medium Exertion
				</label>
				<label for="high">
					<input type="radio" id="high" name="exertion" value="high" />
					🏔️ High Exertion
				</label>
			</fieldset>
		</div>
		<label for="notes">
			Additional Notes
			<textarea name="notes" id="notes" cols={20} rows={3} placeholder="Additional Notes" />
		</label>
		<div class="controls">
			<button type="reset" class="secondary" disabled={submitting} on:click={() => (proposingActivity = false)}>Cancel</button>
			<button type="submit" disabled={submitting}>Create!</button>
		</div>
	</form>
</Modal>

<style lang="scss">
	main {
		.control-row {
			display: flex;
			flex-direction: row;
			gap: 2em;
		}

		section.destination {
			h2 {
				margin-bottom: 0;
			}
		}
	}

	.controls {
		display: flex;
		flex-direction: row;
		gap: 2em;
	}
</style>
