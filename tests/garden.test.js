// La flor del plan semanal: semanas cumplidas, semanas libres, marchitarse y etapas.
const test = require('node:test');
const assert = require('node:assert/strict');
const { loadApp, CORE_FILES } = require('./helpers/load-app');

const app = loadApp([...CORE_FILES, 'js/domain/plan.js', 'js/domain/garden.js']);
const garden = app('computeGarden');
const plain = v => JSON.parse(JSON.stringify(v));

// Lunes 2026-08-03. sessions(semana, cantidad) → sesiones de lunes en adelante.
const MONDAY = new Date(2026, 7, 3);
const dayStr = (week, day) => { const d = new Date(MONDAY); d.setDate(d.getDate() + week * 7 + day); return app('gardenDateStr')(d); };
const sessions = (week, n) => Array.from({ length: n }, (_, i) => ({ date: dayStr(week, i) }));
const plan = [{ date: '2026-08-03', days: [1, 3, 5] }]; // 3 días
const todayIn = (week, day = 0) => { const d = new Date(MONDAY); d.setDate(d.getDate() + week * 7 + day); return d; };

test('sin plan no hay flor (semilla, sin semanas)', () => {
    const g = plain(garden({ workouts: sessions(0, 3), planHistory: [], today: todayIn(0, 6) }));
    assert.equal(g.hasPlan, false);
    assert.equal(g.stage.id, 'seed');
});

test('cada semana cumplida hace crecer la flor; la semana en curso cuenta apenas se cumple', () => {
    let g = plain(garden({ workouts: sessions(0, 2), planHistory: plan, today: todayIn(0, 4) }));
    assert.deepEqual([g.grown, g.stage.id, g.current.trained, g.current.planned, g.current.done], [0, 'seed', 2, 3, false]);
    g = plain(garden({ workouts: sessions(0, 3), planHistory: plan, today: todayIn(0, 4) }));
    assert.deepEqual([g.grown, g.stage.id, g.current.done], [1, 'sprout', true]);
    // dos sesiones el mismo día cuentan como un día
    g = plain(garden({ workouts: [...sessions(0, 2), { date: dayStr(0, 0) }], planHistory: plan, today: todayIn(0, 6) }));
    assert.equal(g.current.trained, 2);
});

test('etapas: brote 1, capullo 3, flor 6, frutos 10 y un fruto más cada 4 semanas', () => {
    const at = weeks => {
        const w = []; for (let i = 0; i < weeks; i++) w.push(...sessions(i, 3));
        return plain(garden({ workouts: w, planHistory: plan, today: todayIn(weeks - 1, 6) }));
    };
    assert.equal(at(3).stage.id, 'bud');
    assert.equal(at(5).stage.id, 'bud');
    assert.equal(at(5).weeksToNext, 1);
    assert.equal(at(6).stage.id, 'flower');
    assert.deepEqual([at(10).stage.id, at(10).fruits], ['fruit', 1]);
    assert.deepEqual([at(14).fruits, at(13).fruits], [2, 1]);
});

test('semanas libres: se usan solas, empiezan en 2 y suman 1 por mes (máximo 3)', () => {
    // Semana 0 cumplida, 1 y 2 sin cumplir (usan las 2 libres), 3 sin cumplir → se marchita.
    const w = [...sessions(0, 3)];
    let g = plain(garden({ workouts: w, planHistory: plan, today: todayIn(3, 0) }));
    assert.deepEqual(g.weeks.map(x => x.status), ['cumplida', 'libre', 'libre', 'en-curso']);
    assert.equal(g.freeWeeks, 0);
    assert.equal(g.wilted, false);
    g = plain(garden({ workouts: w, planHistory: plan, today: todayIn(4, 0) }));
    // La semana 4 (31/8) sigue en agosto: sin semana libre nueva, la 3 queda sin cumplir.
    assert.equal(g.weeks[3].status, 'no');
    assert.equal(g.wilted, true);
    assert.equal(g.grown, 1, 'marchita pero no retrocede');
    // En septiembre se suma 1 semana libre
    g = plain(garden({ workouts: w, planHistory: plan, today: todayIn(5, 0) }));
    assert.equal(g.freeWeeks, 1);
});

test('se recupera con la próxima semana cumplida', () => {
    const w = [...sessions(0, 3), ...sessions(4, 3)];
    const g = plain(garden({ workouts: w, planHistory: plan, today: todayIn(4, 5) }));
    assert.equal(g.weeks[3].status, 'no');
    assert.equal(g.wilted, false);
    assert.equal(g.grown, 2);
});

test('las sesiones borradas no cuentan y las semanas sin plan son neutras', () => {
    const w = [...sessions(0, 2), { date: dayStr(0, 3), deletedAt: '2026-08-07' }];
    let g = plain(garden({ workouts: w, planHistory: plan, today: todayIn(0, 6) }));
    assert.equal(g.current.trained, 2);
    // Plan que arranca en la semana 2: las anteriores no se evalúan
    g = plain(garden({ workouts: [...sessions(0, 1), ...sessions(2, 3)], planHistory: [{ date: dayStr(2, 0), days: [1, 2, 3] }], today: todayIn(2, 6) }));
    assert.deepEqual(g.weeks.map(x => x.status), ['cumplida']);
});

test('plan "de siempre" (formato viejo): empieza en la semana de la primera sesión', () => {
    const g = plain(garden({ workouts: sessions(1, 3), planHistory: [{ date: '1970-01-01', days: [1, 3, 5] }], today: todayIn(1, 6) }));
    assert.equal(g.weeks.length, 1);
    assert.equal(g.weeks[0].start, dayStr(1, 0));
});
