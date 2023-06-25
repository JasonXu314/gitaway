import { GITHUB_PAT, LOCATION } from '$env/static/private';
import { error, json, redirect, type RequestHandler } from '@sveltejs/kit';
import type { AxiosError } from 'axios';
import { http } from '../../../../utils/http';
import type { Label } from '../../../../app';

// get labels (tags) for activity
export const GET: RequestHandler = async ({ url }) => {
	const issueNumber = url.searchParams.get('number');
	if (!issueNumber) {
		throw error(400, { message: 'Must contain \'number\' query parameter.' });
	}

	const tags = await http
		.get<Label[]>(`https://api.github.com/repos/JasonXu314/gitaway/issues/${issueNumber}/labels?per_page=100`, {
			headers: {
				Authorization: `Bearer ${GITHUB_PAT}`
			}
		})
		.then((res) => res.data)
		.catch<Label[]>((err) => err.response);

	return json(tags);
};
