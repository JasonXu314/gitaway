<script lang="ts">
	import { createEventDispatcher } from 'svelte';

	export let open: boolean = false,
		title: string;

	const dispatch = createEventDispatcher<{ close: void }>();
</script>

<dialog {open}>
	<article>
		<header>
			<a href="#" class="close" on:click={() => dispatch('close')} />
			<h2>{title}</h2>
		</header>
		<slot />
	</article>
</dialog>

<style lang="scss">
	dialog article {
		min-width: 50%;

		header {
			margin-bottom: 1em;

			h2 {
				margin-bottom: 0;
			}
		}
	}
</style>
