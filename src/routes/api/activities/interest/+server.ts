import { GITHUB_PAT } from '$env/static/private';
import { error, json, type RequestHandler } from '@sveltejs/kit';
import { http } from '../../../../utils/http';
import { tryGetAuth } from 'utils/auth';

export const POST: RequestHandler = async ({ request, url }) => {
	const pullId = url.searchParams.get('id');
	const { token, username } = tryGetAuth(request);

	if (pullId) {
		const res = await http.post(`https://api.github.com/repos/JasonXu314/wafflehacks-travel/issues/${pullId}/assignees`, 
		await request.json(),
		{
			headers: {
				Authorization: `Bearer ${GITHUB_PAT}`
			}
		});
		return json(res.data);
	}
	throw error(400, { message: "Invalid issue id." });
};

export const GET: RequestHandler = async ({ url }) => {
	const pullId = url.searchParams.get('id');
	
	const assignees = await http
		.get(`https://api.github.com/repos/JasonXu314/wafflehacks-travel/assignees/${pullId}`, {
			headers: {
				Authorization: `Bearer ${GITHUB_PAT}`
			}
		})
		.then((res) => res.data)
		.catch((err) => err.response);

	return json(assignees);
};



