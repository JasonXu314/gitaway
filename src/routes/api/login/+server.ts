import { GITHUB_APP_ID, LOCATION } from '$env/static/private';
import { redirect, type RequestHandler } from '@sveltejs/kit';
import { parse } from 'cookie';

export const GET: RequestHandler = ({ request }) => {
	const cookies = request.headers.get('Cookie');

	if (cookies && parse(cookies).ghToken) {
		const token = parse(cookies).ghToken;
		console.log(`Existing token: ${token}`);

		throw redirect(303, LOCATION);
	}

	throw redirect(303, `https://github.com/login/oauth/authorize?client_id=${GITHUB_APP_ID}&redirect_uri=${LOCATION}/api/auth`);
};

