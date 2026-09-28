// Historial de sesiones: filtros, resumen y detalle.
// Script clásico (no módulo): comparte el ámbito global con el resto de la app.

const HISTORY_RECENT_COUNT = 7;

function renderHistoryItem(w) {
    if (w.type === 'tabata') return renderTabataHistoryItem(w);

    const mood = ['😢','😐','🙂','😊','🔥'][w.mood-1] || '😐';
    const exes = w.exercises.map(e => e?.name?.split(' ')[0] || '').filter(Boolean).join(', ');
    const uid = `session_${w.id}`;
    const durationChip = formatDuration(w.duration) ? `<span class="stat-chip">⏱ ${formatDuration(w.duration)}</span>` : '';
    const sessionVolume = w.volume != null ? w.volume : calculateSessionVolume(w.exercises);
    const volumeChip = sessionVolume > 0 ? `<span class="stat-chip">🏋️ ${Math.round(sessionVolume).toLocaleString('es-AR')}kg</span>` : '';
    const prBadge = (w.prs && w.prs.length > 0) ? `<span class="stat-chip pr">🏆 PR</span>` : '';
    const notesBadge = (w.progressNotes && w.progressNotes.length > 0) ? `<span class="stat-chip" title="Hay señales mixtas para revisar">📝</span>` : '';
    const routineLabel = w.routine ? (customRoutineLabels[w.routine] || ROUTINE_LABELS[w.routine] || `Rutina ${w.routine}`) : '';
    const routineBadge = w.routine
        ? `<span title="${routineLabel}" class="stat-chip brand">${w.routine}</span>`
        : '';

    return `<div class="history-item">
            <div onclick="toggleSession('${uid}')" style="cursor:pointer; user-select: none;">
                <div style="display:flex; align-items:center; gap:6px; flex-wrap:wrap; margin-bottom:4px;">
                    ${routineBadge}<strong>${w.date}</strong>
                    <button type="button" class="small" style="width:auto; padding:2px 6px;" onclick="event.stopPropagation(); editWorkoutDate(${w.id})" title="Editar fecha">✏️</button>
                    <span>${mood}</span>${prBadge}${notesBadge}${durationChip}${volumeChip}
                </div>
                <div>${exes}</div>
                <small style="color:var(--text-faint);">▾ ver detalle</small>
            </div>
            <div id="${uid}" style="display:none; margin-top: 10px; padding-top: 10px; border-top: 1px solid var(--border); font-size: 0.9em;">
                ${w.prs && w.prs.length > 0 ? `<div style="margin-bottom: 10px; padding: 8px; background: rgba(var(--brand-rgb), 0.12); border-left: 3px solid var(--warning); border-radius: 3px;"><strong>🏆 PRs de esta sesión:</strong><br>${w.prs.join('<br>')}</div>` : ''}
                ${w.progressNotes && w.progressNotes.length > 0 ? `<div style="margin-bottom: 10px; padding: 8px; background: var(--bg-elevated); border-left: 3px solid var(--text-faint); border-radius: 3px;"><strong>📝 Para tener en cuenta:</strong><br>${w.progressNotes.join('<br>')}</div>` : ''}
                ${w.notes ? `<div style="margin-bottom: 10px; padding: 8px; background: var(--bg-elevated); border-left: 3px solid var(--brand); border-radius: 3px;"><strong>📌 Notas de la sesión:</strong> ${w.notes}</div>` : ''}
                ${w.exercises.map(ex => `
                    <div style="margin-bottom: 10px; padding: 8px; background: var(--bg-elevated); border-radius: 3px; border-left: 2px solid var(--brand);">
                        <strong>${ex?.name || 'Sin nombre'}</strong><br>
                        ${Array.isArray(ex?.sets) && ex.sets.length > 0
                            ? renderHistorySets(ex)
                            : `<small>Reps: <strong>${ex?.reps || '-'}</strong> | Peso: <strong>${ex?.weight || '-'}</strong> | Pausa: <strong>${ex?.pause || '-'}</strong></small>`}
                        ${ex?.note ? `<br><small style="color: var(--brand); font-style: italic;">💡 ${ex.note}</small>` : ''}
                    </div>
                `).join('')}
            </div>
        </div>`;
}

// Una línea por serie: "S1: 12×50kg · RIR 2 · 90s — nota"
function renderHistorySets(ex) {
    const type = EXERCISE_TYPES[ex.type] ? ex.type : 'kg';
    const labels = setLabels(ex.sets);
    return `<small>${ex.sets.map((set, i) => {
        const extras = [formatEffort(set.effort, type), set.rest ? `${escapeHtml(set.rest)}s` : ''].filter(Boolean).join(' · ');
        const label = set.warmup ? `<span style="color:var(--warning);">Calent.</span>` : `S${labels[i]}`;
        return `${label}: <strong>${escapeHtml(formatSetValue(set, type) || '-')}</strong>`
            + (extras ? ` <span style="color:var(--text-muted);">· ${extras}</span>` : '')
            + (set.note ? ` <em style="color:var(--brand);">— ${escapeHtml(set.note)}</em>` : '');
    }).join('<br>')}</small>`;
}

function renderTabataHistoryItem(w) {
    const durationChip = formatDuration(w.duration) ? `<span class="stat-chip">⏱ ${formatDuration(w.duration)}</span>` : '';
    // Formato nuevo: varios bloques por sesión. Formato viejo (compatibilidad): un solo bloque suelto en el propio objeto.
    const blocks = Array.isArray(w.blocks) ? w.blocks : [{ name: w.name, workSec: w.workSec, restSec: w.restSec, rounds: w.rounds, roundsCompleted: w.roundsCompleted, completed: w.roundsCompleted >= w.rounds }];

    const blocksLabel = blocks.map(b => `${b.name || 'Tabata'} (${b.roundsCompleted}/${b.rounds}×${b.workSec}s/${b.restSec}s)${b.completed === false ? ' ⚠️' : ''}`).join(' + ');

    return `<div class="history-item">
            <div>
                <div style="display:flex; align-items:center; gap:6px; flex-wrap:wrap; margin-bottom:4px;">
                    <span title="Tabata" class="stat-chip tabata">🔥 Tabata${blocks.length > 1 ? ` · ${blocks.length} bloques` : ''}</span>
                    <strong>${w.date}</strong>
                    <button type="button" class="small" style="width:auto; padding:2px 6px;" onclick="event.stopPropagation(); editWorkoutDate(${w.id})" title="Editar fecha">✏️</button>
                    ${durationChip}
                </div>
                <div>${blocksLabel}</div>
            </div>
        </div>`;
}

// Todas las sesiones guardadas (sin límite), más nueva primero.
function getAllSessions() {
    let workouts = JSON.parse(localStorage.getItem('workouts') || '[]');
    if (!Array.isArray(workouts)) workouts = [];
    return workouts
        .filter(w => w && w.date && (w.type === 'tabata' || (w.exercises && Array.isArray(w.exercises))))
        .sort((a, b) => b.date.localeCompare(a.date) || (b.id || 0) - (a.id || 0));
}

// Arma las opciones de mes/año a partir de las sesiones que realmente existen.
function populateHistoryFilters(sessions) {
    const monthSel = document.getElementById('historyMonthFilter');
    const yearSel = document.getElementById('historyYearFilter');
    if (!monthSel || !yearSel) return;

    const months = [...new Set(sessions.map(w => w.date.slice(0, 7)))].sort().reverse();
    const years = [...new Set(sessions.map(w => w.date.slice(0, 4)))].sort().reverse();

    const prevMonth = monthSel.value;
    monthSel.innerHTML = months.map(m => {
        const label = new Date(m + '-01T00:00:00').toLocaleDateString('es-AR', { month: 'long', year: 'numeric' });
        return `<option value="${m}">${label}</option>`;
    }).join('');
    if (months.includes(prevMonth)) monthSel.value = prevMonth;

    const prevYear = yearSel.value;
    yearSel.innerHTML = years.map(y => `<option value="${y}">${y}</option>`).join('');
    if (years.includes(prevYear)) yearSel.value = prevYear;
}

function onHistoryViewModeChange() {
    const mode = document.getElementById('historyViewMode').value;
    document.getElementById('historyMonthFilter').style.display = mode === 'month' ? '' : 'none';
    document.getElementById('historyYearFilter').style.display = mode === 'year' ? '' : 'none';
    displayWorkoutHistory();
}

function displayWorkoutHistory() {
    const sessions = getAllSessions();
    populateHistoryFilters(sessions);

    const mode = document.getElementById('historyViewMode')?.value || 'recent';
    let visible = sessions;
    let emptyMsg = '🗒️ Todavía no guardaste ninguna sesión. Elegí una rutina arriba y cargá tu primer entreno.';

    if (mode === 'month') {
        const month = document.getElementById('historyMonthFilter')?.value;
        visible = month ? sessions.filter(w => w.date.slice(0, 7) === month) : [];
        if (sessions.length > 0) emptyMsg = 'No hay sesiones en ese mes.';
    } else if (mode === 'year') {
        const year = document.getElementById('historyYearFilter')?.value;
        visible = year ? sessions.filter(w => w.date.slice(0, 4) === year) : [];
        if (sessions.length > 0) emptyMsg = 'No hay sesiones en ese año.';
    } else {
        visible = sessions.slice(0, HISTORY_RECENT_COUNT);
    }

    // El resumen (promedios) refleja el mismo período elegido — así sirve para
    // comparar evolución entre meses/años, no solo para ver las últimas sesiones.
    renderWorkoutSummary(visible);

    const html = visible.map(renderHistoryItem).join('');
    const container = document.getElementById('workoutHistory');
    if (container) {
        container.innerHTML = html || `<p style="color:var(--text-faint);">${emptyMsg}</p>`;
    }
    generateProgressionAnalysis();
}

// Promedios del período seleccionado (duración y volumen), a simple vista arriba del historial.
function renderWorkoutSummary(sessions) {
    const el = document.getElementById('workoutSummary');
    if (!el) return;

    if (!sessions || sessions.length === 0) {
        el.innerHTML = '';
        return;
    }

    const withDuration = sessions.filter(w => w.duration != null);
    const strengthWithVolume = sessions.filter(w => w.type !== 'tabata' && (w.volume || 0) > 0);

    const avgDuration = withDuration.length > 0
        ? Math.round(withDuration.reduce((sum, w) => sum + w.duration, 0) / withDuration.length)
        : null;
    const avgVolume = strengthWithVolume.length > 0
        ? Math.round(strengthWithVolume.reduce((sum, w) => sum + w.volume, 0) / strengthWithVolume.length)
        : null;

    const chips = [`<span class="stat-chip">📅 ${sessions.length} sesión${sessions.length === 1 ? '' : 'es'}</span>`];
    if (avgDuration != null) chips.push(`<span class="stat-chip">⏱ Duración prom.: ${formatDuration(avgDuration)}</span>`);
    if (avgVolume != null) chips.push(`<span class="stat-chip">🏋️ Volumen prom.: ${avgVolume.toLocaleString('es-AR')}kg</span>`);

    el.innerHTML = `<div style="display:flex; gap:8px; flex-wrap:wrap;">${chips.join('')}</div>`;
}

function toggleSession(uid) {
    const el = document.getElementById(uid);
    if (!el) return;
    el.style.display = el.style.display === 'none' ? 'block' : 'none';
}

function editWorkoutDate(workoutId) {
    let workouts = JSON.parse(localStorage.getItem('workouts') || '[]');
    const workout = workouts.find(w => w.id === workoutId);
    if (!workout) return;

    const newDate = prompt('Editar fecha (AAAA-MM-DD):', workout.date);
    if (!newDate) return;

    if (!/^\d{4}-\d{2}-\d{2}$/.test(newDate)) {
        showToast('Formato de fecha inválido. Usá AAAA-MM-DD, por ejemplo 2026-08-11', 'error');
        return;
    }

    workout.date = newDate;
    localStorage.setItem('workouts', JSON.stringify(workouts));
    displayWorkoutHistory();
    updateSidebar();
}

