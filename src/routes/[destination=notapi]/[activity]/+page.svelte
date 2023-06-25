<script lang="ts">
	import { page } from '$app/stores';
	import Cookies from 'js-cookie';
	import { onMount } from 'svelte';
	import { http } from 'utils/http';
	import type { Issue, PullRequest } from '../../../app';
	import CommentSection from '../../../components/comment-section.svelte';
	import Reactions from '../../../components/reactions.svelte';

	let destination: Issue,
		activity: PullRequest,
		activityAsIssue: Issue,
		promise: Promise<void> = Promise.resolve(),
		username = Cookies.get('ghName') as string;

	onMount(() => {
		promise = fetchData();
	});

	async function fetchData() {
		return getDestination().then((dest) => {
			destination = dest;

			return getActivity().then(([data, dataAsIssue]) => {
				activity = data;
				activityAsIssue = dataAsIssue;
				console.log(data);
			});
		});
	}

	async function getDestination() {
		return http.get<Issue[]>('/api/destinations').then((res) => res.data.find((dest) => dest.title === $page.params.destination)!);
	}

	async function getActivity() {
		return Promise.all([
			http
				.get<PullRequest[]>(`/api/activities?location=${destination.title}`)
				.then((res) => res.data.find((activity) => activity.title === $page.params.activity)!),
			http
				.get<Issue[]>(`/api/activities?location=${destination.title}&as=issue`)
				.then((res) => res.data.find((activity) => activity.title === $page.params.activity)!)
		]);
	}

	async function expressInterest() {
		http.post(`/api/activities/interest?id=${activity.number}`, { assignees: [username] }).then(() => (promise = fetchData()));
	}

	async function removeInterest() {
		http.delete(`/api/activities/interest?id=${activity.number}`, { data: { assignees: [username] } }).then(() => (promise = fetchData()));
	}
</script>

<svelte:head>
	<title>Gitaway - {activity?.title}</title>
</svelte:head>

<main class="container">
	{#await promise}
		Loading activity data...
	{:then}
		{#if activity}
			{@const rsvpd = activity.assignees.some((user) => user.login === username)}
			<nav>
				<ul>
					<li><a href="/{destination.title}"><i class="fa-solid fa-arrow-left" /> Back</a></li>
					<li>
						<a href={activity.html_url} rel="noopener noreferrer" target="_blank"
							><i class="fa-solid fa-arrow-up-right-from-square" /> To GitHub page</a
						>
					</li>
				</ul>
				{#if rsvpd || activity.assignees.length < 10}
					<ul>
						{#if rsvpd}
							<li><a href="#" role="button" on:click={removeInterest}><i class="fa-solid fa-calendar-check" /> Un-RSVP</a></li>
						{:else}
							<li><a href="#" role="button" on:click={expressInterest}><i class="fa-solid fa-calendar" /> RSVP</a></li>
						{/if}
					</ul>
				{/if}
			</nav>
			<h1>{activity.title}!</h1>
			<div class="activity">
				<p class="description">{activity.body}</p>
				<Reactions id={activity.number} reactions={activityAsIssue.reactions} />
			</div>
			<h2>Discussion</h2>
			<CommentSection id={activity.number} />
		{/if}
	{:catch err}
		<h1 class="error">An error ocurred...</h1>
		<pre>{JSON.stringify(err, null, 4)}</pre>
	{/await}
</main>

<style lang="scss">
	main {
		h1 {
			margin-bottom: 0;
		}

		h2 {
			margin-bottom: 1em;
		}
	}
</style>
