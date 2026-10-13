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

test('empezar un programa crea sus rutinas con objetivos; terminarlo deja las rutinas', () => {
    const { store, routines } = setup();
    routines.create('MIA', 'Mi rutina');
    const days = [
        { key: 'PRG_X_A', label: 'X · Día A', exercises: ['Sentadilla', 'Remo'], targets: { sentadilla: { sets: 3, repsMin: 8, repsMax: 12 } } },
        { key: 'PRG_X_B', label: 'X · Día B', exercises: ['Press'], targets: {} }
    ];
    routines.startProgram('x', days, '2026-09-28');
    assert.deepEqual([...store.get('customRoutines').PRG_X_A], ['Sentadilla', 'Remo']);
    assert.equal(store.get('customRoutineLabels').PRG_X_B, 'X · Día B');
    assert.equal(routines.targets('PRG_X_A').sentadilla.repsMax, 12);
    assert.equal(routines.activeProgram().id, 'x');
    assert.ok(store.get('customRoutines').MIA, 'no toca las rutinas propias');

    routines.endProgram();
    assert.equal(routines.activeProgram(), null);
    assert.deepEqual(JSON.parse(JSON.stringify(routines.targets('PRG_X_A'))), {});
    assert.ok(store.get('customRoutines').PRG_X_A, 'las rutinas del programa quedan');
});

test('un programa activo por módulo: gimnasio y pilates a la vez, y se termina cada uno por separado', () => {
    const app = loadApp();
    const store = app('(a) => new Store(a, STORAGE_SCHEMA)')(app('new MemoryAdapter()'));
    const moduleOf = id => (id.startsWith('p') ? 'pilates' : 'gym');
    const routines = app('(s, m) => new RoutineRepository(s, m)')(store, moduleOf);
    routines.startProgram('fb3', [{ key: 'PRG_FB3_A', label: 'A', exercises: ['Sentadilla'], targets: { sentadilla: { sets: 3 } } }], '2026-10-01');
    routines.startProgram('pmat1', [{ key: 'PRG_PMAT1_A', label: 'Mat', exercises: ['Cien'], targets: { cien: { sets: 1 } } }], '2026-10-02');
    assert.equal(routines.activeProgram('gym').id, 'fb3');
    assert.equal(routines.activeProgram('pilates').id, 'pmat1');
    routines.endProgram('pilates');
    assert.equal(routines.activeProgram('pilates'), null);
    assert.equal(routines.activeProgram('gym').id, 'fb3', 'el de gimnasio sigue');
    assert.equal(routines.targets('PRG_FB3_A').sentadilla.sets, 3);
});

test('el formato viejo (un solo programa) se lee en el módulo de ese programa', () => {
    const app = loadApp();
    const store = app('(a) => new Store(a, STORAGE_SCHEMA)')(app('new MemoryAdapter()'));
    store.set('activeProgram', { id: 'pmat1', startedAt: '2026-09-01', routines: ['PRG_PMAT1_A'] });
    const routines = app('(s, m) => new RoutineRepository(s, m)')(store, id => (id.startsWith('p') ? 'pilates' : 'gym'));
    assert.equal(routines.activeProgram('gym'), null);
    assert.equal(routines.activeProgram('pilates').id, 'pmat1');
    routines.startProgram('fb3', [{ key: 'PRG_FB3_A', label: 'A', exercises: [], targets: {} }], '2026-10-01');
    assert.equal(routines.activeProgram('pilates').id, 'pmat1', 'al guardar, el viejo pasa al formato nuevo sin perderse');
});
