import { GITHUB_PAT } from '$env/static/private';
import { json, type RequestHandler } from '@sveltejs/kit';
import { tryGetAuth } from 'utils/auth';
import type { PullRequest, Repository } from '../../../app';
import { http } from '../../../utils/http';

export const GET: RequestHandler = async ({ url }) => {
	const issueNumber = url.searchParams.get('id');

	const reactions = await http
		.get<PullRequest[]>(`https://api.github.com/repos/JasonXu314/journeyhub/issues/${issueNumber}/reactions`, {
			headers: {
				Authorization: `Bearer ${GITHUB_PAT}`
			}
		})
		.then((res) => res.data)
		.catch<PullRequest[]>((err) => err.response);

	return json(reactions);
};

export const POST: RequestHandler = async ({ request, url }) => {
	const body = await request.json();
	const reaction = body.reaction;
	const issueNumber = body.issue;
	const { token, username } = tryGetAuth(request);

	const reactionData = await http
		.post<Repository>(
			`https://api.github.com/repos/JasonXu314/journeyhub/issues/${issueNumber}/reactions`,
			{ content: reaction },
			{ headers: { Authorization: `Bearer ${token}` } }
		)
		.then((res) => res.data)
		.catch<Repository>((err) => err.response);

	return json(reactionData);
};

export const DELETE: RequestHandler = async ({ request, url }) => {
	const reactionId = url.searchParams.get('id');
	const issueNumber = url.searchParams.get('issue');
	const { token, username } = tryGetAuth(request);

	const reactionData = await http
		.delete<Repository>(`https://api.github.com/repos/JasonXu314/journeyhub/issues/${issueNumber}/reactions/${reactionId}`, {
			headers: { Authorization: `Bearer ${token}` }
		})
		.then((res) => res.data)
		.catch<Repository>((err) => err.response);

	return json(reactionData);
};

