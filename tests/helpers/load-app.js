// Carga los scripts clásicos de la app en un contexto aislado de Node, igual que el
// navegador: comparten el ámbito global, así las clases y funciones se ven entre sí.
// Solo se cargan las capas sin pantalla (core, data, domain): se prueban sin navegador.
const vm = require('node:vm');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..', '..');

const CORE_FILES = [
    'js/core/utils.js',
    'js/core/time.js',
    'js/core/units.js',
    'js/data/store.js',
    'js/data/schema.js',
    'js/domain/catalog.js',
    'js/domain/legacy-format.js',
    'js/domain/sets.js',
    'js/domain/models.js',
    'js/data/migrations.js',
    'js/data/repositories.js',
    'js/data/recording-repository.js',
    'js/data/backup-service.js'
];

/**
 * Devuelve una función `app(expr)` que evalúa una expresión dentro del contexto de la app,
 * por ejemplo app('parseRepsList')('12-10') o app('db').
 */
function loadApp(files = CORE_FILES) {
    const context = vm.createContext({
        console,
        crypto: globalThis.crypto,
        btoa: globalThis.btoa,
        atob: globalThis.atob,
        setTimeout,
        clearTimeout,
        TextEncoder,
        URL,
        URLSearchParams
    });
    files.forEach(file => {
        const code = fs.readFileSync(path.join(ROOT, file), 'utf8');
        vm.runInContext(code, context, { filename: file });
    });
    return expr => vm.runInContext(expr, context);
}

module.exports = { loadApp, ROOT, CORE_FILES };
