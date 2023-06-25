![](https://hackmd.io/_uploads/BJSATuSOn.png)

Our site: [gitaway.tech](https://www.gitaway.tech/)
Demo video: [here](https://youtu.be/jW3xL0kfK1k)

## Gitaway is

-   An open-source, free-for-all, data-free adventure coordinator
-   The world's first GHaaB app (GitHub-as-a-Backend)
    -   Also, quite possibly the biggest abuse of git/GitHub in existence
-   A fun experiment to play around with!

## Inspiration

Using GitHub today is like building a Lego set with half the pieces missing!

You clone a project to learn from it, or to be inspired by it, or to enhance it... but you can't! Half of it is missing. The problem is clear: Github may store the full front-end, but rebuilding the back-end and databases requires access to the original developer's Firebase, MongoDB, or some other third-party database platform. Replicating this infrastructure can be a Herculean effort unless you have the original developer looking over your shoulder.

What if we told you there was another way?

## What it does

Gitaway is a simple travel site to explore cities, rate places, and RSVP for events. It's perfect for a getaway weekend!

But this is no regular travel site. This is the first ever platform that uses GitHub as a Backend! By abstracting GitHub in innovative ways, we can leverage it to store, manage, and distribute data.

Gitaway is a forum for tourists but because everything is centralized on GitHub, enterprising developers can easily fork the repo and start up a forum for anything. And it just works, no strings attached. Hell, it doesn't even need to be a forum. The possibilities are endless.

Throughout the site we included links to the corresponding GitHub components so you can get a look under the hood!

we have plans for further developing the gitaway platform

trip itineraries by milestones custom collections

better represent gitaway experiences

exclusive gitaway vacation

## Future Plans

-   Trip itineraries (front-end)
-   Destination and activity image attachments
-   Networking
    -   Friending other users
    -   Creating "friends only" activities
    -   Creating "invite only" activities

## Technical Information

#### Codebase

-   Our project's code is separated into **three** separate parts--- app, bot, and deployment.
    1.  The [`app`](https://github.com/JasonXu314/gitaway/tree/app) branch contains all the code for the actual web application.
    2.  The [`bot`](https://github.com/JasonXu314/gitaway/tree/bot) branch contains code for a scanner that merges pull requests when the event has completed (allowing 12hr grace period for last comments).
    3.  The [`deployment`](https://github.com/JasonXu314/gitaway-deployment) repo contains a copy of the `app` branch that is deployed to vercel. This has to exist in a separate repository since deployments can only occur on the default branch of a repository, which is `master` in the original codebase.

#### Abstracting to GitHub

-   When using the web app, all interactions are facilitated by the GitHub API.
-   To use GitHub as a backend, we created **abstractions** from various actions users take to GitHub repository features.
    -   All travel **destinations** are represented by **issues** in the repository.
    -   All proposed **activities** are tracked by forking the repo, branching, and making a **pull request**. This pull request is where all user dialogue occurs.

#### User Data

-   Destinations
    -   Active destinations will show up in the [`issues`](https://github.com/JasonXu314/gitaway/issues) tab.
    -   User comments and emoji reactions (like 👍) for destinations are stored on each issue thread.
-   Activities
    -   Active and future activities will show up in the [`pull requests`](https://github.com/JasonXu314/gitaway/pulls) tab.
    -   Completed activities will show up on the [`master`](https://github.com/JasonXu314/gitaway/tree/master) branch, as a record of fun times had!
    -   User comments and emoji reactions (like 👍) for activities are stored on each pull request thread.
-   Itineraries (not implemented on front-end site)
    -   Active and completed itineraries will show up in the [`milestones`](https://github.com/JasonXu314/gitaway/milestones) tab.
    -   Itinerary creators can add activities to any of their own itineraries.

#### Technologies Used

-   [Vercel](https://vercel.com/) (hosting)
-   [SvelteKit](https://kit.svelte.dev/) (front-end)
-   [PicoCSS](https://picocss.com/) ([self-hosted](https://mypico.jasonxu.dev) modified version)
-   [FontAwesome](https://fontawesome.com/) (for icons)
-   [GitHub API](https://docs.github.com/en/rest?apiVersion=2022-11-28) (backend and data storage)

