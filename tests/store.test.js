// Store: transacciones atómicas, validación por esquema y formato guardado.
const test = require('node:test');
const assert = require('node:assert/strict');
const { loadApp } = require('./helpers/load-app');

function freshStore(initial = {}) {
    const app = loadApp();
    const adapter = app('new MemoryAdapter()');
    Object.entries(initial).forEach(([k, v]) => adapter.set(k, v));
    const store = app('(adapter) => new Store(adapter, STORAGE_SCHEMA)')(adapter);
    return { app, adapter, store };
}

test('get devuelve el valor por defecto si no hay nada guardado', () => {
    const { store } = freshStore();
    assert.deepEqual(JSON.parse(JSON.stringify(store.get('workouts'))), []);
    assert.equal(store.get('theme'), null);
});

test('las claves de texto se guardan tal cual (compatibles con datos viejos)', () => {
    const { store, adapter } = freshStore({ theme: 'light' });
    assert.equal(store.get('theme'), 'light');
    store.set('theme', 'dark');
    assert.equal(adapter.get('theme'), 'dark');
});

test('un dato ilegible vuelve al valor por defecto en vez de romper la app', () => {
    const { store } = freshStore({ customRoutines: '{roto' });
    assert.deepEqual(JSON.parse(JSON.stringify(store.get('customRoutines'))), {});
});

test('atomicidad: si falla una escritura, se deshacen las anteriores', () => {
    const { store, adapter } = freshStore({ customRoutineLabels: '{"A":"antes"}' });
    const originalSet = adapter.set.bind(adapter);
    let calls = 0;
    adapter.set = (k, v) => {
        if (++calls === 2) { const e = new Error('sin espacio'); e.name = 'QuotaExceededError'; throw e; }
        originalSet(k, v);
    };
    assert.throws(() => store.transaction(tx => {
        tx.set('customRoutineLabels', { A: 'después' });
        tx.set('archivedRoutines', ['A']);
    }), err => err.name === 'StorageError' && /espacio/.test(err.message));
    assert.equal(adapter.get('customRoutineLabels'), '{"A":"antes"}');
    assert.equal(adapter.get('archivedRoutines'), null);
});

test('atomicidad: un error dentro de la transacción no escribe nada', () => {
    const { store, adapter } = freshStore();
    assert.throws(() => store.transaction(tx => {
        tx.set('customRoutineLabels', { A: 'x' });
        throw new Error('algo falló');
    }));
    assert.equal(adapter.get('customRoutineLabels'), null);
});

test('una transacción dentro de otra se confirma una sola vez, al final', () => {
    const { store, adapter } = freshStore();
    store.transaction(() => {
        store.set('customRoutineLabels', { A: 'x' });
        assert.equal(adapter.get('customRoutineLabels'), null, 'todavía no se escribió');
        assert.equal(store.get('customRoutineLabels').A, 'x', 'pero se lee lo preparado');
    });
    assert.equal(adapter.get('customRoutineLabels'), '{"A":"x"}');
});

test('consistencia: tipos y claves se validan contra el esquema', () => {
    const { store } = freshStore();
    assert.throws(() => store.set('customRoutines', []), /tipo object/);
    assert.throws(() => store.set('claveInventada', 1), /desconocida/);
});

test('onChange avisa qué claves cambiaron', () => {
    const { store } = freshStore();
    const seen = [];
    store.onChange((keys, origin) => seen.push([...keys, origin]));
    store.transaction(tx => { tx.set('theme', 'dark'); tx.set('soundType', 'chime'); });
    assert.deepEqual(seen, [['theme', 'soundType', 'local']]);
});
