// Programas prearmados y progresión doble (primero reps, después peso).
const test = require('node:test');
const assert = require('node:assert/strict');
const { loadApp, CORE_FILES } = require('./helpers/load-app');

const app = loadApp([...CORE_FILES, 'js/domain/programs.js']);
const suggest = app('suggestDoubleProgression');
const PROGRAMS = app('PROGRAMS');
const EXERCISE_TO_MUSCLE_GROUP = app('EXERCISE_TO_MUSCLE_GROUP');
const normalizeForCompare = app('normalizeForCompare');
const plain = v => JSON.parse(JSON.stringify(v));

const target = { sets: 3, repsMin: 8, repsMax: 12, inc: 2.5 };
const sets = (kg, ...reps) => reps.map(r => ({ kg: String(kg).replace('.', ','), reps: String(r) }));

test('sin historial: arranca abajo del rango', () => {
    const r = plain(suggest([], target));
    assert.equal(r.action, 'start');
    assert.deepEqual(r.reps, [8, 8, 8]);
    assert.equal(r.kg, null);
});

test('primero reps: mismo peso y una rep más en cada serie que no llegó al tope', () => {
    const r = plain(suggest(sets(40, 10, 9, 8), target));
    assert.equal(r.action, 'reps');
    assert.equal(r.kg, 40);
    assert.deepEqual(r.reps, [11, 10, 9]);
});

test('una serie ya en el tope se mantiene; las otras suben', () => {
    const r = plain(suggest(sets(40, 12, 12, 10), target));
    assert.equal(r.action, 'reps');
    assert.deepEqual(r.reps, [12, 12, 11]);
});

test('después peso: todas en el tope → sube el peso y vuelve al mínimo', () => {
    const r = plain(suggest(sets(40, 12, 12, 12), target));
    assert.equal(r.action, 'weight');
    assert.equal(r.kg, 42.5);
    assert.deepEqual(r.reps, [8, 8, 8]);
});

test('si hizo menos series que las del objetivo, no sube el peso todavía', () => {
    const r = plain(suggest(sets(40, 12, 12), target));
    assert.equal(r.action, 'reps');
    assert.deepEqual(r.reps, [12, 12, 8]);
});

test('el calentamiento no cuenta y manda el peso más alto', () => {
    const last = [{ kg: '20', reps: '15', warmup: true }, ...sets(40, 12, 12, 12), { kg: '30', reps: '12' }];
    const r = plain(suggest(last, target));
    assert.equal(r.action, 'weight');
    assert.equal(r.kg, 42.5);
});

test('por debajo del mínimo: repetir el peso apuntando al mínimo', () => {
    const r = plain(suggest(sets(50, 6, 5, 5), target));
    assert.equal(r.action, 'repeat');
    assert.equal(r.kg, 50);
    assert.deepEqual(r.reps, [8, 8, 8]);
});

test('5×5: completar las 25 reps sube el peso', () => {
    const t = { sets: 5, repsMin: 5, repsMax: 5, inc: 5 };
    assert.equal(plain(suggest(sets(60, 5, 5, 5, 5, 5), t)).kg, 65);
    assert.equal(plain(suggest(sets(60, 5, 5, 5, 4, 4), t)).action, 'reps');
});

test('peso corporal: al llegar arriba sugiere una variante más difícil', () => {
    const t = { sets: 3, repsMin: 8, repsMax: 15, type: 'bw' };
    const bw = (...reps) => reps.map(r => ({ reps: String(r) }));
    assert.deepEqual(plain(suggest(bw(10, 9, 8), t)).reps, [11, 10, 9]);
    assert.equal(plain(suggest(bw(15, 15, 15), t)).action, 'level');
});

test('los programas usan ejercicios del catálogo (así cuentan en el mapa de músculos)', () => {
    PROGRAMS.forEach(p => {
        assert.ok(p.days.length > 0, p.id);
        assert.ok(p.weekdays.every(d => d >= 0 && d <= 6), p.id);
        p.days.forEach(d => d.exercises.forEach(e => {
            assert.ok(EXERCISE_TO_MUSCLE_GROUP[normalizeForCompare(e.name)], `${p.id}: ${e.name} no está en el catálogo`);
            assert.ok(e.repsMin <= e.repsMax && e.sets > 0, `${p.id}: ${e.name}`);
        }));
    });
});
