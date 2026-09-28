// Preferencias por ejercicio: tipo de medición, unidad de tiempo, grupo muscular y cadencia.
// Script clásico (no módulo): comparte el ámbito global con el resto de la app.

function loadExerciseTypes() {
    try { return JSON.parse(localStorage.getItem('exerciseTypes') || '{}') || {}; } catch (e) { return {}; }
}

let exerciseTypes = loadExerciseTypes();

function saveExerciseType(name, type) {
    if (!EXERCISE_TYPES[type]) return;
    exerciseTypes[normalizeForCompare(name)] = type;
    localStorage.setItem('exerciseTypes', JSON.stringify(exerciseTypes));
}

// Sugerencia automática para ejercicios que todavía no tienen un tipo elegido.
function inferExerciseType(name, routine) {
    const n = normalizeForCompare(name || '');
    if (/\bkm\b|\dkm|bici|correr|corrida|trote|running|caminata|cinta|spinning|natacion|nado/.test(n)) return 'km';
    if (routine === 'FUT' || /futbol|partido|clase|yoga|pilates|estiramiento/.test(n)) return 'min';
    if (/plancha|plank|tabata|soga|isometric/.test(n)) return 'time';
    if (/flexiones|push-?ups?|burpee|dominadas(?! asistidas)/.test(n)) return 'bw';
    return 'kg';
}

function getExerciseType(name, routine) {
    const saved = exerciseTypes[normalizeForCompare(name || '')];
    return EXERCISE_TYPES[saved] ? saved : inferExerciseType(name, routine);
}

function loadTimeUnits() {
    try { return JSON.parse(localStorage.getItem('exerciseTimeUnits') || '{}') || {}; } catch (e) { return {}; }
}

function getTimeUnit(name, type) {
    const saved = loadTimeUnits()[normalizeForCompare(name || '')];
    return TIME_UNITS[saved] ? saved : (DEFAULT_TIME_UNIT_BY_TYPE[type] || 'mss');
}

function saveTimeUnit(name, unit) {
    const all = loadTimeUnits();
    all[normalizeForCompare(name)] = unit;
    localStorage.setItem('exerciseTimeUnits', JSON.stringify(all));
}

// Reclasificación manual: si el usuario arrastró un ejercicio a otro grupo,
// esa elección pisa a la taxonomía automática de arriba.
function loadGroupOverrides() {
    try { return JSON.parse(localStorage.getItem('exerciseGroupOverrides') || '{}'); } catch (e) { return {}; }
}

let exerciseGroupOverrides = loadGroupOverrides();

function saveGroupOverride(exerciseName, group) {
    exerciseGroupOverrides[normalizeForCompare(exerciseName)] = group;
    localStorage.setItem('exerciseGroupOverrides', JSON.stringify(exerciseGroupOverrides));
}

function getMuscleGroup(exerciseName) {
    const key = normalizeForCompare(exerciseName || '');
    return exerciseGroupOverrides[key] || EXERCISE_TO_MUSCLE_GROUP[key] || 'Otro';
}

function loadExerciseTempos() {
    try { return JSON.parse(localStorage.getItem('exerciseTempos') || '{}') || {}; } catch (e) { return {}; }
}

function saveExerciseTempo(name, tempo) {
    const all = loadExerciseTempos();
    all[normalizeForCompare(name)] = tempo;
    localStorage.setItem('exerciseTempos', JSON.stringify(all));
}

