// Preferencias por ejercicio: tipo de medición, unidad de tiempo, grupo muscular, cadencia
// y si es unilateral (de a un lado).
// Todas se guardan por nombre normalizado (sin mayúsculas ni tildes), así "Plancha" y
// "plancha" comparten la misma preferencia en cualquier rutina.
import { normalizeForCompare } from '../core/utils.js';
import { DEFAULT_TIME_UNIT_BY_TYPE, TIME_UNITS } from '../core/time.js';
import { EXERCISE_TYPES, LEGACY_LEG_GROUP, catalogMuscleGroup, splitLegacyLegGroup } from '../domain/catalog.js';
import { pilatesExerciseInfo } from '../domain/pilates-catalog.js';
import { db } from './repositories.js';

export class ExercisePreferences {
    constructor(store) {
        this.store = store;
        this.reload();
    }

    /** Vuelve a leer de lo guardado (ej. si otra pestaña cambió algo). */
    reload() {
        this.types = this.store.get('exerciseTypes');
        this.groupOverrides = this.store.get('exerciseGroupOverrides');
    }

    static key(name) { return normalizeForCompare(name || ''); }

    // ---- Tipo de medición (kg, bw, time, min, km) ----
    hasType(name) { return !!this.types[ExercisePreferences.key(name)]; }

    rawType(name) { return this.types[ExercisePreferences.key(name)]; }

    type(name, routine) {
        const saved = this.types[ExercisePreferences.key(name)];
        return EXERCISE_TYPES[saved] ? saved : ExercisePreferences.inferType(name, routine);
    }

    setType(name, type) {
        if (!EXERCISE_TYPES[type]) return;
        this.types[ExercisePreferences.key(name)] = type;
        this.store.set('exerciseTypes', this.types);
    }

    // Sugerencia automática para ejercicios que todavía no tienen un tipo elegido.
    // ¿La rutina es de pilates? Lo decide la pantalla de disciplinas (js/features/disciplines.js).
    static isPilatesRoutine = () => false;

    static inferType(name, routine) {
        const info = typeof pilatesExerciseInfo === 'function' ? pilatesExerciseInfo(name) : null;
        const n = normalizeForCompare(name || '');
        // Palabras completas: "nado" no tiene que encontrarse adentro de "inclinado".
        const cardio = /\bkm\b|\dkm|\b(bici\w*|correr|corrida|trote|running|caminata|cinta|spinning|natacion|nado|nadar)\b/.test(n);
        // Un nombre de pilates que también es cardio ("Natación"): pilates solo en una rutina de pilates.
        if (info && (!cardio || ExercisePreferences.isPilatesRoutine(routine))) return info.type;
        if (cardio) return 'km';
        if (routine === 'FUT' || /futbol|partido|clase|yoga|pilates|estiramiento/.test(n)) return 'min';
        if (/plancha|plank|tabata|soga|isometric/.test(n)) return 'time';
        if (/flexiones|push-?ups?|burpee|dominadas(?! asistidas)/.test(n)) return 'bw';
        return 'kg';
    }

    // ---- Unidad de carga del tiempo (seg, mss, min, hmm) ----
    timeUnit(name, type) {
        const saved = this.store.get('exerciseTimeUnits')[ExercisePreferences.key(name)];
        return TIME_UNITS[saved] ? saved : (DEFAULT_TIME_UNIT_BY_TYPE[type] || 'mss');
    }

    setTimeUnit(name, unit) {
        this.store.transaction(tx => {
            const all = tx.get('exerciseTimeUnits');
            all[ExercisePreferences.key(name)] = unit;
            tx.set('exerciseTimeUnits', all);
        });
    }

    // ---- Grupo muscular (la elección manual pisa a la taxonomía automática) ----
    muscleGroup(name) {
        const key = ExercisePreferences.key(name);
        const manual = this.groupOverrides[key];
        if (manual === LEGACY_LEG_GROUP) return splitLegacyLegGroup(name);
        return manual || catalogMuscleGroup(name) || 'Otro';
    }

    /** true si el grupo lo eligió la persona (y no sale del catálogo o del nombre). */
    hasManualGroup(name) {
        return !!this.groupOverrides[ExercisePreferences.key(name)];
    }

    setMuscleGroup(name, group) {
        this.groupOverrides[ExercisePreferences.key(name)] = group;
        this.store.set('exerciseGroupOverrides', this.groupOverrides);
    }

    // ---- Unilateral: cada serie se hace de un lado y después del otro ----
    unilateral(name) {
        const saved = this.store.get('exerciseUnilateral')[ExercisePreferences.key(name)];
        return typeof saved === 'boolean' ? saved : ExercisePreferences.inferUnilateral(name);
    }

    setUnilateral(name, on) {
        this.store.transaction(tx => {
            const all = tx.get('exerciseUnilateral');
            all[ExercisePreferences.key(name)] = !!on;
            tx.set('exerciseUnilateral', all);
        });
    }

    // Sugerencia por el nombre ("remo a un brazo", "búlgara", "unilateral"...).
    static inferUnilateral(name) {
        const n = normalizeForCompare(name || '');
        return /unilateral|\bun brazo|\buna pierna|\buna mano|\bun lado|single|bulgar|pistol/.test(n);
    }

    // ---- Cadencia del contador de reps (segundos por rep) ----
    tempo(name) { return this.store.get('exerciseTempos')[ExercisePreferences.key(name)]; }

    setTempo(name, tempo) {
        this.store.transaction(tx => {
            const all = tx.get('exerciseTempos');
            all[ExercisePreferences.key(name)] = tempo;
            tx.set('exerciseTempos', all);
        });
    }
}

export const exercisePrefs = new ExercisePreferences(db);

// API usada por las pantallas (y por las acciones escritas en el HTML).
export function saveExerciseType(name, type) { exercisePrefs.setType(name, type); }
export function inferExerciseType(name, routine) { return ExercisePreferences.inferType(name, routine); }
export function getExerciseType(name, routine) { return exercisePrefs.type(name, routine); }
export function getTimeUnit(name, type) { return exercisePrefs.timeUnit(name, type); }
export function saveTimeUnit(name, unit) { exercisePrefs.setTimeUnit(name, unit); }
export function saveGroupOverride(exerciseName, group) { exercisePrefs.setMuscleGroup(exerciseName, group); }
export function getMuscleGroup(exerciseName) { return exercisePrefs.muscleGroup(exerciseName); }
export function loadExerciseTempos() { return db.get('exerciseTempos'); }
export function saveExerciseTempo(name, tempo) { exercisePrefs.setTempo(name, tempo); }
export function isUnilateral(name) { return exercisePrefs.unilateral(name); }
export function saveUnilateral(name, on) { exercisePrefs.setUnilateral(name, on); }
