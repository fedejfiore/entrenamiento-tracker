// Disciplinas (qué entrena la persona: gimnasio, pilates mat, pilates reformer; puede ser más
// de una) y módulos (Gimnasio / Pilates). Para no mezclar todo, la app muestra lo del módulo
// activo: rutinas, programas, ejercicios del catálogo y tipos de medición. Si la persona
// entrena una sola disciplina no ve nada de las otras; si entrena más de una, cambia de
// módulo con el selector de la barra superior. El historial, el progreso y el plan semanal
// son uno solo (se entrena una sola persona).
// Más adelante, con cuentas, los módulos habilitados también dependerán del plan contratado.
// Script clásico (no módulo): comparte el ámbito global con el resto de la app.

const DISCIPLINES = [
    ['gym', '🏋️', 'Gimnasio'],
    ['mat', '🧘', 'Pilates mat'],
    ['reformer', '🛏️', 'Pilates reformer']
];
const MODULES = { gym: { icon: '🏋️', label: 'Gym' }, pilates: { icon: '🧘', label: 'Pilates' } };

function loadDisciplines() {
    const saved = (db.get('appSettings') || {}).disciplines;
    const list = Array.isArray(saved) ? saved.filter(d => DISCIPLINES.some(([k]) => k === d)) : [];
    return list.length ? list : ['gym'];
}

function saveDisciplines(list) {
    const clean = DISCIPLINES.map(([k]) => k).filter(k => list.includes(k));
    if (!clean.length) return false;
    saveAppSettings({ disciplines: clean });
    applyModule();
    return true;
}

function hasDiscipline(d) { return loadDisciplines().includes(d); }
function hasPilates() { return hasDiscipline('mat') || hasDiscipline('reformer'); }

function availableModules() {
    const list = [];
    if (hasDiscipline('gym')) list.push('gym');
    if (hasPilates()) list.push('pilates');
    return list;
}

function activeModule() {
    const mods = availableModules();
    const saved = (db.get('appSettings') || {}).module;
    return mods.includes(saved) ? saved : mods[0];
}

function setActiveModule(module) {
    if (!availableModules().includes(module) || module === activeModule()) return;
    saveAppSettings({ module });
    applyModule();
}

// ---- Rutinas de cada módulo ----
// Las rutinas existentes y las básicas son de gimnasio. Las que se crean (o vienen de un
// programa) quedan en el módulo donde se crearon.
function loadRoutineDisciplines() {
    return db.get('routineDisciplines') || {};
}

function routineModule(key) {
    return loadRoutineDisciplines()[key] === 'pilates' ? 'pilates' : 'gym';
}

function tagRoutineModule(key, module = activeModule()) {
    const map = loadRoutineDisciplines();
    if (module === 'pilates') map[key] = 'pilates'; else delete map[key];
    try { db.set('routineDisciplines', map); } catch (e) { /* no crítico */ }
}

/** ¿La rutina se ve en el módulo activo? Con un solo módulo se ven todas. */
function routineInActiveModule(key) {
    if (availableModules().length < 2) return true;
    return routineModule(key) === activeModule();
}

/** Si una rutina es de otro módulo (ej. la del plan de hoy), se pasa a ese módulo. */
function ensureModuleForRoutine(key) {
    const m = routineModule(key);
    if (key && m !== activeModule() && availableModules().includes(m)) setActiveModule(m);
}

// ---- Tipos de medición del módulo ----
/** Tipos que se ofrecen al elegir cómo se mide un ejercicio (siempre incluye el actual). */
function typesForModule(current) {
    const pilates = hasPilates();
    return Object.keys(EXERCISE_TYPES).filter(t => {
        if (t === current) return true;
        const def = EXERCISE_TYPES[t];
        if (def.discipline === 'reformer') return hasDiscipline('reformer');
        if (def.discipline === 'pilates') return pilates;
        return true;
    });
}

// ---- Pantalla ----
// Arriba de todo: en la barra superior (computadora) o arriba del contenido (celular, donde
// la barra superior no está). Solo si se entrena más de un módulo.
function renderModuleSwitch() {
    const mods = availableModules();
    const current = activeModule();
    document.querySelectorAll('.module-switch').forEach(box => {
        box.hidden = mods.length < 2;
        box.innerHTML = mods.map(m => `<button type="button" data-module="${m}" aria-pressed="${m === current}">${MODULES[m].icon} ${MODULES[m].label}</button>`).join('');
    });
}

function applyModule() {
    document.documentElement.dataset.module = activeModule();
    renderModuleSwitch();
    renderDisciplineSettings();
    if (typeof renderReformerSettings === 'function') renderReformerSettings();
    if (typeof renderPilatesCatalog === 'function') renderPilatesCatalog();
    if (typeof populateRoutineOptions === 'function') populateRoutineOptions();
    if (typeof renderLibrary === 'function' && document.getElementById('libMyRoutines')) renderLibrary();
    if (typeof renderTodayCard === 'function') { try { renderTodayCard(); } catch (e) { /* sin plan */ } }
}

/** Ajustes → General: qué entrenás (una o varias). */
function renderDisciplineSettings() {
    const box = document.getElementById('disciplineSettings');
    if (!box) return;
    const on = loadDisciplines();
    box.innerHTML = DISCIPLINES.map(([k, icon, label]) => `<button type="button" class="discipline-chip${on.includes(k) ? ' on' : ''}" data-discipline="${k}" aria-pressed="${on.includes(k)}">${icon} ${label}</button>`).join('');
}

function toggleDiscipline(key) {
    const on = loadDisciplines();
    const next = on.includes(key) ? on.filter(k => k !== key) : [...on, key];
    if (!next.length) { showToast('Elegí al menos una disciplina', 'error'); return; }
    saveDisciplines(next);
}

function initDisciplines() {
    document.querySelectorAll('.module-switch').forEach(box => box.addEventListener('click', e => {
        const b = e.target.closest('[data-module]');
        if (b) setActiveModule(b.dataset.module);
    }));
    document.getElementById('disciplineSettings')?.addEventListener('click', e => {
        const b = e.target.closest('[data-discipline]');
        if (b) toggleDiscipline(b.dataset.discipline);
    });
    document.documentElement.dataset.module = activeModule();
    renderModuleSwitch();
    renderDisciplineSettings();
}
