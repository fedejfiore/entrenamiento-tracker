// Selector de rutinas, sugerencia del día y alta / baja / archivo de rutinas.
// Script clásico (no módulo): comparte el ámbito global con el resto de la app.

let selectedMood = 3;

function populateRoutineOptions() {
    const select = document.getElementById('routine');
    if (!select) return;
    const currentValue = select.value;
    const keys = Array.from(new Set([...Object.keys(routines), ...Object.keys(customRoutines)]))
        .filter(isRoutineVisible)
        .sort();

    let html = '<option value="">Elige una rutina...</option>';
    keys.forEach(key => {
        const exercises = customRoutines[key] || routines[key] || [];
        const label = customRoutineLabels[key] || ROUTINE_LABELS[key] || `Rutina ${key}${exercises[0] ? ' (' + exercises[0] + '…)' : ''}`;
        html += `<option value="${escapeHtml(key)}">${escapeHtml(label)}</option>`;
    });
    select.innerHTML = html;
    if (keys.includes(currentValue)) select.value = currentValue;
}

// Rutinas que no cuentan para la sugerencia de "qué entrenar hoy":
// fútbol y bici no son rutinas de gimnasio con grupos musculares que
// rotar, así que no tiene sentido "sugerirlas" por antigüedad.
let suggestedRoutineKey = null;

function getRoutineSuggestionRanking() {
    const EXCLUDE_RE = /f[uú]tbol|bici/i;
    const keys = Array.from(new Set([...Object.keys(routines), ...Object.keys(customRoutines)]))
        .filter(isRoutineVisible)
        .filter(key => {
            const label = customRoutineLabels[key] || ROUTINE_LABELS[key] || key;
            return !EXCLUDE_RE.test(label) && !EXCLUDE_RE.test(key);
        });
    if (keys.length === 0) return [];

    let workouts = repo.workouts.all();
    if (!Array.isArray(workouts)) workouts = [];
    const lastDone = {};
    workouts.forEach(w => {
        if (!w || !w.routine || !w.date) return;
        if (!lastDone[w.routine] || w.date > lastDone[w.routine]) {
            lastDone[w.routine] = w.date;
        }
    });

    return keys
        .map(key => {
            const lastDate = lastDone[key] || null;
            const daysSince = lastDate
                ? Math.floor((Date.now() - new Date(lastDate + 'T00:00:00').getTime()) / 86400000)
                : null;
            return {
                key,
                label: customRoutineLabels[key] || ROUTINE_LABELS[key] || `Rutina ${key}`,
                lastDate,
                daysSince
            };
        })
        .sort((a, b) => {
            // Nunca hechas van primero; entre las hechas, la más vieja primero.
            if (a.lastDate === null && b.lastDate === null) return 0;
            if (a.lastDate === null) return -1;
            if (b.lastDate === null) return 1;
            return a.lastDate < b.lastDate ? -1 : a.lastDate > b.lastDate ? 1 : 0;
        });
}

// La rutina que hace más que no hacés: la usa la tarjeta "Hoy toca" de Inicio.
function updateSuggestedRoutine() {
    const ranking = getRoutineSuggestionRanking();
    suggestedRoutineKey = ranking.length ? ranking[0].key : null;
}

function createNewRoutine() {
    const input = document.getElementById('newRoutineName');
    const name = (input.value || '').trim().replace(/\s+/g, ' ');

    if (!name) {
        showToast('Escribí un nombre para la nueva rutina (ej: Fútbol, Yoga, Natación)', 'error');
        return;
    }

    loadCustomRoutines();
    loadCustomRoutineLabels();

    const key = slugifyRoutineKey(name);
    // Plantilla y nombre juntos (una transacción): nunca queda uno sin el otro.
    repo.routines.create(key, name);
    loadCustomRoutines();
    loadCustomRoutineLabels();

    input.value = '';
    populateRoutineOptions();
    document.getElementById('routine').value = key;
    loadRoutineExercises();
    showToast(`✅ Rutina "${name}" creada. Agregá tu primer ejercicio con "+ Agregar" abajo.`);
}

function updateDeleteRoutineButtonVisibility(routine) {
    const deleteBtn = document.getElementById('btnDeleteRoutine');
    const renameBtn = document.getElementById('btnRenameRoutine');
    if (deleteBtn) deleteBtn.style.display = routine ? '' : 'none';
    if (renameBtn) renameBtn.style.display = routine ? '' : 'none';
}

// Renombra cualquier rutina (base o personalizada). Para las base, esto es solo
// una etiqueta pisando a ROUTINE_LABELS — el código detrás (clave, ejercicios) no
// cambia, así que el historial y las estadísticas no se ven afectados.
function renameRoutine() {
    const routine = document.getElementById('routine').value;
    if (!routine) return;

    const currentLabel = customRoutineLabels[routine] || ROUTINE_LABELS[routine] || routine;
    const newLabel = prompt('Nuevo nombre para la rutina:', currentLabel);
    if (newLabel === null) return;

    const trimmed = newLabel.trim();
    if (!trimmed) { showToast('El nombre no puede estar vacío', 'error'); return; }

    loadCustomRoutineLabels();
    customRoutineLabels[routine] = trimmed;
    saveCustomRoutineLabels();

    populateRoutineOptions();
    document.getElementById('routine').value = routine;
    showToast(`✅ Rutina renombrada a "${trimmed}"`);
}

// Archivar (reservorio) es la acción principal y reversible: la rutina desaparece
// del selector pero nada se borra. Sirve tanto para rutinas base como personalizadas,
// y también para ir preparando una rutina futura: se crea, se carga con ejercicios y
// se archiva hasta que llegue el momento de usarla.
function archiveCurrentRoutine() {
    const routine = document.getElementById('routine').value;
    if (!routine) return;

    const label = customRoutineLabels[routine] || ROUTINE_LABELS[routine] || routine;
    archivedRoutines.add(routine);
    saveArchivedRoutines();

    document.getElementById('routine').value = '';
    populateRoutineOptions();
    loadRoutineExercises();
    showUndoToast(`📥 Rutina "${label}" archivada`, () => {
        archivedRoutines.delete(routine);
        saveArchivedRoutines();
        populateRoutineOptions();
        document.getElementById('routine').value = routine;
        loadRoutineExercises();
    });
}

function renderArchivedRoutinesList() {
    const section = document.getElementById('section-archived-routines');
    const list = document.getElementById('archivedRoutinesList');
    if (!section || !list) return;

    const keys = [...archivedRoutines].sort();
    section.style.display = keys.length > 0 ? '' : 'none';
    if (keys.length === 0) { list.innerHTML = ''; return; }

    list.innerHTML = keys.map(key => {
        const label = customRoutineLabels[key] || ROUTINE_LABELS[key] || `Rutina ${key}`;
        const isCustom = Object.prototype.hasOwnProperty.call(customRoutines, key);
        return `<div style="display:flex; align-items:center; justify-content:space-between; gap:8px; padding:8px 0; border-bottom:1px solid var(--border);">
            <span style="font-size:13px;">${escapeHtml(label)}</span>
            <div style="display:flex; gap:6px;">
                <button type="button" class="small" style="width:auto;" data-action="restore-routine" data-routine="${escapeHtml(key)}">↩️ Restaurar</button>
                ${isCustom ? `<button type="button" class="danger small" style="width:auto;" data-action="delete-routine" data-routine="${escapeHtml(key)}" title="Eliminar definitivamente (no se puede deshacer)">🗑</button>` : ''}
            </div>
        </div>`;
    }).join('');
}

function restoreRoutine(key) {
    archivedRoutines.delete(key);
    saveArchivedRoutines();
    renderArchivedRoutinesList();
    populateRoutineOptions();
    showToast(`✅ Rutina "${customRoutineLabels[key] || ROUTINE_LABELS[key] || key}" restaurada`);

    // La deja lista y seleccionada en Entrenar, para seguir preparándola de una.
    showScreen('entrenar');
    const select = document.getElementById('routine');
    if (select) {
        select.value = key;
        loadRoutineExercises();
        saveWorkoutDraft();
    }
}

// Borrado definitivo: solo para rutinas personalizadas (las base viven en el código
// y no se pueden borrar de verdad). No tiene vuelta atrás, a diferencia de archivar.
function deleteCustomRoutineForever(key) {
    const label = customRoutineLabels[key] || key;
    if (!confirm(`¿Eliminar DEFINITIVAMENTE la rutina "${label}"?\n\nEsto no se puede deshacer: se pierden la plantilla y su lista de ejercicios. Los entrenamientos ya guardados con esta rutina siguen en el historial.`)) {
        return;
    }

    loadCustomRoutines();
    loadCustomRoutineLabels();
    // Plantilla, nombre y archivados en una sola transacción: se borra entera o no se borra.
    repo.routines.deleteForever(key);
    loadCustomRoutines();
    loadCustomRoutineLabels();
    archivedRoutines = loadArchivedRoutines();
    loadArchivedExercises();

    renderArchivedRoutinesList();
    populateRoutineOptions();
    if (typeof renderLibrary === 'function') renderLibrary();
    showToast(`🗑 Rutina "${label}" eliminada definitivamente`);
}

