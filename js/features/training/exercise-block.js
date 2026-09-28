// Bloque de ejercicio: tabla de series, check, calentamiento, notas y tipo de medición.
// Script clásico (no módulo): comparte el ámbito global con el resto de la app.

// Solo cuenta lo que se carga en las series: escribir en "agregar ejercicio" o
// cambiar el tipo de medición no es "empezar a entrenar".
function isSessionDataEvent(e) {
    return !!e.target.closest?.('.set-row, .exercise-note');
}

const DRAG_DOTS_SVG = '<svg viewBox="0 0 12 20" aria-hidden="true"><circle cx="3" cy="4" r="1.6"/><circle cx="9" cy="4" r="1.6"/><circle cx="3" cy="10" r="1.6"/><circle cx="9" cy="10" r="1.6"/><circle cx="3" cy="16" r="1.6"/><circle cx="9" cy="16" r="1.6"/></svg>';

function buildTypeOptionsHtml(selected) {
    return Object.entries(EXERCISE_TYPES)
        .map(([key, def]) => `<option value="${key}"${key === selected ? ' selected' : ''}>${def.label}</option>`)
        .join('');
}

// Limpia un campo de serie mientras se tipea (o se pega), según su tipo.
function sanitizeSetInput(el) {
    const f = el.dataset.f;
    const unit = el.dataset.unit;
    let v = el.value;
    if (f === 'reps') v = v.replace(/\D/g, '');
    else if (f === 'rest') v = v.replace(/[^\d:]/g, '');
    else if (f === 'kg' || f === 'km') v = sanitizeDecimalInput(v);
    else if (f === 'time' && unit === 'seg') v = v.replace(/\D/g, '');
    else if (f === 'time' && unit === 'min') v = v.includes(':') ? v.replace(/[^\d:]/g, '') : sanitizeDecimalInput(v);
    else if (f === 'time') v = formatTimeDigits(v);
    if (v !== el.value) el.value = v;
}

// Una fila = una serie. Los valores de la última sesión se muestran en gris
// (placeholder) y se guardan en data-prev: al tildar una serie vacía se completan
// solos, así repetir lo de la vez pasada es un solo toque.
function buildSetRowHtml(type, label, set = {}, prev = {}, unit = 'mss') {
    const def = EXERCISE_TYPES[type] || EXERCISE_TYPES.kg;
    const scale = EFFORT_SCALES[def.effort];
    const n = set.warmup ? 'de calentamiento' : label;

    const metricInput = (field, hidden) => {
        const f = SET_FIELDS[field];
        const isTime = field === 'time';
        const tu = TIME_UNITS[unit] || TIME_UNITS.mss;
        const inputmode = isTime ? tu.inputmode : f.inputmode;
        const hint = isTime ? tu.hint : f.hint;
        const prevVal = isTime ? timeInputValue(prev.time, unit) : String(prev[field] || '');
        const value = isTime ? timeInputValue(set.time, unit) : String(set[field] || '');
        const pattern = inputmode === 'numeric' ? ' pattern="[0-9]*"' : '';
        const head = isTime ? `Tiempo en ${tu.label}` : f.head;
        return `<input type="text" inputmode="${inputmode}"${pattern} autocomplete="off" data-f="${field}"${isTime ? ` data-unit="${unit}"` : ''} data-prev="${escapeHtml(prevVal)}" placeholder="${escapeHtml(prevVal || hint)}" value="${escapeHtml(value)}" aria-label="${head}, serie ${n}"${hidden ? ' hidden' : ''}>`;
    };
    // Los campos de otros tipos quedan ocultos (no se pierden si se cambia el tipo).
    const visibleInputs = def.cols.map(f => metricInput(f, false)).join('');
    const hiddenInputs = Object.keys(SET_FIELDS).filter(f => !def.cols.includes(f)).map(f => metricInput(f, true)).join('');

    const prevRest = String(prev.rest || '');
    const effortOptions = scale.options
        .map(([v, optLabel]) => `<option value="${v}"${(set.effort || '') === v ? ' selected' : ''}>${optLabel}</option>`)
        .join('');

    return `<div class="set-row${set.done ? ' done' : ''}${set.warmup ? ' warmup' : ''}">
            <button type="button" class="set-num" data-action="toggle-warmup" aria-pressed="${set.warmup ? 'true' : 'false'}" title="Tocá para marcar/desmarcar como calentamiento" aria-label="Serie ${n}: marcar como calentamiento">${set.warmup ? WARMUP_LABEL : label}</button>
            ${visibleInputs}
            ${def.calc === 'speed' ? buildSpeedCellHtml(set, prev) : ''}
            <input type="text" inputmode="numeric" pattern="[0-9]*" autocomplete="off" data-f="rest" data-prev="${escapeHtml(prevRest)}" placeholder="${escapeHtml(prevRest || String(DEFAULT_REST_SECONDS))}" value="${escapeHtml(set.rest || '')}" aria-label="Descanso en segundos, serie ${n}"${def.rest ? '' : ' hidden'}>
            <select data-f="effort" aria-label="${scale.title}, serie ${n}">${effortOptions}</select>
            <button type="button" class="set-check" aria-pressed="${set.done ? 'true' : 'false'}" aria-label="Serie ${n} hecha" data-action="toggle-done">✓</button>
            <button type="button" class="set-note-btn${set.note ? ' has-note' : ''}" aria-label="Nota de la serie ${n}" title="Nota de la serie" data-action="toggle-set-note">📝</button>
            ${hiddenInputs}
            <input type="text" class="set-note" data-f="note" autocomplete="off" placeholder="Nota de la serie (ej: se me fue la técnica)" value="${escapeHtml(set.note || '')}"${set.note ? '' : ' hidden'}>
        </div>`;
}

// Km/h calculado de minutos + km. Si todavía no se cargó nada, se calcula con lo de
// la última vez y se ve en gris, igual que las sugerencias de los campos.
function buildSpeedCellHtml(set, prev) {
    const own = computeSpeed(parseTimeSeconds(set.time), parseDecimal(set.km));
    const speed = own || computeSpeed(parseTimeSeconds(set.time || prev.time), parseDecimal(set.km || prev.km));
    return `<span class="set-calc${own ? '' : ' is-prev'}" data-calc="speed" aria-label="Velocidad en km/h">${speed ? formatNumber(Math.round(speed * 10) / 10) : '–'}</span>`;
}

function updateSetCalc(row) {
    const cell = row?.querySelector('.set-calc');
    if (!cell) return;
    const val = f => row.querySelector(`[data-f="${f}"]`);
    const t = val('time'), k = val('km');
    const unit = t?.dataset.unit;
    const own = computeSpeed(parseTimeInput(t?.value, unit), parseDecimal(k?.value));
    const speed = own || computeSpeed(parseTimeInput(t?.value || t?.dataset.prev, unit), parseDecimal(k?.value || k?.dataset.prev));
    cell.textContent = speed ? formatNumber(Math.round(speed * 10) / 10) : '–';
    cell.classList.toggle('is-prev', !own);
}

function buildSetsTableHtml(type, sets, prevSets, unit = 'mss') {
    const def = EXERCISE_TYPES[type] || EXERCISE_TYPES.kg;
    const scale = EFFORT_SCALES[def.effort];
    const head = `<div class="sets-head">
            <span>#</span>
            ${def.cols.map(f => f === 'time'
                ? `<button type="button" class="time-unit-btn" data-action="cycle-time-unit" title="Cambiar unidad: segundos, m:ss, minutos u h:mm" aria-label="Unidad de tiempo: ${TIME_UNITS[unit].label}. Tocá para cambiarla">${TIME_UNITS[unit].head} ⇄</button>`
                : `<span>${SET_FIELDS[f].head}</span>`).join('')}
            ${def.calc === 'speed' ? '<span title="Velocidad calculada">Km/h</span>' : ''}
            ${def.rest ? '<span title="Descanso en segundos">Desc s</span>' : ''}
            <span title="${scale.title}">${scale.head}</span>
            <span>✓</span>
            <span></span>
        </div>`;
    const lastPrev = prevSets[prevSets.length - 1] || {};
    const labels = setLabels(sets);
    const rows = sets.map((set, i) => buildSetRowHtml(type, labels[i], set || {}, prevSets[i] || lastPrev, unit)).join('');
    return head + rows;
}

// Genera el bloque de un ejercicio a partir de las últimas veces que se hizo.
// Se usa tanto al armar la lista completa como al agregar un ejercicio suelto,
// así nunca hace falta reconstruir (y perder) los bloques que ya tenían datos cargados.
function buildExerciseRowHtml(idx, ex, routine) {
    const stats = exerciseStats[ex] || {};
    const type = getExerciseType(ex, routine);
    const prevSets = getPrevSets(ex, type);
    // Misma estructura que la última vez (incluidas las series de calentamiento).
    const initialSets = prevSets.length > 0
        ? prevSets.map(p => (p && p.warmup) ? { warmup: true } : {})
        : Array.from({ length: EXERCISE_TYPES[type].defaultSets }, () => ({}));
    const setCount = initialSets.length;
    const safeName = escapeHtml(ex);
    const timeUnit = getTimeUnit(ex, type);

    return `<div class="exercise-row" id="row_${idx}" data-name="${safeName}" data-type="${type}" data-time-unit="${timeUnit}">
            <div class="exercise-row-header">
                <button type="button" class="drag-handle" aria-label="Reordenar ${safeName}: mantené apretado y arrastrá, o usá las flechas ↑ ↓" title="Mantené apretado y arrastrá para reordenar">${DRAG_DOTS_SVG}</button>
                <div class="exercise-title">
                    <strong id="exname_${idx}" data-action="open-detail" data-dblaction="rename-exercise" title="Tocá para ver el progreso · doble toque para renombrar" style="cursor:pointer;">${safeName}</strong>
                    <div class="exercise-meta">
                        <select class="type-chip" aria-label="Cómo se mide ${safeName}" data-change="change-type">${buildTypeOptionsHtml(type)}</select>
                        <span class="exercise-last">${buildLastSummaryText(stats, type)}</span>
                    </div>
                    ${stats.lastNote ? `<small style="color:var(--brand); font-style:italic; display:block; margin-top:3px;">💡 ${escapeHtml(stats.lastNote)}</small>` : ''}
                </div>
                <div class="exercise-row-actions">
                    <button type="button" data-action="archive-exercise" title="Archivar (guardar para después, sin perder el historial)">📥</button>
                    <button type="button" class="danger" data-action="remove-exercise" title="Quitar de la sesión de hoy">✕</button>
                </div>
            </div>
            <div class="sets-table t-${type}">${buildSetsTableHtml(type, initialSets, prevSets, timeUnit)}</div>
            <div class="sets-controls">
                <button type="button" data-action="remove-set" aria-label="Quitar la última serie" title="Quitar la última serie"${setCount <= 1 ? ' disabled' : ''}>−</button>
                <button type="button" data-action="add-set">+ Agregar serie</button>
                <button type="button" class="rep-count-btn" data-action="count-reps" title="Cuenta la próxima serie con cadencia y voz">▶ Contar reps</button>
            </div>
            <input type="text" class="exercise-note" id="note_${idx}" autocomplete="off" placeholder="Nota del ejercicio (opcional)">
        </div>`;
}

function buildLastSummaryText(stats, type) {
    const summary = formatSetsSummary(stats.lastSets, type);
    let record = '';
    if (type === 'kg' && stats.maxWeight) record = `Máx ${stats.maxWeight}kg`;
    if (type === 'km') {
        record = [
            stats.maxTotalSec ? formatDurationHuman(stats.maxTotalSec) : '',
            stats.maxKm ? `${formatNumber(stats.maxKm)}km` : '',
            formatSpeed(stats.bestSpeed)
        ].filter(Boolean).join(' · ');
    }
    if ((type === 'time' || type === 'min') && stats.maxSetSec) record = `Máx ${formatDurationHuman(stats.maxSetSec)}`;
    if (!summary) return 'Sin registros previos';
    return `Últ: ${escapeHtml(summary)}${record ? `<br>🏆 ${escapeHtml(record)}` : ''}`;
}

function getBlockName(block) {
    return block?.querySelector('[id^="exname_"]')?.textContent.trim() || block?.dataset.name || '';
}

// Solo lo realmente escrito (los placeholders en gris no cuentan).
function readSetRow(row) {
    const set = {};
    row.querySelectorAll('[data-f]').forEach(el => {
        const v = (el.value || '').trim();
        if (!v) return;
        if (el.dataset.f === 'time') {
            // Lo tipeado depende de la unidad del campo; se guarda siempre igual.
            const sec = parseTimeInput(v, el.dataset.unit);
            if (sec != null) set.time = formatSecondsClock(sec);
            return;
        }
        set[el.dataset.f] = v;
    });
    if (row.classList.contains('done')) set.done = true;
    if (row.classList.contains('warmup')) set.warmup = true;
    return set;
}

function readBlockSets(block) {
    return [...block.querySelectorAll('.set-row')].map(readSetRow);
}

function updateSetControls(block) {
    const minus = block.querySelector('.sets-controls button');
    if (minus) minus.disabled = block.querySelectorAll('.set-row').length <= 1;
}

function renumberSets(block) {
    const rows = [...block.querySelectorAll('.set-row')];
    const labels = setLabels(rows.map(r => ({ warmup: r.classList.contains('warmup') })));
    rows.forEach((r, i) => { r.querySelector('.set-num').textContent = labels[i]; });
}

function renderBlockSets(block, type, sets) {
    const prevSets = getPrevSets(getBlockName(block), type);
    const table = block.querySelector('.sets-table');
    if (!table) return;
    const unit = getTimeUnit(getBlockName(block), type);
    block.dataset.timeUnit = unit;
    table.className = `sets-table t-${type}`;
    table.innerHTML = buildSetsTableHtml(type, sets.length > 0 ? sets : [{}], prevSets, unit);
    updateSetControls(block);
}

function applySetsToBlock(block, sets, note) {
    if (Array.isArray(sets) && sets.length > 0) renderBlockSets(block, block.dataset.type, sets);
    const noteEl = block.querySelector('.exercise-note');
    if (noteEl && note) noteEl.value = note;
}

// Serie de calentamiento / aproximación: se registra igual, pero no cuenta para
// volumen, PRs, 1RM ni récords. Se marca tocando el número de la serie.
function toggleWarmup(btn) {
    const row = btn.closest('.set-row');
    const block = btn.closest('.exercise-row');
    if (!row || !block) return;
    const on = !row.classList.contains('warmup');
    row.classList.toggle('warmup', on);
    btn.setAttribute('aria-pressed', on ? 'true' : 'false');
    renumberSets(block);
    saveWorkoutDraft();
}

function toggleSetDone(btn) {
    const row = btn.closest('.set-row');
    const block = btn.closest('.exercise-row');
    if (!row || !block) return;

    if (row.classList.contains('done')) {
        row.classList.remove('done');
        btn.setAttribute('aria-pressed', 'false');
        saveWorkoutDraft();
        return;
    }

    const type = block.dataset.type;
    // Serie sin tocar: se completa con lo de la última vez (lo que se ve en gris).
    (EXERCISE_TYPES[type] || EXERCISE_TYPES.kg).cols.forEach(f => {
        const el = row.querySelector(`[data-f="${f}"]`);
        if (el && !el.value.trim() && el.dataset.prev) el.value = el.dataset.prev;
    });

    if (!setHasMetric(readSetRow(row), type)) {
        row.classList.remove('shake');
        void row.offsetWidth; // reinicia la animación
        row.classList.add('shake');
        showToast('Cargá los valores de la serie antes de marcarla', 'error');
        row.querySelector('input:not([hidden])')?.focus();
        return;
    }

    const hasRest = !!(EXERCISE_TYPES[type] || EXERCISE_TYPES.kg).rest;
    const restEl = row.querySelector('[data-f="rest"]');
    const restSeconds = hasRest ? (parseRestSeconds(restEl?.value) ?? parseRestSeconds(restEl?.dataset.prev) ?? DEFAULT_REST_SECONDS) : 0;
    if (hasRest && restEl && !restEl.value.trim()) restEl.value = String(restSeconds);
    updateSetCalc(row);

    row.classList.add('done');
    btn.setAttribute('aria-pressed', 'true');
    if (row.querySelector('.set-stepper')) hideSetStepper();
    try { navigator.vibrate && navigator.vibrate(20); } catch (e) {}
    maybeAutoStartSessionTimer();
    saveWorkoutDraft();
    if (restSeconds > 0) runRestTimer(restSeconds);
}

function toggleSetNote(btn) {
    const input = btn.closest('.set-row')?.querySelector('.set-note');
    if (!input) return;
    // Si queda vacía, se vuelve a esconder sola al salir del campo (listener focusout).
    input.hidden = false;
    input.focus();
}

function addSet(btn) {
    const block = btn.closest('.exercise-row');
    const table = block?.querySelector('.sets-table');
    if (!table) return;
    const rows = table.querySelectorAll('.set-row');
    const n = rows.length + 1;
    const type = block.dataset.type;

    // Sugerencia para la serie nueva: esa misma serie de la última sesión o, si
    // la vez pasada hiciste menos series, lo que tiene la serie de arriba.
    const prevSets = getPrevSets(getBlockName(block), type);
    let prev = prevSets[n - 1];
    if (!prev && rows.length > 0) {
        prev = {};
        rows[rows.length - 1].querySelectorAll('input[data-f]').forEach(el => {
            if (el.dataset.f === 'note') return;
            const v = el.value.trim() || el.dataset.prev || '';
            if (!v) return;
            prev[el.dataset.f] = el.dataset.f === 'time' ? formatSecondsClock(parseTimeInput(v, el.dataset.unit)) : v;
        });
    }

    table.insertAdjacentHTML('beforeend', buildSetRowHtml(type, String(n), {}, prev || {}, block.dataset.timeUnit || getTimeUnit(getBlockName(block), type)));
    renumberSets(block);
    updateSetControls(block);
    saveWorkoutDraft();
}

function removeLastSet(btn) {
    const block = btn.closest('.exercise-row');
    const rows = block?.querySelectorAll('.set-row') || [];
    if (rows.length <= 1) return;

    const last = rows[rows.length - 1];
    const set = readSetRow(last);
    if (setHasAnyData(set)) {
        const summary = formatSetValue(set, block.dataset.type);
        const what = set.done ? 'ya está completada' : 'tiene datos cargados';
        const which = set.warmup ? 'de calentamiento' : last.querySelector('.set-num').textContent;
        if (!confirm(`La serie ${which} de ${getBlockName(block)} ${what}${summary ? ` (${summary})` : ''}.\n\nSi la quitás se pierden esos datos. ¿Quitarla igual?`)) return;
    }

    last.remove();
    updateSetControls(block);
    saveWorkoutDraft();
}

function changeExerciseType(select) {
    const block = select.closest('.exercise-row');
    const newType = select.value;
    if (!block || !EXERCISE_TYPES[newType]) return;
    const name = getBlockName(block);

    const sets = readBlockSets(block);
    saveExerciseType(name, newType);
    block.dataset.type = newType;
    renderBlockSets(block, newType, sets);

    const lastEl = block.querySelector('.exercise-last');
    if (lastEl) lastEl.innerHTML = buildLastSummaryText(exerciseStats[name] || {}, newType);

    saveWorkoutDraft();
    showToast(`"${name}" ahora se mide en: ${EXERCISE_TYPES[newType].label}. El historial anterior no cambia.`);
}

// Tocar el encabezado del tiempo pasa por segundos → m:ss → minutos → h:mm. Los
// valores ya cargados se convierten (no se pierden) y la elección queda guardada.
function cycleTimeUnit(btn) {
    const block = btn.closest('.exercise-row');
    if (!block) return;
    const name = getBlockName(block);
    const current = block.dataset.timeUnit || getTimeUnit(name, block.dataset.type);
    const next = TIME_UNIT_ORDER[(TIME_UNIT_ORDER.indexOf(current) + 1) % TIME_UNIT_ORDER.length];
    const sets = readBlockSets(block);
    saveTimeUnit(name, next);
    renderBlockSets(block, block.dataset.type, sets);
    saveWorkoutDraft();
    showToast(`⏱ ${name}: tiempo en ${TIME_UNITS[next].label}`, 'success', 1800);
}

// Texto para los avisos antes de perder datos de un bloque ("2 series completadas", etc.)
// o '' si el bloque no tiene nada cargado en esta sesión.
function describeBlockSessionData(block) {
    if (!block) return '';
    const sets = readBlockSets(block);
    const done = sets.filter(s => s.done).length;
    const withData = sets.filter(s => !s.done && setHasAnyData(s)).length;
    const parts = [];
    if (done) parts.push(`${done} serie${done === 1 ? '' : 's'} completada${done === 1 ? '' : 's'}`);
    if (withData) parts.push(`${withData} serie${withData === 1 ? '' : 's'} con datos cargados`);
    if (!parts.length && block.querySelector('.exercise-note')?.value.trim()) parts.push('una nota escrita');
    return parts.join(' y ');
}

