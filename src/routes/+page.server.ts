import { parse } from 'cookie';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = ({ request }) => {
	const header = request.headers.get('Cookie');

	if (!header) {
		return {
			loggedIn: false,
			installedApp: false
		};
	} else {
		const cookies = parse(header);

		return {
			loggedIn: cookies.ghName !== undefined && cookies.ghToken !== undefined,
			installedApp: !!cookies.ghAppInstalled
		};
	}
};

