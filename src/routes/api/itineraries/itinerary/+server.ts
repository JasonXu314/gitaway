import { GITHUB_PAT } from '$env/static/private';
import { json, type RequestHandler } from '@sveltejs/kit';
import { tryGetAuth } from 'utils/auth';
import { http } from '../../../../utils/http';

// get milestone (by number)
export const GET: RequestHandler = async ({ url }) => {
	const itineraryNumber = url.searchParams.get('number');
	const itineraryData = await http
		.get(`https://api.github.com/repos/JasonXu314/journeyhub/milestones/${itineraryNumber}`, {
			headers: {
				Authorization: `Bearer ${GITHUB_PAT}`
			}
		})
		.then((res) => res.data)
		.catch((err) => err.response);

	return json(itineraryData);
};

// create milestone (title, state, description, due_on)
export const POST: RequestHandler = async ({ request, url }) => {
	const { token, username } = tryGetAuth(request);

	const milestoneData = await http
		.post(`https://api.github.com/repos/JasonXu314/journeyhub/milestones`, await request.json(), { headers: { Authorization: `Bearer ${token}` } })
		.then((res) => res.data)
		.catch((err) => err.response);

	return json(milestoneData);
};

// update milestone (title, state, description, due_on)
export const PATCH: RequestHandler = async ({ request, url }) => {
	const milestoneNumber = url.searchParams.get('number');
	const { token, username } = tryGetAuth(request);

	const reactionData = await http
		.patch(`https://api.github.com/repos/JasonXu314/journeyhub/milestones/${milestoneNumber}`, await request.json(), {
			headers: { Authorization: `Bearer ${token}` }
		})
		.then((res) => res.data)
		.catch((err) => err.response);

	return json(reactionData);
};
