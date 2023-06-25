<script lang="ts">
	import Cookies from 'js-cookie';
	import { onMount } from 'svelte';
	import { http } from 'utils/http';
	import { REACTIONS, emoji, type ElemOf } from 'utils/utils';
	import type { Reaction, ReactionRecord } from '../app';

	export let reactions: ReactionRecord,
		names: ElemOf<typeof REACTIONS>[] = [...REACTIONS],
		id: number,
		initialData: Reaction[] | null = null;

	let myReactions = initialData || [];

	onMount(() => {
		if (!initialData) {
			fetchMyReactions();
		}
	});

	async function fetchMyReactions() {
		return http
			.get<Reaction[]>(`/api/reactions?id=${id}`)
			.then((res) => res.data.filter((reaction) => reaction.user.login === Cookies.get('ghName')))
			.then((reactions) => (myReactions = reactions));
	}

	function addReaction(reaction: ElemOf<typeof REACTIONS>) {
		http.post('/api/reactions', { reaction, issue: id })
			.then(fetchMyReactions)
			.then(() => reactions[reaction]++);
	}

	function removeReaction(reaction: ElemOf<typeof REACTIONS>) {
		const rid = myReactions.find((r) => r.content === reaction)!.id;

		http.delete(`/api/reactions?id=${rid}&issue=${id}`)
			.then(fetchMyReactions)
			.then(() => reactions[reaction]--);
	}
</script>

<div class="reactions">
	{#each names as reaction}
		{@const reacted = myReactions.some((r) => r.content === reaction)}
		<div class="reaction-pill" class:reacted>
			<span class="reaction-contents" on:click={() => (reacted ? removeReaction(reaction) : addReaction(reaction))}>
				{emoji(reaction)}
				{reactions[reaction]}
			</span>
		</div>
	{/each}
</div>

<style lang="scss">
	.reactions {
		display: flex;
		flex-direction: row;
		gap: 1em;
		align-items: center;

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

			&.reacted {
				background-color: #abd6f3;
			}
		}
	}
</style>
