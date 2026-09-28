// Lectura del formato viejo de las sesiones ("12-10-8", "50-55", "90s"): cada usuario pudo
// haber tipeado distinto, y el historial se tiene que leer igual sin perder el orden.
const test = require('node:test');
const assert = require('node:assert/strict');
const { loadApp } = require('./helpers/load-app');

const app = loadApp();
const parseRepsList = app('parseRepsList');
const parseWeightList = app('parseWeightList');
const parsePauseList = app('parsePauseList');
const setsFromLegacy = app('setsFromLegacy');
const legacyStringsFromSets = app('legacyStringsFromSets');
const plain = v => JSON.parse(JSON.stringify(v)); // objetos del contexto de la app -> de este

test('reps: cualquier separador da la misma lista, en orden', () => {
    for (const input of ['12-10-8', '12,10,8', '12 10 8', '12/10/8', '12; 10; 8']) {
        assert.deepEqual(plain(parseRepsList(input)), [12, 10, 8], input);
    }
    assert.deepEqual(plain(parseRepsList('4x12')), [12, 12, 12, 12]);
    assert.deepEqual(plain(parseRepsList('alta')), []);
    assert.deepEqual(plain(parseRepsList('')), []);
});

test('pesos: guion separa series; coma o punto es decimal', () => {
    assert.deepEqual(plain(parseWeightList('50-55-60', '12-10-8')), [50, 55, 60]);
    assert.deepEqual(plain(parseWeightList('22,5-25', '12-10')), [22.5, 25]);
    assert.deepEqual(plain(parseWeightList('22.5-25', '12-10')), [22.5, 25]);
    assert.deepEqual(plain(parseWeightList('50kg', '12')), [50]);
    assert.deepEqual(plain(parseWeightList('50 55 60', '12-10-8')), [50, 55, 60]);
    assert.deepEqual(plain(parseWeightList('50;55', '12-10')), [50, 55]);
});

test('pesos: caso ambiguo "50,55" se decide con la cantidad de series', () => {
    assert.deepEqual(plain(parseWeightList('50,55', '12-10')), [50, 55], '2 series y números parecidos: dos series');
    assert.deepEqual(plain(parseWeightList('22,5', '12-10')), [22.5], 'un solo decimal: 22,5 kg');
    assert.deepEqual(plain(parseWeightList('50,55', '12')), [50.55], 'una sola serie: decimal');
    assert.deepEqual(plain(parseWeightList('50,55,60', '12-10-8')), [50, 55, 60], 'varias comas: lista');
});

test('pausas en segundos, con distintas formas de escribirlas', () => {
    assert.deepEqual(plain(parsePauseList('90-90-120')), [90, 90, 120]);
    assert.deepEqual(plain(parsePauseList('90s')), [90]);
    assert.deepEqual(plain(parsePauseList('1:30')), [90]);
    assert.deepEqual(plain(parsePauseList('2m')), [120]);
    assert.deepEqual(plain(parsePauseList('90, 60')), [90, 60]);
});

test('formato viejo -> series: si hay menos pesos que reps, se repite el último', () => {
    const sets = plain(setsFromLegacy({ reps: '12-10-8', weight: '50-55', pause: '90' }, 'kg'));
    assert.deepEqual(sets.map(s => s.kg), ['50', '55', '55']);
    assert.deepEqual(sets.map(s => s.reps), ['12', '10', '8']);
});

test('formato viejo -> series de cardio: "1-1" con peso 9 son 2 vueltas de 9 km', () => {
    const sets = plain(setsFromLegacy({ reps: '1-1', weight: '9', pause: '' }, 'km'));
    assert.equal(sets.length, 2);
    assert.deepEqual(sets.map(s => s.km), ['9', '9']);
});

test('series -> formato viejo: el calentamiento no cuenta y el orden se respeta', () => {
    const out = plain(legacyStringsFromSets([
        { reps: '15', kg: '20', warmup: true },
        { reps: '12', kg: '50', rest: '90' },
        { reps: '10', kg: '55', rest: '90' }
    ], 'kg'));
    assert.deepEqual(out, { reps: '12-10', weight: '50-55', pause: '90-90' });
});
