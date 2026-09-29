// Migraciones del esquema de datos. Cada una lleva los datos de la versión anterior a
// `to`. Corren una sola vez al abrir la app, todas juntas en UNA transacción (o se aplican
// todas o ninguna), y antes se guarda una copia completa en "preMigrationBackup".
//
// Para agregar una: subir SCHEMA_VERSION en schema.js y sumar { to, description, run }.
// run(tx) recibe la transacción: leer con tx.get(clave), escribir con tx.set(clave, valor).

const MIGRATIONS = [
    {
        to: 2,
        description: 'Cada sesión recibe un id único universal (uid) y su fecha de modificación (updatedAt), necesarios para sincronizar con una base de datos real.',
        run(tx) {
            const workouts = tx.get('workouts');
            let changed = false;
            workouts.forEach(w => {
                if (!w || typeof w !== 'object') return;
                if (!w.uid) { w.uid = generateId(); changed = true; }
                if (!w.updatedAt) { w.updatedAt = WorkoutSession.inferUpdatedAt(w); changed = true; }
            });
            if (changed) tx.set('workouts', workouts);

            // Nombre viejo de las rutinas archivadas.
            const legacyArchived = tx.get('deletedBaseRoutines');
            if (tx.store.adapter.get('archivedRoutines') === null && Array.isArray(legacyArchived)) {
                tx.set('archivedRoutines', legacyArchived);
            }
        }
    },
    {
        to: 3,
        description: 'La rutina de fútbol (día de partido) deja de ser una rutina básica de la app: si el usuario la usa, pasa a sus propias rutinas con el mismo nombre, así su historial sigue igual.',
        run(tx) {
            const usesFootball = tx.get('workouts').some(w => w && w.routine === 'FUT');
            const custom = tx.get('customRoutines');
            if (!usesFootball || custom.FUT) return;
            custom.FUT = ['Partido de fútbol'];
            tx.set('customRoutines', custom);
            const labels = tx.get('customRoutineLabels');
            if (!labels.FUT) { labels.FUT = '⚽ Fútbol (día de partido)'; tx.set('customRoutineLabels', labels); }
        }
    }
];

/**
 * Lleva los datos guardados a SCHEMA_VERSION. Devuelve { from, to, ran[] } o { error }.
 * Si algo falla, los datos quedan exactamente como estaban y la app sigue funcionando.
 */
function runMigrations(store) {
    const from = parseInt(store.get('schemaVersion') || '1', 10) || 1;
    const pending = MIGRATIONS.filter(m => m.to > from && m.to <= SCHEMA_VERSION).sort((a, b) => a.to - b.to);
    if (pending.length === 0) return { from, to: from, ran: [] };

    try {
        const copy = JSON.stringify({
            takenAt: new Date().toISOString(),
            schemaVersion: from,
            data: store.snapshot(def => def.group !== 'meta')
        });
        store.set('preMigrationBackup', copy);
    } catch (err) {
        // Sin copia de seguridad no se migra: mejor seguir con el formato anterior.
        console.error('No se pudo guardar la copia previa a la migración; no se migra.', err);
        return { from, to: from, ran: [], error: err };
    }

    try {
        store.transaction(tx => {
            pending.forEach(m => m.run(tx));
            tx.set('schemaVersion', String(SCHEMA_VERSION));
        });
        return { from, to: SCHEMA_VERSION, ran: pending.map(m => m.to) };
    } catch (err) {
        console.error('Falló la migración de datos; quedaron como estaban.', err);
        return { from, to: from, ran: [], error: err };
    }
}
