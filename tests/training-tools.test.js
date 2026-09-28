// Calculadora de discos, series por músculo y superseries.
const test = require('node:test');
const assert = require('node:assert/strict');
const { loadApp, CORE_FILES } = require('./helpers/load-app');

const app = loadApp([...CORE_FILES, 'js/domain/training-tools.js', 'js/data/exercise-prefs.js']);
const calculatePlates = app('calculatePlates');
const muscleSetsByGroup = app('muscleSetsByGroup');
const muscleLevel = app('muscleLevel');
const muscleMapRange = app('muscleMapRange');
const getWeekStart = app('getWeekStart');
const formatDateLocal = app('formatDateLocal');
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
    assert.equal(muscleLevel(12), 3);
    assert.equal(muscleLevel(18), 4);
    assert.equal(muscleLevel(24), 5);
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

test('inicio de semana según preferencia (lunes, domingo, sábado)', () => {
    const wed = new Date(2026, 8, 23); // miércoles 23/09/2026
    assert.equal(formatDateLocal(getWeekStart(wed, 1)), '2026-09-21');
    assert.equal(formatDateLocal(getWeekStart(wed, 0)), '2026-09-20');
    assert.equal(formatDateLocal(getWeekStart(wed, 6)), '2026-09-19');
    const sun = new Date(2026, 8, 27);
    assert.equal(formatDateLocal(getWeekStart(sun, 1)), '2026-09-21');
    assert.equal(formatDateLocal(getWeekStart(sun, 0)), '2026-09-27');
});

test('períodos del mapa: semana en curso y semanas completas anteriores', () => {
    const wed = new Date(2026, 8, 23);
    const week = plain(muscleMapRange('week', wed, 1));
    assert.deepEqual(week, { from: '2026-09-21', to: '2026-09-23', weeks: 1, inProgress: true, daysLeft: 4 });
    const last = plain(muscleMapRange('lastweek', wed, 0));
    assert.equal(last.from, '2026-09-13');
    assert.equal(last.to, '2026-09-19');
    const four = plain(muscleMapRange('4w', wed, 1));
    assert.equal(four.from, '2026-08-24');
    assert.equal(four.to, '2026-09-20');
    assert.equal(four.weeks, 4);
});

test('máquina de placas: 5 kg sin placas, 10 kg la primera, +5 por placa', () => {
    const calculateStack = app('calculateStack');
    assert.deepEqual(plain(calculateStack(10)).pin, 1);
    const r = plain(calculateStack(40));
    assert.equal(r.pin, 7);
    assert.equal(r.achieved, 40);
    assert.equal(r.exact, true);
    const near = plain(calculateStack(42));
    assert.equal(near.exact, false);
    assert.deepEqual(near.below, { pin: 7, weight: 40 });
    assert.deepEqual(near.above, { pin: 8, weight: 45 });
    assert.equal(plain(calculateStack(4)).pin, 0);
    const custom = plain(calculateStack(30, { empty: 2.5, first: 7, step: 7, count: 10 }));
    assert.equal(custom.pin, 4);
    assert.equal(custom.achieved, 28);
});

test('máquina de placas por nombre del ejercicio', () => {
    const isLikelyStackMachine = app('isLikelyStackMachine');
    assert.equal(isLikelyStackMachine('Jalón al pecho'), true);
    assert.equal(isLikelyStackMachine('Tríceps en polea'), true);
    assert.equal(isLikelyStackMachine('Press banca'), false);
});

test('unilateral sugerido por el nombre', () => {
    const inferUnilateral = app('ExercisePreferences').inferUnilateral;
    assert.equal(inferUnilateral('Remo a un brazo'), true);
    assert.equal(inferUnilateral('Sentadilla búlgara'), true);
    assert.equal(inferUnilateral('Press unilateral en máquina'), true);
    assert.equal(inferUnilateral('Sentadilla'), false);
});
