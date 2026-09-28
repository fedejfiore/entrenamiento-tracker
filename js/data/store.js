// Capa de persistencia: el ÚNICO lugar de la app que lee y escribe datos guardados.
//
// Store habla con un "adaptador" que sabe guardar texto por clave. Hoy es localStorage;
// para pasar a una base de datos real (SQLite en una app nativa, o una API) alcanza con
// escribir otro adaptador con los mismos 4 métodos — el resto de la app no cambia.
//
// Garantías (ACID, adaptado a una app local):
//   Atomicidad   transaction(): todas las escrituras se preparan en memoria y se aplican
//                juntas; si una falla (ej. sin espacio), se deshacen las ya aplicadas.
//   Consistencia cada clave está declarada en el esquema (js/data/schema.js) con su tipo
//                y, si hace falta, un validador; un dato inválido aborta la transacción.
//   Aislamiento  las transacciones son sincrónicas (no se pueden intercalar dentro de la
//                pestaña) y los cambios hechos desde OTRA pestaña se avisan con onChange().
//   Durabilidad  localStorage persiste al cerrar; requestPersistence() le pide al navegador
//                que no lo borre por falta de espacio, y las migraciones guardan una copia
//                antes de tocar nada (js/data/migrations.js).

class ValidationError extends Error {
    constructor(message, details) {
        super(message);
        this.name = 'ValidationError';
        this.details = details;
    }
}

class StorageError extends Error {
    constructor(message, cause) {
        super(message);
        this.name = 'StorageError';
        this.cause = cause;
    }
}

/**
 * Adaptador sobre localStorage.
 * Interfaz que debe cumplir cualquier adaptador:
 *   get(key) → string | null     set(key, string)     remove(key)     keys() → string[]
 */
class LocalStorageAdapter {
    get(key) { return window.localStorage.getItem(key); }
    set(key, value) { window.localStorage.setItem(key, value); }
    remove(key) { window.localStorage.removeItem(key); }
    keys() { return Object.keys(window.localStorage); }

    static isAvailable() {
        try {
            const probe = '__storage_probe__';
            window.localStorage.setItem(probe, '1');
            window.localStorage.removeItem(probe);
            return true;
        } catch (e) {
            return false;
        }
    }
}

/** Adaptador en memoria: para pruebas y como respaldo si el navegador bloquea localStorage. */
class MemoryAdapter {
    constructor(initial = {}) { this.map = new Map(Object.entries(initial)); }
    get(key) { return this.map.has(key) ? this.map.get(key) : null; }
    set(key, value) { this.map.set(key, String(value)); }
    remove(key) { this.map.delete(key); }
    keys() { return [...this.map.keys()]; }
}

/** Escrituras preparadas de una transacción (todavía no aplicadas). */
class Transaction {
    constructor(store) {
        this.store = store;
        this.staged = new Map(); // clave -> texto a guardar, o null para borrar
    }

    /** Lee viendo lo ya preparado en esta misma transacción. */
    get(key) {
        const raw = this.staged.has(key) ? this.staged.get(key) : this.store.adapter.get(key);
        return this.store.decode(key, raw);
    }

    set(key, value) {
        this.store.validate(key, value);
        this.staged.set(key, this.store.encode(key, value));
    }

    remove(key) {
        this.store.definition(key); // falla si la clave no existe en el esquema
        this.staged.set(key, null);
    }

    get changedKeys() { return [...this.staged.keys()]; }

    commit() {
        const adapter = this.store.adapter;
        const previous = [];
        try {
            for (const [key, raw] of this.staged) {
                previous.push([key, adapter.get(key)]);
                if (raw === null) adapter.remove(key);
                else adapter.set(key, raw);
            }
        } catch (err) {
            // Atomicidad: se vuelve todo a como estaba antes de empezar.
            for (const [key, raw] of previous.reverse()) {
                try { raw === null ? adapter.remove(key) : adapter.set(key, raw); } catch (e) { /* mejor esfuerzo */ }
            }
            const quota = err && (err.name === 'QuotaExceededError' || err.code === 22 || err.code === 1014);
            throw new StorageError(quota
                ? 'No hay más espacio para guardar en este navegador. Descargá un backup y liberá espacio.'
                : 'No se pudieron guardar los cambios.', err);
        }
    }
}

class Store {
    /**
     * @param adapter  ver LocalStorageAdapter
     * @param schema   { [clave]: { type, format, default, validate?, ... } } — js/data/schema.js
     */
    constructor(adapter, schema) {
        this.adapter = adapter;
        this.schema = schema;
        this.activeTx = null;
        this.listeners = new Set();
        this.persistent = adapter instanceof LocalStorageAdapter;
        if (typeof window !== 'undefined' && this.persistent) {
            // Aislamiento entre pestañas: localStorage avisa cuando OTRA pestaña escribe.
            window.addEventListener('storage', e => {
                if (e.key && this.schema[e.key]) this.emit([e.key], 'external');
            });
        }
    }

    definition(key) {
        const def = this.schema[key];
        if (!def) throw new ValidationError(`Clave de datos desconocida: "${key}". Declarala en js/data/schema.js.`);
        return def;
    }

    decode(key, raw) {
        const def = this.definition(key);
        if (raw === null || raw === undefined) return Store.clone(def.default);
        if (def.format === 'text') return raw;
        try {
            const value = JSON.parse(raw);
            return Store.matchesType(def.type, value) ? value : Store.clone(def.default);
        } catch (e) {
            console.warn(`Dato ilegible en "${key}"; se usa el valor por defecto.`, e);
            return Store.clone(def.default);
        }
    }

    encode(key, value) {
        return this.definition(key).format === 'text' ? String(value) : JSON.stringify(value);
    }

    validate(key, value) {
        const def = this.definition(key);
        if (def.format === 'text') {
            if (typeof value !== 'string' && typeof value !== 'number') {
                throw new ValidationError(`"${key}" tiene que ser texto.`);
            }
        } else if (!Store.matchesType(def.type, value)) {
            throw new ValidationError(`"${key}" tiene que ser de tipo ${def.type}.`);
        }
        if (def.validate) def.validate(value);
    }

    /** Valor actual (una copia: modificarla no cambia lo guardado hasta hacer set). */
    get(key) {
        if (this.activeTx) return this.activeTx.get(key);
        return this.decode(key, this.adapter.get(key));
    }

    has(key) {
        this.definition(key);
        return this.adapter.get(key) !== null;
    }

    set(key, value) { this.transaction(tx => tx.set(key, value)); }

    remove(key) { this.transaction(tx => tx.remove(key)); }

    /**
     * Ejecuta `work(tx)` y aplica todas sus escrituras juntas al final, o ninguna si algo
     * falla. Una transacción dentro de otra se suma a la de afuera (se confirma una vez).
     * Tiene que ser sincrónica: una promesa en el medio rompería el aislamiento.
     */
    transaction(work) {
        if (this.activeTx) return work(this.activeTx);
        const tx = new Transaction(this);
        this.activeTx = tx;
        let result;
        try {
            result = work(tx);
            if (result && typeof result.then === 'function') {
                throw new StorageError('Las transacciones tienen que ser sincrónicas.');
            }
            tx.commit();
        } finally {
            this.activeTx = null;
        }
        if (tx.changedKeys.length) this.emit(tx.changedKeys, 'local');
        return result;
    }

    /** listener(keys, origin) — origin: 'local' (esta pestaña) | 'external' (otra pestaña). */
    onChange(listener) {
        this.listeners.add(listener);
        return () => this.listeners.delete(listener);
    }

    emit(keys, origin) {
        this.listeners.forEach(fn => {
            try { fn(keys, origin); } catch (e) { console.error(e); }
        });
    }

    /** Todas las claves declaradas de un grupo con su valor actual (para backup). */
    snapshot(filter = () => true) {
        const out = {};
        Object.entries(this.schema).forEach(([key, def]) => {
            if (filter(def, key) && this.has(key)) out[key] = this.get(key);
        });
        return out;
    }

    /** Pide al navegador que no borre estos datos si le falta espacio. */
    async requestPersistence() {
        try {
            if (navigator.storage && navigator.storage.persist) return await navigator.storage.persist();
        } catch (e) { /* no soportado */ }
        return false;
    }

    static matchesType(type, value) {
        switch (type) {
            case 'array': return Array.isArray(value);
            case 'object': return value !== null && typeof value === 'object' && !Array.isArray(value);
            case 'any': return true;
            default: return typeof value === type;
        }
    }

    static clone(value) {
        return value === undefined || value === null || typeof value !== 'object' ? value : JSON.parse(JSON.stringify(value));
    }
}
