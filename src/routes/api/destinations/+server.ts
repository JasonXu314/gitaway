import { GITHUB_PAT } from '$env/static/private';
import { error, json, type RequestHandler } from '@sveltejs/kit';
import { http } from '../../../utils/http';

export const GET: RequestHandler = async () => {
	const res = await http.get('https://api.github.com/repos/JasonXu314/wafflehacks-travel/issues', {
		headers: {
			Authorization: `Bearer ${GITHUB_PAT}`
		}
	});

	return json(res.data);
};

export const POST: RequestHandler = async ({ request }) => {
	const data = await request.json();

	if (typeof data.location !== 'string') {
		throw error(400, 'Location must be string.');
	}

	return json({ placeholder: ':P' });
};

