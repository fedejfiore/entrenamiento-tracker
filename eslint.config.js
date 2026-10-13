// Reglas automáticas del código (npm run lint).
//  - La app son scripts clásicos que comparten el ámbito global: los nombres válidos salen del
//    registro scripts/globals.json (ver scripts/globals.js). Un nombre que no existe es un error.
//  - innerHTML / insertAdjacentHTML con datos: lo que se interpola tiene que pasar por escapeHtml
//    (o ser una de las funciones que ya devuelven HTML seguro). Lo que hoy no cumple está anotado
//    en scripts/lint-baseline.json y no puede crecer (ver scripts/lint.js).
const js = require('@eslint/js');
const globals = require('globals');
const noUnsanitized = require('eslint-plugin-no-unsanitized');
const appGlobals = require('./scripts/globals.json');

const appNames = Object.fromEntries(Object.entries(appGlobals).map(([name, g]) => [name, g.kind === 'let' || g.kind === 'var' ? 'writable' : 'readonly']));

module.exports = [
    { ignores: ['dist/**', 'www/**', 'android/**', 'node_modules/**', 'vendor/**', 'js/app.min.js', 'docs/**', 'tools/**', 'control/**'] },
    js.configs.recommended,
    // Las funciones globales se usan desde otros archivos: solo se avisa de lo local sin usar.
    { rules: { 'no-unused-vars': ['error', { vars: 'local', args: 'none', caughtErrors: 'none', ignoreRestSiblings: true }] } },
    {
        files: ['js/**/*.js'],
        plugins: { 'no-unsanitized': noUnsanitized },
        languageOptions: {
            ecmaVersion: 'latest',
            sourceType: 'script',
            globals: { ...globals.browser, ...appNames, Capacitor: 'readonly', Chart: 'readonly' }
        },
        rules: {
            'no-redeclare': ['error', { builtinGlobals: false }],
            'no-empty': ['error', { allowEmptyCatch: true }],
            'no-eval': 'error',
            'no-implied-eval': 'error',
            'no-new-func': 'error',
            'no-unsanitized/method': ['error', { escape: { methods: ['escapeHtml'], taggedTemplates: ['html'] } }],
            'no-unsanitized/property': ['error', { escape: { methods: ['escapeHtml'], taggedTemplates: ['html'] } }]
        }
    },
    {
        files: ['service-worker.js'],
        languageOptions: { ecmaVersion: 'latest', sourceType: 'script', globals: { ...globals.serviceworker } }
    },
    {
        files: ['landing/**/*.js'],
        plugins: { 'no-unsanitized': noUnsanitized },
        languageOptions: { ecmaVersion: 'latest', sourceType: 'script', globals: { ...globals.browser } },
        rules: { 'no-unsanitized/method': 'error', 'no-unsanitized/property': 'error' }
    },
    {
        files: ['scripts/**/*.js', 'tests/**/*.js', 'eslint.config.js', '.tmp_*.js'],
        languageOptions: { ecmaVersion: 'latest', sourceType: 'commonjs', globals: { ...globals.node } }
    },
    {
        // Las pruebas en el navegador corren funciones dentro de la página (page.evaluate).
        files: ['tests/e2e/**/*.js', 'scripts/landing-shots.js'],
        languageOptions: { globals: { ...globals.node, ...globals.browser, ...appNames } }
    },
    {
        files: ['tests/routine-share.test.js'],
        rules: { 'no-control-regex': 'off' }
    }
];
