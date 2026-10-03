// Plan semanal: vigencia por semana, horarios, próximo entrenamiento y calendario.
const test = require('node:test');
const assert = require('node:assert/strict');
const { loadApp, CORE_FILES } = require('./helpers/load-app');

const app = loadApp([...CORE_FILES, 'js/domain/plan.js']);
const TrainingPlan = app('TrainingPlan');
const buildPlanIcs = app('buildPlanIcs');
const planGoogleCalendarLinks = app('planGoogleCalendarLinks');
const plain = v => JSON.parse(JSON.stringify(v));

const plan = () => new TrainingPlan({ days: [1, 3, 5], times: { 1: '19:00', 3: '19:00', 5: '08:30' }, remind: 30 });

test('el plan vigente es el último que empezó antes o en esa semana', () => {
    const history = [
        { date: '1970-01-01', days: [2, 4] },
        { date: '2026-09-21', days: [1, 3, 5], times: { 1: '07:00' } }
    ];
    assert.deepEqual(plain(TrainingPlan.forWeek(history, '2026-09-14').days), [2, 4]);
    assert.deepEqual(plain(TrainingPlan.forWeek(history, '2026-09-28').days), [1, 3, 5]);
    assert.equal(TrainingPlan.forWeek(history, '2026-09-28').timeFor(1), '07:00');
    assert.equal(TrainingPlan.forWeek(history, '2026-09-28').timeFor(3), '19:00', 'sin horario: el de por defecto');
    assert.ok(TrainingPlan.forWeek([], '2026-09-28').isEmpty);
});

test('los planes viejos (solo días, sin horarios) siguen funcionando', () => {
    const p = new TrainingPlan({ days: [1, 3] });
    assert.equal(p.timeFor(1), '19:00');
    assert.equal(p.remind, 30);
});

test('días agrupados por horario, de lunes a domingo', () => {
    const groups = plain(plan().groups());
    assert.deepEqual(groups.map(g => [g.time, g.days.map(d => d.ics).join(',')]), [['08:30', 'FR'], ['19:00', 'MO,WE']]);
});

test('próximo entrenamiento', () => {
    // Domingo 27/09/2026 10:00 -> lunes 19:00
    const next = plan().nextSession(new Date(2026, 8, 27, 10, 0), new Date(2026, 8, 27, 10, 0));
    assert.equal(next.weekday, 1);
    assert.equal(next.time, '19:00');
    assert.equal(next.isToday, false);
    assert.equal(next.isTomorrow, true);
    // Lunes 28/09 a las 12:00 -> hoy a las 19:00
    assert.equal(plan().nextSession(new Date(2026, 8, 28, 12, 0), new Date(2026, 8, 28, 12, 0)).isToday, true);
});

test('si ya entrenaste hoy, el próximo (buscado desde mañana) es "mañana", no "hoy"', () => {
    // Viernes 2/10/2026 a las 23:55, ya entrenaste; el sábado se entrena a las 11.
    const p = new TrainingPlan({ days: [5, 6], times: { 5: '19:00', 6: '11:00' } });
    const now = new Date(2026, 9, 2, 23, 55);
    const next = p.nextSession(new Date(2026, 9, 3, 0, 0), now);
    assert.equal(next.weekday, 6);
    assert.equal(next.time, '11:00');
    assert.equal(next.isToday, false);
    assert.equal(next.isTomorrow, true);
});

test('.ics: un evento semanal por horario, con alarma y en hora local', () => {
    const ics = buildPlanIcs(plan(), { title: '🏋️ Entrenar', durationMin: 65, now: new Date(2026, 8, 27, 10, 0) });
    assert.ok(ics.startsWith('BEGIN:VCALENDAR\r\n'));
    assert.equal((ics.match(/BEGIN:VEVENT/g) || []).length, 2);
    assert.match(ics, /RRULE:FREQ=WEEKLY;BYDAY=MO,WE/);
    assert.match(ics, /RRULE:FREQ=WEEKLY;BYDAY=FR/);
    assert.match(ics, /DTSTART:20260928T190000\r\n/, 'lunes 28/09 19:00, sin zona horaria');
    assert.match(ics, /DTSTART:20261002T083000\r\n/, 'viernes 2/10 08:30');
    assert.match(ics, /TRIGGER:-PT30M/);
    assert.match(ics, /DURATION:PT65M/);
    assert.ok(ics.split('\r\n').every(l => new TextEncoder().encode(l).length <= 75), 'líneas de hasta 75 bytes');
});

test('Google Calendar: un link por horario con la repetición semanal', () => {
    const links = plain(planGoogleCalendarLinks(plan(), { now: new Date(2026, 8, 27, 10, 0), durationMin: 60 }));
    assert.equal(links.length, 2);
    assert.equal(links[1].label, 'Lun, Mié · 19:00');
    const url = new URL(links[1].url);
    assert.equal(url.searchParams.get('recur'), 'RRULE:FREQ=WEEKLY;BYDAY=MO,WE');
    assert.equal(url.searchParams.get('dates'), '20260928T190000/20260928T200000');
});

test('rutina por día: solo de los días del plan, y se guarda solo si hay alguna', () => {
    const P = app('TrainingPlan');
    const p = new P({ days: [4, 0], times: { 4: '18:00' }, routines: { 4: 'R1', 2: 'R9', 0: '' } });
    assert.equal(p.routineFor(4), 'R1');
    assert.equal(p.routineFor(2), null);
    assert.equal(p.routineFor(0), null);
    assert.deepEqual(JSON.parse(JSON.stringify(p.toJSON().routines)), { 4: 'R1' });
    // Un plan sin rutinas guarda igual que antes (los planes viejos no "cambian")
    assert.equal('routines' in new P({ days: [1] }).toJSON(), false);
    assert.ok(new P({ days: [1] }).sameAs(new P({ days: [1], routines: {} })));
});

test('el nombre de la rutina dice el día', () => {
    const m = app('routineLabelMatchesWeekday');
    assert.equal(m('Torso C (jue)', 4), true);
    assert.equal(m('Torso C (Jue)', 4), true);
    assert.equal(m('Pierna sábado', 6), true);
    assert.equal(m('Pierna + hombro (sáb)', 6), true);
    assert.equal(m('Torso A (dom)', 4), false);
    assert.equal(m('Lunes - pecho', 1), true);
    assert.equal(m('Marcha y trote', 2), false, '"mar" dentro de otra palabra no cuenta');
    assert.equal(m('Rutina A', 4), false);
});
