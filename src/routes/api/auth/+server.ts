import { GITHUB_APP_ID, GITHUB_APP_SECRET, LOCATION } from '$env/static/private';
import { error, redirect, type RequestHandler } from '@sveltejs/kit';
import { parse, serialize } from 'cookie';
import type { GHUser } from '../../../app';
import { http, type AccessTokenResponse } from '../../../utils/http';

// TODO: for some smoother ux maybe could add redirectTo url
export const GET: RequestHandler = async ({ url, request }) => {
	const code = url.searchParams.get('code');
	const cookies = request.headers.get('Cookie');

	if (cookies && parse(cookies).ghToken) {
		const token = parse(cookies).ghToken;
		console.log(`Existing token: ${token}`);

		throw redirect(303, LOCATION);
	}

	if (!code) {
		throw error(400, { message: 'No code found in url; you may have reached this endpoint by mistake.' });
	}

	const data = await http
		.post<AccessTokenResponse>(
			`https://github.com/login/oauth/access_token?client_id=${GITHUB_APP_ID}&client_secret=${GITHUB_APP_SECRET}&code=${code}`,
			undefined,
			{
				headers: { Accept: 'application/json' }
			}
		)
		.then((res) => res.data)
		.catch<AccessTokenResponse>((err) => err.response);

	const userData = await http
		.get<GHUser>('https://api.github.com/user', {
			headers: { Authorization: `Bearer ${data.access_token}` }
		})
		.then((res) => res.data)
		.catch<GHUser>((err) => err.response);

	const headers = new Headers();
	headers.append('Location', LOCATION);
	headers.append('Set-Cookie', serialize('ghToken', data.access_token, { maxAge: data.expires_in, path: '/' }));
	headers.append('Set-Cookie', serialize('ghName', userData.login, { maxAge: data.expires_in, path: '/' }));

	return new Response(undefined, {
		status: 303,
		headers
	});
};

