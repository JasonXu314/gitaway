<script lang="ts">
	import { page } from '$app/stores';
	import Cookies from 'js-cookie';
	import { onMount } from 'svelte';
	import { http } from 'utils/http';
	import { REACTIONS, emoji } from 'utils/utils';
	import type { Comment, Issue, PullRequest } from '../../app';

	let destination: Issue,
		promise: Promise<void> = Promise.resolve(),
		comments: Comment[] = [],
		proposingActivity = false,
		submitting = false,
		activities: PullRequest[] = [];

	onMount(() => {
		promise = getDestination().then((dest) => {
			destination = dest;

			getComments().then((data) => {
				comments = data;
				console.log(data);
			});
			getActivities().then((data) => {
				activities = data;
				console.log(data);
			});
		});
	});

	async function getDestination() {
		return http.get<Issue[]>('/api/destinations').then((res) => res.data.find((dest) => dest.title === $page.params.destination)!);
	}

	async function getComments() {
		return http.get(`/api/discussion?type=destination&id=${destination.number}`).then((res) => res.data);
	}

	async function getActivities() {
		return http.get(`/api/activities?location=${destination.title}`).then((res) => res.data);
	}

	async function expressInterest() {
		// TODO: make more user-friendly lol
		http.post(`/api/destinations/follow?id=${destination.number}`, { assignees: [Cookies.get('ghName')] });
	}
</script>

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
				</div>
				<h2>Discussion</h2>
				<section class="comments">
					{#each comments as comment}
						<div class="comment">
							<img src={comment.user.avatar_url} alt="User Avatar" class="avatar" />
							<div class="content">
								<h3><a href={comment.user.html_url} rel="noopener noreferrer" target="_blank">{comment.user.login}</a></h3>
								<p>{comment.body}</p>
							</div>
						</div>
					{/each}
				</section>
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

<dialog open={proposingActivity}>
	{#if proposingActivity}
		<article>
			<header>
				<a href="#" class="close" on:click={() => (proposingActivity = false)} />
				<h2>Propose an Activity</h2>
			</header>
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
				<div class="controls">
					<button type="reset" class="secondary" disabled={submitting} on:click={() => (proposingActivity = false)}>Cancel</button>
					<button type="submit" disabled={submitting}>Create!</button>
				</div>
			</form>
		</article>
	{/if}
</dialog>

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

				.destination {
					.reactions {
						display: flex;
						flex-direction: row;
						gap: 1em;
						margin-bottom: 2em;

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

		.comments {
			.comment {
				display: flex;
				flex-direction: row;
				gap: 1.5em;

				.avatar {
					max-height: 75px;
					border-radius: 50%;
				}

				.content {
					h3 {
						margin-bottom: 0;
					}
				}
			}
		}
	}

	dialog article {
		min-width: 50%;

		header {
			margin-bottom: 1em;

			h2 {
				margin-bottom: 0;
			}
		}

		.controls {
			display: flex;
			flex-direction: row;
			gap: 2em;
		}
	}
</style>
