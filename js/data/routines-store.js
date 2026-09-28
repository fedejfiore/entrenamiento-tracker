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
    repo.routines.savePlanHistory(history);
    return history;
}

// Plan vigente para la semana que arranca en weekStart: el más reciente cuya
// fecha de vigencia sea anterior o igual al lunes de esa semana.
function getPlanForWeek(weekStart) {
    const history = loadTrainingDaysPlanHistory();
    const weekMondayStr = formatDateLocal(weekStart);
    const applicable = history
        .filter(e => e.date <= weekMondayStr)
        .sort((a, b) => a.date.localeCompare(b.date));
    return applicable.length > 0 ? applicable[applicable.length - 1].days : [];
}

function loadTrainingDaysPlan() {
    const plan = getPlanForWeek(getMonday(new Date()));
    document.querySelectorAll('.day-plan-checkbox').forEach(cb => {
        cb.checked = plan.includes(parseInt(cb.value, 10));
    });
    return plan;
}

function saveTrainingDaysPlan() {
    const selected = [...document.querySelectorAll('.day-plan-checkbox:checked')]
        .map(cb => parseInt(cb.value, 10))
        .sort((a, b) => a - b);
    const mondayStr = formatDateLocal(getMonday(new Date()));
    const current = getPlanForWeek(getMonday(new Date())).slice().sort((a, b) => a - b);

    if (JSON.stringify(selected) === JSON.stringify(current)) return; // sin cambios reales

    // El cambio rige desde la semana en curso: no reescribe semanas ya pasadas.
    const history = loadTrainingDaysPlanHistory();
    const lastEntry = history[history.length - 1];
    if (lastEntry && lastEntry.date === mondayStr) {
        lastEntry.days = selected; // ya se había cambiado esta semana: actualizar, no duplicar
    } else {
        history.push({ date: mondayStr, days: selected });
    }
    repo.routines.savePlanHistory(history);
    updateSidebar();
}

