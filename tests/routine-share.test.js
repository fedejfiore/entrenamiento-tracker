// Compartir rutinas por link: ida y vuelta, y validación de links manipulados.
const test = require('node:test');
const assert = require('node:assert/strict');
const { loadApp, CORE_FILES } = require('./helpers/load-app');

const app = loadApp([...CORE_FILES, 'js/domain/routine-share.js']);
const encode = app('encodeRoutineShare');
const decode = app('decodeRoutineShare');
const toB64 = app('toBase64Url');
const plain = v => JSON.parse(JSON.stringify(v));

test('ida y vuelta: nombre, tipos y objetivos (con tildes y ñ)', () => {
    const code = encode({ label: 'Pierna de Ñandú', exercises: [
        { name: 'Sentadilla búlgara', type: 'kg', target: { sets: 3, repsMin: 8, repsMax: 12, rest: 90 } },
        { name: 'Plancha', type: 'time' }
    ] });
    assert.match(code, /^[A-Za-z0-9_-]+$/);
    const r = plain(decode(code));
    assert.equal(r.label, 'Pierna de Ñandú');
    assert.deepEqual(r.exercises[0], { name: 'Sentadilla búlgara', type: 'kg', target: { sets: 3, repsMin: 8, repsMax: 12, rest: 90, inc: 2.5 } });
    assert.deepEqual(r.exercises[1], { name: 'Plancha', type: 'time', target: null });
});

test('links dañados o manipulados se rechazan con un mensaje claro', () => {
    assert.throws(() => decode(''), /incompleto/);
    assert.throws(() => decode('abc$%'), /no es válido/);
    assert.throws(() => decode('x'.repeat(20000)), /largo/);
    assert.throws(() => decode(toB64('no es json')), /dañado/);
    assert.throws(() => decode(toB64(JSON.stringify({ v: 99, n: 'X', e: [{ n: 'A' }] }))), /otra versión/);
    assert.throws(() => decode(toB64(JSON.stringify({ v: 1, n: 'X', e: [] }))), /no tiene ejercicios/);
});

test('se limpian nombres, tipos desconocidos, duplicados y números fuera de rango', () => {
    const evil = { v: 1, n: '<img src=x onerror=alert(1)>\u0007' + 'a'.repeat(200), e: [
        { n: 'Press‮ banca', t: 'hackeo', g: [999, -1, 5, 5] },
        { n: 'press banca' },
        { n: '' },
        { n: 'Remo', g: [3, 12, 8, 60] }
    ] };
    const r = plain(decode(toB64(JSON.stringify(evil))));
    assert.equal(r.label.length, 80);
    assert.ok(!/[\u0000-\u001f‮]/.test(r.label + r.exercises.map(e => e.name).join('')));
    assert.equal(r.exercises.length, 2, 'sin vacíos ni duplicados');
    assert.equal(r.exercises[0].type, null);
    assert.equal(r.exercises[0].target, null, 'objetivo fuera de rango se descarta');
    assert.equal(r.exercises[1].target, null, 'mínimo mayor que máximo se descarta');
});

test('como mucho 40 ejercicios', () => {
    const many = { v: 1, n: 'X', e: Array.from({ length: 60 }, (_, i) => ({ n: `Ej ${i}` })) };
    assert.equal(plain(decode(toB64(JSON.stringify(many)))).exercises.length, 40);
});
