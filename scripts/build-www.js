// Arma la carpeta www/ que va dentro de la app nativa (Capacitor): solo lo que la app necesita
// para funcionar (la página, el código, los estilos, las fuentes y los íconos). Nada de
// documentos, backups ni pruebas. Uso: node scripts/build-www.js
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const OUT = path.join(ROOT, 'www');
const FILES = ['entrenamiento_trackerv2.html', 'manifest.json', 'service-worker.js', 'icon-192.png', 'icon-512.png', 'icon-512-maskable.png', 'apple-touch-icon.png'];
const DIRS = ['js', 'css', 'fonts', 'vendor', 'legal'];

fs.rmSync(OUT, { recursive: true, force: true });
fs.mkdirSync(OUT, { recursive: true });
FILES.forEach(f => fs.copyFileSync(path.join(ROOT, f), path.join(OUT, f)));
DIRS.forEach(d => fs.cpSync(path.join(ROOT, d), path.join(OUT, d), { recursive: true }));

// En la web, index.html es la página de presentación; dentro de la app nativa se abre
// directamente la app (y los links "volver" de los textos legales llevan a ella).
fs.writeFileSync(path.join(OUT, 'index.html'), `<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="refresh" content="0; url=./entrenamiento_trackerv2.html">
    <title>Esō Agōn</title>
</head>
<body></body>
</html>
`);

const count = dir => fs.readdirSync(dir, { withFileTypes: true }).reduce((n, e) => n + (e.isDirectory() ? count(path.join(dir, e.name)) : 1), 0);
console.log(`www/ listo: ${count(OUT)} archivos`);
