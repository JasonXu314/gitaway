import { GITHUB_PAT } from '$env/static/private';
import { error, json, type RequestHandler } from '@sveltejs/kit';
import { tryGetAuth } from 'utils/auth';
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

	const res = await http.get(`https://api.github.com/repos/JasonXu314/gitaway/issues/${id}/comments`, {
		headers: {
			Authorization: `Bearer ${GITHUB_PAT}`
		}
	});

	return json(res.data);
};

// post comment (provide issue id as query string)
export const POST: RequestHandler = async ({ request, url }) => {
	const id = url.searchParams.get('id');
	const body = await request.json();
	if (Object.keys(body).length === 0) {
		return json({});
	}
	console.log(body);
	const { token, username } = tryGetAuth(request);

	const res = await http.post(`https://api.github.com/repos/JasonXu314/gitaway/issues/${id}/comments`, body, {
		headers: {
			Authorization: `Bearer ${token}`
		}
	});

	return json(res.data);
};

