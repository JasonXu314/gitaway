import { GITHUB_PAT } from '$env/static/private';
import { error, json, type RequestHandler } from '@sveltejs/kit';
import { http } from '../../../../utils/http';

export const POST: RequestHandler = async ({ request, url }) => {
	const issueNumber = url.searchParams.get('id');
	if (issueNumber) {
		const res = await http.post(`https://api.github.com/repos/JasonXu314/wafflehacks-travel/issues/${issueNumber}/assignees`, 
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

