<script lang="ts">
	export let id: string;
</script>

<label for={id}>
	<slot />
	<input {...$$props} type="checkbox" {id} />
</label>

<style lang="scss">
	label {
		height: 1.5em;
		border-radius: 0.75em;
		border: 1px solid rgba(0, 0, 0, 0.2);
		background: transparent;
		position: relative;
		color: rgba(0, 0, 0, 0.4);
		cursor: pointer;
		text-align: center;
		padding-bottom: 1.5em;

		&:has(input:checked) {
			background: rgba(225, 225, 225, 0.9);
		}

		input {
			position: absolute;
			width: 0;
			height: 0;
			overflow: hidden;
			border: 0;

			&:active,
			&:checked,
			&:focus {
				background: none;
				box-shadow: none;
			}
		}
	}
</style>
