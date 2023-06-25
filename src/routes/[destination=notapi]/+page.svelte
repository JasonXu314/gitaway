<script lang="ts">
	import { page } from '$app/stores';
	import Cookies from 'js-cookie';
	import { onMount } from 'svelte';
	import { http } from 'utils/http';
	import type { Issue, PullRequest } from '../../app';
	import CommentSection from '../../components/comment-section.svelte';
	import Modal from '../../components/modal.svelte';
	import Reactions from '../../components/reactions.svelte';

	let destination: Issue,
		promise: Promise<void> = Promise.resolve(),
		proposingActivity = false,
		submitting = false,
		activities: PullRequest[] = [];

	onMount(() => {
		promise = getDestination().then((dest) => {
			destination = dest;

			getActivities().then((data) => {
				activities = data;
				console.log(data);
			});
		});
	});

	async function getDestination() {
		return http.get<Issue[]>('/api/destinations').then((res) => res.data.find((dest) => dest.title === $page.params.destination)!);
	}

	async function getActivities() {
		return http.get(`/api/activities?location=${destination.title}`).then((res) => res.data);
	}

	async function expressInterest() {
		// TODO: make more user-friendly lol
		http.post(`/api/destinations/follow?id=${destination.number}`, { assignees: [Cookies.get('ghName')] });
	}
</script>

<svelte:head>
	<title>JourneyHub - {destination?.title}</title>
</svelte:head>

<main class="container">
	{#await promise}
		Loading destination data...
	{:then}
		<nav>
			<ul>
				<li><a href="/"><i class="fa-solid fa-arrow-left" /> Back</a></li>
				<li>
					<a href={destination.html_url} rel="noopener noreferrer" target="_blank"
						><i class="fa-solid fa-arrow-up-right-from-square" /> To GitHub page</a
					>
				</li>
			</ul>
			<ul>
				<li><a href="#" role="button" on:click={() => (proposingActivity = true)}>Propose Activity</a></li>
				<li><a href="#" role="button" on:click={expressInterest}>Follow this location</a></li>
			</ul>
		</nav>
		<div class="layout">
			<div class="main">
				<h1>Destination... {destination.title}!</h1>
				<div class="destination">
					<p class="description">{destination.body}</p>
					{#if destination}
						<Reactions id={destination.number} reactions={destination.reactions} />
					{/if}
				</div>
				<h2>Discussion</h2>
				<CommentSection id={destination.number} />
			</div>
			<aside class="activities">
				{#each activities as activity}
					<div class="activity">
						<h4><a href="/{destination.title}/{activity.title}" rel="noopener noreferrer" target="_blank">{activity.title}</a></h4>
						<p>{activity.body}</p>
					</div>
				{/each}
			</aside>
		</div>
	{:catch err}
		<h1 class="error">An error ocurred...</h1>
		<pre>{JSON.stringify(err, null, 4)}</pre>
	{/await}
</main>

<Modal open={proposingActivity} title="Propose an Activity" on:close={() => (proposingActivity = false)}>
	{#if proposingActivity}
		<form action="/api/activities?returnTo=/{destination.title}" method="POST" on:submit={() => (submitting = true)}>
			<label for="location">
				Location
				<select id="location" value={destination.title} disabled>
					<option>{destination.title}</option>
				</select>
				<input type="hidden" name="location" value={destination.title} />
				<input type="hidden" name="locationId" value={destination.number} />
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
	{/if}
</Modal>

<style lang="scss">
	main {
		h1 {
			margin-bottom: 0;
		}

		h2 {
			margin-bottom: 1em;
		}

		.layout {
			@media screen and (min-width: 992px) {
				display: flex;
				flex-direction: row;
			}

			.main {
				flex-grow: 1;
			}

			.activities {
				max-width: 300px;

				h4 {
					margin-bottom: 0.25em;

					a {
						text-overflow: ellipsis;
						white-space: nowrap;
						overflow: hidden;
						display: block;
					}
				}
			}
		}
	}

	.controls {
		display: flex;
		flex-direction: row;
		gap: 2em;
	}
</style>
