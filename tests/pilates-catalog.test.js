// Catálogo y programas de pilates: que cada ficha esté completa y bien referenciada.
const test = require('node:test');
const assert = require('node:assert/strict');
const { loadApp, CORE_FILES } = require('./helpers/load-app');

const app = loadApp([...CORE_FILES, 'js/domain/pilates.js', 'js/domain/pilates-catalog.js', 'js/domain/pilates-reformer.js', 'js/domain/programs.js', 'js/domain/pilates-programs.js']);
const EX = app('PILATES_EXERCISES');
const ERR = app('PILATES_ERRORS');
const CAUTION = app('PILATES_CAUTIONS');
const BREATH = app('PILATES_BREATH');
const EQUIP = app('PILATES_EQUIPMENT');
const GROUPS = app('MUSCLE_GROUPS');
const TYPES = app('EXERCISE_TYPES');
const norm = app('normalizeForCompare');

test('hay muchos ejercicios de mat y de reformer', () => {
    assert.ok(EX.filter(e => e.kind === 'mat').length >= 70, 'mat');
    assert.ok(EX.filter(e => e.kind === 'reformer').length >= 50, 'reformer');
});

test('los nombres no se repiten', () => {
    const names = EX.map(e => norm(e.name));
    assert.deepEqual([...names.filter((n, i) => names.indexOf(n) !== i)], []);
});

test('cada ficha está completa y sus referencias existen', () => {
    const problems = [];
    EX.forEach(e => {
        const p = msg => problems.push(`${e.name}: ${msg}`);
        if (![1, 2, 3].includes(e.lvl)) p('nivel');
        if (!GROUPS[e.muscle]) p(`músculo ${e.muscle}`);
        (e.also || []).forEach(m => { if (!GROUPS[m]) p(`músculo secundario ${m}`); });
        if (!TYPES[e.type]) p(`tipo ${e.type}`);
        if (!EQUIP[e.equip]) p(`elemento ${e.equip}`);
        if (!e.en) p('nombre para buscar el video');
        if (!Array.isArray(e.steps) || e.steps.length < 3) p('pasos');
        if (!e.easier || !e.harder) p('versiones más fácil y más difícil');
        if (!e.reps) p('objetivo');
        if (!BREATH[e.breath] && !(typeof e.breath === 'string' && e.breath.length > 20)) p(`respiración ${e.breath}`);
        if (!e.err.length) p('errores comunes');
        e.err.forEach(x => { if (typeof x === 'string' ? !ERR[x] : !(Array.isArray(x) && x.length === 2)) p(`error ${x}`); });
        e.caution.forEach(c => { if (!CAUTION[c]) p(`precaución ${c}`); });
        if (e.kind === 'reformer') {
            if (e.type !== 'springs') p('el reformer se mide con resortes');
            if (!['up', 'down', 'control'].includes(e.dir)) p('sentido de dificultad');
            if (!(e.load >= 0)) p('carga sugerida');
        }
    });
    assert.deepEqual(problems, []);
});

test('el grupo muscular de cada ejercicio sale del catálogo', () => {
    const groupOf = name => Object.keys(GROUPS).find(g => GROUPS[g].exercises.includes(name));
    assert.equal(groupOf('Los cien (Hundred)'), 'Core');
    assert.equal(groupOf('Footwork: talones'), 'Glúteos');
    assert.equal(app('catalogMuscleGroup')('Footwork: talones'), 'Glúteos');
    assert.equal(app('catalogMuscleGroup')('los cien (hundred)'), 'Core');
});

test('los programas de pilates usan ejercicios del catálogo con su tipo', () => {
    const info = app('pilatesExerciseInfo');
    const missing = [];
    app('PROGRAMS').filter(p => p.discipline).forEach(p => p.days.forEach(d => d.exercises.forEach(x => {
        const e = info(x.name);
        if (!e) missing.push(`${p.id}: ${x.name}`);
        else if (e.type !== x.type) missing.push(`${p.id}: ${x.name} es ${e.type} y el programa dice ${x.type}`);
        if (e && e.kind !== p.discipline) missing.push(`${p.id}: ${x.name} es de ${e.kind}`);
    })));
    assert.deepEqual(missing, []);
});

test('progresión en pilates: al tope, la versión más difícil (no peso)', () => {
    const s = app('suggestDoubleProgression')([{ reps: '10' }], { sets: 1, repsMin: 6, repsMax: 10, type: 'pilates' });
    assert.equal(s.action, 'level');
    assert.equal(s.kg, null);
    assert.match(s.text, /versión más difícil/);
});
