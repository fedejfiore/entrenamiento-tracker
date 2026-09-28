// Modelo de dominio: lo nuevo se crea con identidad y se valida antes de guardarse.
const test = require('node:test');
const assert = require('node:assert/strict');
const { loadApp } = require('./helpers/load-app');
const legacy = require('./fixtures/legacy-data');

const app = loadApp();
const WorkoutSession = app('WorkoutSession');
const ExerciseLog = app('ExerciseLog');
const BodyMeasurement = app('BodyMeasurement');
const plain = v => JSON.parse(JSON.stringify(v));

test('una sesión nueva trae id, uid universal y fecha de modificación', () => {
    const s = plain(WorkoutSession.create({ date: '2026-09-28', routine: 'A1', exercises: [{ name: 'Press de pecho' }] }));
    assert.equal(typeof s.id, 'number');
    assert.match(s.uid, /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
    assert.ok(!isNaN(Date.parse(s.updatedAt)));
});

test('ExerciseLog guarda las series y además los textos viejos que leen PRs y gráficos', () => {
    const ex = plain(new ExerciseLog({
        name: 'Press de pecho', type: 'kg', note: '',
        sets: [{ reps: '15', kg: '20', warmup: true }, { reps: '12', kg: '50', rest: '90', done: true }]
    }));
    assert.equal(ex.sets.length, 2);
    assert.equal(ex.reps, '12');
    assert.equal(ex.weight, '50');
    assert.equal(ex.sets[1].done, true);
});

test('validación estricta de lo nuevo', () => {
    const ok = { id: 1, date: '2026-09-28', exercises: [{ name: 'X', sets: [{ reps: '10' }] }] };
    assert.doesNotThrow(() => WorkoutSession.validate(ok));
    assert.throws(() => WorkoutSession.validate({ ...ok, date: '28/09/2026' }), /AAAA-MM-DD/);
    assert.throws(() => WorkoutSession.validate({ ...ok, exercises: [] }), /al menos un ejercicio/);
    assert.throws(() => WorkoutSession.validate({ ...ok, exercises: [{ name: '' }] }), /nombre/);
    assert.throws(() => WorkoutSession.validate({ ...ok, exercises: [{ name: 'X', sets: [{ reps: 10 }] }] }), /texto/);
    assert.throws(() => WorkoutSession.validate({ ...ok, exercises: [{ name: 'X', type: 'lbs' }] }), /tipo de medición/);
    assert.doesNotThrow(() => WorkoutSession.validate({ id: 2, date: '2026-09-28', type: 'tabata', blocks: [{ name: 'B' }] }));
});

test('lo ya guardado (formato viejo) pasa la validación liviana', () => {
    assert.doesNotThrow(() => WorkoutSession.validateList(legacy.workouts));
    legacy.workouts.forEach((w, i) => assert.doesNotThrow(() => WorkoutSession.validate(w, `sesión ${i}`)));
});

test('medida corporal: campos vacíos quedan en null (como se guardaban antes)', () => {
    const m = plain(BodyMeasurement.create({ date: '2026-09-28', weight: 75, fat: NaN }));
    assert.deepEqual(m, { date: '2026-09-28', weight: 75, fat: null, muscle: null, water: null, waist: null });
    assert.throws(() => BodyMeasurement.validate({ date: '2026-09-28', weight: 0 }), /peso/);
});

test('fecha de modificación inferida para sesiones viejas', () => {
    assert.equal(WorkoutSession.inferUpdatedAt({ id: 1753300000000 }), new Date(1753300000000).toISOString());
    assert.equal(WorkoutSession.inferUpdatedAt({ id: 5, endTime: '2026-07-24T21:00:00.000Z' }), '2026-07-24T21:00:00.000Z');
    assert.equal(WorkoutSession.inferUpdatedAt({ id: 5, date: '2026-07-24' }), '2026-07-24T12:00:00.000Z');
});
