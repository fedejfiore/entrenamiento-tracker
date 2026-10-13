// Manejo de errores: capturar, no repetir avisos y proteger funciones (también asincrónicas).
const test = require('node:test');
const assert = require('node:assert/strict');
const { loadApp } = require('./helpers/load-app');

const app = loadApp(['js/core/errors.js']);
const ErrorReporter = app('ErrorReporter');

function reporter() {
    let clock = 0;
    const notes = [];
    const r = new ErrorReporter({ notify: m => notes.push(m), max: 3, quietMs: 1000, now: () => clock });
    return { r, notes, tick: ms => { clock += ms; } };
}

test('captura el error, avisa una vez y no vuelve a avisar enseguida', () => {
    const { r, notes, tick } = reporter();
    r.capture(new Error('uno'), 'prueba');
    r.capture(new Error('dos'), 'prueba');
    assert.equal(notes.length, 1);
    tick(1500);
    r.capture('tres');
    assert.equal(notes.length, 2);
    assert.equal(r.lastMessage(), 'tres');
});

test('guarda solo los últimos errores', () => {
    const { r } = reporter();
    ['a', 'b', 'c', 'd'].forEach(m => r.capture(new Error(m), 'x'));
    assert.deepEqual([...r.recent.map(e => e.message)], ['b', 'c', 'd']);
    assert.equal(r.lastMessage(), 'd (x)');
});

test('run: si la función lanza, devuelve el valor de reserva y la app sigue', () => {
    const { r } = reporter();
    assert.equal(r.run(() => { throw new Error('falla'); }, 'paso', 'reserva'), 'reserva');
    assert.equal(r.run(() => 42), 42);
    assert.equal(r.recent.length, 1);
});

test('run: también protege promesas rechazadas', async () => {
    const { r } = reporter();
    const out = await r.run(async () => { throw new Error('async'); }, 'paso', 'ok');
    assert.equal(out, 'ok');
    assert.equal(r.lastMessage(), 'async (paso)');
});

test('guard: protege un manejador de eventos y conserva this y argumentos', () => {
    const { r } = reporter();
    const obj = { n: 2, f: r.guard(function (x) { return this.n * x; }) };
    assert.equal(obj.f(5), 10);
    const bad = r.guard(() => { throw new Error('boom'); }, 'click');
    assert.equal(bad(), undefined);
    assert.equal(r.lastMessage(), 'boom (click)');
});

test('el propio manejador nunca falla (aunque falle el aviso)', () => {
    const r = new ErrorReporter({ notify: () => { throw new Error('aviso roto'); } });
    assert.doesNotThrow(() => r.capture(new Error('x')));
});
