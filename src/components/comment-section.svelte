<script lang="ts">
	import { onMount } from 'svelte';
	import { http } from 'utils/http';
	import type { Comment } from '../app';
	import Button from './button.svelte';

	export let id: number;

	let comments: Comment[] = [],
		promise = Promise.resolve(),
		newComment: string,
		submitting = false;

	onMount(() => {
		promise = fetchData();
	});

	function fetchData() {
		return http
			.get(`/api/discussion?id=${id}`)
			.then((res) => res.data)
			.then((data) => (comments = data));
	}

	function postComment() {
		submitting = true;
		http.post(`/api/discussion?id=${id}`, { body: newComment }).then(() => {
			promise = fetchData();
			newComment = '';
			submitting = false;
		});
	}
</script>

<section class="comments">
	{#await promise}
		Loading discussion...
	{:then}
		<div class="new">
			<textarea name="body" cols={20} rows={3} placeholder="Leave a comment" bind:value={newComment} />
			<Button class="btn" on:click={postComment} disabled={submitting}>Comment</Button>
		</div>
		{#each comments as comment}
			<div class="comment">
				<img src={comment.user.avatar_url} alt="User Avatar" class="avatar" />
				<div class="content">
					<h3><a href={comment.user.html_url} rel="noopener noreferrer" target="_blank">{comment.user.login}</a></h3>
					<p>{comment.body}</p>
				</div>
			</div>
		{/each}
	{:catch err}
		<h1 class="error">An error occurred...</h1>
		<pre>{JSON.stringify(err, null, 4)}</pre>
	{/await}
</section>

<style lang="scss">
	.comments {
		margin-bottom: 0;

		.new {
			position: relative;
			display: block;

			textarea {
				background-color: transparent;
				margin-bottom: 0;
				color: rgba(0, 0, 0, 0.4);
				border: 1px solid rgba(0, 0, 0, 0.2);

				&::placeholder {
					color: rgba(0, 0, 0, 0.4);
				}
			}

			:global(button) {
				position: absolute;
				top: 50%;
				right: 1em;
				transform: translate(0, -50%);
				border: 1px solid rgba(0, 0, 0, 0.4);
				padding: 8px;
				font-weight: 200;
				background: transparent;
				box-shadow: unset;
				border-radius: 20px;
			}
		}

		.comment {
			display: flex;
			flex-direction: row;
			gap: 1.5em;
			margin-top: 1em;

			.avatar {
				max-height: 75px;
				border-radius: 50%;
			}

			.content {
				h3 {
					margin-bottom: 0;
				}

				p {
					color: black;
				}
			}
		}
	}
</style>
