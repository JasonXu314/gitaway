import { GITHUB_PAT } from '$env/static/private';
import { json, type RequestHandler } from '@sveltejs/kit';
import { http } from '../../../utils/http';

export const GET: RequestHandler = async () => {
	const res = await http.get('https://api.github.com/repos/JasonXu314/wafflehacks-travel/issues', {
		headers: {
			Authorization: `Bearer ${GITHUB_PAT}`
		}
	});

	return json(res.data);
};

