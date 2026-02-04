import type { APIRoute } from 'astro';

const REEL_IDS = [
	'DRHlZ4SjXq0',
	'DQ-FNuzDbHZ',
	'DQ8zMa0jZC4',
	'DQwqPV9jfHV',
	'DQqyd7LDVIs',
	'DQo-9V1jdNA',
	'DQjHiwTDRae',
	'DQblzoqDb-3',
	'DQRIReBjQx4',
	'DQJ7So3jC3j',
	'DQHj4zRDMvw',
	'DQCkiQIDftO',
	'DP_29HNDI7-',
	'DP9CL73DEia',
	'DP6cpyODJQ-',
	'DP3pYw9DfvG',
	'DP1-W9HDbEz',
	'DPyfSm-jWFs',
	'DPv4b4Gja2Q',
	'DPrJnQ9DJUC',
	'DPmI9PfDU2q',
	'DPhJ6J9DS7Y',
	'DPdVAY4DWiw',
	'DPWMci4jd86',
	'DPQgylnDQH2',
	'DPMfLGSDThv',
	'DPDhB3yDVZt',
	'DPA-6xTjbD1',
	'DO6cwHKDT2l',
	'DOwKGNBDc6n',
	'DOrC-TsjUVC',
	'DOn0WrGFUdr',
	'DOlx4JrElhz',
	'DOlLlvzDQf_',
	'DOgNtVRjcaB',
	'DOdb3OVE0h2',
	'DOUAdLyCr5e',
	'DORIKZ6jMsx',
	'DOG4OoODQFk',
	'DODW8WYjdXl',
	'DN_Yo6-Ddku',
	'DN8k_haDWTX',
	'DN6DlqhjdVK',
	'DN3LtSPWpiD',
	'DN1MBobWuAn',
	'DNyCedq2my5',
	'DNuf00YRIEN',
	'DNqAw3iN785',
	'DNlo-C7qWoI',
	'DNk3qQtO7QU',
	'DNiS1IytBHy',
	'DNfuGZWovCo',
];

export const getStaticPaths = async () => {
	return REEL_IDS.map((id) => ({ params: { id } }));
};

export const GET: APIRoute = async ({ params, request }) => {
	const id = params.id;
	if (!id) {
		return new Response('Missing reel id', { status: 400 });
	}

	const mediaUrl = `https://www.instagram.com/reel/${id}/media/?size=l`;

	try {
		const response = await fetch(mediaUrl, {
			headers: {
				'User-Agent':
					'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
				Accept: 'image/avif,image/webp,image/apng,image/*,*/*;q=0.8',
			},
		});

		if (!response.ok) {
			return Response.redirect(new URL('/instagram-placeholder.svg', request.url), 302);
		}

		const contentType = response.headers.get('content-type') ?? 'image/jpeg';
		const body = await response.arrayBuffer();
		return new Response(body, {
			status: 200,
			headers: {
				'Content-Type': contentType,
				'Cache-Control': 'public, max-age=86400',
			},
		});
	} catch (error) {
		return Response.redirect(new URL('/instagram-placeholder.svg', request.url), 302);
	}
};
