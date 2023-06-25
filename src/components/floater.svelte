<div class="floater">
	<img src="/gitaway.png" alt="Logo" class="logo" />
	<div class="text">
		<h1>Gitaway</h1>
		<h5>The first Github-as-a-Backend App</h5>
	</div>
</div>

<style lang="scss">
	div.floater {
		position: absolute;
		display: flex;
		flex-direction: row;
		gap: 1em;
		left: 10%;
		top: 5%;
		z-index: 10;
		height: 150px;
		border-radius: 75px;
		background-color: rgba(243, 243, 243, 0.82);
		backdrop-filter: blur(17.5px);
		padding-right: 2em;

		.logo {
			width: 150px;
			height: 150px;
		}

		h1,
		h5 {
			color: black;
		}

		h1 {
			margin-bottom: 4px;
			font-size: 56px;
		}
	}
</style>
