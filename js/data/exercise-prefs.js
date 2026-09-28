// Preferencias por ejercicio: tipo de medición, unidad de tiempo, grupo muscular, cadencia
// y si es unilateral (de a un lado).
// Todas se guardan por nombre normalizado (sin mayúsculas ni tildes), así "Plancha" y
// "plancha" comparten la misma preferencia en cualquier rutina.

class ExercisePreferences {
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
    static inferType(name, routine) {
        const n = normalizeForCompare(name || '');
        if (/\bkm\b|\dkm|bici|correr|corrida|trote|running|caminata|cinta|spinning|natacion|nado/.test(n)) return 'km';
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
        return this.groupOverrides[key] || EXERCISE_TO_MUSCLE_GROUP[key] || 'Otro';
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

const exercisePrefs = new ExercisePreferences(db);

// API usada por las pantallas (y por las acciones escritas en el HTML).
function saveExerciseType(name, type) { exercisePrefs.setType(name, type); }
function inferExerciseType(name, routine) { return ExercisePreferences.inferType(name, routine); }
function getExerciseType(name, routine) { return exercisePrefs.type(name, routine); }
function getTimeUnit(name, type) { return exercisePrefs.timeUnit(name, type); }
function saveTimeUnit(name, unit) { exercisePrefs.setTimeUnit(name, unit); }
function saveGroupOverride(exerciseName, group) { exercisePrefs.setMuscleGroup(exerciseName, group); }
function getMuscleGroup(exerciseName) { return exercisePrefs.muscleGroup(exerciseName); }
function loadExerciseTempos() { return db.get('exerciseTempos'); }
function saveExerciseTempo(name, tempo) { exercisePrefs.setTempo(name, tempo); }
function isUnilateral(name) { return exercisePrefs.unilateral(name); }
function saveUnilateral(name, on) { exercisePrefs.setUnilateral(name, on); }
