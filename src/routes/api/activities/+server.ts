import { GITHUB_PAT, LOCATION } from '$env/static/private';
import { error, json, redirect, type RequestHandler } from '@sveltejs/kit';
import type { AxiosError } from 'axios';
import { tryGetAuth } from 'utils/auth';
import type { PullRequest, Ref, Repository } from '../../../app';
import { http } from '../../../utils/http';

export const GET: RequestHandler = async ({ url }) => {
	const location = url.searchParams.get('location'),
		type = url.searchParams.get('as');

	const activities = await http
		.get<PullRequest[]>(`https://api.github.com/repos/JasonXu314/journeyhub/${type === 'issue' ? 'issues' : 'pulls?state=open'}`, {
			headers: {
				Authorization: `Bearer ${GITHUB_PAT}`
			}
		})
		.then((res) => res.data)
		.catch<PullRequest[]>((err) => err.response);

	return json(location ? activities.filter((activity) => activity.title.split(' in ')[1] === location) : activities);
};

// TODO: this endpoint dont giv a fuck about validation lul
export const POST: RequestHandler = async ({ request, url }) => {
	const body = await request.formData();
	const returnURL = url.searchParams.get('returnTo');
	const location = body.get('location') as string,
		event = body.get('event') as string,
		date = body.get('date') as string,
		locationId = body.get('locationId');
	const parsedDate = new Date(date);

	if (Number.isNaN(parsedDate.valueOf())) {
		throw error(400, { message: 'Invalid date.' });
	}

	const { token, username } = tryGetAuth(request);

	const existingFork = await http
		.get<Repository>(`https://api.github.com/repos/${username}/journeyhub`, { headers: { Authorization: `Bearer ${token}` } })
		.then((res) => res.data)
		.catch((err: AxiosError) => {
			if (err.response?.status === 404) {
				return null;
			}
			console.error(err.response);
		});

	const forkData =
		existingFork && existingFork.fork && existingFork.parent!.full_name === 'JasonXu314/journeyhub'
			? existingFork
			: await http
					.post<Repository>(
						'https://api.github.com/repos/JasonXu314/journeyhub/forks',
						{ default_branch_only: true },
						{ headers: { Authorization: `Bearer ${token}` } }
					)
					.then((res) => res.data)
					.catch<Repository>((err) => err.response);
	console.log(forkData);
	const fullEventName = `${date.replaceAll('/', '-')}_${location}_${event}`;
	const normalizedEventName = fullEventName.replaceAll(' ', '_');
	const master = await http
		.get<Ref>(`https://api.github.com/repos/${username}/journeyhub/git/ref/heads/master`, { headers: { Authorization: `Bearer ${token}` } })
		.then((res) => res.data)
		.catch<Ref>((err) => err.response);
	console.log(master);
	await http
		.post(
			`https://api.github.com/repos/${username}/journeyhub/git/refs`,
			{
				ref: `refs/heads/${normalizedEventName}`,
				sha: master.object.sha
			},
			{ headers: { Authorization: `Bearer ${token}` } }
		)
		.then((res) => res.data)
		.catch((err) => err.response);
	await http.put(
		`https://api.github.com/repos/${username}/journeyhub/contents/${normalizedEventName}.md`,
		{
			message: `Creating event ${event} in ${location}`,
			content: btoa(`# ${event}\n## In ${location}, on ${date}`),
			branch: normalizedEventName
		},
		{ headers: { Authorization: `Bearer ${token}` } }
	);

	const pullData = await http
		.post<PullRequest>(
			`https://api.github.com/repos/JasonXu314/journeyhub/pulls`,
			{
				title: `${event} in ${location}`,
				head: normalizedEventName,
				repo: `${username}/journeyhub`,
				base: 'master',
				body: `${event} in ${location} (#${locationId}) on ${date}!`
			},
			{ headers: { Authorization: `Bearer ${token}` } }
		)
		.then((res) => res.data)
		.catch<PullRequest>((err) => err.response);

	const mergeDate = new Date(parsedDate.valueOf() + 1000 * 60 * 60 * 12);

	await http.post(`https://journeyhub-scanner.jasonxu.dev/track?id=${pullData.number}`, { date: mergeDate.toISOString() });

	const labels = ['🎡 Activity'];

	if (body.get('wheelchair') === 'on') {
		labels.push('♿ Accessible');
	}
	if (body.get('cash') === 'on') {
		labels.push('💵 Cash Only');
	}
	if (body.get('children') === 'on') {
		labels.push('🧒 Child Friendly');
	}

	switch (body.get('cost')) {
		case 'inexpensive':
			labels.push('💲 Inexpensive');
			break;
		case 'moderate':
			labels.push('💳 Moderate Cost');
			break;
		case 'expensive':
			labels.push('💰 Expensive');
			break;
	}

	switch (body.get('exertion')) {
		case 'low':
			labels.push('🚶 Low Exertion');
			break;
		case 'medium':
			labels.push('🚴‍♂️ Medium Exertion');
			break;
		case 'high':
			labels.push('🏔️ High Exertion');
			break;
	}

	const issueNumber = pullData.number;
	await http.post(
		`https://api.github.com/repos/JasonXu314/journeyhub/issues/${issueNumber}/labels`,
		{ labels },
		{ headers: { Authorization: `Bearer ${token}` } }
	);

	throw redirect(303, returnURL || LOCATION);
};

