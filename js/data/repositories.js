// Repositorios: acceso a los datos por entidad, encima de Store. La app usa estos métodos
// (y db.get / db.set para preferencias simples) en lugar de tocar el almacenamiento.
// Al pasar a una base de datos real, estos métodos son los que se reimplementan (o se
// cambia el adaptador de Store) sin tocar las pantallas.

class WorkoutRepository {
    constructor(store) { this.store = store; }

    /** Sesiones vigentes (copia: modificarla no guarda nada hasta saveAll). */
    all() { return this.store.get('workouts').filter(w => !(w && w.deletedAt)); }

    /** Todas, incluidas las borradas (borrado lógico: necesarias para sincronizar). */
    allIncludingDeleted() { return this.store.get('workouts'); }

    /**
     * Borrado lógico: la sesión se marca con deletedAt (y updatedAt) en vez de quitarse,
     * así el borrado también se puede sincronizar con una base de datos. Desaparece de
     * todas las pantallas y estadísticas. Devuelve la sesión borrada o null.
     */
    remove(id) {
        let removed = null;
        this.store.transaction(tx => {
            const list = tx.get('workouts');
            const w = list.find(x => x && !x.deletedAt && (x.id === id || x.uid === id));
            if (!w) return;
            const now = new Date().toISOString();
            w.deletedAt = now;
            w.updatedAt = now;
            removed = w;
            tx.set('workouts', list);
        });
        return removed;
    }

    /** Deshace un borrado lógico. */
    restore(id) {
        this.store.transaction(tx => {
            const list = tx.get('workouts');
            const w = list.find(x => x && x.deletedAt && (x.id === id || x.uid === id));
            if (!w) return;
            delete w.deletedAt;
            w.updatedAt = new Date().toISOString();
            tx.set('workouts', list);
        });
    }

    /** Agrega una sesión nueva, validada. Devuelve el objeto guardado. */
    add(session) {
        const data = session instanceof WorkoutSession ? session.toJSON() : session;
        WorkoutSession.validate(data, 'La sesión nueva');
        this.store.transaction(tx => {
            const list = tx.get('workouts');
            list.push(data);
            tx.set('workouts', list);
        });
        return data;
    }

    /**
     * Guarda la lista completa después de editarla (ej. cambiar una fecha, unificar nombres).
     * Detecta qué sesiones cambiaron y les actualiza updatedAt: es lo que permite, a futuro,
     * sincronizar solo lo modificado con una base de datos real.
     */
    saveAll(list) {
        this.store.transaction(tx => {
            const stored = tx.get('workouts');
            const before = new Map(stored.filter(Boolean).map(w => [WorkoutRepository.keyOf(w), JSON.stringify(w)]));
            const now = new Date().toISOString();
            list.forEach(w => {
                if (!w || typeof w !== 'object') return;
                if (before.get(WorkoutRepository.keyOf(w)) !== JSON.stringify(w)) w.updatedAt = now;
            });
            // `list` suele venir de all() (sin las borradas): se combinan con lo guardado para
            // no perder las sesiones borradas lógicamente y conservar el orden original.
            const edited = new Map(list.filter(Boolean).map(w => [WorkoutRepository.keyOf(w), w]));
            const merged = stored.map(w => (w && edited.get(WorkoutRepository.keyOf(w))) || w);
            const storedKeys = new Set(stored.filter(Boolean).map(WorkoutRepository.keyOf));
            list.forEach(w => { if (w && !storedKeys.has(WorkoutRepository.keyOf(w))) merged.push(w); });
            tx.set('workouts', merged);
        });
    }

    static keyOf(w) { return w.uid || `id:${w.id}`; }
}

class BodyMetricsRepository {
    constructor(store) { this.store = store; }

    all() { return this.store.get('bodyMetrics'); }

    add(measurement) {
        BodyMeasurement.validate(measurement, 'La medida nueva');
        this.store.transaction(tx => {
            const list = tx.get('bodyMetrics');
            list.push(measurement);
            tx.set('bodyMetrics', list);
        });
        return measurement;
    }
}

/**
 * Rutinas del usuario. Una rutina es una clave ("A1", "YOGA"…) con su lista ordenada de
 * ejercicios, un nombre visible opcional, y puede estar archivada (no aparece en el
 * selector, no se borra nada). Las rutinas base del código (catalog.js) se pueden
 * personalizar: la versión guardada reemplaza a la base.
 */
class RoutineRepository {
    constructor(store) { this.store = store; }

    custom() { return this.store.get('customRoutines'); }
    saveCustom(map) { this.store.set('customRoutines', map); }

    labels() { return this.store.get('customRoutineLabels'); }
    saveLabels(map) { this.store.set('customRoutineLabels', map); }

    /** Claves archivadas. Si falta la clave nueva se usa la vieja (la migración 2 la copia). */
    archived() {
        const saved = this.store.has('archivedRoutines') ? this.store.get('archivedRoutines') : this.store.get('deletedBaseRoutines');
        return new Set(Array.isArray(saved) ? saved : []);
    }
    saveArchived(set) { this.store.set('archivedRoutines', [...set]); }

    /** { claveRutina: [ejercicios archivados] } */
    archivedExercises() { return this.store.get('archivedExercises'); }
    saveArchivedExercises(map) { this.store.set('archivedExercises', map); }

    /** Crea una rutina vacía con su nombre visible, en una transacción. */
    create(key, label) {
        this.store.transaction(tx => {
            const custom = tx.get('customRoutines');
            const labels = tx.get('customRoutineLabels');
            custom[key] = [];
            labels[key] = label;
            tx.set('customRoutines', custom);
            tx.set('customRoutineLabels', labels);
        });
    }

    /** Borra definitivamente una rutina personalizada: plantilla, nombre y archivados. */
    deleteForever(key) {
        this.store.transaction(tx => {
            const custom = tx.get('customRoutines');
            const labels = tx.get('customRoutineLabels');
            const archivedEx = tx.get('archivedExercises');
            delete custom[key];
            delete labels[key];
            delete archivedEx[key];
            const archived = this.archived();
            archived.delete(key);
            tx.set('customRoutines', custom);
            tx.set('customRoutineLabels', labels);
            tx.set('archivedExercises', archivedEx);
            tx.set('archivedRoutines', [...archived]);
        });
    }

    /** Objetivos (series, rango de reps…) de los ejercicios de una rutina, o {}. */
    targets(routineKey) { return this.store.get('routineTargets')[routineKey] || {}; }

    activeProgram() {
        const p = this.store.get('activeProgram');
        return p && p.id ? p : null;
    }

    /**
     * Empieza un programa en una sola transacción: crea (o actualiza) sus rutinas con los
     * objetivos de cada ejercicio y lo marca como el programa en curso.
     * days: [{ key, label, exercises: [nombres], targets: { ejercicioNormalizado: {...} } }]
     */
    startProgram(programId, days, startedAt) {
        this.store.transaction(tx => {
            const custom = tx.get('customRoutines');
            const labels = tx.get('customRoutineLabels');
            const targets = tx.get('routineTargets');
            days.forEach(d => {
                custom[d.key] = [...d.exercises];
                labels[d.key] = d.label;
                targets[d.key] = d.targets;
            });
            tx.set('customRoutines', custom);
            tx.set('customRoutineLabels', labels);
            tx.set('routineTargets', targets);
            tx.set('activeProgram', { id: programId, startedAt, routines: days.map(d => d.key) });
        });
    }

    /** Termina el programa: se van los objetivos, las rutinas y su historial quedan. */
    endProgram() {
        this.store.transaction(tx => {
            const active = tx.get('activeProgram');
            const targets = tx.get('routineTargets');
            (active.routines || []).forEach(k => { delete targets[k]; });
            tx.set('routineTargets', targets);
            tx.set('activeProgram', {});
        });
    }

    hasPlanHistory() { return this.store.has('trainingDaysPlanHistory'); }
    planHistory() { return this.store.get('trainingDaysPlanHistory'); }
    savePlanHistory(list) { this.store.set('trainingDaysPlanHistory', list); }
}

/** Almacenamiento principal de la app: localStorage, o memoria si el navegador lo bloquea. */
const db = new Store(LocalStorageAdapter.isAvailable() ? new LocalStorageAdapter() : new MemoryAdapter(), STORAGE_SCHEMA);

const repo = {
    workouts: new WorkoutRepository(db),
    bodyMetrics: new BodyMetricsRepository(db),
    routines: new RoutineRepository(db)
};
