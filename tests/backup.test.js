// Backup: incluye todos los datos del esquema, se valida antes de escribir y restaura
// todo junto. Acepta backups viejos y sigue siendo legible por versiones anteriores.
const test = require('node:test');
const assert = require('node:assert/strict');
const { loadApp } = require('./helpers/load-app');
const legacy = require('./fixtures/legacy-data');

function setup() {
    const app = loadApp();
    const adapter = app('new MemoryAdapter()');
    const store = app('(a) => new Store(a, STORAGE_SCHEMA)')(adapter);
    // Grabaciones en memoria (en el navegador es IndexedDB).
    const recordings = {
        saved: { restWarn: { mime: 'audio/webm', duration: 1.2, updatedAt: 1, data: 'AAEC' } },
        async exportAll() { return { ...this.saved }; },
        async replaceAll(map) { this.saved = { ...map }; }
    };
    const service = app('(s, r) => new BackupService(s, r)')(store, recordings);
    return { app, store, service, recordings };
}

test('el backup incluye datos y preferencias, y las claves sueltas para versiones viejas', async () => {
    const { store, service } = setup();
    store.transaction(tx => {
        tx.set('workouts', legacy.workouts);
        tx.set('customRoutines', legacy.customRoutines);
        tx.set('customRoutineLabels', { A1: 'Empuje' });
        tx.set('theme', 'light');
        tx.set('workoutDraft', { algo: 1 }); // estado temporal: NO va al backup
    });
    const b = JSON.parse(JSON.stringify(await service.build()));
    assert.equal(b.format, 'entrenamiento-tracker-backup');
    assert.equal(b.data.customRoutineLabels.A1, 'Empuje');
    assert.equal(b.data.theme, 'light');
    assert.equal(b.data.workoutDraft, undefined);
    assert.deepEqual(b.workouts, legacy.workouts, 'clave suelta para versiones anteriores');
    assert.equal(b.recordings.restWarn.data, 'AAEC');
});

test('ida y vuelta: restaurar un backup deja todo igual', async () => {
    const { store, service, recordings } = setup();
    store.transaction(tx => {
        tx.set('workouts', legacy.workouts);
        tx.set('bodyMetrics', legacy.bodyMetrics);
        tx.set('customRoutineLabels', { A1: 'Empuje' });
    });
    const text = JSON.stringify(await service.build());
    store.set('customRoutineLabels', { A1: 'cambiado' });
    recordings.saved = {};
    await service.restore(service.parse(text));
    assert.equal(store.get('customRoutineLabels').A1, 'Empuje');
    assert.equal(store.get('bodyMetrics').length, 2);
    assert.ok(recordings.saved.restWarn);
});

test('backup viejo: restaura sus claves y no toca el resto', async () => {
    const { store, service, recordings } = setup();
    store.set('customRoutineLabels', { A1: 'Empuje' });
    const parsed = service.parse(JSON.stringify({ version: '2.0', ...legacy }));
    assert.equal(parsed.summary.sessions, 3);
    assert.equal(parsed.recordings, null);
    await service.restore(parsed);
    assert.equal(store.get('workouts').length, 3);
    assert.equal(store.get('customRoutineLabels').A1, 'Empuje');
    assert.equal(store.get('schemaVersion'), '1', 'las migraciones corren al recargar');
    assert.ok(recordings.saved.restWarn, 'sin grabaciones en el archivo: se conservan las actuales');
});

test('un archivo inválido no escribe nada', () => {
    const { store, service } = setup();
    store.set('customRoutineLabels', { A1: 'Empuje' });
    assert.throws(() => service.parse('no es json'), /JSON/);
    assert.throws(() => service.parse('{"hola":1}'), /workouts/);
    assert.throws(() => service.parse(JSON.stringify({ workouts: [], customRoutines: [] })), /customRoutines/);
    assert.equal(store.get('customRoutineLabels').A1, 'Empuje');
});

test('las fotos entran en el backup y se restauran', async () => {
    const app = loadApp();
    const store = app('(a) => new Store(a, STORAGE_SCHEMA)')(app('new MemoryAdapter()'));
    store.set('workouts', legacy.workouts);
    const mem = saved => ({ saved, async exportAll() { return { ...this.saved }; }, async replaceAll(map) { this.saved = { ...map }; } });
    const recordings = mem({});
    const photos = mem({ avatar: { kind: 'avatar', mime: 'image/jpeg', updatedAt: 1, data: 'AAEC' } });
    const service = app('(s, r, p) => new BackupService(s, r, p)')(store, recordings, photos);
    const backup = await service.build();
    assert.equal(backup.photos.avatar.kind, 'avatar');
    const parsed = service.parse(JSON.stringify(backup));
    assert.equal(parsed.summary.photos, 1);
    photos.saved = {};
    await service.restore(parsed);
    assert.equal(photos.saved.avatar.data, 'AAEC');
});
