// Pilates: resortes, Mi reformer, sugerencias y récords según el sentido de dificultad.
const test = require('node:test');
const assert = require('node:assert/strict');
const { loadApp, CORE_FILES } = require('./helpers/load-app');

const app = loadApp([...CORE_FILES, 'js/domain/pilates.js']);
const parseSprings = app('parseSprings');
const springsLoad = app('springsLoad');
const suggestSprings = app('suggestSprings');
const normalizeReformer = app('normalizeReformer');
const detectPilatesPRs = app('detectPilatesPRs');
const updatePilatesStats = app('updatePilatesStats');
const bb = { brand: 'bb', springs: [{ color: '🔴', load: 100, count: 3 }, { color: '🔵', load: 50, count: 1 }, { color: '🟡', load: 25, count: 1 }] };

test('los resortes se leen como colores, y un color se puede repetir', () => {
    assert.deepEqual([...parseSprings('🔴🔴🔵')], ['🔴', '🔴', '🔵']);
    assert.deepEqual([...parseSprings('🔴 x 🔴️')], ['🔴', '🔴'], 'ignora lo que no es un color');
    assert.equal(springsLoad('🔴🔴🔵', bb), 250);
    assert.equal(springsLoad('⚫', bb), 0, 'un color que no está en Mi reformer no suma');
});

test('Mi reformer: sin datos o con datos rotos vuelve a Balanced Body; los colores no se duplican', () => {
    assert.equal(normalizeReformer(null).brand, 'bb');
    assert.equal(normalizeReformer({ springs: [{ color: 'x' }] }).brand, 'bb');
    const r = normalizeReformer({ brand: 'otro', springs: [{ color: '🔴', load: 100, count: 2 }, { color: '🔴', load: 50, count: 1 }] });
    assert.equal(r.springs.length, 1);
    assert.equal(r.springs[0].count, 2);
});

test('sugerir resortes: la combinación más cercana con los que tiene la máquina', () => {
    assert.equal(suggestSprings(100, bb), '🔴');
    assert.equal(suggestSprings(300, bb), '🔴🔴🔴');
    assert.equal(suggestSprings(150, bb), '🔴🔵');
    assert.equal(suggestSprings(400, bb), '🔴🔴🔴🔵🟡', 'sin pasarse de los 3 rojos que tiene');
    assert.equal(suggestSprings(0, bb), '');
});

function statsAfter(sessions, type, name) {
    const st = {};
    sessions.forEach(sets => updatePilatesStats(st, sets, type, name, bb));
    return st;
}

test('récord con más resortes cuando más es más difícil (por defecto)', () => {
    const prev = statsAfter([[{ reps: '10', springs: '🔴🔴' }]], 'springs', 'Footwork X');
    const prs = detectPilatesPRs({ name: 'Footwork X', type: 'springs', sets: [{ reps: '10', springs: '🔴🔴🔴' }] }, prev, bb);
    assert.equal(prs.length, 1);
    assert.match(prs[0], /🔴🔴🔴 × 10/);
    const none = detectPilatesPRs({ name: 'Footwork X', type: 'springs', sets: [{ reps: '10', springs: '🔴' }] }, prev, bb);
    assert.equal(none.length, 0, 'con menos resorte y las mismas reps no es récord');
});

test('mismos resortes y más reps es récord; dominar por primera vez también', () => {
    const prev = statsAfter([[{ reps: '8', springs: '🔴', effort: 'controlado' }]], 'springs', 'Y');
    const prs = detectPilatesPRs({ name: 'Y', type: 'springs', sets: [{ reps: '10', springs: '🔴', effort: 'dominado' }] }, prev, bb);
    assert.equal(prs.length, 2);
    const again = statsAfter([[{ reps: '8', springs: '🔴', effort: 'dominado' }]], 'springs', 'Y');
    assert.equal(detectPilatesPRs({ name: 'Y', type: 'springs', sets: [{ reps: '8', springs: '🔴', effort: 'dominado' }] }, again, bb).length, 0, 'dominarlo otra vez no es récord');
});

test('pilates de mat (solo reps): más reps es récord', () => {
    const prev = statsAfter([[{ reps: '6' }]], 'pilates', 'Z');
    assert.equal(detectPilatesPRs({ name: 'Z', type: 'pilates', sets: [{ reps: '8' }] }, prev, bb).length, 1);
    assert.equal(detectPilatesPRs({ name: 'Z', type: 'pilates', sets: [{ reps: '5' }] }, prev, bb).length, 0);
});
