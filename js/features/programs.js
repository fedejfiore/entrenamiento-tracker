// Inicio → "Programas": elegir un programa prearmado, ver cuál es el próximo día y, en
// Entrenar, el objetivo de cada ejercicio con progresión doble (primero reps, después peso).
// Script clásico (no módulo): comparte el ámbito global con el resto de la app.

const PROGRAM_TIER_LABEL = { free: 'Gratis', pro: 'Pro' };

function programTargetsFor(routineKey) {
    return routineKey ? repo.routines.targets(routineKey) : {};
}

function getExerciseTarget(routineKey, name) {
    return programTargetsFor(routineKey)[normalizeForCompare(name || '')] || null;
}

// En máquinas de placas el salto de peso es el de una placa.
function targetIncrement(name, target) {
    return plateModeFor(name) === 'stack' ? stackFor(name).step : target.inc;
}

/** Sugerencia de hoy para un ejercicio con objetivo, a partir de su última sesión. */
function programSuggestion(routineKey, name) {
    const target = getExerciseTarget(routineKey, name);
    if (!target) return null;
    const last = (exerciseStats[name] || {}).lastSets || [];
    return { target, ...suggestDoubleProgression(last, { ...target, inc: targetIncrement(name, target) }) };
}

/**
 * Valores sugeridos (en gris) de cada serie para un ejercicio con objetivo: las series de
 * calentamiento de la última vez y, después, las series del objetivo con el peso y las reps
 * que tocan hoy. Tildar una serie sin tocar la completa con esto, igual que con la última vez.
 */
function programPrevSets(routineKey, name, prevSets) {
    const s = programSuggestion(routineKey, name);
    if (!s) return null;
    const lastWork = prevSets.filter(p => p && !p.warmup);
    const warmups = prevSets.filter(p => p && p.warmup);
    const work = s.reps.map((reps, i) => {
        const base = lastWork[i] || lastWork[lastWork.length - 1] || {};
        const kg = s.kg != null ? String(s.kg).replace('.', ',') : (base.kg || '');
        return { reps: String(reps), kg, rest: String(s.target.rest || base.rest || '') };
    });
    return [...warmups, ...work];
}

function programTargetLineHtml(routineKey, name) {
    const s = programSuggestion(routineKey, name);
    if (!s) return '';
    const { sets, repsMin, repsMax } = s.target;
    const range = repsMin === repsMax ? `${repsMin}` : `${repsMin}–${repsMax}`;
    return `<small class="program-target program-${s.action}">🎯 ${sets} × ${range} · ${escapeHtml(s.text)}</small>`;
}

// ---- Programa en curso ----

function programDayKeys(program) {
    return program.days.map(d => programRoutineKey(program.id, d.key));
}

/** Próximo día del programa: el que sigue al último que se entrenó. */
function nextProgramDay(program) {
    const keys = programDayKeys(program);
    const last = repo.workouts.all()
        .filter(w => w && keys.includes(w.routine))
        .sort((a, b) => (a.date || '').localeCompare(b.date || '') || (a.id || 0) - (b.id || 0))
        .pop();
    const idx = last ? (keys.indexOf(last.routine) + 1) % keys.length : 0;
    return { day: program.days[idx], key: keys[idx], sessions: repo.workouts.all().filter(w => w && keys.includes(w.routine)).length };
}

function renderProgramsSection() {
    const box = document.getElementById('programStatus');
    if (!box) return;
    const active = repo.routines.activeProgram();
    const program = active && findProgram(active.id);
    if (!program) {
        box.innerHTML = `<p class="program-empty">Programas armados con progresión automática: la app te dice cuántas reps y qué peso hacer cada día. Primero se suben reps y, cuando llegás al tope en todas las series, se sube el peso.</p>
            <button type="button" data-program-action="browse">📚 Ver programas</button>`;
        return;
    }
    const { day, key, sessions } = nextProgramDay(program);
    const since = new Date(active.startedAt + 'T00:00:00').toLocaleDateString('es-AR');
    const week = Math.floor((Date.now() - new Date(active.startedAt + 'T00:00:00').getTime()) / (7 * 86400000)) + 1;
    box.innerHTML = `<div class="program-active">
            <strong>${escapeHtml(program.name)}</strong>
            <small>Desde el ${since} · semana ${Math.min(week, program.weeks)} de ${program.weeks} · ${sessions} ${sessions === 1 ? 'sesión' : 'sesiones'}</small>
            <p>Te toca: <b>${escapeHtml(day.name)}</b></p>
            <div class="program-actions">
                <button type="button" class="success" data-program-action="train" data-routine="${escapeHtml(key)}">▶ Entrenar ${escapeHtml(day.name)}</button>
                <button type="button" class="small" data-program-action="browse">Cambiar</button>
                <button type="button" class="small danger" data-program-action="end">Terminar</button>
            </div>
        </div>`;
}

function programCardHtml(p, activeId) {
    const days = p.days.map(d => `<li><b>${escapeHtml(d.name)}:</b> ${d.exercises.map(e => `${escapeHtml(e.name)} ${e.sets}×${e.repsMin === e.repsMax ? e.repsMin : e.repsMin + '–' + e.repsMax}`).join(' · ')}</li>`).join('');
    const weekdays = p.weekdays.map(n => WEEKDAYS.find(w => w.n === n)?.short || '').join(' ');
    return `<div class="program-card${p.id === activeId ? ' current' : ''}">
            <div class="program-card-head">
                <strong>${escapeHtml(p.name)}</strong>
                <span class="program-tier tier-${p.tier}">${PROGRAM_TIER_LABEL[p.tier]}</span>
            </div>
            <small>${escapeHtml(p.level)} · ${p.weekdays.length} días por semana (${weekdays}) · ${p.weeks} semanas</small>
            <p>${escapeHtml(p.description)}</p>
            <details><summary>Ver ejercicios</summary><ul>${days}</ul></details>
            <button type="button" data-program-action="start" data-program="${p.id}"${p.id === activeId ? ' disabled' : ''}>${p.id === activeId ? 'En curso' : 'Empezar este programa'}</button>
        </div>`;
}

function openProgramsModal() {
    const active = repo.routines.activeProgram();
    document.getElementById('programList').innerHTML = PROGRAMS.map(p => programCardHtml(p, active?.id)).join('');
    document.getElementById('programsModal').classList.add('open');
}

function closeProgramsModal() {
    document.getElementById('programsModal')?.classList.remove('open');
}

function startProgram(id) {
    const program = findProgram(id);
    if (!program) return;
    const active = repo.routines.activeProgram();
    const replacing = active && active.id !== id ? `\n\nSe termina "${findProgram(active.id)?.name || 'el programa anterior'}" (sus rutinas y tu historial quedan).` : '';
    if (!confirm(`¿Empezar "${program.name}"?\n\nSe crean ${program.days.length === 1 ? 'su rutina' : `sus ${program.days.length} rutinas`} con el objetivo de cada ejercicio.${replacing}`)) return;

    const days = program.days.map(d => ({
        key: programRoutineKey(program.id, d.key),
        label: `${program.short} · ${d.name}`,
        exercises: d.exercises.map(e => e.name),
        targets: Object.fromEntries(d.exercises.map(e => [normalizeForCompare(e.name), {
            sets: e.sets, repsMin: e.repsMin, repsMax: e.repsMax, rest: e.rest, inc: e.inc, ...(e.type ? { type: e.type } : {})
        }]))
    }));
    try {
        if (active) repo.routines.endProgram();
        repo.routines.startProgram(program.id, days, getLocalDateString());
        // Los de peso corporal se miden así (si el usuario no eligió otra cosa antes).
        program.days.forEach(d => d.exercises.forEach(e => {
            if (e.type && !exercisePrefs.hasType(e.name)) saveExerciseType(e.name, e.type);
        }));
    } catch (e) {
        showToast('No se pudo empezar el programa: ' + e.message, 'error');
        return;
    }
    // Las rutinas del programa vuelven a estar visibles si alguna vez se archivaron.
    days.forEach(d => archivedRoutines.delete(d.key));
    saveArchivedRoutines();
    loadCustomRoutines();
    loadCustomRoutineLabels();
    populateRoutineOptions();

    const plan = getCurrentPlan();
    const sameDays = plan.days.join() === program.weekdays.join();
    if (!sameDays && confirm(`¿Usar también los días del programa en tu plan semanal (${program.weekdays.map(n => WEEKDAYS.find(w => w.n === n)?.long).join(', ')})?`)) {
        const time = plan.days.length ? plan.timeFor(plan.days[0]) : undefined;
        saveCurrentPlan(new TrainingPlan({ days: program.weekdays, times: Object.fromEntries(program.weekdays.map(n => [n, plan.timeFor(n) || time])), remind: plan.remind }));
        renderPlanSection();
    }
    closeProgramsModal();
    renderProgramsSection();
    showToast(`📚 ${program.name}: listo. Empezá por "${days[0].label}".`, 'success', 3500);
}

function endProgram() {
    const active = repo.routines.activeProgram();
    if (!active) return;
    if (!confirm('¿Terminar el programa?\n\nSus rutinas y todo lo que entrenaste quedan; solo se dejan de mostrar los objetivos de cada ejercicio.')) return;
    repo.routines.endProgram();
    renderProgramsSection();
    showToast('Programa terminado');
}

function trainProgramDay(routineKey) {
    const select = document.getElementById('routine');
    if (!select) return;
    showScreen('entrenar');
    select.value = routineKey;
    select.dispatchEvent(new Event('change', { bubbles: true }));
}

function bindPrograms() {
    const onClick = e => {
        const btn = e.target.closest('[data-program-action]');
        if (!btn) return;
        const action = btn.dataset.programAction;
        if (action === 'browse') openProgramsModal();
        if (action === 'close') closeProgramsModal();
        if (action === 'start') startProgram(btn.dataset.program);
        if (action === 'end') endProgram();
        if (action === 'train') trainProgramDay(btn.dataset.routine);
    };
    document.getElementById('programsSection')?.addEventListener('click', onClick);
    const modal = document.getElementById('programsModal');
    modal?.addEventListener('click', e => {
        if (e.target === modal) { closeProgramsModal(); return; }
        onClick(e);
    });
}
