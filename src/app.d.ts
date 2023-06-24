// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces
declare global {
	namespace App {
		// interface Error {}
		// interface Locals {}
		// interface PageData {}
		// interface Platform {}
	}
}

export interface GHUser {
	avatar_url: string;
	events_url: string;
	followers_url: string;
	following_url: string;
	gists_url: string;
	gravatar_id: string;
	html_url: string;
	id: number;
	login: string;
	node_id: string;
	organizations_url: string;
	received_events_url: string;
	repos_url: string;
	site_admin: boolean;
	starred_url: string;
	subscriptions_url: string;
	type: 'User';
	url: string;
}

export interface Destination {
	active_lock_reason: null;
	assignee: GHUser;
	assignees: GHUser[];
	author_association: string;
	body: string;
	closed_at: null;
	comments: number;
	comments_url: string;
	created_at: string;
	events_url: string;
	html_url: string;
	id: number;
	labels: string[];
	labels_url: string;
	locked: false;
	milestone: null;
	node_id: string;
	number: number;
	performed_via_github_app: null;
	reactions: {
		'+1': number;
		'-1': number;
		confused: number;
		eyes: number;
		heart: number;
		hooray: number;
		laugh: number;
		rocket: number;
		total_count: number;
		url: string;
	};
	repository_url: string;
	state: string;
	state_reason: null;
	timeline_url: string;
	title: 'Paris';
	updated_at: string;
	url: string;
	user: GHUser;
}

