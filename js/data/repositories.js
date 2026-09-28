// Repositorios: acceso a los datos por entidad, encima de Store. La app usa estos métodos
// (y db.get / db.set para preferencias simples) en lugar de tocar el almacenamiento.
// Al pasar a una base de datos real, estos métodos son los que se reimplementan (o se
// cambia el adaptador de Store) sin tocar las pantallas.

class WorkoutRepository {
    constructor(store) { this.store = store; }

    /** Todas las sesiones (copia: modificarla no guarda nada hasta saveAll). */
    all() { return this.store.get('workouts'); }

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
            const before = new Map(tx.get('workouts').filter(Boolean).map(w => [WorkoutRepository.keyOf(w), JSON.stringify(w)]));
            const now = new Date().toISOString();
            list.forEach(w => {
                if (!w || typeof w !== 'object') return;
                if (!w.uid) w.uid = generateId();
                if (before.get(WorkoutRepository.keyOf(w)) !== JSON.stringify(w)) w.updatedAt = now;
            });
            tx.set('workouts', list);
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

/** Almacenamiento principal de la app: localStorage, o memoria si el navegador lo bloquea. */
const db = new Store(LocalStorageAdapter.isAvailable() ? new LocalStorageAdapter() : new MemoryAdapter(), STORAGE_SCHEMA);

const repo = {
    workouts: new WorkoutRepository(db),
    bodyMetrics: new BodyMetricsRepository(db)
};
