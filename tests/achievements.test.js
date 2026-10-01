// Medallas y estadísticas de uso del Perfil.
const test = require('node:test');
const assert = require('node:assert/strict');
const { loadApp, CORE_FILES } = require('./helpers/load-app');

const app = loadApp([...CORE_FILES, 'js/domain/training-tools.js', 'js/data/exercise-prefs.js', 'js/domain/stats.js', 'js/domain/achievements.js']);
const compute = app('computeUsageStats');
const evaluate = app('evaluateAchievements');
const plain = v => JSON.parse(JSON.stringify(v));

const w = (date, extra = {}) => ({ id: date, date, exercises: [{ name: 'Press', type: 'kg', sets: [{ reps: '10', kg: '50', done: true }, { reps: '10', kg: '20', warmup: true, done: true }], reps: '10', weight: '50' }], ...extra });

test('estadísticas: sesiones, volumen sin calentamiento, récords, horas y ejercicio favorito', () => {
    const s = plain(compute([
        w('2026-09-01', { duration: 60, prs: ['a', 'b'] }),
        w('2026-09-03', { duration: 30 }),
        { id: 3, date: '2026-09-04', exercises: [{ name: 'Bici', type: 'km', sets: [{ time: '00:30:00', km: '12,5' }] }] },
        w('2026-09-05', { deletedAt: '2026-09-06' })
    ]));
    assert.equal(s.sessions, 3, 'las borradas no cuentan');
    assert.equal(s.records, 2);
    assert.equal(s.hours, 1.5);
    assert.equal(s.avgMinutes, 45);
    assert.equal(s.totalKm, 12.5);
    assert.equal(s.favoriteExercise, 'Press');
    assert.equal(s.firstDate, '2026-09-01');
    assert.equal(s.totalVolume, 1000, 'dos sesiones de 10 × 50 kg, sin el calentamiento');
});

test('rachas: semanas consecutivas con al menos una sesión', () => {
    // Semanas (lunes): 31/8, 7/9, 14/9 seguidas; 28/9 después de un hueco.
    const s = plain(compute([w('2026-09-01'), w('2026-09-08'), w('2026-09-16'), w('2026-09-29')], 1));
    assert.equal(s.bestWeekStreak, 3);
});

test('medallas: nivel alcanzado, próximo umbral y progreso', () => {
    const r = plain(evaluate({ sessions: 12, bestWeekStreak: 0, totalVolume: 0, records: 0, hours: 0, totalKm: 0 }));
    const sessions = r.find(a => a.id === 'sessions');
    assert.equal(sessions.level, 2);
    assert.equal(sessions.tier.name, 'Plata');
    assert.equal(sessions.next, 50);
    assert.ok(sessions.progress > 0 && sessions.progress < 0.1);
    const streak = r.find(a => a.id === 'streak');
    assert.equal(streak.level, 0);
    assert.equal(streak.tier, null);
    assert.equal(streak.next, 2);
});

test('trofeos: se leen los récords guardados como texto, el más importante por ejercicio y día', () => {
    const recent = app('recentRecords');
    const ws = [
        { date: '2026-09-20', prs: ['Press de pecho: 81kg (antes 75kg)', 'Press de pecho: volumen total 4.860 kg (antes 4.500 kg)', 'Remo sentado: 15 reps (antes 12)'] },
        { date: '2026-09-27', prs: ['Bici: distancia 18km (antes 9km)', 'Curl: mismo peso y reps con menos descanso (60s, antes 90s)', 'Curl martillo: volumen total 1.275 kg (antes 1.200 kg)'] },
        { date: '2026-09-28', prs: ['Press de pecho: 82,5kg (antes 81kg)'], deletedAt: '2026-09-29' },
        { date: '2026-09-10', prs: ['Sentadilla: 225lb (antes 205lb)'] }
    ];
    const r = JSON.parse(JSON.stringify(recent(ws)));
    assert.deepEqual(r.map(x => [x.date, x.exercise, x.kind, x.valueText, x.deltaText]), [
        ['2026-09-27', 'Bici', 'distance', '18km', null],
        ['2026-09-27', 'Curl martillo', 'volume', '1.275 kg', null],
        ['2026-09-20', 'Press de pecho', 'weight', '81kg', '+6 kg'],
        ['2026-09-20', 'Remo sentado', 'reps', '15', '+3 reps'],
        ['2026-09-10', 'Sentadilla', 'weight', '225lb', '+20 lb']
    ]);
});
