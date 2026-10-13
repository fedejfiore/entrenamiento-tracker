// Reglas automáticas del código (npm run lint).
//  - La app son módulos ES: cada archivo importa lo que usa. Un nombre que no se importa ni
//    existe en el navegador es un error (no-undef), y un import no se puede reasignar
//    (no-import-assign): cada módulo cambia su propio estado.
//  - innerHTML / insertAdjacentHTML con datos: lo que se interpola tiene que pasar por escapeHtml
//    o armarse con la plantilla html`…`. Lo que hoy no cumple está anotado en
//    scripts/lint-baseline.json y no puede crecer (ver scripts/lint.js).
const js = require('@eslint/js');
const globals = require('globals');
const noUnsanitized = require('eslint-plugin-no-unsanitized');

const unsanitized = { escape: { methods: ['escapeHtml'], taggedTemplates: ['html'] } };

module.exports = [
    { ignores: ['dist/**', 'www/**', 'android/**', 'node_modules/**', 'vendor/**', 'js/app.min.js', 'docs/**', 'tools/**', 'control/**'] },
    js.configs.recommended,
    { rules: { 'no-unused-vars': ['error', { vars: 'local', args: 'none', caughtErrors: 'none', ignoreRestSiblings: true }] } },
    {
        files: ['js/**/*.js'],
        ignores: ['js/boot.js', 'js/i18n/**'],
        plugins: { 'no-unsanitized': noUnsanitized },
        languageOptions: {
            ecmaVersion: 'latest',
            sourceType: 'module',
            globals: { ...globals.browser, Capacitor: 'readonly', Chart: 'readonly' }
        },
        rules: {
            'no-empty': ['error', { allowEmptyCatch: true }],
            'no-eval': 'error',
            'no-implied-eval': 'error',
            'no-new-func': 'error',
            'no-import-assign': 'error',
            'no-unsanitized/method': ['error', unsanitized],
            'no-unsanitized/property': ['error', unsanitized]
        }
    },
    {
        // Scripts clásicos a propósito: boot.js (en <head>, antes de pintar) y los diccionarios.
        files: ['js/boot.js', 'js/i18n/**/*.js'],
        languageOptions: { ecmaVersion: 'latest', sourceType: 'script', globals: { ...globals.browser, I18N_DICTIONARIES: 'readonly' } },
        rules: { 'no-empty': ['error', { allowEmptyCatch: true }] }
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
        // Las pruebas en el navegador corren funciones dentro de la página (page.evaluate) y
        // usan la app por window.gym.
        files: ['tests/e2e/**/*.js', 'scripts/landing-shots.js'],
        languageOptions: { globals: { ...globals.node, ...globals.browser, gym: 'readonly' } }
    },
    {
        files: ['tests/routine-share.test.js'],
        rules: { 'no-control-regex': 'off' }
    }
];
