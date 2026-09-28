// Calculadora de discos, series por músculo y superseries.
const test = require('node:test');
const assert = require('node:assert/strict');
const { loadApp, CORE_FILES } = require('./helpers/load-app');

const app = loadApp([...CORE_FILES, 'js/domain/training-tools.js']);
const calculatePlates = app('calculatePlates');
const muscleSetsByGroup = app('muscleSetsByGroup');
const muscleLevel = app('muscleLevel');
const nextInSuperset = app('nextInSuperset');
const nextSupersetLetter = app('nextSupersetLetter');
const plain = v => JSON.parse(JSON.stringify(v));
const STD = [25, 20, 15, 10, 5, 2.5, 1.25];

test('discos: 100 kg con barra de 20 = 25 + 15 por lado', () => {
    const r = plain(calculatePlates(100, 20, STD));
    assert.deepEqual(r.perSide, [25, 15]);
    assert.equal(r.achieved, 100);
    assert.equal(r.exact, true);
});

test('discos: pesos con decimales', () => {
    assert.deepEqual(plain(calculatePlates(62.5, 20, STD)).perSide, [20, 1.25]);
    assert.deepEqual(plain(calculatePlates(47.5, 20, STD)).perSide, [10, 2.5, 1.25]);
});

test('discos: encuentra combinación aunque falten discos (no solo "el más grande")', () => {
    // Sin el de 25: 40 por lado = 20 + 20
    assert.deepEqual(plain(calculatePlates(100, 20, [20, 15, 10])).perSide, [20, 20]);
    // Solo 15 y 10: 20 por lado = 10 + 10 (empezar por el de 15 no llega)
    assert.deepEqual(plain(calculatePlates(60, 20, [15, 10])).perSide, [10, 10]);
});

test('discos: si no se puede exacto, el más cercano por debajo y por encima', () => {
    const r = plain(calculatePlates(61, 20, STD));
    assert.equal(r.exact, false);
    assert.equal(r.below, 60);
    assert.equal(r.above, 62.5);
});

test('discos: peso menor que la barra y sin barra', () => {
    assert.equal(plain(calculatePlates(15, 20, STD)).belowBar, true);
    assert.deepEqual(plain(calculatePlates(50, 0, STD)).perSide, [25]);
});

test('series por músculo: sin calentamiento, formato viejo y nuevo, dentro del período', () => {
    const workouts = [
        { date: '2026-09-22', exercises: [
            { name: 'Press de pecho', sets: [{ reps: '15', warmup: true }, { reps: '10' }, { reps: '8' }] },
            { name: 'Remo', reps: '12-12-12', weight: '40' }
        ] },
        { date: '2026-09-24', exercises: [{ name: 'Press de pecho', reps: '10-10', weight: '50' }] },
        { date: '2026-09-01', exercises: [{ name: 'Press de pecho', reps: '10-10-10' }] },
        { date: '2026-09-23', deletedAt: 'x', exercises: [{ name: 'Press de pecho', reps: '10' }] },
        { date: '2026-09-23', type: 'tabata', blocks: [] }
    ];
    const groupOf = n => n.startsWith('Press') ? 'Pecho' : 'Espalda';
    const r = plain(muscleSetsByGroup(workouts, '2026-09-21', '2026-09-27', groupOf));
    assert.equal(r.Pecho.sets, 4);
    assert.equal(r.Espalda.sets, 3);
    assert.equal(r.Pecho.exercises['Press de pecho'], 4);
});

test('niveles de color según series por semana', () => {
    assert.equal(muscleLevel(0), 0);
    assert.equal(muscleLevel(3), 1);
    assert.equal(muscleLevel(8), 2);
    assert.equal(muscleLevel(15), 3);
    assert.equal(muscleLevel(24), 4);
});

test('superseries: siguiente ejercicio de la misma letra, en el orden de pantalla', () => {
    const letters = { 'Press': 'A', 'Remo': 'A', 'Curl': 'B', 'Tríceps': 'B', 'Sentadilla': undefined };
    const order = ['Press', 'Curl', 'Remo', 'Tríceps', 'Sentadilla'];
    const of = n => letters[n];
    assert.equal(nextInSuperset(order, of, 'Press'), 'Remo');
    assert.equal(nextInSuperset(order, of, 'Remo'), null, 'último de la A: descanso');
    assert.equal(nextInSuperset(order, of, 'Sentadilla'), null, 'sin superserie');
    assert.equal(nextSupersetLetter(['A', 'B']), 'C');
});
