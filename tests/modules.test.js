// La app son módulos ES: cada archivo importa lo que usa y exporta lo que usan los demás. Nada
// queda en el ámbito global, salvo tres excepciones a propósito:
//  - window.gym (js/main.js): acceso de solo lectura para las pruebas y para depurar.
//  - I18N_DICTIONARIES (js/core/i18n.js): los diccionarios se cargan aparte (js/i18n/*.js).
//  - __i18nMissing (js/core/i18n.js): solo con ?i18n-debug, lista lo que faltó traducir.
// js/boot.js es un script clásico a propósito: corre en <head>, antes de pintar.
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { ROOT } = require('./helpers/load-app');

const walk = dir => fs.readdirSync(dir, { withFileTypes: true })
    .flatMap(e => (e.isDirectory() ? walk(path.join(dir, e.name)) : [path.join(dir, e.name)]));
const rel = f => path.relative(ROOT, f).split(path.sep).join('/');
const appFiles = walk(path.join(ROOT, 'js')).map(rel)
    .filter(f => f.endsWith('.js') && !f.startsWith('js/i18n/') && f !== 'js/boot.js' && f !== 'js/app.min.js');

test('todos los archivos de la app son módulos ES (importan o exportan)', () => {
    const classic = appFiles.filter(f => !/^\s*(import|export)\s/m.test(fs.readFileSync(path.join(ROOT, f), 'utf8')));
    assert.deepEqual(classic, []);
});

test('ningún módulo crea globales (salvo window.gym en main.js)', () => {
    const offenders = [];
    appFiles.forEach(f => {
        const code = fs.readFileSync(path.join(ROOT, f), 'utf8');
        [...code.matchAll(/\b(?:window|globalThis|self)\.([A-Za-z_$][\w$]*)\s*(?:=(?!=)|\|\|=)/g)].forEach(m => {
            const allowed = (f === 'js/main.js' && m[1] === 'gym') || (f === 'js/core/i18n.js' && ['I18N_DICTIONARIES', '__i18nMissing'].includes(m[1]));
            if (!allowed) offenders.push(`${f}: ${m[1]}`);
        });
    });
    assert.deepEqual(offenders, []);
});

test('main.js importa todos los módulos que no importa nadie más (no quedan archivos sin cargar)', () => {
    const imported = new Set();
    appFiles.forEach(f => {
        const code = fs.readFileSync(path.join(ROOT, f), 'utf8');
        [...code.matchAll(/^\s*(?:import|export)\s[^'"]*?['"](\.{1,2}\/[^'"]+)['"]/gm)]
            .forEach(m => imported.add(path.posix.normalize(path.posix.join(path.posix.dirname(f), m[1]))));
    });
    const orphans = appFiles.filter(f => f !== 'js/main.js' && !imported.has(f));
    assert.deepEqual(orphans, []);
});
