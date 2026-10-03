// Arma la carpeta dist/ que se publica en GitHub Pages: la página de presentación, la app
// optimizada (ver scripts/build.js) y los textos legales. Uso: node scripts/build-web.js
const { build } = require('./build');

build('dist', { extraFiles: ['index.html'], extraDirs: ['landing'] });
