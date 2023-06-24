import { GITHUB_APP_ID, LOCATION } from '$env/static/private';
import { redirect, type RequestHandler } from '@sveltejs/kit';

export const GET: RequestHandler = () => {
	throw redirect(303, `https://github.com/login/oauth/authorize?client_id=${GITHUB_APP_ID}&redirect_uri=${LOCATION}/api/auth`);
};

