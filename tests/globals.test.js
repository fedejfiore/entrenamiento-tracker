// Trinquete de globales: la app todavía son scripts clásicos que comparten el ámbito global
// (ver scripts/globals.js). Sumar una global nueva tiene que ser una decisión: se actualiza el
// registro con npm run globals:update. El objetivo es que la lista se achique, no que crezca.
const test = require('node:test');
const assert = require('node:assert/strict');
const { collectGlobals, loadLedger, diff } = require('../scripts/globals');

test('ningún nombre global se declara en dos archivos', () => {
    assert.deepEqual(collectGlobals().dupes, []);
});

test('las globales coinciden con el registro (scripts/globals.json)', () => {
    const { globals } = collectGlobals();
    const d = diff(globals, loadLedger());
    assert.deepEqual(d.added, [], 'globales nuevas: declaralas dentro de una clase o un módulo, o anotalas con npm run globals:update');
    assert.deepEqual(d.moved, [], 'globales que cambiaron de archivo o de tipo: npm run globals:update');
    assert.deepEqual(d.removed, [], 'globales que ya no existen (¡bien!): npm run globals:update para achicar el registro');
});
