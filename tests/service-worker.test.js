// El service worker tiene que precargar exactamente los archivos que usa la página, o la
// app no abre sin conexión. Esta prueba falla si se agrega un archivo y se olvida la lista.
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { ROOT } = require('./helpers/load-app');

const html = fs.readFileSync(path.join(ROOT, 'entrenamiento_trackerv2.html'), 'utf8');
const sw = fs.readFileSync(path.join(ROOT, 'service-worker.js'), 'utf8');

const pageAssets = [...html.matchAll(/(?:src|href)="((?:css|js)\/[^"]+)"/g)].map(m => './' + m[1]);
const precached = [...sw.matchAll(/'(\.\/[^']+)'/g)].map(m => m[1]);

test('todo lo que carga la página está en la precarga del service worker', () => {
    const missing = pageAssets.filter(a => !precached.includes(a));
    assert.deepEqual(missing, []);
});

test('todo lo precargado existe en el repo', () => {
    const missing = precached.filter(p => !fs.existsSync(path.join(ROOT, p)));
    assert.deepEqual(missing, []);
});

test('cada archivo JS del repo está incluido en la página', () => {
    const walk = dir => fs.readdirSync(dir, { withFileTypes: true })
        .flatMap(e => e.isDirectory() ? walk(path.join(dir, e.name)) : [path.join(dir, e.name)]);
    const jsFiles = walk(path.join(ROOT, 'js')).map(f => './' + path.relative(ROOT, f).split(path.sep).join('/'));
    // Los diccionarios de idiomas no van en la página: se cargan solo si el idioma no es español.
    const notLoaded = jsFiles.filter(f => !pageAssets.includes(f) && !f.startsWith('./js/i18n/'));
    assert.deepEqual(notLoaded, []);
});
