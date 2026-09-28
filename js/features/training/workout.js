// Pantalla Entrenar: armar la rutina, agregar / quitar ejercicios y guardar la sesión.
// Script clásico (no módulo): comparte el ámbito global con el resto de la app.

// Reservorio de ejercicios de la rutina actual: los archivados no se muestran en
// la lista activa de arriba, pero quedan a mano acá para restaurarlos con un clic.
function buildArchivedExercisesHtml(routine, archivedNames) {
    if (!archivedNames || archivedNames.length === 0) return '';

    const uid = `archivedExercises_${normalizeForCompare(routine).replace(/[^a-z0-9]+/g, '_')}`;
    const items = archivedNames.map(name =>
        `<div style="display:flex; align-items:center; justify-content:space-between; gap:8px; padding:6px 0; border-bottom:1px solid var(--border);">
            <span style="font-size:13px;">${escapeHtml(name)}</span>
            <button type="button" class="small" style="width:auto;" data-action="restore-archived" data-exercise="${escapeHtml(name)}">↩️ Restaurar</button>
        </div>`
    ).join('');

    return `<div class="collapsible" data-action="toggle-collapsible" data-target="${uid}">▶ 📥 Reservorio de ejercicios (${archivedNames.length})</div>
        <div class="collapsible-content" id="${uid}">${items}</div>`;
}

function archiveExerciseFromRow(idx, routine) {
    const nameEl = document.getElementById(`exname_${idx}`);
    const exerciseName = nameEl ? nameEl.textContent : null;
    if (!exerciseName) return;

    const dataLabel = describeBlockSessionData(document.getElementById(`row_${idx}`));
    if (dataLabel) {
        if (!confirm(`⚠️ ${exerciseName}\n\nTiene ${dataLabel} en esta sesión (sin guardar). Si lo archivás ahora se pierden.\n\n¿Archivar de todas formas?`)) {
            return;
        }
    }

    if (!archivedExercises[routine]) archivedExercises[routine] = [];
    const already = archivedExercises[routine].some(n => normalizeForCompare(n) === normalizeForCompare(exerciseName));
    if (!already) archivedExercises[routine].push(exerciseName);
    saveArchivedExercises();

    loadRoutineExercises();
    showToast(`📥 "${exerciseName}" archivado en esta rutina`);
}

function restoreArchivedExercise(routine, name) {
    if (!archivedExercises[routine]) return;
    archivedExercises[routine] = archivedExercises[routine].filter(n => normalizeForCompare(n) !== normalizeForCompare(name));
    saveArchivedExercises();

    loadRoutineExercises();
    showToast(`✅ "${name}" restaurado a la rutina`);
}

function loadRoutineExercises() {
    reorderController.finish(); // si quedó un arrastre a medias, se cierra y la vista vuelve a la normalidad
    const routine = document.getElementById('routine').value;
    const container = document.getElementById('exercisesContainer');
    if (!container) return;

    updateDeleteRoutineButtonVisibility(routine);

    if (!routine) {
        container.innerHTML = '';
        return;
    }

    loadCustomRoutines();
    calculateStats();
    const routineExists = Object.prototype.hasOwnProperty.call(customRoutines, routine) || Object.prototype.hasOwnProperty.call(routines, routine);

    if (!routineExists) {
        container.innerHTML = '<p style="color:var(--text-faint);">⚠️ Esa rutina ya no existe. Elegí otra arriba.</p>';
        return;
    }

    let exercises = customRoutines[routine] || routines[routine] || [];
    const archivedNames = archivedExercises[routine] || [];
    const archivedSet = new Set(archivedNames.map(normalizeForCompare));

    let html = `<div class="sets-legend">Mantené apretados los puntos ⠿ y arrastrá para reordenar · Tocá el número de serie para marcarla como calentamiento (C) · ✓ marca la serie y arranca el descanso · RIR: reps que te quedaban (F = al fallo)</div>`;
    exercises.forEach((ex, idx) => {
        if (!ex) return;
        if (archivedSet.has(normalizeForCompare(ex))) return;
        html += buildExerciseRowHtml(idx, ex, routine);
    });

    // Los ejercicios agregados en la sesión se insertan antes de este ancla, así
    // quedan junto a los demás bloques (y se pueden reordenar con ellos).
    html += `<div id="archivedExercisesAnchor">${buildArchivedExercisesHtml(routine, archivedNames)}</div>`;

    html += `<div id="quickAddWrapper" style="margin-top: 10px;">
        <input type="text" id="quickAddExercise" list="exerciseNamesList" placeholder="Nuevo ejercicio (o elegí uno existente)" data-input="quick-add-name" style="margin-bottom: 0;">
        <datalist id="exerciseNamesList"></datalist>
        <div class="quick-add-type-row">
            <select id="quickAddType" aria-label="Cómo se mide el ejercicio nuevo" data-change="quick-add-type" style="flex: 1;">${buildTypeOptionsHtml('kg')}</select>
            <button data-action="quick-add" style="flex: 0 0 auto; width: auto;">+ Agregar</button>
        </div>
    </div>`;
    container.innerHTML = html;
    populateExerciseDatalist();

    const sessionNotesInput = document.getElementById('sessionNotes');
    if (sessionNotesInput) {
        const lastNote = getLastRoutineNote(routine);
        sessionNotesInput.value = lastNote;
        sessionNotesInput.placeholder = lastNote ? 'Notas de la sesión' : 'Notas de la sesión (opcional)';
    }
}

function populateExerciseDatalist() {
    const datalist = document.getElementById('exerciseNamesList');
    if (datalist) {
        datalist.innerHTML = getAllKnownExerciseNames().map(n => `<option value="${escapeHtml(n)}"></option>`).join('');
    }
    populateUnifySelectors();
}

// Dado un nombre recién tipeado, devuelve el nombre "canónico" a usar:
// reutiliza uno existente si coincide (ignorando mayúsculas/acentos/espacios),
// avisa si se parece a uno existente, o lo deja pasar como ejercicio nuevo.
function resolveExerciseName(rawName) {
    const trimmed = rawName.trim().replace(/\s+/g, ' ');
    if (!trimmed) return null;

    const known = getAllKnownExerciseNames();
    const normTrimmed = normalizeForCompare(trimmed);

    const exact = known.find(n => normalizeForCompare(n) === normTrimmed);
    if (exact) return exact;

    const similar = known.find(n => {
        const normN = normalizeForCompare(n);
        return normN.includes(normTrimmed) || normTrimmed.includes(normN);
    });
    if (similar) {
        const useSimilar = confirm(`Ya existe un ejercicio parecido: "${similar}".\n\nAceptar → usar "${similar}"\nCancelar → crear "${trimmed}" como ejercicio nuevo`);
        return useSimilar ? similar : trimmed;
    }

    return trimmed;
}

function editExerciseName(idx, routine) {
    const elem = document.getElementById(`exname_${idx}`);
    const currentName = elem.textContent;
    const newNameRaw = prompt('Editar nombre (si escribís uno que ya existe en otra rutina, se puede unificar y fusionar sus estadísticas):', currentName);
    if (!newNameRaw || !newNameRaw.trim()) return;

    const trimmed = newNameRaw.trim().replace(/\s+/g, ' ');
    if (normalizeForCompare(trimmed) === normalizeForCompare(currentName)) return; // sin cambios reales

    const known = getAllKnownExerciseNames();
    const exactMatch = known.find(n => normalizeForCompare(n) === normalizeForCompare(trimmed) && normalizeForCompare(n) !== normalizeForCompare(currentName));

    if (exactMatch) {
        if (confirm(`"${currentName}" y "${exactMatch}" van a quedar unificados como un solo ejercicio.\n\nEsto renombra "${currentName}" a "${exactMatch}" en TODAS las rutinas donde aparece y en todo el historial de sesiones ya guardadas, para que las estadísticas se junten.\n\n¿Confirmás?`)) {
            unifyExerciseName(currentName, exactMatch);
        }
        return;
    }

    // Nombre nuevo (o solo cambia formato/tildes): renombrar únicamente en esta rutina
    loadCustomRoutines();
    if (!customRoutines[routine]) {
        customRoutines[routine] = JSON.parse(JSON.stringify(routines[routine]));
    }
    // Por nombre y no por idx: el orden de la rutina puede haber cambiado con drag & drop.
    const pos = customRoutines[routine].findIndex(n => normalizeForCompare(n) === normalizeForCompare(currentName));
    if (pos < 0) return;
    customRoutines[routine][pos] = trimmed;
    saveCustomRoutines();
    // El tipo de medición acompaña al ejercicio renombrado.
    const oldType = exercisePrefs.rawType(currentName);
    if (oldType && !exercisePrefs.hasType(trimmed)) saveExerciseType(trimmed, oldType);
    elem.textContent = trimmed;
    const block = elem.closest('.exercise-row');
    if (block) block.dataset.name = trimmed;
    populateExerciseDatalist();
}

function deleteRowQuick(idx, routine) {
    const exerciseName = document.getElementById(`exname_${idx}`)?.textContent || 'Ejercicio';
    const block = document.getElementById(`row_${idx}`);
    const dataLabel = describeBlockSessionData(block);

    if (dataLabel) {
        if (!confirm(`⚠️ ${exerciseName}\n\nTiene ${dataLabel}.\n\nSi lo quitás ahora sin guardar, perderás estos datos.\n\n¿Seguro que querés quitarlo?`)) {
            return;
        }
    }

    block?.remove();
    saveWorkoutDraft();
}

// Mientras se escribe el nombre, el selector de tipo sugiere cómo medirlo (el tipo
// ya guardado si el ejercicio existe, o uno deducido del nombre: "Plancha" → Tiempo,
// "Bici" → Km). Si el usuario lo cambió a mano, se respeta su elección.
function onQuickAddNameInput(routine) {
    const select = document.getElementById('quickAddType');
    const name = document.getElementById('quickAddExercise')?.value || '';
    if (!select || select.dataset.touched) return;
    select.value = name.trim() ? getExerciseType(name, routine) : 'kg';
}

function quickAddExercise(routine) {
    const input = document.getElementById('quickAddExercise');
    const rawName = input.value;

    if (!rawName.trim()) {
        showToast('Escribí el nombre del ejercicio', 'error');
        return;
    }

    const name = resolveExerciseName(rawName);
    if (!name) return;

    loadCustomRoutines();
    if (!customRoutines[routine]) {
        customRoutines[routine] = JSON.parse(JSON.stringify(routines[routine]));
    }

    const alreadyInRoutine = customRoutines[routine].some(n => normalizeForCompare(n) === normalizeForCompare(name));
    if (alreadyInRoutine) {
        showToast(`"${name}" ya está en esta rutina`, 'error');
        return;
    }

    customRoutines[routine].push(name);
    saveCustomRoutines();

    // Tipo de medición: el que se eligió a mano, o el sugerido si el ejercicio
    // todavía no tenía uno (uno existente conserva el suyo si no se tocó el selector).
    const typeSelect = document.getElementById('quickAddType');
    if (typeSelect && (typeSelect.dataset.touched || !exercisePrefs.hasType(name))) {
        saveExerciseType(name, typeSelect.value);
    }

    // Agregar solo el bloque nuevo, sin reconstruir los demás: así no se pierde
    // lo que ya estaba anotado en las series de esta sesión.
    const quickAddWrapper = document.getElementById('quickAddWrapper');
    if (quickAddWrapper) {
        calculateStats();
        let idx = customRoutines[routine].length - 1;
        while (document.getElementById(`row_${idx}`)) idx++;
        const anchor = document.getElementById('archivedExercisesAnchor') || quickAddWrapper;
        anchor.insertAdjacentHTML('beforebegin', buildExerciseRowHtml(idx, name, routine));
        populateExerciseDatalist();
    } else {
        loadRoutineExercises();
    }

    input.value = '';
    if (typeSelect) { delete typeSelect.dataset.touched; typeSelect.value = 'kg'; }
    showToast('✅ Ejercicio agregado');
}

function saveWorkoutSession() {
    const routine = document.getElementById('routine').value;
    const date = document.getElementById('workoutDate').value;
    
    if (!routine || !date) {
        showToast('Seleccioná rutina y fecha', 'error');
        return;
    }

    // Leer todos los bloques de ejercicio (en el orden en que están en pantalla).
    // Solo cuentan las series hechas: tildadas o con valores escritos. Las
    // sugerencias en gris (lo de la última vez) no se guardan por sí solas.
    const exercises = [];
    document.querySelectorAll('#exercisesContainer .exercise-row').forEach(block => {
        const name = getBlockName(block);
        const type = EXERCISE_TYPES[block.dataset.type] ? block.dataset.type : 'kg';
        const sets = readBlockSets(block)
            .filter(set => set.done || setHasMetric(set, type))
            .map(set => cleanSetForSave(set, type));
        if (!name || sets.length === 0) return;

        exercises.push(new ExerciseLog({
            name,
            type,
            sets,
            note: (block.querySelector('.exercise-note')?.value || '').trim(),
            superset: block.dataset.superset || null,
            unilateral: block.dataset.unilateral === '1'
        }).toJSON());
    });

    if (exercises.length === 0) {
        showToast('Marcá (✓) o cargá al menos una serie', 'error');
        return;
    }

    const generalNotes = document.getElementById('sessionNotes').value.trim();

    // Si el cronómetro quedó marcado de un día distinto al que se está guardando
    // (se inició/finalizó y nunca se guardó, o la pestaña quedó abierta de un día
    // para el otro), no corresponde a esta sesión: se descarta en vez de reutilizarlo.
    if (currentSessionStartTime && formatDateLocal(new Date(currentSessionStartTime)) !== date) {
        stopSessionTimer();
    }

    // Si no hay sesión activa, guardar en historial antiguo
    const effectiveEnd = currentSessionStartTime ? (currentSessionEndTime || Date.now()) : null;
    const duration = currentSessionStartTime
        ? Math.max(1, Math.round((effectiveEnd - currentSessionStartTime) / 60000))
        : null;

    calculateStats(); // estado ANTES de esta sesión, para detectar PRs
    const { prs, notes: progressNotes } = detectPRs(exercises, exerciseStats);
    const volume = calculateSessionVolume(exercises);

    const session = WorkoutSession.create({
        date: date,
        routine: routine,
        exercises: exercises,
        mood: selectedMood,
        notes: generalNotes,
        startTime: currentSessionStartTime ? new Date(currentSessionStartTime).toISOString() : null,
        endTime: effectiveEnd ? new Date(effectiveEnd).toISOString() : null,
        duration: duration,
        volume: volume,
        prs: prs,
        progressNotes: progressNotes
    });

    // Todo junto o nada: la sesión nueva, el borrador y el reloj de la sesión en curso.
    // Si no se pudo guardar, el formulario queda como estaba para reintentar.
    try {
        db.transaction(tx => {
            repo.workouts.add(session);
            tx.remove('workoutDraft');
            tx.remove('activeSessionStart');
            tx.remove('activeSessionEnd');
        });
    } catch (err) {
        console.error('No se pudo guardar la sesión:', err);
        showToast(`❌ No se pudo guardar la sesión. ${err.message}`, 'error', 6000);
        return;
    }
    cancelRestTimer(); // no dejar el widget de descanso corriendo después de guardar
    stopRepCounter(true);
    stopSessionTimer();
    clearWorkoutDraft();

    let msg = `✅ Sesión guardada — ${exercises.length} ejercicios`;
    if (duration) msg += `\n⏱ Duración: ${formatDuration(duration)}`;
    if (volume > 0) msg += `\n🏋️ Volumen: ${Math.round(volume).toLocaleString('es-AR')} kg`;
    if (prs.length > 0) msg += `\n\n🏆 ¡Nuevo PR!\n` + prs.map(p => `• ${p}`).join('\n');
    if (progressNotes.length > 0) msg += `\n\n📝 Para tener en cuenta:\n` + progressNotes.map(n => `• ${n}`).join('\n');
    showToast(msg, prs.length > 0 ? 'pr' : 'success', (prs.length > 0 || progressNotes.length > 0) ? 5500 : 3200);
    if (prs.length > 0) speakCue(['record'], prs.length === 1 ? '¡Nuevo récord!' : `¡${prs.length} récords nuevos!`, 'records');
    document.getElementById('sessionNotes').value = '';
    document.getElementById('routine').value = '';
    document.getElementById('exercisesContainer').innerHTML = '';

    displayWorkoutHistory();
    updateSidebar();
}

