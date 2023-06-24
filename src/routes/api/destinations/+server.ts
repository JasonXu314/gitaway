import { GITHUB_PAT, LOCATION } from '$env/static/private';
import { error, json, redirect, type RequestHandler } from '@sveltejs/kit';
import { parse } from 'cookie';
import { http } from '../../../utils/http';

export const GET: RequestHandler = async () => {
	const res = await http.get('https://api.github.com/repos/JasonXu314/wafflehacks-travel/issues', {
		headers: {
			Authorization: `Bearer ${GITHUB_PAT}`
		}
	});

	return json(res.data);
};

export const POST: RequestHandler = async ({ request }) => {
	const body = await request.formData();
	const location = body.get('location'),
		description = body.get('description');

	const cookies = request.headers.get('Cookie');

	if (!cookies || !parse(cookies).ghToken) {
		console.log('No token, redirecting', cookies);
		throw redirect(303, `${LOCATION}/api/login`);
	}

	if (typeof location !== 'string') {
		throw error(400, 'Location must be string.');
	} else if (typeof description !== 'string' && description !== null) {
		throw error(400, 'Description, if present, must be a string');
	}

	const data = await http
		.post(
			'https://api.github.com/repos/JasonXu314/wafflehacks-travel/issues',
			{ title: location, body: description },
			{ headers: { Authorization: `Bearer ${parse(cookies).ghToken}` } }
		)
		.then((res) => res.data)
		.catch((err) => err.response);
	
	const issueNumber = data.number;
	const label = await http.post(
		`https://api.github.com/repos/JasonXu314/wafflehacks-travel/issues/${issueNumber}/labels`,
		{ labels: [ 'Destination' ] },
		{ headers: { Authorization: `Bearer ${parse(cookies).ghToken}` } }
	);

	console.log(data);

	throw redirect(303, LOCATION);
};

