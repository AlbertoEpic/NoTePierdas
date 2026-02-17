import { planetData } from '../data/planets';

type MaybeRecord = Record<string, unknown>;

export type Planet = {
	slug: string;
	name: string;
	image: string;
	description: string;
	tone: string;
	orbit: string;
	size: string;
};

const defaultPlanet: Planet = {
	slug: 'planeta-alquezar',
	name: 'Planeta',
	image: '/planets/Planeta_Alquézar.jpg',
	description: 'Mini planeta en exploración.',
	tone: 'Registro nuevo',
	orbit: 'Órbita en estudio',
	size: 'Variable',
};

function asRecord(value: unknown): MaybeRecord | null {
	if (!value || typeof value !== 'object' || Array.isArray(value)) {
		return null;
	}
	return value as MaybeRecord;
}

function asString(value: unknown): string | null {
	if (typeof value !== 'string') {
		return null;
	}
	const trimmed = value.trim();
	return trimmed.length > 0 ? trimmed : null;
}

function pickString(...values: unknown[]): string | null {
	for (const value of values) {
		const current = asString(value);
		if (current) {
			return current;
		}
	}
	return null;
}

function toAbsoluteUrl(url: string, baseUrl: string): string {
	if (/^https?:\/\//i.test(url)) {
		return url;
	}
	try {
		return new URL(url, baseUrl).toString();
	} catch {
		return url;
	}
}

function extractImageUrl(imageValue: unknown): string | null {
	if (typeof imageValue === 'string') {
		return imageValue;
	}

	if (Array.isArray(imageValue) && imageValue.length > 0) {
		return extractImageUrl(imageValue[0]);
	}

	const imageRecord = asRecord(imageValue);
	if (!imageRecord) {
		return null;
	}

	const directUrl = pickString(imageRecord.url);
	if (directUrl) {
		return directUrl;
	}

	const dataValue = imageRecord.data;
	if (dataValue) {
		if (Array.isArray(dataValue) && dataValue.length > 0) {
			for (const item of dataValue) {
				const nested = asRecord(item);
				const nestedUrl =
					extractImageUrl(nested?.attributes) ?? extractImageUrl(nested);
				if (nestedUrl) {
					return nestedUrl;
				}
			}
		}

		const singleData = asRecord(dataValue);
		if (singleData) {
			return extractImageUrl(singleData.attributes) ?? extractImageUrl(singleData);
		}
	}

	return null;
}

function normalizePlanet(entry: unknown, baseUrl: string): Planet | null {
	const raw = asRecord(entry);
	if (!raw) {
		return null;
	}

	const attrs = asRecord(raw.attributes) ?? raw;
	const slug = pickString(attrs.slug, attrs.uid, attrs.documentId);
	const name = pickString(attrs.name, attrs.title);
	if (!slug || !name) {
		return null;
	}

	const imageRaw =
		pickString(attrs.imageUrl, attrs.imageURL, attrs.image_url) ??
		extractImageUrl(attrs.image) ??
		extractImageUrl(attrs.cover) ??
		extractImageUrl(attrs.photo) ??
		defaultPlanet.image;

	return {
		slug,
		name,
		image: toAbsoluteUrl(imageRaw, baseUrl),
		description: pickString(attrs.description, attrs.summary, attrs.excerpt) ?? defaultPlanet.description,
		tone: pickString(attrs.tone, attrs.colorTone, attrs.color) ?? defaultPlanet.tone,
		orbit: pickString(attrs.orbit, attrs.orbitLabel) ?? defaultPlanet.orbit,
		size: pickString(attrs.size, attrs.scale) ?? defaultPlanet.size,
	};
}

function getFallbackPlanets(): Planet[] {
	return planetData as Planet[];
}

export async function getPlanets(): Promise<Planet[]> {
	const strapiUrl = (import.meta.env.STRAPI_URL || '').trim();
	if (!strapiUrl) {
		return getFallbackPlanets();
	}

	const endpoint = (import.meta.env.STRAPI_PLANETS_ENDPOINT || '/api/planets?populate=*').trim();
	const token = (import.meta.env.STRAPI_TOKEN || '').trim();

	const normalizedBase = strapiUrl.replace(/\/$/, '');
	const normalizedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
	const requestUrl = `${normalizedBase}${normalizedEndpoint}`;

	const headers: Record<string, string> = {};
	if (token) {
		headers.Authorization = `Bearer ${token}`;
	}

	try {
		const response = await fetch(requestUrl, { headers });
		if (!response.ok) {
			throw new Error(`Strapi respondió ${response.status}`);
		}

		const payload = (await response.json()) as { data?: unknown };
		const items = Array.isArray(payload.data) ? payload.data : [];
		const planets = items
			.map((item) => normalizePlanet(item, normalizedBase))
			.filter((planet): planet is Planet => planet !== null);

		if (planets.length === 0) {
			return getFallbackPlanets();
		}

		return planets;
	} catch (error) {
		console.warn('[MINIPLANETAS] Error al cargar Strapi. Usando fallback local.', error);
		return getFallbackPlanets();
	}
}