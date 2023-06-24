import { GITHUB_PAT, LOCATION } from '$env/static/private';
import { json, redirect, type RequestHandler } from '@sveltejs/kit';
import type { AxiosError } from 'axios';
import { tryGetAuth } from 'utils/auth';
import type { Ref, Repository } from '../../../app';
import { http } from '../../../utils/http';

export const GET: RequestHandler = async () => {
	const res = await http.get('https://api.github.com/repos/JasonXu314/wafflehacks-travel/pulls', {
		headers: {
			Authorization: `Bearer ${GITHUB_PAT}`
		}
	});

	return json(res.data);
};

// TODO: this endpoint dont giv a fuck about validation lul
export const POST: RequestHandler = async ({ request }) => {
	const body = await request.formData();
	const location = body.get('location'),
		event = body.get('event'),
		date = body.get('date') as string;

	const { token, username } = tryGetAuth(request);

	const existingFork = await http
		.get<Repository>(`https://api.github.com/repos/${username}/wafflehacks-travel`, { headers: { Authorization: `Bearer ${token}` } })
		.then((res) => res.data)
		.catch((err: AxiosError) => {
			if (err.response?.status === 404) {
				return null;
			}
			console.error(err.response);
		});

	const forkData =
		existingFork && existingFork.fork && existingFork.parent!.full_name === 'JasonXu314/wafflehacks-travel'
			? existingFork
			: await http
					.post<Repository>(
						'https://api.github.com/repos/JasonXu314/wafflehacks-travel/forks',
						{ default_branch_only: true },
						{ headers: { Authorization: `Bearer ${token}` } }
					)
					.then((res) => res.data)
					.catch<Repository>((err) => err.response);

	console.log(forkData);
	const fullEventName = `${date.replaceAll('/', '-')}_${location}_${event}`;
	const master = await http
		.get<Ref>(`https://api.github.com/repos/${username}/wafflehacks-travel/git/ref/heads/master`, { headers: { Authorization: `Bearer ${token}` } })
		.then((res) => res.data)
		.catch<Ref>((err) => err.response);

	await http
		.post(
			`https://api.github.com/repos/${username}/wafflehacks-travel/git/refs`,
			{
				ref: `refs/heads/${fullEventName}`,
				sha: master.object.sha
			},
			{ headers: { Authorization: `Bearer ${token}` } }
		)
		.then((res) => res.data)
		.catch((err) => err.response);
	await http.put(
		`https://api.github.com/repos/${username}/wafflehacks-travel/contents/${fullEventName}.md`,
		{
			message: `Creating event ${event} at ${location}`,
			content: btoa(`# ${event}\n## At ${location}, ${date}`),
			branch: fullEventName
		},
		{ headers: { Authorization: `Bearer ${token}` } }
	);

	const res = await http
		.post(
			`https://api.github.com/repos/JasonXu314/wafflehacks-travel/pulls`,
			{
				title: `${event} at ${location}`,
				head: fullEventName,
				repo: `${username}/wafflehacks-travel`,
				base: 'master',
				body: `An event at ${location}\n#1`
			},
			{ headers: { Authorization: `Bearer ${token}` } }
		)
		.then((res) => res.data)
		.catch((err) => err.response);

	throw redirect(303, LOCATION);
};

