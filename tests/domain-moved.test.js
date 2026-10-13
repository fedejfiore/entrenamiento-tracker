// Lógica que vivía en las pantallas y pasó al dominio (etapa 2 de arquitectura): ahora se prueba sola.
const test = require('node:test');
const assert = require('node:assert/strict');
const { loadApp, CORE_FILES } = require('./helpers/load-app');

const app = loadApp([...CORE_FILES, 'js/core/brand.js', 'js/domain/legacy-format.js', 'js/domain/stats.js', 'js/domain/plan.js', 'js/domain/training-tools.js', 'js/domain/routine-share.js', 'js/domain/feedback.js']);

test('estado de la semana del calendario según el plan', () => {
    const status = app('getWeekStatus');
    const monday = new Date('2026-10-05T00:00:00');
    const w = dates => dates.map(date => ({ date }));
    assert.equal(status([], [], monday), 'sin-plan');
    assert.equal(status(w(['2026-10-05', '2026-10-07']), [1, 3], monday, new Date('2026-10-20')), 'dias-respetados');
    assert.equal(status(w(['2026-10-06', '2026-10-08']), [1, 3], monday, new Date('2026-10-20')), 'cantidad-cumplida');
    assert.equal(status(w(['2026-10-05']), [1, 3], monday, new Date('2026-10-06')), 'en-curso', 'semana en curso: todavía hay tiempo');
    assert.equal(status(w(['2026-10-05']), [1, 3], monday, new Date('2026-10-20')), 'incumplido');
});

test('texto de la próxima sesión', () => {
    const next = app('describeNext');
    assert.equal(next(null), '');
    assert.equal(next({ isToday: true, time: '19:00', weekday: 1 }), 'hoy a las 19:00');
    assert.equal(next({ isTomorrow: true, time: '11:00', weekday: 6 }), 'mañana a las 11:00');
    assert.match(next({ time: '08:00', weekday: 3 }), /^el miércoles a las 08:00$/);
});

test('historial de progresión: por ejercicio, ordenado por fecha, con la última rutina', () => {
    const build = app('buildProgressionHistory');
    const { history, lastRoutine } = build([
        { date: '2026-10-08', routine: 'B', exercises: [{ name: 'Remo', reps: '10-10', weight: '40-40' }] },
        { date: '2026-10-01', routine: 'A', exercises: [{ name: 'Remo', reps: '10-10', weight: '35-35' }] }
    ]);
    assert.deepEqual([...history.Remo.map(h => h.date)], ['2026-10-01', '2026-10-08']);
    assert.equal(lastRoutine.Remo, 'B');
    assert.equal(history.Remo[1].maxWeight, 40);
});

test('nota del mapa muscular respecto del rango ideal', () => {
    const note = app('muscleRangeNote');
    assert.equal(note(25, {}), 'por encima del rango');
    assert.equal(note(12, {}), 'en rango ✓');
    assert.equal(note(4, { inProgress: true }), 'faltan 6 para el rango');
    assert.equal(note(0, { inProgress: false }), '');
});

test('códigos de rutina en un texto pegado (uno o varios links, o el código solo)', () => {
    const codes = app('routineShareCodesFrom');
    assert.deepEqual([...codes('mirá https://x.app/#rutina=abc_123 y https://x.app/#rutina=XYZ-9')], ['abc_123', 'XYZ-9']);
    assert.deepEqual([...codes('  abcdefgh12  ')], ['abcdefgh12']);
    assert.deepEqual([...codes('hola')], []);
});

test('edad desde la fecha de nacimiento (y valores imposibles)', () => {
    const age = app('ageFrom');
    assert.equal(age('1990-10-14', new Date('2026-10-13T12:00:00')), 35, 'todavía no cumplió');
    assert.equal(age('1990-10-13', new Date('2026-10-13T12:00:00')), 36);
    assert.equal(age('2030-01-01', new Date('2026-10-13T12:00:00')), null);
    assert.equal(age('', new Date()), null);
});

test('comentarios: validación del formulario y armado del mensaje', () => {
    const validate = app('validateFeedback');
    const message = app('feedbackMessage');
    const ok = { type: 'minor', description: 'El botón se ve cortado', name: 'Ana Pérez', contact: 'ana@mail.com', area: 'Historial' };
    assert.equal(validate(ok).ok, true);
    const bad = validate({ type: 'x', description: 'corto', name: 'Ana', contact: '123' });
    assert.deepEqual(Object.keys(bad.errors).sort(), ['contact', 'description', 'name', 'type']);
    assert.equal(validate({ ...ok, contact: '+54 9 11 5555-1234' }).ok, true, 'WhatsApp con código de área');
    const m = message(ok, 'Gymnastés', 'Versión: v1');
    assert.match(m.subject, /^\[Gymnastés\] 🟡 Error menor · Historial$/);
    assert.match(m.body, /Datos técnicos ----\nVersión: v1$/);
    assert.ok(!message(ok, 'Gymnastés').body.includes('Datos técnicos'));
});
