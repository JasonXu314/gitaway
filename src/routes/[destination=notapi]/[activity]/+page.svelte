<script lang="ts">
	import { page } from '$app/stores';
	import Cookies from 'js-cookie';
	import { onMount } from 'svelte';
	import { http } from 'utils/http';
	import type { Issue, PullRequest } from '../../../app';
	import Button from '../../../components/button.svelte';
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

	function videoTick(evt: Event) {
		const video = evt.target as HTMLVideoElement;
		if (video.currentTime >= video.duration - 2) {
			video.currentTime = 0;
		}
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
			<div class="contents">
				<section class="activity">
					<div class="info">
						<div class="left">
							<div class="nav">
								<a href="/{destination.title}"><i class="fa-solid fa-arrow-left" /></a>
							</div>
							<div class="text">
								<h3>
									{activity.title}
									<a href={activity.html_url} rel="noopener noreferrer" target="_blank"><i class="fa-brands fa-github" /></a>
								</h3>
								<p>{activity.body}</p>
							</div>
						</div>
						<Reactions id={activity.number} reactions={activityAsIssue.reactions} names={['+1', '-1', 'heart', 'eyes']} />
					</div>
					<div class="extras">
						<div class="tags">
							{#each activity.labels as label}
								<span class="tag-pill">{label.name}</span>
							{/each}
						</div>
						<div class="rsvp">
							{#if rsvpd || activity.assignees.length < 10}
								{#if rsvpd}
									<Button class="ghost" on:click={removeInterest}><i class="fa-solid fa-calendar-check" /> Cancel</Button>
								{:else}
									<Button class="ghost" on:click={expressInterest}><i class="fa-solid fa-calendar" /> RSVP</Button>
								{/if}
							{/if}
						</div>
					</div>
				</section>
				<section class="comments">
					<CommentSection id={activity.number} />
				</section>
			</div>
		{/if}
	{:catch err}
		<h1 class="error">An error ocurred...</h1>
		<pre>{JSON.stringify(err, null, 4)}</pre>
	{/await}
	<video class="background" autoplay muted on:timeupdate={videoTick}>
		<source src="/background.mp4" />
	</video>
</main>

<style lang="scss">
	main {
		z-index: 0;

		h1 {
			margin-bottom: 0;
		}

		.contents {
			z-index: 20;
			position: absolute;
			top: 25%;
			left: 50%;
			transform: translateX(-50%);
			width: 80%;

			.activity {
				border-bottom: 1px solid rgba(0, 0, 0, 0.3);
				margin-bottom: 0.5em;
				border-radius: 12px;
				background-color: rgba(224, 225, 224, 0.9);
				backdrop-filter: blur(17.5px);
				padding: 2em;
				gap: 4em;

				.info {
					display: flex;
					flex-direction: row;
					align-items: center;
					justify-content: space-between;
					gap: 1em;

					.left {
						display: flex;
						flex-direction: row;
						align-items: center;
						gap: 1em;

						.nav a {
							color: rgba(0, 0, 0, 0.4);

							&:hover {
								color: black;
							}
						}
					}

					.text {
						a {
							color: rgba(0, 0, 0, 0.4);

							&:hover {
								color: black;
							}
						}

						h3,
						p {
							margin-bottom: 0;
							color: black;
						}
					}
				}

				.extras {
					display: flex;
					flex-direction: row;
					justify-content: space-between;

					.tags {
						display: flex;
						flex-direction: row;
						flex-wrap: wrap;
						gap: 1em;
						align-items: center;

						.tag-pill {
							height: 2em;
							font-size: 16px;
							border-radius: 1em;
							border: 1px solid rgba(0, 0, 0, 0.2);
							background: transparent;
							color: rgba(0, 0, 0, 0.4);
							text-align: center;
							padding: 2px 8px;
						}
					}

					.rsvp {
						i {
							margin-right: 0.4em;
						}
					}
				}
			}

			.comments {
				background-color: rgba(224, 225, 224, 0.9);
				border-radius: 12px;
				padding: 2em;
				margin-bottom: 0;
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
</style>
