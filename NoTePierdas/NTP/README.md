# 🗺️ Mi Bitácora de Rutas GPS

Bienvenido a mi colección personal de tracks. He creado este proyecto para visualizar mis aventuras de senderismo, ciclismo y trail running de una forma interactiva, utilizando herramientas de código abierto.

[🌐 Ver la web en vivo](https://TU-USUARIO.github.io/TU-REPOSITORIO/)

## 🚀 Características
- **Mapa Interactivo:** Visualización de múltiples rutas simultáneamente sobre OpenStreetMap.
- **Perfiles de Elevación:** Gráficos dinámicos que muestran el desnivel de cada track en tiempo real.
- **Estadísticas Globales:** Contador acumulado de kilómetros y desnivel total.
- **Filtros por Actividad:** Clasificación por colores (Bici, Senderismo, Running).

## 🛠️ Tecnología utilizada
Para construir este "Wikiloc personal" he utilizado:
* [Leaflet.js](https://leafletjs.com/) - Para el motor de mapas.
* [Leaflet-GPX](https://github.com/mpetazzoni/leaflet-gpx) - Para analizar los archivos XML de los tracks.
* [Leaflet-Elevation](https://github.com/Raruto/leaflet-elevation) - Para los perfiles de altitud.
* **GitHub Pages** - Para el alojamiento gratuito.

## 📂 Cómo añadir nuevas rutas
Si quieres replicar este proyecto o eres yo mismo en el futuro:
1. Saca el archivo `.gpx` de tu reloj o GPS.
2. Guárdalo en la carpeta `/rutas`.
3. Añade la entrada correspondiente en el array `misRutas` dentro de `index.html`:
   ```javascript
   { nombre: "Nueva Aventura", archivo: "rutas/mi-track.gpx", tipo: "senderismo" }