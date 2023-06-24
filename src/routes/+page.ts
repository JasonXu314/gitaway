import Cookies from 'js-cookie';
import type { PageLoad } from './$types';

export const load: PageLoad = ({ data }) => {
	if (typeof window === 'undefined') {
		return data;
	} else {
		const token = Cookies.get('ghToken'),
			username = Cookies.get('ghName'),
			appInstalled = Cookies.get('ghAppInstalled');

		return {
			loggedIn: token !== undefined && username !== undefined,
			installedApp: !!appInstalled
		};
	}
};

