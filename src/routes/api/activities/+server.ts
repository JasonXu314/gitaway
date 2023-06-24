import { GITHUB_PAT, LOCATION } from '$env/static/private';
import { json, redirect, type RequestHandler } from '@sveltejs/kit';
import type { AxiosError } from 'axios';
import { parse } from 'cookie';
import type { Repository } from '../../../app';
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

	const cookies = request.headers.get('Cookie');

	if (!cookies || !parse(cookies).ghToken) {
		console.log('No token, redirecting', cookies);
		throw redirect(303, `${LOCATION}/api/login`);
	}

	const existingFork = await http
		.get<Repository>(`https://api.github.com/repos/${parse(cookies).ghName}/wafflehacks-travel`, { headers: { Authorization: parse(cookies).ghToken } })
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
					.post<Repository>('https://api.github.com/repos/JasonXu314/wafflehacks-travel/forks', { default_branch_only: true })
					.then((res) => res.data)
					.catch<Repository>((err) => err.response);

	console.log(forkData);
	const fullEventName = `${date.replaceAll('/', '-')}_${location}_${event}`;
	await http.post(`https://api.github.com/repos/${parse(cookies).ghName}/wafflehacks-travel/contents/${fullEventName}.md`, {
		message: `Creating event ${event} at ${location}`,
		content: btoa(`# ${event}\n## At ${location}, ${date}`),
		branch: fullEventName
	});

	throw redirect(303, LOCATION);
};

