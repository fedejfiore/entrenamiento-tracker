// Biblioteca: todas las rutinas (tuyas, programas, básicas y archivadas) y todos los
// ejercicios (los tuyos y el catálogo de variantes con videos). También compartir una
// rutina por link e importar una que te pasaron.
// Script clásico (no módulo): comparte el ámbito global con el resto de la app.

function routineExercisesOf(key) {
    return (customRoutines[key] || routines[key] || []).filter(Boolean);
}

function lastDoneOf(key) {
    let last = null;
    repo.workouts.all().forEach(w => { if (w && w.routine === key && (!last || w.date > last)) last = w.date; });
    return last;
}

function libRoutineItemHtml(key, { archived = false } = {}) {
    const label = routineLabelOf(key);
    const exercises = routineExercisesOf(key);
    const last = lastDoneOf(key);
    const lastText = last ? `última vez ${new Date(last + 'T00:00:00').toLocaleDateString('es-AR')}` : 'nunca la hiciste';
    const list = exercises.map(e => `<li>${escapeHtml(e)}</li>`).join('');
    const k = escapeHtml(key);
    const actions = archived
        ? `<button type="button" class="small" data-lib="restore" data-routine="${k}">↩️ Restaurar</button>`
        : `<button type="button" class="small" data-lib="train" data-routine="${k}" aria-label="Entrenar ${escapeHtml(label)}">▶ Entrenar</button>
           <button type="button" class="small lib-secondary" data-lib="share" data-routine="${k}" aria-label="Compartir ${escapeHtml(label)}" title="Compartir por link">🔗</button>
           <button type="button" class="small lib-secondary" data-lib="archive" data-routine="${k}" aria-label="Archivar ${escapeHtml(label)}" title="Archivar">📥</button>`;
    return `<div class="lib-item">
            <div class="lib-item-main">
                <strong>${escapeHtml(label)}</strong>
                <small>${exercises.length} ${exercises.length === 1 ? 'ejercicio' : 'ejercicios'} · ${lastText}</small>
                ${list ? `<details><summary>Ver ejercicios</summary><ol>${list}</ol></details>` : ''}
            </div>
            <div class="lib-actions">${actions}</div>
        </div>`;
}

function renderLibrary() {
    loadCustomRoutines();
    loadCustomRoutineLabels();
    const visible = k => !archivedRoutines.has(k);
    const own = Object.keys(customRoutines).filter(k => !k.startsWith('PRG_') && visible(k)).sort((a, b) => routineLabelOf(a).localeCompare(routineLabelOf(b), 'es'));
    const fromPrograms = Object.keys(customRoutines).filter(k => k.startsWith('PRG_') && visible(k));
    const base = Object.keys(routines).filter(k => !customRoutines[k] && visible(k));
    const set = (id, html, empty) => { const el = document.getElementById(id); if (el) el.innerHTML = html || `<p class="lib-empty">${empty}</p>`; };

    const ownHtml = own.map(k => libRoutineItemHtml(k)).join('');
    const myBox = document.getElementById('libMyRoutines');
    if (myBox) myBox.innerHTML = ownHtml || emptyStateHtml('Todavía no creaste rutinas. Creá una, elegí un programa armado o importá una que te pasaron (abajo).', ['create-routine', 'programs']);
    const active = repo.routines.activeProgram();
    const programIntro = `<p class="lib-note">Programas armados con progresión automática (primero reps, después peso).${active ? ` En curso: <b>${escapeHtml(findProgram(active.id)?.name || '')}</b>.` : ''}</p>
        <button type="button" data-program-action="browse">📚 Ver todos los programas</button>`;
    set('libPrograms', programIntro + fromPrograms.map(k => libRoutineItemHtml(k)).join(''), '');
    set('libBaseRoutines', base.map(k => libRoutineItemHtml(k)).join(''), 'No hay rutinas básicas visibles (están todas archivadas).');
    renderArchivedRoutinesList();
    renderLibraryExercises();
}

function renderLibraryExercises() {
    const box = document.getElementById('libMyExercises');
    if (!box) return;
    calculateStats();
    const byGroup = {};
    Object.keys(exerciseStats).forEach(name => { (byGroup[getMuscleGroup(name)] ||= []).push(name); });
    const order = [...Object.keys(MUSCLE_GROUPS), 'Otro'].filter(g => byGroup[g]);
    if (!order.length) { box.innerHTML = emptyStateHtml('Cuando guardes sesiones, acá vas a ver cada ejercicio que hiciste, agrupado por músculo.', ['train', 'import']); return; }
    box.innerHTML = order.map(g => `<details class="progression-group">
            <summary>${(MUSCLE_GROUPS[g] || {}).icon || '📌'} ${escapeHtml(g)} <small>(${byGroup[g].length})</small></summary>
            ${byGroup[g].sort((a, b) => a.localeCompare(b, 'es')).map(n => {
                const type = getExerciseType(n);
                const summary = buildLastSummaryText(exerciseStats[n] || {}, type).replace(/<br>/g, ' · ');
                return `<button type="button" class="progression-row" data-exercise="${escapeHtml(n)}">
                        <span class="progression-name"><strong>${escapeHtml(n)}</strong></span><small>${summary}</small>
                        <span class="progression-open" aria-hidden="true">📊</span></button>`;
            }).join('')}
        </details>`).join('');
}

function trainRoutine(key) {
    showScreen('entrenar', true);
    setTrainMode('rutina');
    const select = document.getElementById('routine');
    if (!select) return;
    populateRoutineOptions();
    select.value = key;
    loadRoutineExercises();
    saveWorkoutDraft();
}

function archiveRoutineFromLibrary(key) {
    const label = routineLabelOf(key);
    archivedRoutines.add(key);
    saveArchivedRoutines();
    populateRoutineOptions();
    renderLibrary();
    showUndoToast(`📥 "${label}" archivada`, () => {
        archivedRoutines.delete(key);
        saveArchivedRoutines();
        populateRoutineOptions();
        renderLibrary();
    });
}

// ---------- Compartir e importar por link ----------

async function shareRoutine(key) {
    const label = routineLabelOf(key);
    const targets = repo.routines.targets(key);
    const exercises = routineExercisesOf(key).map(name => ({
        name, type: getExerciseType(name, key), target: targets[normalizeForCompare(name)] || null, group: getMuscleGroup(name)
    }));
    const url = `${location.origin}${location.pathname}#rutina=${encodeRoutineShare({ label, exercises })}`;
    const text = `Te paso mi rutina "${label}" (${exercises.length} ejercicios). Abrila en ${APP_BRAND.name} con este link:`;
    try {
        if (navigator.share) { await navigator.share({ title: label, text, url }); return; }
    } catch (e) {
        if (e && e.name === 'AbortError') return; // canceló el menú de compartir
    }
    try {
        await navigator.clipboard.writeText(`${text} ${url}`);
        showToast('🔗 Link copiado: pegalo en WhatsApp o donde quieras', 'success', 3000);
    } catch (e) {
        prompt('Copiá este link para compartir la rutina:', url);
    }
}

function routineShareCodeFrom(text) {
    return routineShareCodesFrom(text)[0] || null;
}

/** Todos los códigos de un texto: se pueden pegar varios links juntos (uno por rutina). */
function routineShareCodesFrom(text) {
    const s = String(text || '');
    const links = [...s.matchAll(/#rutina=([A-Za-z0-9_-]+)/g)].map(m => m[1]);
    if (links.length) return links;
    const bare = s.trim().match(/^([A-Za-z0-9_-]{8,})$/);
    return bare ? [bare[1]] : [];
}

let importRoutineSeq = 0;

function importRoutineFromCode(code) {
    let shared;
    try {
        shared = decodeRoutineShare(code);
    } catch (e) {
        showToast(e instanceof ValidationError ? e.message : 'No se pudo leer la rutina del link', 'error', 4000);
        return false;
    }
    const names = shared.exercises.map(e => `• ${e.name}${e.target ? ` (${e.target.sets}×${e.target.repsMin}${e.target.repsMax !== e.target.repsMin ? '–' + e.target.repsMax : ''})` : ''}`).join('\n');
    if (!confirm(`¿Agregar la rutina "${shared.label}" a tu Biblioteca?\n\n${names}\n\nSe crea como una rutina tuya: la podés modificar cuando quieras.`)) return false;
    // Contador además de la hora: al importar varias de una vez caen en el mismo milisegundo.
    const key = 'R' + Date.now().toString(36).toUpperCase() + (importRoutineSeq++).toString(36).toUpperCase();
    const targets = {};
    shared.exercises.forEach(e => { if (e.target) targets[normalizeForCompare(e.name)] = e.target; });
    try {
        repo.routines.importRoutine(key, shared.label, shared.exercises.map(e => e.name), targets);
        shared.exercises.forEach(e => { if (e.type && !exercisePrefs.hasType(e.name)) saveExerciseType(e.name, e.type); });
        // El grupo que trae el link se usa si quien la recibe no eligió otro a mano.
        shared.exercises.forEach(e => {
            if (e.group && !exercisePrefs.hasManualGroup(e.name) && e.group !== catalogMuscleGroup(e.name)) saveGroupOverride(e.name, e.group);
        });
    } catch (e) {
        showToast('No se pudo guardar la rutina: ' + e.message, 'error');
        return false;
    }
    loadCustomRoutines();
    loadCustomRoutineLabels();
    populateRoutineOptions();
    renderLibrary();
    showToast(`✅ "${shared.label}" agregada a tus rutinas`, 'success', 3000);
    return true;
}

// Al abrir la app con un link de rutina (#rutina=...), se ofrece importarla.
function checkRoutineLinkOnStart() {
    const code = routineShareCodeFrom(location.hash);
    if (!code) return;
    try { history.replaceState(null, '', location.pathname + location.search); } catch (e) {}
    setTimeout(() => {
        if (importRoutineFromCode(code)) { showScreen('biblioteca'); setLibraryTab('rutinas'); }
    }, 400);
}

// ---------- Pestañas y eventos ----------

function setLibraryTab(tab) {
    const t = tab === 'ejercicios' ? 'ejercicios' : 'rutinas';
    document.querySelectorAll('.lib-tab').forEach(el => { el.hidden = el.dataset.tab !== t; });
    document.querySelectorAll('[data-lib-tab]').forEach(b => {
        const on = b.dataset.libTab === t;
        b.classList.toggle('active', on);
        b.setAttribute('aria-selected', on ? 'true' : 'false');
    });
}

function bindLibrary() {
    const screen = document.querySelector('[data-screen="biblioteca"]');
    if (!screen) return;
    screen.addEventListener('click', e => {
        const tab = e.target.closest('[data-lib-tab]');
        if (tab) { setLibraryTab(tab.dataset.libTab); return; }
        const ex = e.target.closest('.progression-row[data-exercise]');
        if (ex) { openExerciseDetail(ex.dataset.exercise); return; }
        if (e.target.closest('[data-program-action="browse"]')) { openProgramsModal(); return; }
        const btn = e.target.closest('[data-lib]');
        if (!btn) return;
        const key = btn.dataset.routine;
        if (btn.dataset.lib === 'train') trainRoutine(key);
        if (btn.dataset.lib === 'share') shareRoutine(key);
        if (btn.dataset.lib === 'archive') archiveRoutineFromLibrary(key);
        if (btn.dataset.lib === 'restore') { restoreRoutine(key); }
        if (btn.dataset.lib === 'import') {
            const input = document.getElementById('importRoutineLink');
            const codes = routineShareCodesFrom(input?.value);
            if (!codes.length) { showToast('Pegá el link completo que te pasaron', 'error'); return; }
            const added = codes.filter(code => importRoutineFromCode(code)).length;
            if (added && input) input.value = '';
            if (codes.length > 1) showToast(`✅ ${added} de ${codes.length} rutinas agregadas`, 'success', 3000);
        }
    });
    setLibraryTab('rutinas');
    checkRoutineLinkOnStart();
    // Con la app ya abierta, tocar un link de rutina solo cambia el #: también se ofrece importarla.
    window.addEventListener('hashchange', checkRoutineLinkOnStart);
}
