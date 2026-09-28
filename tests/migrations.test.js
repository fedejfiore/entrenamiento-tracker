// Migraciones: llevan los datos viejos al esquema actual una sola vez, con copia previa,
// y si algo falla dejan todo como estaba.
const test = require('node:test');
const assert = require('node:assert/strict');
const { loadApp } = require('./helpers/load-app');
const legacy = require('./fixtures/legacy-data');

function legacyStore() {
    const app = loadApp();
    const adapter = app('new MemoryAdapter()');
    adapter.set('workouts', JSON.stringify(legacy.workouts));
    adapter.set('bodyMetrics', JSON.stringify(legacy.bodyMetrics));
    adapter.set('customRoutines', JSON.stringify(legacy.customRoutines));
    adapter.set('deletedBaseRoutines', JSON.stringify(['B']));
    const store = app('(a) => new Store(a, STORAGE_SCHEMA)')(adapter);
    return { app, adapter, store, run: () => app('runMigrations')(store) };
}

test('v1 -> v2: cada sesión recibe uid y updatedAt, sin perder nada', () => {
    const { store, run, app } = legacyStore();
    const result = run();
    assert.deepEqual(JSON.parse(JSON.stringify(result.ran)), [2]);
    assert.equal(store.get('schemaVersion'), String(app('SCHEMA_VERSION')));

    const workouts = JSON.parse(JSON.stringify(store.get('workouts')));
    assert.equal(workouts.length, legacy.workouts.length);
    assert.ok(workouts.every(w => w.uid && w.updatedAt));
    assert.equal(new Set(workouts.map(w => w.uid)).size, workouts.length, 'uids únicos');
    // El resto de cada sesión queda igual.
    workouts.forEach((w, i) => {
        const { uid, updatedAt, ...rest } = w;
        assert.deepEqual(rest, legacy.workouts[i]);
    });
    // Rutinas archivadas con el nombre viejo pasan al nuevo.
    assert.deepEqual(JSON.parse(JSON.stringify(store.get('archivedRoutines'))), ['B']);
});

test('antes de migrar se guarda una copia completa', () => {
    const { store, run } = legacyStore();
    run();
    const copy = JSON.parse(store.get('preMigrationBackup'));
    assert.equal(copy.schemaVersion, 1);
    assert.deepEqual(copy.data.workouts, legacy.workouts);
});

test('corre una sola vez: los uid no cambian en la segunda apertura', () => {
    const { store, run } = legacyStore();
    run();
    const first = store.get('workouts').map(w => w.uid).join();
    const second = run();
    assert.equal(second.ran.length, 0);
    assert.equal(store.get('workouts').map(w => w.uid).join(), first);
});

test('si la migración falla, los datos quedan exactamente como estaban', () => {
    const { store, adapter, run } = legacyStore();
    const before = adapter.get('workouts');
    const originalSet = adapter.set.bind(adapter);
    adapter.set = (k, v) => {
        if (k === 'schemaVersion') throw Object.assign(new Error('sin espacio'), { name: 'QuotaExceededError' });
        originalSet(k, v);
    };
    const result = run();
    assert.ok(result.error);
    assert.equal(adapter.get('workouts'), before);
    assert.equal(adapter.get('schemaVersion'), null);
    assert.equal(store.get('workouts').some(w => w.uid), false);
});
