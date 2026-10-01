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
    assert.equal(muscleLevel(18), 3);
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
    const last7 = plain(muscleMapRange('last7', wed, 0));
    assert.equal(last7.from, '2026-09-17');
    assert.equal(last7.to, '2026-09-23');
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

test('conteo fraccionado: las series indirectas valen media serie', () => {
    const groups = { 'press de pecho': 'Pecho', 'remo sentado': 'Espalda', 'jalones de triceps': 'Tríceps', 'sentadilla bulgara': 'Piernas' };
    const groupOf = n => groups[n.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')] || 'Otro';
    const ex = (name, n) => ({ name, sets: Array.from({ length: n }, () => ({ reps: '10', kg: '20', done: true })) });
    const r = plain(muscleSetsByGroup([{ date: '2026-09-22', exercises: [ex('Press de pecho', 4), ex('Remo sentado', 4), ex('Jalones de tríceps', 3), ex('Sentadilla búlgara', 4)] }], '2026-09-21', '2026-09-27', groupOf));
    assert.equal(r.Pecho.sets, 4);
    assert.equal(r['Tríceps'].direct, 3);
    assert.equal(r['Tríceps'].indirect, 2, 'press de pecho: 4 × 0,5');
    assert.equal(r['Tríceps'].sets, 5);
    assert.equal(r.Hombros.sets, 2);
    assert.equal(r['Bíceps'].sets, 2, 'remo: 4 × 0,5');
    assert.equal(r['Glúteos'].sets, 2, 'búlgara: 4 × 0,5');
    assert.equal(r.Piernas.sets, 4);
    const secondary = app('secondaryMusclesFor');
    assert.deepEqual(plain(secondary('Remo al mentón', 'Hombros')), {}, 'remo al mentón no es un remo de espalda');
});

test('estancamiento: 3 semanas y 3 sesiones sin más peso ni más reps', () => {
    const detect = app('detectStall');
    const today = new Date(2026, 8, 30);
    const s = (date, kg, reps, n = 3) => ({ date, sets: Array.from({ length: n }, () => ({ kg: String(kg), reps: String(reps) })) });
    // Mejoró el 1/9 (40×12) y después repitió lo mismo 3 veces: estancado, sugiere subir peso.
    const flat = [s('2026-08-20', 37.5, 12), s('2026-09-01', 40, 12), s('2026-09-08', 40, 12), s('2026-09-15', 40, 11), s('2026-09-22', 40, 12)];
    const r = JSON.parse(JSON.stringify(detect(flat, { today })));
    assert.deepEqual([r.action, r.kg, r.reps, r.weeks, r.sessions, r.variant], ['weight', 40, 12, 4, 3, false]);
    // Con un objetivo de 15 reps, todavía tocan reps
    assert.equal(detect(flat, { today, repsMax: 15 }).action, 'reps');
    // Si en la última sesión hizo una rep más, no está estancado
    assert.equal(detect([...flat, s('2026-09-29', 40, 13, 1)], { today }), null);
    // Más peso también es mejora
    assert.equal(detect([...flat, s('2026-09-29', 42.5, 8)], { today }), null);
    // Pocas semanas o pocas sesiones: todavía no
    assert.equal(detect(flat.slice(0, 4), { today: new Date(2026, 8, 16) }), null);
    // Un dato aislado más pesado no deja "estancado" a quien progresa con menos peso
    const outlier = [s('2026-08-01', 15, 12), s('2026-08-08', 25, 12, 2), s('2026-08-23', 15, 15), s('2026-09-04', 15, 15, 4), s('2026-09-12', 18, 15), s('2026-09-22', 18, 17), s('2026-09-27', 20, 15)];
    assert.equal(detect(outlier, { today }), null);
    // ...pero si después de bajar repite lo mismo 3 semanas, sí
    assert.equal(detect([s('2026-08-01', 25, 12), s('2026-08-20', 15, 15), s('2026-08-27', 15, 15), s('2026-09-03', 15, 15), s('2026-09-10', 15, 14)], { today }).kg, 15);
    // 6 semanas o más: sugiere también una variante
    assert.equal(detect([...flat, s('2026-10-10', 40, 12)], { today: new Date(2026, 9, 14) }).variant, true);
});

test('estancamiento: no cuentan calentamientos; con peso corporal se miran las reps', () => {
    const detect = app('detectStall');
    const today = new Date(2026, 8, 30);
    const bw = (date, reps) => ({ date, sets: [{ reps: String(reps) }, { reps: String(reps - 2) }] });
    const r = detect([bw('2026-08-25', 20), bw('2026-09-01', 20), bw('2026-09-10', 19), bw('2026-09-20', 20)], { type: 'bw', today });
    assert.equal(r.action, 'harder');
    // Un calentamiento con más peso no cuenta como mejora
    const s = (date, kg, reps, warm) => ({ date, sets: [{ kg: '20', reps: '10' }, ...(warm ? [{ kg: String(kg), reps: String(reps), warmup: true }] : [])] });
    assert.ok(detect([s('2026-08-25'), s('2026-09-01', 50, 5, true), s('2026-09-10'), s('2026-09-20')], { today }));
    // Tiempo o distancia: no aplica
    assert.equal(detect([s('2026-08-25'), s('2026-09-01'), s('2026-09-10'), s('2026-09-20')], { type: 'time', today }), null);
});
