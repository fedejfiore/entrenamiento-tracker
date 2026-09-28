// Rutinas del usuario: estado en memoria de las pantallas (customRoutines, archivedRoutines…).
// Se lee y guarda a través de repo.routines (RoutineRepository, js/data/repositories.js).
// Las cargas iniciales las hace app.js DESPUÉS de correr las migraciones.

let customRoutines = {};

let customRoutineLabels = {};

// Reservorio de rutinas: claves (base o personalizadas) que el usuario archivó.
// No se borra ningún dato — ni ejercicios, ni entrenamientos guardados, ni progreso
// por músculo — solo se dejan de ofrecer en el selector. Sirve tanto para esconder
// rutinas que no se están usando ahora como para ir preparando rutinas futuras sin
// que aparezcan en la lista actual.
function loadArchivedRoutines() {
    return repo.routines.archived();
}

let archivedRoutines = new Set();

function saveArchivedRoutines() {
    repo.routines.saveArchived(archivedRoutines);
}

function isRoutineVisible(key) {
    return !archivedRoutines.has(key);
}

// Reservorio de ejercicios: por cada rutina, nombres de ejercicios archivados.
// Igual idea que el reservorio de rutinas pero a nivel ejercicio individual: se
// dejan de mostrar en la lista activa de esa rutina sin perder su historial.
let archivedExercises = {};

function loadArchivedExercises() {
    archivedExercises = repo.routines.archivedExercises();
}

function saveArchivedExercises() {
    repo.routines.saveArchivedExercises(archivedExercises);
}

function loadCustomRoutines() {
    customRoutines = repo.routines.custom();
}

function loadCustomRoutineLabels() {
    customRoutineLabels = repo.routines.labels();
}

function saveCustomRoutineLabels() {
    repo.routines.saveLabels(customRoutineLabels);
}

function saveCustomRoutines() {
    repo.routines.saveCustom(customRoutines);
}

function getLastRoutineNote(routine) {
    const workouts = repo.workouts.all();
    for (let i = workouts.length - 1; i >= 0; i--) {
        if (workouts[i] && workouts[i].routine === routine && workouts[i].notes) {
            return workouts[i].notes;
        }
    }
    return '';
}

function getAllKnownExerciseNames() {
    const names = new Set();
    // Si una rutina tiene versión personalizada, esa reemplaza a la base
    // (no se combinan), para que un nombre ya unificado no siga reapareciendo.
    const allKeys = new Set([...Object.keys(routines), ...Object.keys(customRoutines)]);
    allKeys.forEach(key => {
        const list = customRoutines[key] || routines[key] || [];
        list.forEach(n => names.add(n));
    });
    return Array.from(names).sort((a, b) => a.localeCompare(b, 'es'));
}

// Genera una clave única (ej. "Yoga" -> "YOGA") que no choque con las rutinas
// base ni con otras ya creadas, para poder guardarla en customRoutines.
function slugifyRoutineKey(name) {
    let base = normalizeForCompare(name)
        .toUpperCase()
        .replace(/[^A-Z0-9]+/g, '_')
        .replace(/^_+|_+$/g, '');
    if (!base) base = 'RUTINA';

    const allKeys = new Set([...Object.keys(routines), ...Object.keys(customRoutines)]);
    let key = base;
    let i = 2;
    while (allKeys.has(key)) {
        key = `${base}_${i}`;
        i++;
    }
    return key;
}

function initializeData() {
    // Primera vez: arrancar sin historial, solo con las rutinas base del código
    db.transaction(tx => {
        if (!db.has('workouts')) {
            tx.set('workouts', []);
            // Instalación nueva: no hay datos viejos que migrar. (Si ya había datos, la
            // versión la marca solo runMigrations: así una migración fallida se reintenta.)
            if (!db.has('schemaVersion')) tx.set('schemaVersion', String(SCHEMA_VERSION));
        }
        if (!db.has('bodyMetrics')) tx.set('bodyMetrics', []);
        tx.set('version', '2.0');
    });
}

// Historial de planes semanales: cada entrada dice desde qué lunes rige esa
// cantidad/selección de días. Así, cambiar el plan hoy no reescribe cómo se
// evaluaron semanas que ya pasaron con el plan anterior.
function loadTrainingDaysPlanHistory() {
    if (repo.routines.hasPlanHistory()) return repo.routines.planHistory();

    // Migración desde el formato viejo (un solo plan global): se asume vigente
    // "desde siempre" para no alterar retroactivamente semanas ya calculadas.
    const legacyPlan = db.get('trainingDaysPlan');
    const history = (Array.isArray(legacyPlan) && legacyPlan.length > 0) ? [{ date: '1970-01-01', days: legacyPlan }] : [];
    // (El plan vigente y cómo se guarda: js/features/plan-screen.js y js/domain/plan.js.)
    repo.routines.savePlanHistory(history);
    return history;
}

// Plan vigente para la semana que arranca en weekStart: el más reciente cuya
// fecha de vigencia sea anterior o igual al lunes de esa semana.
