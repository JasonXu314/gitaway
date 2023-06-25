import { GITHUB_PAT } from '$env/static/private';
import { error, json, type RequestHandler } from '@sveltejs/kit';
import { tryGetAuth } from 'utils/auth';
import { http } from '../../../../utils/http';

// add interested
export const POST: RequestHandler = async ({ request, url }) => {
	const pullId = url.searchParams.get('id');
	if (!pullId) {
		throw error(400, { message: 'Must contain \'id\' query parameter.' });
	}

	const { token, username } = tryGetAuth(request);

	if (pullId) {
		const res = await http.post(`https://api.github.com/repos/JasonXu314/gitaway/issues/${pullId}/assignees`, await request.json(), {
			headers: {
				Authorization: `Bearer ${token}`
			}
		});
		return json(res.data);
	}
	throw error(400, { message: 'Invalid issue id.' });
};

export const GET: RequestHandler = async ({ url }) => {
	const pullId = url.searchParams.get('id');
	if (!pullId) {
		throw error(400, { message: 'Must contain pull id as \'id\' query parameter.' });
	}

	const assignees = await http
		.get(`https://api.github.com/repos/JasonXu314/gitaway/assignees/${pullId}`, {
			headers: {
				Authorization: `Bearer ${GITHUB_PAT}`
			}
		})
		.then((res) => res.data)
		.catch((err) => err.response);

	return json(assignees);
};

export const DELETE: RequestHandler = async ({ request, url }) => {
	const pullId = url.searchParams.get('id');
	if (!pullId) {
		throw error(400, { message: 'Must contain pull id as \'id\' query parameter.' });
	}

	const assignees = await http
		.delete(`https://api.github.com/repos/JasonXu314/gitaway/issues/${pullId}/assignees`, {
			data: await request.json(),
			headers: {
				Authorization: `Bearer ${GITHUB_PAT}`
			}
		})
		.then((res) => res.data)
		.catch((err) => err.response);

	return json(assignees);
};

