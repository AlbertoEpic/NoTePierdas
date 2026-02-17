# MINIPLANETAS - SQLP

Landing page para el proyecto MINIPLANETAS con diseno visual y animaciones suaves.

## Integracion con Strapi

La web ya puede leer planetas desde Strapi y, si falla la conexion o no hay datos, usa automaticamente `src/data/planets.js` como fallback.

1. Crea un archivo `.env` en `MINIPLANETAS/` usando `.env.example`.
2. Configura:
	- `STRAPI_URL` (por ejemplo `http://localhost:1337`)
	- `STRAPI_TOKEN` (opcional, recomendado si la coleccion no es publica)
	- `STRAPI_PLANETS_ENDPOINT` (por defecto `/api/planets?populate=*`)
3. Reinicia `npm run dev` o vuelve a ejecutar `npm run build`.

Campos esperados por planeta en Strapi (acepta variantes):
- `slug`
- `name` (o `title`)
- `image` (media de Strapi o URL)
- `imageUrl` (alternativa en texto para carga rapida)
- `description`
- `tone`
- `orbit`
- `size`

## Esquema recomendado en Strapi

Content-Type: `planet` (Collection Type)

Campos (exactos recomendados):
- `name` -> Text (Short text), Required
- `slug` -> UID (attached to `name`), Required, Unique
- `description` -> Text (Long text), Required
- `tone` -> Text (Short text), Required
- `orbit` -> Text (Short text), Required
- `size` -> Enumeration (`Compacto`, `Denso`, `Ligero`, `Dual`, `Extenso`, `Sereno`, `Variable`)
- `image` -> Media (Single media), Required

Opcionales utiles:
- `order` -> Number (integer) para ordenar la galeria
- `publishedAt` -> (Draft & Publish activado)

Permisos y API:
1. En `Settings -> Users & Permissions -> Roles -> Public`, habilita `find` y `findOne` para `planet`.
2. Si no quieres API publica, usa token y rellena `STRAPI_TOKEN` en `.env`.
3. Endpoint recomendado:
	- `STRAPI_PLANETS_ENDPOINT=/api/planets?populate=*&sort=order:asc,name:asc`

Ejemplo de URL final:
- `http://localhost:1337/api/planets?populate=*&sort=order:asc,name:asc`

## Checklist rapido (3 minutos)

1. Abre Strapi Admin (`/admin`) y entra en **Content-Type Builder**.
2. Crea un **Collection Type** llamado `planet`.
3. Añade campos en este orden:
	- `name` (Short text, required)
	- `slug` (UID basado en `name`, required, unique)
	- `description` (Long text, required)
	- `tone` (Short text, required)
	- `orbit` (Short text, required)
	- `size` (Enumeration: `Compacto`, `Denso`, `Ligero`, `Dual`, `Extenso`, `Sereno`, `Variable`)
	- `image` (Media, single, required)
	- `order` (Number integer, opcional)
4. Guarda y deja **Draft & Publish** activado.
5. Ve a **Settings -> Users & Permissions -> Roles -> Public** y activa `find` + `findOne` para `planet`.
6. Crea 2-3 planetas en **Content Manager** y publícalos.
7. En `MINIPLANETAS/.env` configura:
	- `STRAPI_URL=http://localhost:1337`
	- `STRAPI_PLANETS_ENDPOINT=/api/planets?populate=*&sort=order:asc,name:asc`
	- `STRAPI_TOKEN=` (rellena solo si no usas permisos públicos)
8. Reinicia `npm run dev` y comprueba que la portada carga los planetas desde Strapi.

## Dataset JSON de ejemplo

Archivo incluido: `strapi/planets.seed.json`

Importacion en 1 comando:

1. Configura `STRAPI_URL` en `.env`.
2. Ejecuta:

```bash
npm run seed:strapi
```

Comportamiento del seed:
- Hace `upsert` por `slug` (si existe, actualiza; si no existe, crea).
- Evita duplicados al ejecutar el comando varias veces.

Variables opcionales para el script:
- `STRAPI_TOKEN` (si la API no es publica)
- `STRAPI_SEED_FILE` (por defecto `strapi/planets.seed.json`)

Uso rapido por API REST (PowerShell):

1. Asegura que en Strapi el campo `image` no sea obligatorio, o añade tambien un campo `imageUrl` (Short text).
2. Importa con este comando desde `MINIPLANETAS/`:

```powershell
$baseUrl = "http://localhost:1337"
$token = "TU_TOKEN_OPCIONAL"
$items = Get-Content .\strapi\planets.seed.json | ConvertFrom-Json

$headers = @{ "Content-Type" = "application/json" }
if ($token) { $headers["Authorization"] = "Bearer $token" }

foreach ($item in $items) {
	$body = @{ data = $item } | ConvertTo-Json -Depth 6
	Invoke-RestMethod -Method Post -Uri "$baseUrl/api/planets" -Headers $headers -Body $body
}
```

3. Si usas media real de Strapi (`image`), sube las imágenes en Media Library y asígnalas después a cada planeta.

## Comandos

| Comando         | Accion                                   |
| :-------------- | :---------------------------------------- |
| `npm install`   | Instala dependencias                     |
| `npm run dev`   | Inicia el servidor local                 |
| `npm run build` | Genera la version estatica en `dist/`    |
| `npm run preview` | Previsualiza el build localmente      |

## Notas

- Edita la portada en `src/pages/index.astro`.
- Los assets estaticos van en `public/`.
