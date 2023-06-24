<script lang="ts">
	import { onMount } from 'svelte';
	import { http } from 'utils/http';
	import type { Comment } from '../app';

	export let id: number;

	let comments: Comment[] = [],
		promise = Promise.resolve();

	onMount(() => {
		promise = http
			.get(`/api/discussion?id=${id}`)
			.then((res) => res.data)
			.then((data) => (comments = data));
	});
</script>

<section class="comments">
	{#await promise}
		Loading discussion...
	{:then}
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
</style>
