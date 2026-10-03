// Arma la carpeta www/ que va dentro de la app nativa (Capacitor): solo lo que la app necesita
// para funcionar, optimizado (ver scripts/build.js). Nada de documentos, backups ni pruebas.
// Uso: node scripts/build-www.js
const { build } = require('./build');

// En la web, index.html es la página de presentación; dentro de la app nativa se abre
// directamente la app (y los links "volver" de los textos legales llevan a ella).
build('www', {
    indexHtml: `<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="refresh" content="0; url=./entrenamiento_trackerv2.html">
    <title>Esō Agōn</title>
</head>
<body></body>
</html>
`
});
