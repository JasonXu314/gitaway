import { GITHUB_PAT, LOCATION } from '$env/static/private';
import { json, redirect, type RequestHandler } from '@sveltejs/kit';
import type { AxiosError } from 'axios';
import { tryGetAuth } from 'utils/auth';
import type { PullRequest, Ref, Repository } from '../../../app';
import { http } from '../../../utils/http';

export const GET: RequestHandler = async ({ url }) => {
	const state = url.searchParams.get('state'); // open, closed, all
	const sortBy = url.searchParams.get('sort'); // due_on, completeness
	const sortDirection = url.searchParams.get('direction'); // asc, desc
	const perPage = url.searchParams.get('per_page'); // max 100
	const page = url.searchParams.get('page'); // page number

	const allNull: boolean = !!(state ?? sortBy ?? sortDirection ?? perPage ?? page);
	const rec = {state, sortBy, sortDirection, perPage, page};
	const req = `https://api.github.com/repos/JasonXu314/wafflehacks-travel/milestones${(allNull ? '?' : '') + Object.entries(rec).map(([prop, val]) => val === null ? null : `${prop}=${val}`).filter((val) => val !== null).join('&')}`
	console.log(req);

	const itineraries = await http
		.get<PullRequest[]>(req, {
			headers: {
				Authorization: `Bearer ${GITHUB_PAT}`
			}
		})
		.then((res) => res.data)
		.catch<PullRequest[]>((err) => err.response);

	return json(itineraries);
};

// export const POST: RequestHandler = async ({ request, url }) => {
// 	const body = await request.json();
// 	console.log(body);
// 	const reaction = body.reaction;
// 	const issueNumber = body.issue;
// 	const { token, username } = tryGetAuth(request);

// 	const reactionData =
// 		await http.post<Repository>(
// 			`https://api.github.com/repos/JasonXu314/wafflehacks-travel/issues/${issueNumber}/reactions`,
// 			{ content: reaction },
// 			{ headers: { Authorization: `Bearer ${token}` } }
// 		)
// 		.then((res) => res.data)
// 		.catch<Repository>((err) => err.response);



// 	return json(reactionData);
// };

// export const DELETE: RequestHandler = async ({ request, url }) => {
// 	const body = await request.json();
// 	console.log(body);
// 	const reactionId = body.reactionId;
// 	const issueNumber = body.issue;
// 	const { token, username } = tryGetAuth(request);

// 	const reactionData =
// 		await http.post<Repository>(
// 			`https://api.github.com/repos/JasonXu314/wafflehacks-travel/issues/${issueNumber}/reactions/${reactionId}`,
// 			{ headers: { Authorization: `Bearer ${token}` } }
// 		)
// 		.then((res) => res.data)
// 		.catch<Repository>((err) => err.response);



// 	return json(reactionData);
// };