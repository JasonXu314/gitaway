import { GITHUB_PAT } from '$env/static/private';
import { error, json, type RequestHandler } from '@sveltejs/kit';
import { http } from 'utils/http';

export const GET: RequestHandler = async ({ url }) => {
	const idStr = url.searchParams.get('id');
	let id;

	if (!idStr) {
		throw error(400, 'ID is required.');
	}

	try {
		id = parseInt(idStr);
	} catch {
		throw error(400, 'Unable to parse ID string (must be an integer).');
	}

	const res = await http.get(`https://api.github.com/repos/JasonXu314/wafflehacks-travel/issues/${id}/comments`, {
		headers: {
			Authorization: `Bearer ${GITHUB_PAT}`
		}
	});

	return json(res.data);
};

