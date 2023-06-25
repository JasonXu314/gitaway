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
	dialog {
		z-index: 999;
		border-radius: 20;

		article {
			min-width: 60%;
			background-color: rgba(243, 243, 243, 0.82);

			header {
				margin-bottom: 1em;
				border-bottom: 0;
				background-color: transparent;

				h2 {
					color: black;
					margin-bottom: 0;
				}
			}
		}
	}
</style>
