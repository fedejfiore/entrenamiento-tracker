// Importar historial de Hevy, Strong y Fitbod (CSV) y exportar el propio.
const test = require('node:test');
const assert = require('node:assert/strict');
const { loadApp, CORE_FILES } = require('./helpers/load-app');

const app = loadApp([...CORE_FILES, 'js/domain/routine-share.js', 'js/domain/stats.js', 'js/domain/import-csv.js']);
const prepare = app('prepareCsvImport');
const plain = v => JSON.parse(JSON.stringify(v));

const HEVY = [
    '"title","start_time","end_time","description","exercise_title","superset_id","exercise_notes","set_index","set_type","weight_kg","reps","distance_km","duration_seconds","rpe"',
    '"Push Day","30 Sep 2024, 18:05","30 Sep 2024, 19:10","Buen día","Bench Press (Barbell)",,"",0,"warmup",40,10,,,',
    '"Push Day","30 Sep 2024, 18:05","30 Sep 2024, 19:10","Buen día","Bench Press (Barbell)",,"",1,"normal",80,8,,,8',
    '"Push Day","30 Sep 2024, 18:05","30 Sep 2024, 19:10","Buen día","Bench Press (Barbell)",,"",2,"normal",80,7,,,9.5',
    '"Push Day","30 Sep 2024, 18:05","30 Sep 2024, 19:10","Buen día","Plank",,"",0,"normal",,,,60,',
    '"Leg Day","2 Oct 2024, 07:00","2 Oct 2024, 08:00","","Squat (Barbell)",,"",0,"normal",100,5,,,'
].join('\n');

const STRONG = [
    'Date;Workout Name;Duration;Exercise Name;Set Order;Weight;Reps;Distance;Seconds;Notes;Workout Notes;RPE',
    '2024-09-30 18:05:00;"Push, heavy";1h 5m;Bench Press (Barbell);W;95;10;0;0;;;',
    '2024-09-30 18:05:00;"Push, heavy";1h 5m;Bench Press (Barbell);1;185;5;0;0;"felt ""good""";;8',
    '2024-09-30 18:05:00;"Push, heavy";1h 5m;Running;1;0;0;3.1;1800;;;'
].join('\r\n');

const FITBOD = [
    'Date,Exercise,Reps,Weight(kg),Duration(s),Distance(m),Incline,Resistance,isWarmup,Note,multiplier',
    '2024-09-30 18:05:00 +0000,Dumbbell Bicep Curl,12,10,0,0,0,0,false,,1',
    '2024-09-30 18:05:00 +0000,Dumbbell Bicep Curl,10,12,0,0,0,0,false,,1',
    '2024-09-30 18:05:00 +0000,Cycling,0,0,1200,8000,0,0,false,,1'
].join('\n');

test('Hevy: sesiones, calentamientos, RPE → RIR, duración y tipo de cada ejercicio', () => {
    const r = plain(prepare(HEVY));
    assert.equal(r.source, 'hevy');
    assert.equal(r.workouts.length, 2);
    const push = r.workouts[0];
    assert.deepEqual([push.date, push.routine, push.duration, push.startTime, push.notes], ['2024-09-30', 'Push Day', 65, '2024-09-30T18:05:00', 'Buen día']);
    const bench = push.exercises[0];
    assert.equal(bench.type, 'kg');
    assert.deepEqual(bench.sets, [
        { reps: '10', kg: '40', warmup: true, done: true },
        { reps: '8', kg: '80', effort: '2', done: true },
        { reps: '7', kg: '80', effort: '1', done: true } // RPE 9,5: quizás quedaba una
    ]);
    // Los textos viejos (récords, gráficos) no incluyen el calentamiento
    assert.equal(bench.reps, '8-7');
    assert.equal(bench.weight, '80-80');
    assert.equal(push.exercises[1].type, 'time');
    assert.equal(push.exercises[1].sets[0].time, '1:00');
    assert.equal(push.volume, 80 * 8 + 80 * 7);
    assert.deepEqual([r.from, r.to, r.sets, r.errors.length], ['2024-09-30', '2024-10-02', 5, 0]);
});

test('Strong: separador ;, comas dentro de comillas, libras y millas', () => {
    const r = plain(prepare(STRONG, { weightUnit: 'lb' }));
    assert.equal(r.source, 'strong');
    const w = r.workouts[0];
    assert.equal(w.routine, 'Push, heavy');
    assert.equal(w.duration, 65);
    const bench = w.exercises[0];
    assert.deepEqual(bench.sets[1], { reps: '5', kg: '83.915', effort: '2', done: true });
    assert.equal(bench.note, 'felt "good"');
    const run = w.exercises[1];
    assert.equal(run.type, 'km');
    assert.deepEqual(run.sets[0], { km: '4.989', time: '30:00', done: true });
    // En kg no se convierte
    assert.equal(plain(prepare(STRONG, { weightUnit: 'kg' })).workouts[0].exercises[0].sets[1].kg, '185');
});

test('Fitbod: peso en kg, distancia en metros', () => {
    const r = plain(prepare(FITBOD));
    assert.equal(r.source, 'fitbod');
    assert.equal(r.workouts.length, 1);
    assert.deepEqual(r.workouts[0].exercises.map(e => [e.name, e.type, e.sets.length]), [['Dumbbell Bicep Curl', 'kg', 2], ['Cycling', 'km', 1]]);
    assert.equal(r.workouts[0].exercises[1].sets[0].km, '8');
});

test('importar dos veces el mismo archivo no duplica', () => {
    const first = plain(prepare(HEVY));
    const keys = new Set(first.workouts.map(w => w.importKey));
    const again = plain(prepare(HEVY, { existingKeys: keys }));
    assert.equal(again.workouts.length, 0);
    assert.equal(again.skipped, 2);
});

test('exportar a CSV y volver a importar da lo mismo', () => {
    const original = plain(prepare(HEVY)).workouts;
    const csv = app('workoutsToCsv')(original);
    assert.match(csv.split('\r\n')[0], /^Fecha,Hora,Sesión,Ejercicio/);
    const back = plain(prepare(csv));
    assert.equal(back.source, 'esoagon');
    assert.equal(back.workouts.length, 2);
    const strip = ws => ws.map(w => ({ date: w.date, routine: w.routine, duration: w.duration, ex: w.exercises.map(e => [e.name, e.type, e.sets]) }));
    assert.deepEqual(strip(back.workouts), strip(original));
});

test('archivos desconocidos, fechas raras y nombres con código', () => {
    assert.throws(() => prepare('a,b,c\n1,2,3'), /No reconozco el archivo/);
    const bad = HEVY.replace('"Leg Day","2 Oct 2024, 07:00"', '"Leg Day","mañana"').replace('Plank', '<img src=x onerror=alert(1)>Plank');
    const r = plain(prepare(bad));
    assert.equal(r.errors.length, 1);
    assert.match(r.errors[0], /Fila 6/);
    assert.ok(r.workouts[0].exercises.every(e => !/[<>]/.test(e.name)));
});

test('fechas: ISO, "30 Sep 2024, 18:05", "Sep 30, 2024", día/mes y mes/día', () => {
    const d = (s, o) => plain(app('parseImportDate')(s, o));
    assert.deepEqual(d('2024-09-30 18:05:00'), { date: '2024-09-30', time: '18:05' });
    assert.deepEqual(d('30 Sep 2024, 18:05'), { date: '2024-09-30', time: '18:05' });
    assert.deepEqual(d('30 sept. 2024'), { date: '2024-09-30', time: null });
    assert.deepEqual(d('Sep 30, 2024'), { date: '2024-09-30', time: null });
    assert.equal(d('30/9/2024').date, '2024-09-30');
    assert.equal(d('9/30/2024').date, '2024-09-30');
    assert.equal(d('3/4/2024').date, '2024-04-03');
    assert.equal(d('3/4/2024', { monthFirst: true }).date, '2024-03-04');
    assert.equal(d('mañana'), null);
});
