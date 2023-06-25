<script lang="ts">
	import Cookies from 'js-cookie';
	import { onMount } from 'svelte';
	import { http } from 'utils/http';
	import type { Issue } from '../app';
	import Button from '../components/button.svelte';
	import Floater from '../components/floater.svelte';
	import Input from '../components/input.svelte';
	import Modal from '../components/modal.svelte';
	import Reactions from '../components/reactions.svelte';
	import Select from '../components/select.svelte';
	import ToggleButton from '../components/toggle-button.svelte';
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

	$: {
		if (!isLoggedIn && typeof document !== 'undefined') document.querySelector('html')!.className = 'landing-override';
		else if (typeof document !== 'undefined') document.querySelector('html')!.className = '';
	}

	function videoTick(evt: Event) {
		const video = evt.target as HTMLVideoElement;
		if (video.currentTime >= video.duration - 2) {
			video.currentTime = 0;
		}
	}
</script>

<svelte:head>
	<title>Gitaway</title>
</svelte:head>

<main class="container">
	<Floater />
	{#if isLoggedIn}
		<div class="contents">
			<div class="control-row">
				<Button on:click={() => (proposingDestination = true)}>Add Destination</Button>
				<Button on:click={() => (proposingActivity = true)}>Add Activity</Button>
			</div>
			<section class="destinations">
				{#await destinationRequest}
					Loading Destinations...
				{:then}
					{#each destinations as destination}
						<div class="destination">
							<div class="info">
								<h2 class="title">
									<a href="/{destination.title}">{destination.title}</a>
								</h2>
								<p class="description">{destination.body}</p>
							</div>
							<Reactions id={destination.number} reactions={destination.reactions} names={['+1', '-1']} />
						</div>
					{/each}
				{:catch err}
					<h1 class="error">An error ocurred...</h1>
					<pre>{JSON.stringify(err, null, 4)}</pre>
				{/await}
			</section>
		</div>
	{:else}
		<div class="main">
			<h1>Your <i>gitaway</i> vacation awaits!</h1>
			<h5>Connect with other travelers with GitHub.</h5>
			<h3>
				But first, install our <a
					href="https://github.com/apps/gitaway-app/installations/new"
					rel="noreferrer noopener"
					target="_blank"
					on:click={silenceWarning}>GitHub App</a
				>.
			</h3>
			{#if hasInstalledApp}
				<h3>Then, log in with <a href="/api/login">GitHub</a></h3>
			{/if}
		</div>
	{/if}
	<video class="background" autoplay muted on:timeupdate={videoTick}>
		<source src="/background.mp4" />
	</video>
</main>

<Modal open={proposingDestination} title="Propose a Destination" on:close={() => (proposingDestination = false)}>
	<form class="destination-modal" action="/api/destinations" method="POST" on:submit={() => (submitting = true)}>
		<label for="location">
			Destination *
			<Input type="text" id="location" name="location" />
		</label>
		<label for="description">
			Description *
			<Input type="text" id="description" name="description" />
		</label>
		<div class="controls">
			<Button type="reset" class="ghost" disabled={submitting} on:click={() => (proposingDestination = false)}>Cancel</Button>
			<Button type="submit" class="action" disabled={submitting}>Create!</Button>
		</div>
	</form>
</Modal>

<Modal open={proposingActivity} title="Propose an Activity" on:close={() => (proposingActivity = false)}>
	<form class="activity-modal" action="/api/activities" method="POST" on:submit={() => (submitting = true)}>
		<label for="location">
			Location
			<Select name="location" id="location" on:change={syncLocationId}>
				{#each destinations as destination}
					<option>{destination.title}</option>
				{/each}
			</Select>
			<Input type="hidden" name="locationId" value={locationId} />
		</label>
		<label for="event">
			Event
			<Input type="text" id="event" name="event" />
		</label>
		<label for="date">
			Date
			<Input type="date" id="date" name="date" />
		</label>
		<div class="grid">
			<label for="cost">
				Cost
				<Select name="cost" id="cost">
					<option value="inexpensive">💲 Inexpensive</option>
					<option value="moderate">💳 Moderate Cost</option>
					<option value="expensive">💰 Expensive</option>
				</Select>
			</label>
			<label for="exertion">
				Exertion
				<Select name="exertion" id="exertion">
					<option value="low">🚶 Low Exertion</option>
					<option value="medium">🚴‍♂️ Medium Exertion</option>
					<option value="high">🏔️ High Exertion</option>
				</Select>
			</label>
		</div>
		<div class="grid">
			<ToggleButton id="wheelchair" name="wheelchair">♿ Accessible</ToggleButton>
			<ToggleButton id="cash" name="cash">💵 Cash Only</ToggleButton>
			<ToggleButton id="children" name="children">🧒 Child Friendly</ToggleButton>
		</div>
		<label for="notes">
			Additional Notes
			<textarea name="notes" id="notes" cols={20} rows={3} placeholder="Additional Notes" />
		</label>
		<div class="controls">
			<Button type="reset" class="ghost" disabled={submitting} on:click={() => (proposingActivity = false)}>Cancel</Button>
			<Button type="submit" class="action" disabled={submitting}>Create!</Button>
		</div>
	</form>
</Modal>

<style lang="scss">
	main {
		z-index: 0;

		.contents {
			z-index: 20;
			position: absolute;
			top: 25%;
			left: 50%;
			transform: translateX(-50%);
			width: 80%;

			.control-row {
				display: inline-flex;
				flex-direction: row;
				gap: 2em;
			}

			.destinations {
				background-color: rgba(243, 243, 243, 0.82);
				box-shadow: 0px 6px 10px rgba(0, 0, 0, 0.25);
				border-radius: 20px;
				padding: 2em;
				backdrop-filter: blur(17.5px);
				color: black;

				div.destination {
					border-bottom: 1px solid rgba(0, 0, 0, 0.3);
					display: flex;
					flex-direction: row;
					justify-content: space-between;
					margin-bottom: 0.5em;

					h2 {
						margin-bottom: 0;

						a {
							color: black;
						}
					}

					.description {
						color: black;
					}
				}
			}
		}

		.main {
			position: absolute;
			top: 50%;
			left: 50%;
			transform: translate(-50%, -50%);
			z-index: 20;
			text-align: center;
			padding: 1.5em 2em;
			border-radius: 20px;
			width: max-content;
			background-color: rgba(243, 243, 243, 0.82);
			backdrop-filter: blur(17.5px);

			h1 {
				font-size: 56px;
			}

			* {
				color: black;
				margin-bottom: 0.25em;

				a {
					text-decoration: underline;
				}
			}
		}

		video.background {
			position: fixed;
			left: 0;
			top: 0;
			width: 100vw;
			height: 100vh;
			z-index: 0;
			object-fit: cover;
		}
	}

	.controls {
		display: flex;
		flex-direction: row;
		gap: 2em;
	}

	.destination-modal {
		margin-bottom: 0;

		label {
			color: rgba(0, 0, 0, 0.4);
		}
	}

	.activity-modal {
		margin-bottom: 0;

		label {
			color: rgba(0, 0, 0, 0.4);
		}

		textarea {
			background-color: transparent;
			margin-bottom: 0;
			color: rgba(0, 0, 0, 0.4);
			border: 1px solid rgba(0, 0, 0, 0.2);

			&::placeholder {
				color: rgba(0, 0, 0, 0.4);
			}
		}
	}
</style>
