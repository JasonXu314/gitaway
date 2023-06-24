import { GITHUB_APP_ID, GITHUB_APP_SECRET, LOCATION } from '$env/static/private';
import { error, type RequestHandler } from '@sveltejs/kit';
import { http, type AccessTokenResponse } from '../../../utils/http';

export const GET: RequestHandler = async ({ url }) => {
	const code = url.searchParams.get('code');

	if (!code) {
		throw error(400, { message: 'No code found in url; you may have reached this endpoint by mistake.' });
	}

	const res = await http
		.post<AccessTokenResponse>(
			`https://github.com/login/oauth/access_token?client_id=${GITHUB_APP_ID}&client_secret=${GITHUB_APP_SECRET}&code=${code}`,
			undefined,
			{
				headers: { Accept: 'application/json' }
			}
		)
		.then((res) => res.data)
		.catch<AccessTokenResponse>((err) => err.response);

	console.log(res);

	return new Response(undefined, { status: 303, headers: { Location: LOCATION, 'Set-Cookie': `gh-token: ${res.access_token}` } });
};

