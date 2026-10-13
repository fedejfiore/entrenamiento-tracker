// Carga módulos de la app (ES) en un contexto aislado de Node para probarlos sin navegador.
// Se arman con esbuild (cada módulo con lo que importa) y lo que exportan queda a mano con
// app('nombre') o en expresiones: app('(a) => new Store(a, STORAGE_SCHEMA)'). Los valores
// son vivos: si un módulo reasigna una variable exportada, app() ve el valor nuevo.
// Solo se cargan las capas sin pantalla (core, data, domain): se prueban sin navegador.
const vm = require('node:vm');
const path = require('node:path');
const esbuild = require('esbuild');

const ROOT = path.resolve(__dirname, '..', '..');

const CORE_FILES = [
    'js/core/errors.js',
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

const bundles = new Map(); // mismo conjunto de archivos → mismo código armado (más rápido)

function bundle(files) {
    const key = files.join('|');
    if (!bundles.has(key)) {
        const entry = files.map((f, i) => `import * as m${i} from './${f}';`).join('\n')
            + `\nglobalThis.__modules = [${files.map((_, i) => `m${i}`).join(', ')}];`;
        const out = esbuild.buildSync({ stdin: { contents: entry, resolveDir: ROOT, loader: 'js' }, bundle: true, format: 'iife', write: false, logLevel: 'silent' });
        bundles.set(key, out.outputFiles[0].text);
    }
    return bundles.get(key);
}

/**
 * Devuelve una función `app(expr)` que evalúa una expresión con lo que exportan los módulos,
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
        TextDecoder,
        URL,
        URLSearchParams
    });
    vm.runInContext(bundle(files), context, { filename: 'app-bundle.js' });
    // Cada export, como propiedad viva del contexto (un getter al módulo que lo exporta).
    vm.runInContext(`(() => {
        for (const m of globalThis.__modules) {
            for (const name of Object.keys(m)) {
                if (name in globalThis) continue;
                Object.defineProperty(globalThis, name, { get: () => m[name], enumerable: true });
            }
        }
    })()`, context);
    return expr => vm.runInContext(expr, context);
}

module.exports = { loadApp, ROOT, CORE_FILES };
