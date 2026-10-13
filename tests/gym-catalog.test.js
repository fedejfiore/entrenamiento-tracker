// Catálogo de gimnasio: que cada ficha esté completa, bien referenciada y traducida, y que no
// cambie el grupo muscular de los ejercicios que ya existían (el historial no se mueve).
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { loadApp, CORE_FILES } = require('./helpers/load-app');

const before = loadApp([...CORE_FILES]);
const app = loadApp([...CORE_FILES, 'js/domain/gym-catalog.js']);
const EX = app('GYM_EXERCISES');
const ERR = app('GYM_ERRORS');
const CAUTION = app('GYM_CAUTIONS');
const EQUIP = app('GYM_EQUIPMENT');
const GROUPS = app('MUSCLE_GROUPS');
const TYPES = app('EXERCISE_TYPES');
const norm = app('normalizeForCompare');
const info = app('gymExerciseInfo');

test('hay ejercicios para cada músculo', () => {
    assert.ok(EX.length >= 90);
    ['Pecho', 'Espalda', 'Hombros', 'Bíceps', 'Tríceps', 'Cuádriceps', 'Isquios', 'Glúteos', 'Gemelos', 'Core']
        .forEach(m => assert.ok(EX.filter(e => e.muscle === m).length >= 3, m));
});

test('los nombres y alias no se repiten', () => {
    const names = EX.flatMap(e => [e.name, ...e.aliases]).map(norm);
    assert.deepEqual([...names.filter((n, i) => names.indexOf(n) !== i)], []);
});

test('cada ficha está completa y sus referencias existen', () => {
    const problems = [];
    EX.forEach(e => {
        const p = msg => problems.push(`${e.name}: ${msg}`);
        if (![1, 2, 3].includes(e.lvl)) p('nivel');
        if (!GROUPS[e.muscle]) p(`músculo ${e.muscle}`);
        e.also.forEach(m => { if (!GROUPS[m] || m === e.muscle) p(`secundario ${m}`); });
        if (!EQUIP[e.equip]) p(`equipo ${e.equip}`);
        if (!TYPES[e.type] || TYPES[e.type].discipline) p(`tipo ${e.type}`);
        if (e.steps.length < 3) p('pasos');
        if (!e.err.length) p('errores');
        e.err.forEach(x => { if (typeof x === 'string' ? !ERR[x] : x.length !== 2) p(`error ${x}`); });
        e.caution.forEach(c => { if (!CAUTION[c]) p(`precaución ${c}`); });
        e.alt.forEach(a => { if (!info(a)) p(`alternativa ${a}`); if (norm(a) === norm(e.name)) p('se nombra a sí mismo'); });
        if (!/^[a-z0-9 -]+$/.test(e.en)) p('nombre en inglés para el video');
    });
    assert.deepEqual(problems, []);
});

test('la ficha se encuentra por el nombre o por un alias (sin importar acentos)', () => {
    assert.equal(info('Mariposa').name, 'Aperturas en mariposa');
    assert.equal(info('extension de cuadriceps').name, 'Extensión de piernas');
    assert.equal(info('Algo inventado'), null);
});

test('los ejercicios que ya estaban clasificados conservan su grupo muscular', () => {
    const old = before('EXERCISE_TO_MUSCLE_GROUP');
    const now = app('EXERCISE_TO_MUSCLE_GROUP');
    const changed = Object.keys(old).filter(k => old[k] !== now[k]);
    assert.deepEqual(changed, []);
    assert.equal(now[norm('Peso muerto con kettlebell')], 'Isquios', 'los nuevos suman su grupo');
});

test('todos los textos de las fichas están traducidos', () => {
    const texts = new Set();
    Object.values(ERR).forEach(pair => pair.forEach(t => texts.add(t)));
    Object.values(CAUTION).forEach(t => texts.add(t));
    EX.forEach(e => {
        e.steps.forEach(t => texts.add(t));
        e.err.forEach(x => { if (Array.isArray(x)) x.forEach(t => texts.add(t)); });
    });
    ['en', 'pt', 'de', 'zh'].forEach(lang => {
        const ctx = { I18N_DICTIONARIES: {} };
        vm.runInNewContext(fs.readFileSync(path.join(__dirname, '..', 'js', 'i18n', `${lang}.js`), 'utf8'), ctx);
        const missing = [...texts].filter(t => !(t in ctx.I18N_DICTIONARIES[lang].text));
        assert.deepEqual(missing, [], lang);
    });
});
