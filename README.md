# Welcome to Gitaway!

## This is

-   An open-source, free-for-all, data-free adventure coordinator
    -   Consequently, all it takes is a simple fork to run your own copy of the platform!
-   The world's first GHaaB app (GitHub as a Backend)
    -   Also, quite possibly the biggest abuse of git/GitHub in existence
-   A fun experiment to play around with!

## About the Repo

-   Previous activities will show up on this branch, as a record of fun times had!
-   The `app` branch contains all the code for the actual web application.
-   All travel destinations are represented by issues in the repository, and all proposed activities are represented by pull requests.
    -   An activity is proposed by forking the repo, branching, and making a pull request.
-   When using the web app, all interactions are facilitated by the GitHub API.

## Judges' Notes

-   As mentioned above, see the `app` branch for the code, or see the [deployment repo](https://github.com/JasonXu314/gitaway-deployment).
-   The `bot` branch contains code for a scanner that merges pull requests when the event has completed (allowing 12hr grace period for last comments).
-   Technologies used:
    -   [SvelteKit](https://kit.svelte.dev/)
    -   [PicoCSS](https://picocss.com/) ([self-hosted](https://mypico.jasonxu.dev) modified version)
    -   [FontAwesome](https://fontawesome.com/) (for icons)
    -   [GitHub API](https://docs.github.com/en/rest?apiVersion=2022-11-28)

