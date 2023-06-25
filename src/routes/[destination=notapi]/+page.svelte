<script lang="ts">
	import { page } from '$app/stores';
	import Cookies from 'js-cookie';
	import { onMount } from 'svelte';
	import { http } from 'utils/http';
	import type { Issue, PullRequest } from '../../app';
	import Button from '../../components/button.svelte';
	import CommentSection from '../../components/comment-section.svelte';
	import Floater from '../../components/floater.svelte';
	import Input from '../../components/input.svelte';
	import Modal from '../../components/modal.svelte';
	import Reactions from '../../components/reactions.svelte';
	import Select from '../../components/select.svelte';
	import ToggleButton from '../../components/toggle-button.svelte';

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

	function videoTick(evt: Event) {
		const video = evt.target as HTMLVideoElement;
		if (video.currentTime >= video.duration - 2) {
			video.currentTime = 0;
		}
	}
</script>

<svelte:head>
	<title>Gitaway - {destination?.title}</title>
</svelte:head>

<main class="container">
	<Floater />
	{#await promise}
		Loading destination data...
	{:then}
		<div class="contents">
			<div class="layout">
				<div class="main">
					<section class="destination">
						<div class="info">
							<div class="nav">
								<a href="/"><i class="fa-solid fa-arrow-left" /></a>
							</div>
							<div class="text">
								<h3>
									{destination.title}
									<a href={destination.html_url} rel="noopener noreferrer" target="_blank"><i class="fa-brands fa-github" /></a>
								</h3>
								<p>{destination.body}</p>
							</div>
						</div>
						<Reactions id={destination.number} reactions={destination.reactions} names={['+1', '-1', 'heart', 'eyes']} />
					</section>
					<section class="comments">
						<CommentSection id={destination.number} />
					</section>
				</div>
				<aside class="activities">
					<Button class="action" on:click={() => (proposingActivity = true)}>Add Activity</Button>
					{#each activities as activity}
						<div class="activity">
							<h4><a href="/{destination.title}/{activity.title}">{activity.title}</a></h4>
							<p>{activity.body}</p>
						</div>
					{/each}
					{#if activities.length === 0}
						<div class="activity">
							<h4>Activities will show up here</h4>
						</div>
					{/if}
				</aside>
			</div>
		</div>
	{:catch err}
		<h1 class="error">An error ocurred...</h1>
		<pre>{JSON.stringify(err, null, 4)}</pre>
	{/await}
	<video class="background" autoplay muted on:timeupdate={videoTick}>
		<source src="/background.mp4" />
	</video>
</main>

<Modal open={proposingActivity} title="Propose an Activity" on:close={() => (proposingActivity = false)}>
	{#if proposingActivity}
		<form class="activity-modal" action="/api/activities?returnTo=/{destination.title}" method="POST" on:submit={() => (submitting = true)}>
			<label for="location">
				Location
				<Select id="location" value={destination.title} disabled>
					<option>{destination.title}</option>
				</Select>
				<Input type="hidden" name="location" value={destination.title} />
				<Input type="hidden" name="locationId" value={destination.number} />
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
	{/if}
</Modal>

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

			.layout {
				@media screen and (min-width: 992px) {
					display: flex;
					flex-direction: row;
					gap: 1em;
				}

				.main {
					flex-grow: 1;

					.destination {
						border-bottom: 1px solid rgba(0, 0, 0, 0.3);
						display: flex;
						flex-direction: row;
						justify-content: space-between;
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
							gap: 1em;

							.nav a {
								color: rgba(0, 0, 0, 0.4);

								&:hover {
									color: black;
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
					}

					.comments {
						background-color: rgba(224, 225, 224, 0.9);
						border-radius: 12px;
						padding: 2em;
						margin-bottom: 0;
					}
				}

				.activities {
					background-color: rgba(224, 225, 224, 0.9);
					border-radius: 12px;
					padding: 1em;
					max-width: 300px;
					height: max-content;

					:global(button) {
						width: 100%;
					}

					.activity {
						border-bottom: 1px solid rgba(0, 0, 0, 0.4);

						h4 {
							color: black;
							margin-bottom: 0.25em;

							a {
								color: black;
								text-overflow: ellipsis;
								white-space: nowrap;
								overflow: hidden;
								display: block;
							}
						}

						p {
							font-size: 16px;
							color: black;
							margin-bottom: 0.5em;
						}

						&:last-child {
							border: unset;

							p {
								margin-bottom: 0;
							}
						}
					}
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
