// Repositorios: borrado lógico de sesiones y operaciones de rutinas.
const test = require('node:test');
const assert = require('node:assert/strict');
const { loadApp } = require('./helpers/load-app');
const legacy = require('./fixtures/legacy-data');

function setup() {
    const app = loadApp();
    const adapter = app('new MemoryAdapter()');
    const store = app('(a) => new Store(a, STORAGE_SCHEMA)')(adapter);
    store.set('workouts', legacy.workouts.map((w, i) => ({ ...w, uid: `uid-${i}`, updatedAt: '2026-01-01T00:00:00.000Z' })));
    return {
        store,
        workouts: app('(s) => new WorkoutRepository(s)')(store),
        routines: app('(s) => new RoutineRepository(s)')(store)
    };
}

test('borrar una sesión la oculta pero la conserva marcada (para sincronizar)', () => {
    const { store, workouts } = setup();
    const removed = workouts.remove(legacy.workouts[0].id);
    assert.ok(removed.deletedAt);
    assert.equal(workouts.all().length, 2, 'las pantallas ya no la ven');
    const raw = store.get('workouts');
    assert.equal(raw.length, 3, 'sigue guardada');
    assert.ok(raw[0].deletedAt && raw[0].updatedAt !== '2026-01-01T00:00:00.000Z');
});

test('editar después de borrar no pierde ni revive la sesión borrada', () => {
    const { store, workouts } = setup();
    workouts.remove(legacy.workouts[0].id);
    const list = workouts.all();
    list[0].date = '2026-12-31';
    workouts.saveAll(list);
    const raw = store.get('workouts');
    assert.equal(raw.length, 3);
    assert.ok(raw[0].deletedAt, 'la borrada sigue borrada');
    assert.equal(raw[1].date, '2026-12-31');
    assert.notEqual(raw[1].updatedAt, '2026-01-01T00:00:00.000Z', 'la editada tiene updatedAt nuevo');
    assert.equal(raw[2].updatedAt, '2026-01-01T00:00:00.000Z', 'la no tocada queda igual');
});

test('deshacer un borrado', () => {
    const { workouts } = setup();
    workouts.remove(legacy.workouts[1].id);
    workouts.restore(legacy.workouts[1].id);
    assert.equal(workouts.all().length, 3);
});

test('rutina nueva: plantilla y nombre juntos', () => {
    const { routines } = setup();
    routines.create('YOGA', 'Yoga');
    assert.deepEqual(JSON.parse(JSON.stringify(routines.custom().YOGA)), []);
    assert.equal(routines.labels().YOGA, 'Yoga');
});

test('borrar una rutina limpia plantilla, nombre y archivados en una transacción', () => {
    const { routines } = setup();
    routines.create('YOGA', 'Yoga');
    routines.saveArchived(new Set(['YOGA', 'B']));
    routines.saveArchivedExercises({ YOGA: ['Saludo al sol'] });
    routines.deleteForever('YOGA');
    assert.equal(routines.custom().YOGA, undefined);
    assert.equal(routines.labels().YOGA, undefined);
    assert.equal(routines.archivedExercises().YOGA, undefined);
    assert.deepEqual([...routines.archived()], ['B']);
});
