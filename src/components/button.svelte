<button on:click {...$$props}><slot /></button>

<style lang="scss">
	button {
		width: max-content;
		color: black;
		background: rgba(225, 225, 225, 0.9);
		backdrop-filter: blur(17.5px);
		font-weight: 600;
		border: 0;
		box-shadow: 0px 6px 10px rgba(0, 0, 0, 0.25);
		border-radius: 12px;

		&.action {
			background: rgba(255, 255, 255, 0.7);
		}

		&.ghost {
			background: transparent;
			border: 0;
			color: rgba(0, 0, 0, 0.4);
			box-shadow: none;

			&:hover {
				outline: 1px solid rgba(0, 0, 0, 0.4);
			}
		}
	}
</style>
