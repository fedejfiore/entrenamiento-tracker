// Funciones activables: modo simple, activar y desactivar, dependencias y guardado.
const test = require('node:test');
const assert = require('node:assert/strict');
const { loadApp } = require('./helpers/load-app');

const app = loadApp(['js/core/errors.js', 'js/core/feature-registry.js']);
const FeatureRegistry = app('FeatureRegistry');
const DEFS = app('FEATURE_DEFINITIONS');
const GROUPS = app('FEATURE_GROUPS');

function registry(saved = null) {
    let stored = saved;
    const r = new FeatureRegistry(DEFS, { load: () => stored, save: s => { stored = JSON.parse(JSON.stringify(s)); } });
    return { r, stored: () => stored };
}

test('arranca en modo simple: solo lo marcado como simple', () => {
    const { r } = registry();
    assert.equal(r.state.mode, 'simple');
    assert.equal(r.isOn('restColumn'), true, 'el descanso por serie viene de base');
    assert.equal(r.isOn('garden'), true, 'la flor se ve');
    assert.equal(r.isOn('effort'), false);
    assert.equal(r.isOn('muscleMap'), false);
    assert.equal(r.isOn('noExiste'), true, 'lo que no es activable siempre se ve');
});

test('activar y desactivar se guarda y pasa a modo personalizado', () => {
    const { r, stored } = registry();
    r.set('effort', true);
    assert.equal(r.isOn('effort'), true);
    assert.equal(stored().mode, 'custom');
    assert.equal(stored().on.effort, true);
    r.set('restColumn', false);
    assert.equal(r.isOn('restColumn'), false);
});

test('dependencias: grabaciones necesita la voz', () => {
    const { r } = registry();
    r.set('recordings', true);
    assert.equal(r.isOn('voice'), true, 'activar grabaciones activa la voz');
    r.set('voice', false);
    assert.equal(r.isOn('recordings'), false, 'apagar la voz apaga las grabaciones');
});

test('volver a simple y activar todo', () => {
    const { r } = registry();
    r.useAll();
    assert.equal(r.inactiveIds().length, 0);
    r.useSimple();
    assert.deepEqual([...r.activeIds()].sort(), ['garden', 'restColumn']);
});

test('lo guardado roto o de otra versión se completa con los valores por defecto', () => {
    const { r } = registry({ mode: 'raro', on: { effort: true, inventada: true, muscleMap: 'si' } });
    assert.equal(r.state.mode, 'simple');
    assert.equal(r.isOn('effort'), true);
    assert.equal(r.isOn('muscleMap'), false, 'un valor que no es booleano no cuenta');
    assert.equal('inventada' in r.state.on, false);
});

test('grupos: todos los grupos tienen funciones y cada función tiene un grupo válido', () => {
    const groups = new Set([...GROUPS].map(g => g[0]));
    DEFS.forEach(d => assert.ok(groups.has(d.group), d.id));
    groups.forEach(g => assert.ok(DEFS.some(d => d.group === g), g));
    const { r } = registry();
    r.setGroup('progress', true);
    assert.equal(r.isOn('muscleMap') && r.isOn('body') && r.isOn('stall'), true);
});

test('un error en quien escucha los cambios no rompe el guardado', () => {
    const { r, stored } = registry();
    r.onChange(() => { throw new Error('pantalla rota'); });
    assert.doesNotThrow(() => r.set('effort', true));
    assert.equal(stored().on.effort, true);
});

test('CSS: una regla por función apagada', () => {
    const css = FeatureRegistry.css(['rir', 'tabata']);
    assert.match(css, /html\[data-features-off~="rir"\] \[data-feature~="rir"\]/);
    assert.match(css, /display: none !important/);
});
