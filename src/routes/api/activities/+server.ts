import { GITHUB_PAT, LOCATION } from '$env/static/private';
import { json, redirect, type RequestHandler } from '@sveltejs/kit';
import type { AxiosError } from 'axios';
import { tryGetAuth } from 'utils/auth';
import type { PullRequest, Ref, Repository } from '../../../app';
import { http } from '../../../utils/http';

export const GET: RequestHandler = async ({ url }) => {
	const location = url.searchParams.get('location'),
		type = url.searchParams.get('as');

	const activities = await http
		.get<PullRequest[]>(`https://api.github.com/repos/JasonXu314/journeyhub/${type === 'issue' ? 'issues' : 'pulls?state=open'}`, {
			headers: {
				Authorization: `Bearer ${GITHUB_PAT}`
			}
		})
		.then((res) => res.data)
		.catch<PullRequest[]>((err) => err.response);

	return json(location ? activities.filter((activity) => activity.title.split(' in ')[1] === location) : activities);
};

// TODO: this endpoint dont giv a fuck about validation lul
export const POST: RequestHandler = async ({ request, url }) => {
	const body = await request.formData();
	const returnURL = url.searchParams.get('returnTo');
	const location = body.get('location') as string,
		event = body.get('event') as string,
		date = body.get('date') as string,
		locationId = body.get('locationId');
	// const tags = body.get('labels') as string[];

	const { token, username } = tryGetAuth(request);

	const existingFork = await http
		.get<Repository>(`https://api.github.com/repos/${username}/journeyhub`, { headers: { Authorization: `Bearer ${token}` } })
		.then((res) => res.data)
		.catch((err: AxiosError) => {
			if (err.response?.status === 404) {
				return null;
			}
			console.error(err.response);
		});

	const forkData =
		existingFork && existingFork.fork && existingFork.parent!.full_name === 'JasonXu314/journeyhub'
			? existingFork
			: await http
					.post<Repository>(
						'https://api.github.com/repos/JasonXu314/journeyhub/forks',
						{ default_branch_only: true },
						{ headers: { Authorization: `Bearer ${token}` } }
					)
					.then((res) => res.data)
					.catch<Repository>((err) => err.response);

	const fullEventName = `${date.replaceAll('/', '-')}_${location}_${event}`;
	const normalizedEventName = fullEventName.replaceAll(' ', '_');
	const master = await http
		.get<Ref>(`https://api.github.com/repos/${username}/journeyhub/git/ref/heads/master`, { headers: { Authorization: `Bearer ${token}` } })
		.then((res) => res.data)
		.catch<Ref>((err) => err.response);

	await http
		.post(
			`https://api.github.com/repos/${username}/journeyhub/git/refs`,
			{
				ref: `refs/heads/${normalizedEventName}`,
				sha: master.object.sha
			},
			{ headers: { Authorization: `Bearer ${token}` } }
		)
		.then((res) => res.data)
		.catch((err) => err.response);
	await http.put(
		`https://api.github.com/repos/${username}/journeyhub/contents/${normalizedEventName}.md`,
		{
			message: `Creating event ${event} in ${location}`,
			content: btoa(`# ${event}\n## In ${location}, on ${date}`),
			branch: normalizedEventName
		},
		{ headers: { Authorization: `Bearer ${token}` } }
	);

	const pullData = await http
		.post(
			`https://api.github.com/repos/JasonXu314/journeyhub/pulls`,
			{
				title: `${event} in ${location}`,
				head: normalizedEventName,
				repo: `${username}/journeyhub`,
				base: 'master',
				body: `${event} in ${location} (#${locationId}) on ${date}!`
			},
			{ headers: { Authorization: `Bearer ${token}` } }
		)
		.then((res) => res.data)
		.catch((err) => err.response);

	const issueNumber = pullData.number;
	const label = await http.post(
		`https://api.github.com/repos/JasonXu314/wafflehacks-travel/issues/${issueNumber}/labels`,
		{ labels: ['🎡 Activity'] },
		{ headers: { Authorization: `Bearer ${token}` } }
	);

	throw redirect(303, returnURL || LOCATION);
};

