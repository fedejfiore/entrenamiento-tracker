// Modelo de dominio: sesión de entrenamiento, ejercicio registrado, serie y medida corporal.
//
// Lo que se guarda son objetos JSON planos (así lo leen el resto de la app, los backups y
// una futura base de datos). Estas clases son la puerta de entrada: arman los objetos con
// la forma correcta, les ponen identidad (uid) y fecha de modificación (updatedAt) —lo que
// necesita una base de datos real para sincronizar— y los validan antes de guardarlos.
//
// Validación en dos niveles, a propósito:
//   validate()      estricta: para lo que se crea o se edita ahora.
//   validateStored() liviana: para lo que ya estaba guardado. Un dato viejo con una forma
//                   rara nunca debe impedir seguir usando la app ni guardar sesiones nuevas.

const ISO_DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

function assertValid(condition, message, details) {
    if (!condition) throw new ValidationError(message, details);
}

class SetEntry {
    static get FIELDS() { return ['reps', 'kg', 'km', 'time', 'springs', 'rest', 'effort', 'note', 'warmup', 'done']; }

    constructor(data = {}) {
        SetEntry.FIELDS.forEach(f => {
            const v = data[f];
            if (v !== undefined && v !== null && v !== '' && v !== false) this[f] = v;
        });
    }

    get isWarmup() { return !!this.warmup; }

    toJSON() { return { ...this }; }

    static validate(set, where) {
        assertValid(set && typeof set === 'object' && !Array.isArray(set), `${where}: la serie tiene que ser un objeto.`);
        ['reps', 'kg', 'km', 'time', 'springs', 'rest', 'effort', 'note'].forEach(f => {
            if (set[f] !== undefined) assertValid(typeof set[f] === 'string', `${where}: "${f}" tiene que ser texto.`);
        });
        ['warmup', 'done'].forEach(f => {
            if (set[f] !== undefined) assertValid(typeof set[f] === 'boolean', `${where}: "${f}" tiene que ser verdadero/falso.`);
        });
    }
}

class ExerciseLog {
    /**
     * @param name   nombre del ejercicio
     * @param type   'kg' | 'bw' | 'time' | 'min' | 'km' (EXERCISE_TYPES)
     * @param sets   series ya normalizadas (cleanSetForSave)
     * @param note   nota del ejercicio
     */
    constructor({ name, type = 'kg', sets = [], note = '', superset = null, unilateral = false, equipLevel = null }) {
        this.name = String(name || '').trim();
        this.type = EXERCISE_TYPES[type] ? type : 'kg';
        this.sets = sets.map(s => s instanceof SetEntry ? s : new SetEntry(s));
        this.note = note || '';
        this.superset = superset || null; // letra de la superserie ("A", "B"…), si se hizo en una
        this.unilateral = !!unilateral;   // de a un lado: las reps y el peso son por lado
        this.equipLevel = equipLevel || null; // pilates: nivel del elemento (liviana, media, fuerte)
    }

    /**
     * Forma guardada. Además de `sets`, incluye los textos viejos (reps "12-10-8", weight,
     * pause) que siguen leyendo los PRs, el volumen, los gráficos y el historial anterior.
     */
    toJSON() {
        const sets = this.sets.map(s => s.toJSON());
        const out = { name: this.name, type: this.type, sets, ...legacyStringsFromSets(sets, this.type), note: this.note };
        if (this.superset) out.superset = this.superset;
        if (this.unilateral) out.unilateral = true;
        if (this.equipLevel) out.equipLevel = this.equipLevel;
        return out;
    }

    static validate(ex, where) {
        assertValid(ex && typeof ex === 'object', `${where}: el ejercicio tiene que ser un objeto.`);
        assertValid(typeof ex.name === 'string' && ex.name.trim() !== '', `${where}: falta el nombre del ejercicio.`);
        if (ex.type !== undefined) assertValid(!!EXERCISE_TYPES[ex.type], `${where}: tipo de medición desconocido "${ex.type}".`);
        if (ex.unilateral !== undefined) assertValid(typeof ex.unilateral === 'boolean', `${where}: "unilateral" tiene que ser verdadero/falso.`);
        if (ex.superset !== undefined) assertValid(/^[A-Z]$/.test(ex.superset), `${where}: superserie inválida "${ex.superset}".`);
        if (ex.sets !== undefined) {
            assertValid(Array.isArray(ex.sets), `${where}: "sets" tiene que ser una lista.`);
            ex.sets.forEach((s, i) => SetEntry.validate(s, `${where}, serie ${i + 1}`));
        }
    }
}

class WorkoutSession {
    /** Sesión nueva con identidad y fecha de modificación. */
    static create(fields) {
        const now = new Date().toISOString();
        return new WorkoutSession({ id: Date.now(), ...fields, uid: generateId(), updatedAt: now });
    }

    constructor(data) {
        // Se conservan todos los campos (también los desconocidos: compatibilidad hacia adelante).
        Object.assign(this, data);
    }

    get isTabata() { return this.type === 'tabata'; }

    toJSON() {
        const out = { ...this };
        if (Array.isArray(out.exercises)) out.exercises = out.exercises.map(e => e instanceof ExerciseLog ? e.toJSON() : e);
        return out;
    }

    static validate(w, where = 'Sesión') {
        assertValid(w && typeof w === 'object' && !Array.isArray(w), `${where}: tiene que ser un objeto.`);
        assertValid(typeof w.date === 'string' && ISO_DATE_RE.test(w.date), `${where}: la fecha tiene que ser AAAA-MM-DD.`, { date: w.date });
        assertValid(w.id !== undefined && w.id !== null, `${where}: falta el id.`);
        if (w.type === 'tabata') {
            assertValid(Array.isArray(w.blocks) && w.blocks.length > 0, `${where}: una sesión Tabata necesita bloques.`);
        } else {
            assertValid(Array.isArray(w.exercises) && w.exercises.length > 0, `${where}: una sesión necesita al menos un ejercicio.`);
            w.exercises.forEach((ex, i) => ExerciseLog.validate(ex, `${where}, ejercicio ${i + 1}`));
        }
        ['duration', 'volume', 'mood'].forEach(f => {
            if (w[f] !== undefined && w[f] !== null) assertValid(typeof w[f] === 'number' && isFinite(w[f]), `${where}: "${f}" tiene que ser un número.`);
        });
    }

    static validateStored(w, index) {
        assertValid(w && typeof w === 'object' && !Array.isArray(w), `Sesión #${index + 1}: tiene que ser un objeto.`);
    }

    static validateList(list) {
        list.forEach((w, i) => WorkoutSession.validateStored(w, i));
    }

    /**
     * Fecha de modificación para sesiones viejas que no la tienen: el id era Date.now()
     * del momento de guardar; si no, el fin de la sesión o el mediodía de su fecha.
     */
    static inferUpdatedAt(w) {
        if (typeof w.id === 'number' && w.id > 1e12) return new Date(w.id).toISOString();
        if (w.endTime) return w.endTime;
        return `${w.date || '1970-01-01'}T12:00:00.000Z`;
    }
}

class BodyMeasurement {
    static get FIELDS() { return ['weight', 'fat', 'muscle', 'water', 'waist']; }

    static create(fields) {
        const out = { date: fields.date };
        BodyMeasurement.FIELDS.forEach(f => {
            const n = fields[f];
            out[f] = typeof n === 'number' && isFinite(n) ? n : null;
        });
        return out;
    }

    static validate(m, where = 'Medida') {
        assertValid(m && typeof m === 'object', `${where}: tiene que ser un objeto.`);
        assertValid(typeof m.date === 'string' && ISO_DATE_RE.test(m.date), `${where}: la fecha tiene que ser AAAA-MM-DD.`);
        assertValid(typeof m.weight === 'number' && m.weight > 0, `${where}: falta el peso.`);
        BodyMeasurement.FIELDS.forEach(f => {
            if (m[f] !== undefined && m[f] !== null) assertValid(typeof m[f] === 'number' && isFinite(m[f]), `${where}: "${f}" tiene que ser un número.`);
        });
    }

    static validateList(list) {
        list.forEach((m, i) => assertValid(m && typeof m === 'object', `Medida #${i + 1}: tiene que ser un objeto.`));
    }
}
