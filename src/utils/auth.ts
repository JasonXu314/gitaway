import { LOCATION } from '$env/static/private';
import { redirect } from '@sveltejs/kit';
import { parse } from 'cookie';

export interface AuthInfo {
	token: string;
	username: string;
}

export function tryGetAuth(request: Request): AuthInfo {
	const cookies = request.headers.get('Cookie');

	if (!cookies || !parse(cookies).ghToken || !parse(cookies).ghName) {
		console.log('No token, redirecting', cookies);
		throw redirect(303, `${LOCATION}/api/login`);
	}

	return {
		token: parse(cookies).ghToken,
		username: parse(cookies).ghName
	};
}

