import { readFile } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';

const cwd = process.cwd();

function parseDotEnv(content) {
	const result = {};
	for (const line of content.split(/\r?\n/)) {
		const trimmed = line.trim();
		if (!trimmed || trimmed.startsWith('#')) {
			continue;
		}
		const separatorIndex = trimmed.indexOf('=');
		if (separatorIndex <= 0) {
			continue;
		}
		const key = trimmed.slice(0, separatorIndex).trim();
		let value = trimmed.slice(separatorIndex + 1).trim();
		if (
			(value.startsWith('"') && value.endsWith('"')) ||
			(value.startsWith("'") && value.endsWith("'"))
		) {
			value = value.slice(1, -1);
		}
		result[key] = value;
	}
	return result;
}

async function loadEnvFromDotFile() {
	const envPath = path.join(cwd, '.env');
	try {
		const envContent = await readFile(envPath, 'utf-8');
		const parsed = parseDotEnv(envContent);
		for (const [key, value] of Object.entries(parsed)) {
			if (!(key in process.env)) {
				process.env[key] = value;
			}
		}
	} catch {
		// Si no existe .env, se usan variables del entorno del sistema.
	}
}

async function main() {
	if (process.argv.includes('--help') || process.argv.includes('-h')) {
		console.log('Uso: npm run seed:strapi');
		console.log('Opcional: STRAPI_URL, STRAPI_TOKEN y STRAPI_SEED_FILE en .env');
		console.log('Modo: upsert por slug (crea o actualiza).');
		process.exit(0);
	}

	await loadEnvFromDotFile();

	const strapiUrl = (process.env.STRAPI_URL || '').trim().replace(/\/$/, '');
	if (!strapiUrl) {
		throw new Error('Falta STRAPI_URL. Configúralo en .env o en el entorno.');
	}

	const token = (process.env.STRAPI_TOKEN || '').trim();
	const seedFile = (process.env.STRAPI_SEED_FILE || 'strapi/planets.seed.json').trim();
	const seedPath = path.resolve(cwd, seedFile);

	const raw = await readFile(seedPath, 'utf-8');
	const items = JSON.parse(raw);

	if (!Array.isArray(items) || items.length === 0) {
		throw new Error(`El seed en ${seedFile} no contiene elementos.`);
	}

	const endpoint = `${strapiUrl}/api/planets`;
	const headers = { 'Content-Type': 'application/json' };
	if (token) {
		headers.Authorization = `Bearer ${token}`;
	}

	console.log(`Importando ${items.length} planeta(s) a ${endpoint} (upsert por slug)...`);

	let created = 0;
	let updated = 0;
	let skipped = 0;
	for (const item of items) {
		const slug = item?.slug;
		if (!slug || typeof slug !== 'string') {
			skipped += 1;
			console.warn(`- Omitido (sin slug): ${item?.name || 'registro'}`);
			continue;
		}

		const findUrl = `${endpoint}?filters[slug][$eq]=${encodeURIComponent(slug)}&pagination[limit]=1`;
		const findResponse = await fetch(findUrl, { headers });
		if (!findResponse.ok) {
			const findBody = await findResponse.text();
			console.warn(`- Error buscando ${slug}: ${findResponse.status}`);
			console.warn(findBody);
			continue;
		}

		const findPayload = await findResponse.json();
		const existing = Array.isArray(findPayload?.data) ? findPayload.data[0] : null;

		if (existing?.id) {
			const updateUrl = `${endpoint}/${existing.id}`;
			const updateResponse = await fetch(updateUrl, {
				method: 'PUT',
				headers,
				body: JSON.stringify({ data: item }),
			});

			if (!updateResponse.ok) {
				const body = await updateResponse.text();
				console.warn(`- Error actualizando ${slug}: ${updateResponse.status}`);
				console.warn(body);
				continue;
			}

			updated += 1;
			console.log(`- UPDATE: ${item?.name || slug}`);
			continue;
		}

		const createResponse = await fetch(endpoint, {
			method: 'POST',
			headers,
			body: JSON.stringify({ data: item }),
		});

		if (!createResponse.ok) {
			const body = await createResponse.text();
			console.warn(`- Error creando ${slug}: ${createResponse.status}`);
			console.warn(body);
			continue;
		}

		created += 1;
		console.log(`- CREATE: ${item?.name || slug}`);
	}

	console.log(`Finalizado. Creados: ${created}, Actualizados: ${updated}, Omitidos: ${skipped}, Total: ${items.length}`);
}

main().catch((error) => {
	console.error('[seed:strapi]', error.message);
	process.exit(1);
});
