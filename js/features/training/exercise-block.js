// Bloque de ejercicio: tabla de series, check, calentamiento, notas y tipo de medición.

// Solo cuenta lo que se carga en las series: escribir en "agregar ejercicio" o
// cambiar el tipo de medición no es "empezar a entrenar".
import { escapeHtml, formatNumber, parseDecimal, sanitizeDecimalInput } from '../../core/utils.js';
import { TIME_UNITS, TIME_UNIT_ORDER, computeSpeed, formatDurationHuman, formatSecondsClock, formatTimeDigits, parseRestSeconds, parseTimeInput, parseTimeSeconds, timeInputValue } from '../../core/time.js';
import { displayStringToKg, displayStringToKm, distanceUnitDef, formatDistance, formatSpeed, formatWeight, kgStringToDisplay, kmStringToDisplay, kmToDisplay, weightUnitDef } from '../../core/units.js';
import { DEFAULT_REST_SECONDS, EFFORT_SCALES, EXERCISE_TYPES, SET_FIELDS, WARMUP_LABEL } from '../../domain/catalog.js';
import { gymExerciseInfo } from '../../domain/gym-catalog.js';
import { pilatesExerciseInfo } from '../../domain/pilates-catalog.js';
import { formatSetsSummary, setHasAnyData, setHasMetric, setLabels } from '../../domain/sets.js';
import { getExerciseType, getTimeUnit, isUnilateral, saveExerciseType, saveTimeUnit, saveUnilateral } from '../../data/exercise-prefs.js';
import { exerciseStats, getPrevSets } from '../../domain/stats.js';
import { showToast, showUndoToast } from '../../ui/toast.js';
import { playTick } from '../../audio/sound.js';
import { speakCue } from '../../audio/recordings.js';
import { runRestTimer } from '../rest-timer.js';
import { maybeAutoStartSessionTimer } from './session-clock.js';
import { saveWorkoutDraft } from './draft.js';
import { hideSetStepper } from './set-stepper.js';
import { isSessionComplete, openFinishPrompt } from './finish-prompt.js';
import { getSupersetLetter, goToNextInSuperset } from './supersets.js';
import { focusCurrentExercise, rememberManualCollapse } from './focus.js';
import { loadAppSettings } from '../general-settings.js';
import { features } from '../feature-settings.js';
import { typesForModule } from '../disciplines.js';
import { equipLevelChipHtml } from '../pilates-library.js';
import { programPrevSets, programTargetLineHtml, stallHintHtml } from '../programs.js';
import { progressionChoicesHtml } from './progression.js';

export function isSessionDataEvent(e) {
    return !!e.target.closest?.('.set-row, .exercise-note');
}

export const DRAG_DOTS_SVG = '<svg viewBox="0 0 12 20" aria-hidden="true"><circle cx="3" cy="4" r="1.6"/><circle cx="9" cy="4" r="1.6"/><circle cx="3" cy="10" r="1.6"/><circle cx="9" cy="10" r="1.6"/><circle cx="3" cy="16" r="1.6"/><circle cx="9" cy="16" r="1.6"/></svg>';

export function buildTypeOptionsHtml(selected) {
    return typesForModule(selected).map(key => [key, EXERCISE_TYPES[key]])
        .map(([key, def]) => `<option value="${key}"${key === selected ? ' selected' : ''}>${def.label}</option>`)
        .join('');
}

// Limpia un campo de serie mientras se tipea (o se pega), según su tipo.
export function sanitizeSetInput(el) {
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

/**
 * Qué columnas se ven en las series de un tipo de ejercicio, según las funciones activas
 * (Ajustes → Funciones), y la grilla que les corresponde. Lo que no se ve igual queda en la
 * fila (oculto): no se pierde lo cargado si después se activa.
 */
export function setColumnsFor(type) {
    const def = EXERCISE_TYPES[type] || EXERCISE_TYPES.kg;
    const on = id => (typeof features === 'undefined' ? true : features.isOn(id));
    const showRest = !!def.rest && on('restColumn');
    // El dominio es parte de pilates; el RIR / esfuerzo es opcional.
    const showEffort = def.effort === 'mastery' || on('effort');
    const showNote = on('notes');
    const grid = ['var(--c-num)', ...def.cols.map(() => 'minmax(0, 1fr)')];
    if (def.calc === 'speed') grid.push('var(--c-speed)');
    if (showRest) grid.push('minmax(0, 1fr)');
    if (showEffort) grid.push(def.effort === 'rir' ? 'var(--c-effort)' : 'var(--c-effort-wide)');
    grid.push('var(--c-check)');
    if (showNote) grid.push('var(--c-note)');
    return { showRest, showEffort, showNote, style: `--set-cols: ${grid.join(' ')}` };
}

// Una fila = una serie. Los valores de la última sesión se muestran en gris
// (placeholder) y se guardan en data-prev: al tildar una serie vacía se completan
// solos, así repetir lo de la vez pasada es un solo toque.
export function buildSetRowHtml(type, label, set = {}, prev = {}, unit = 'mss') {
    const def = EXERCISE_TYPES[type] || EXERCISE_TYPES.kg;
    const scale = EFFORT_SCALES[def.effort];
    const n = set.warmup ? 'de calentamiento' : label;
    const cols = setColumnsFor(type);

    const metricInput = (field, hidden) => {
        const f = SET_FIELDS[field];
        const isTime = field === 'time';
        const tu = TIME_UNITS[unit] || TIME_UNITS.mss;
        const inputmode = isTime ? tu.inputmode : f.inputmode;
        const hint = isTime ? tu.hint : f.hint;
        const shown = (s, f) => f === 'km' ? kmStringToDisplay(s[f]) : f === 'kg' ? kgStringToDisplay(s[f] || '') : String(s[f] || '');
        const prevVal = isTime ? timeInputValue(prev.time, unit) : shown(prev, field);
        const value = isTime ? timeInputValue(set.time, unit) : shown(set, field);
        const pattern = inputmode === 'numeric' ? ' pattern="[0-9]*"' : '';
        const head = isTime ? `Tiempo en ${tu.label}` : field === 'km' ? `Distancia en ${distanceUnitDef().label}` : field === 'kg' ? `Peso en ${weightUnitDef().label}` : f.head;
        // Distancia: el valor exacto en km viaja aparte, así mostrarlo redondeado en millas no lo cambia.
        const exactKm = field === 'km' && set.km ? ` data-km="${escapeHtml(String(set.km))}"`
            : field === 'kg' && set.kg ? ` data-kg="${escapeHtml(String(set.kg))}"` : '';
        if (field === 'springs') {
            return `<input type="text" class="springs-input" readonly inputmode="none" autocomplete="off" data-f="springs" data-prev="${escapeHtml(prevVal)}" placeholder="${escapeHtml(prevVal || hint)}" value="${escapeHtml(value)}" aria-label="Resortes, serie ${n}. Tocá para elegirlos"${hidden ? ' hidden' : ''}>`;
        }
        return `<input type="text" inputmode="${inputmode}"${pattern} autocomplete="off" data-f="${field}"${isTime ? ` data-unit="${unit}"` : ''}${exactKm} data-prev="${escapeHtml(prevVal)}" placeholder="${escapeHtml(prevVal || hint)}" value="${escapeHtml(value)}" aria-label="${head}, serie ${n}"${hidden ? ' hidden' : ''}>`;
    };
    // Los campos de otros tipos quedan ocultos (no se pierden si se cambia el tipo).
    const visibleInputs = def.cols.map(f => metricInput(f, false)).join('');
    const hiddenInputs = Object.keys(SET_FIELDS).filter(f => !def.cols.includes(f)).map(f => metricInput(f, true)).join('');

    const prevRest = String(prev.rest || '');
    const effortOptions = scale.options
        .map(([v, optLabel]) => `<option value="${v}"${(set.effort || '') === v ? ' selected' : ''}>${optLabel}</option>`)
        .join('');

    return `<div class="set-row${set.done ? ' done' : ''}${set.half && !set.done ? ' half' : ''}${set.warmup ? ' warmup' : ''}" style="${cols.style}">
            <button type="button" class="set-num" data-action="toggle-warmup" aria-pressed="${set.warmup ? 'true' : 'false'}" title="Tocá para marcar/desmarcar como calentamiento" aria-label="Serie ${n}: marcar como calentamiento">${set.warmup ? WARMUP_LABEL : label}</button>
            ${visibleInputs}
            ${def.calc === 'speed' ? buildSpeedCellHtml(set, prev) : ''}
            <input type="text" inputmode="numeric" pattern="[0-9]*" autocomplete="off" data-f="rest" data-prev="${escapeHtml(prevRest)}" placeholder="${escapeHtml(prevRest || String(DEFAULT_REST_SECONDS))}" value="${escapeHtml(set.rest || '')}" aria-label="Descanso en segundos, serie ${n}"${cols.showRest ? '' : ' hidden'}>
            <select data-f="effort" aria-label="${scale.title}, serie ${n}"${cols.showEffort ? '' : ' hidden'}>${effortOptions}</select>
            <button type="button" class="set-check" aria-pressed="${set.done ? 'true' : 'false'}" aria-label="Serie ${n} hecha" data-action="toggle-done">${set.half && !set.done ? '½' : '✓'}</button>
            <button type="button" class="set-note-btn${set.note ? ' has-note' : ''}" aria-label="Nota de la serie ${n}" title="Nota de la serie" data-action="toggle-set-note"${cols.showNote ? '' : ' hidden'}>📝</button>
            ${hiddenInputs}
            <input type="text" class="set-note" data-f="note" autocomplete="off" placeholder="Nota de la serie (ej: se me fue la técnica)" value="${escapeHtml(set.note || '')}"${set.note && cols.showNote ? '' : ' hidden'}>
        </div>`;
}

// Velocidad (km/h o mph) calculada del tiempo y la distancia. Si todavía no se cargó nada, se calcula con lo de
// la última vez y se ve en gris, igual que las sugerencias de los campos.
export function buildSpeedCellHtml(set, prev) {
    const own = computeSpeed(parseTimeSeconds(set.time), parseDecimal(set.km));
    const speed = own || computeSpeed(parseTimeSeconds(set.time || prev.time), parseDecimal(set.km || prev.km));
    return `<span class="set-calc${own ? '' : ' is-prev'}" data-calc="speed" aria-label="Velocidad en ${distanceUnitDef().speed}">${speed ? formatNumber(Math.round(kmToDisplay(speed) * 10) / 10) : '–'}</span>`;
}

export function updateSetCalc(row) {
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

export function buildSetsTableHtml(type, sets, prevSets, unit = 'mss') {
    const def = EXERCISE_TYPES[type] || EXERCISE_TYPES.kg;
    const scale = EFFORT_SCALES[def.effort];
    const cols = setColumnsFor(type);
    const head = `<div class="sets-head" style="${cols.style}">
            <span>#</span>
            ${def.cols.map(f => f === 'time'
                ? `<button type="button" class="time-unit-btn" data-action="cycle-time-unit" title="Cambiar unidad: segundos, m:ss, minutos u h:mm" aria-label="Unidad de tiempo: ${TIME_UNITS[unit].label}. Tocá para cambiarla">${TIME_UNITS[unit].head} ⇄</button>`
                : `<span>${f === 'km' ? distanceUnitDef().head : f === 'kg' ? weightUnitDef().head : SET_FIELDS[f].head}</span>`).join('')}
            ${def.calc === 'speed' ? `<span title="Velocidad calculada">${distanceUnitDef().speedHead}</span>` : ''}
            ${cols.showRest ? '<span title="Descanso en segundos">Desc s</span>' : ''}
            ${cols.showEffort ? `<span title="${scale.title}">${scale.head}</span>` : ''}
            <span>✓</span>
            ${cols.showNote ? '<span></span>' : ''}
        </div>`;
    const lastPrev = prevSets[prevSets.length - 1] || {};
    const labels = setLabels(sets);
    const rows = sets.map((set, i) => buildSetRowHtml(type, labels[i], set || {}, prevSets[i] || lastPrev, unit)).join('');
    return head + rows;
}

// Valores sugeridos de cada serie: lo de la última vez o, si la rutina es de un programa,
// lo que toca hoy según su progresión (js/features/programs.js).
/**
 * Lo que se ve en gris (y se completa al tildar sin tocar): siempre lo de la última vez. Solo la
 * primera vez de un ejercicio con objetivo de programa se proponen las reps del objetivo. Subir
 * peso o reps es una opción que la persona elige ("Para progresar hoy").
 */
export function getBlockPrevSets(name, type, routine = document.getElementById('routine')?.value) {
    const prev = getPrevSets(name, type);
    if (prev.some(p => p && !p.warmup)) return prev;
    return programPrevSets(routine, name, prev) || prev;
}

// Genera el bloque de un ejercicio a partir de las últimas veces que se hizo.
// Se usa tanto al armar la lista completa como al agregar un ejercicio suelto,
// así nunca hace falta reconstruir (y perder) los bloques que ya tenían datos cargados.
export function buildExerciseRowHtml(idx, ex, routine) {
    const stats = exerciseStats[ex] || {};
    const type = getExerciseType(ex, routine);
    const prevSets = getBlockPrevSets(ex, type, routine);
    // Misma estructura que la última vez (incluidas las series de calentamiento).
    const initialSets = prevSets.length > 0
        ? prevSets.map(p => (p && p.warmup) ? { warmup: true } : {})
        : Array.from({ length: EXERCISE_TYPES[type].defaultSets }, () => ({}));
    const setCount = initialSets.length;
    const safeName = escapeHtml(ex);
    const timeUnit = getTimeUnit(ex, type);
    const superset = getSupersetLetter(routine, ex);
    const unilateral = isUnilateral(ex);

    return `<div class="exercise-row" id="row_${idx}" data-name="${safeName}" data-type="${type}" data-time-unit="${timeUnit}" data-unilateral="${unilateral ? '1' : '0'}"${superset ? ` data-superset="${escapeHtml(superset)}"` : ''}>
            <div class="exercise-row-header">
                <button type="button" class="drag-handle" aria-label="Reordenar ${safeName}: mantené apretado y arrastrá, o usá las flechas ↑ ↓" title="Mantené apretado y arrastrá para reordenar">${DRAG_DOTS_SVG}</button>
                <div class="exercise-title">
                    <div class="exercise-name-line">
                        <strong id="exname_${idx}" translate="no" data-action="open-detail" data-dblaction="rename-exercise" title="Tocá para ver el progreso · doble toque para renombrar" style="cursor:pointer;">${safeName}</strong>
                        ${typeof pilatesExerciseInfo === 'function' && pilatesExerciseInfo(ex) ? `<button type="button" class="pl-info-btn" data-pilates-info="${safeName}" aria-label="Ficha de ${safeName}: técnica, respiración y errores" title="Ficha: técnica, respiración y errores">📖</button>`
                            : typeof gymExerciseInfo === 'function' && gymExerciseInfo(ex) ? `<button type="button" class="pl-info-btn" data-gym-info="${safeName}" aria-label="Ficha de ${safeName}: técnica y errores" title="Ficha: técnica, errores y video">📖</button>` : ''}
                        <button type="button" class="collapse-btn" data-action="toggle-collapse" aria-expanded="true" aria-label="Contraer ${safeName}" title="Contraer / expandir">▾</button>
                    </div>
                    <div class="exercise-done-summary" data-action="toggle-collapse" hidden></div>
                    <div class="exercise-meta">
                        <select class="type-chip" aria-label="Cómo se mide ${safeName}" data-change="change-type">${buildTypeOptionsHtml(type)}</select>
                        ${equipLevelChipHtml(ex)}
                        <button type="button" data-feature="unilateral" class="side-chip${unilateral ? ' on' : ''}" data-action="toggle-unilateral" aria-pressed="${unilateral ? 'true' : 'false'}" title="${unilateral ? 'Unilateral: cada serie se marca por lado (tocá para desactivar)' : 'Marcar como unilateral (de a un lado)'}">↔${unilateral ? ' Por lado' : ''}</button>
                <button type="button" data-feature="supersets" class="superset-chip${superset ? ' on' : ''}" data-action="superset" title="${superset ? `Superserie ${escapeHtml(superset)} (tocá para cambiarla)` : 'Armar una superserie con otro ejercicio'}">🔗${superset ? ' ' + escapeHtml(superset) : ''}</button>
                        <span class="exercise-last">${buildLastSummaryText(stats, type)}</span>
                    </div>
                    ${programTargetLineHtml(routine, ex)}
                    ${progressionChoicesHtml(routine, ex, type)}
                    ${stallHintHtml(routine, ex, type)}
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
                <button type="button" data-feature="repCounter" class="rep-count-btn" data-action="count-reps" title="Cuenta la próxima serie con cadencia y voz">▶ Contar reps</button>
            </div>
            <input type="text" data-feature="notes" class="exercise-note" id="note_${idx}" autocomplete="off" placeholder="Nota del ejercicio (opcional)">
        </div>`;
}

export function buildLastSummaryText(stats, type) {
    const summary = formatSetsSummary(stats.lastSets, type);
    let record = '';
    if (type === 'kg' && stats.maxWeight) record = `Máx ${formatWeight(stats.maxWeight)}`;
    if (type === 'km') {
        record = [
            stats.maxTotalSec ? formatDurationHuman(stats.maxTotalSec) : '',
            formatDistance(stats.maxKm),
            formatSpeed(stats.bestSpeed)
        ].filter(Boolean).join(' · ');
    }
    if ((type === 'time' || type === 'min') && stats.maxSetSec) record = `Máx ${formatDurationHuman(stats.maxSetSec)}`;
    if (!summary) return 'Sin registros previos';
    return `Últ: ${escapeHtml(summary)}${record ? `<br>🏆 ${escapeHtml(record)}` : ''}`;
}

export function getBlockName(block) {
    return block?.querySelector('[id^="exname_"]')?.textContent.trim() || block?.dataset.name || '';
}

// Solo lo realmente escrito (los placeholders en gris no cuentan).
export function readSetRow(row) {
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
        if (el.dataset.f === 'km') {
            // Si no se tocó lo que se mostró, vale el km exacto (sin el redondeo de pantalla).
            set.km = el.dataset.km && kmStringToDisplay(el.dataset.km) === v ? el.dataset.km : displayStringToKm(v);
            return;
        }
        if (el.dataset.f === 'kg') {
            // Si no se tocó lo que se mostró, vale el kg exacto (sin el redondeo de las libras).
            set.kg = el.dataset.kg && kgStringToDisplay(el.dataset.kg) === v ? el.dataset.kg : displayStringToKg(v);
            return;
        }
        set[el.dataset.f] = v;
    });
    if (row.classList.contains('done')) set.done = true;
    else if (row.classList.contains('half')) set.half = true; // unilateral: un lado hecho (solo borrador)
    if (row.classList.contains('warmup')) set.warmup = true;
    return set;
}

export function readBlockSets(block) {
    return [...block.querySelectorAll('.set-row')].map(readSetRow);
}

export function updateSetControls(block) {
    const minus = block.querySelector('.sets-controls button');
    if (minus) minus.disabled = block.querySelectorAll('.set-row').length <= 1;
}

export function renumberSets(block) {
    const rows = [...block.querySelectorAll('.set-row')];
    const labels = setLabels(rows.map(r => ({ warmup: r.classList.contains('warmup') })));
    rows.forEach((r, i) => { r.querySelector('.set-num').textContent = labels[i]; });
}

export function renderBlockSets(block, type, sets) {
    const prevSets = getBlockPrevSets(getBlockName(block), type);
    const table = block.querySelector('.sets-table');
    if (!table) return;
    const unit = getTimeUnit(getBlockName(block), type);
    block.dataset.timeUnit = unit;
    table.className = `sets-table t-${type}`;
    table.innerHTML = buildSetsTableHtml(type, sets.length > 0 ? sets : [{}], prevSets, unit);
    updateSetControls(block);
}

export function applySetsToBlock(block, sets, note) {
    if (Array.isArray(sets) && sets.length > 0) renderBlockSets(block, block.dataset.type, sets);
    const noteEl = block.querySelector('.exercise-note');
    if (noteEl && note) noteEl.value = note;
    if (isBlockComplete(block)) setBlockCollapsed(block, true);
}

// Serie de calentamiento / aproximación: se registra igual, pero no cuenta para
// volumen, PRs, 1RM ni récords. Se marca tocando el número de la serie.
export function toggleWarmup(btn) {
    if (typeof features !== 'undefined' && !features.isOn('warmup')) return;
    const row = btn.closest('.set-row');
    const block = btn.closest('.exercise-row');
    if (!row || !block) return;
    const on = !row.classList.contains('warmup');
    row.classList.toggle('warmup', on);
    btn.setAttribute('aria-pressed', on ? 'true' : 'false');
    renumberSets(block);
    saveWorkoutDraft();
    // La "C" no se explica sola: la primera vez de cada sesión se aclara qué significa.
    if (on && !warmupHintShown) {
        warmupHintShown = true;
        showToast('C = serie de calentamiento: se guarda, pero no cuenta para récords ni volumen. Tocá la C para volver a serie normal.', 'success', 4500);
    }
}

export let warmupHintShown = false;

export function toggleSetDone(btn) {
    const row = btn.closest('.set-row');
    const block = btn.closest('.exercise-row');
    if (!row || !block) return;

    if (row.classList.contains('done')) {
        row.classList.remove('done', 'half');
        btn.setAttribute('aria-pressed', 'false');
        btn.textContent = '✓';
        setBlockCollapsed(block, false);
        saveWorkoutDraft();
        return;
    }
    const unilateral = block.dataset.unilateral === '1';
    const secondSide = unilateral && row.classList.contains('half');

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

    // Unilateral, primer lado: queda a medias (½) y solo hay unos segundos para acomodarse.
    if (unilateral && !secondSide) {
        row.classList.add('half');
        btn.textContent = '½';
        try { navigator.vibrate && navigator.vibrate(20); } catch (e) {}
        maybeAutoStartSessionTimer();
        saveWorkoutDraft();
        runSideSwitch(loadAppSettings().sideSwitchSeconds);
        return;
    }
    cancelSideSwitch();

    const hasRest = !!(EXERCISE_TYPES[type] || EXERCISE_TYPES.kg).rest;
    const restEl = row.querySelector('[data-f="rest"]');
    const restSeconds = hasRest ? (parseRestSeconds(restEl?.value) ?? parseRestSeconds(restEl?.dataset.prev) ?? DEFAULT_REST_SECONDS) : 0;
    if (hasRest && restEl && !restEl.value.trim()) restEl.value = String(restSeconds);
    updateSetCalc(row);

    row.classList.remove('half');
    row.classList.add('done');
    btn.textContent = '✓';
    btn.setAttribute('aria-pressed', 'true');
    if (row.querySelector('.set-stepper')) hideSetStepper();
    try { navigator.vibrate && navigator.vibrate(20); } catch (e) {}
    maybeAutoStartSessionTimer();
    saveWorkoutDraft();
    // Todas las series hechas: el bloque se contrae solo (se vuelve a abrir con ▸).
    // Y se abre el que sigue (ver focus.js).
    if (isBlockComplete(block)) setTimeout(() => { if (isBlockComplete(block)) { setBlockCollapsed(block, true); focusCurrentExercise({ scroll: !isSessionComplete() }); } }, 700);
    // Era la última serie de la sesión: en vez del descanso, se pregunta si guardar.
    if (isSessionComplete()) { setTimeout(() => { if (isSessionComplete()) openFinishPrompt(); }, 400); return; }
    if (goToNextInSuperset(block, row)) return; // superserie: el descanso va al final de la vuelta
    if (restSeconds > 0) runRestTimer(restSeconds);
}

// ---- Unilaterales: pausa corta para cambiar de lado (no es descanso) ----
export let sideSwitchTimer = null;

export let sideSwitchToast = null;

export function runSideSwitch(seconds) {
    cancelSideSwitch();
    speakCue(['repSwitch'], 'Cambiá de lado');
    if (!seconds) return;
    sideSwitchToast = showToast(`↔ Cambiá de lado · ${seconds} s`, 'success', seconds * 1000);
    sideSwitchTimer = setTimeout(() => {
        sideSwitchTimer = null;
        playTick(1200, 0.08);
        speakCue(['repGo'], '¡Ya!');
    }, seconds * 1000);
}

export function cancelSideSwitch() {
    if (sideSwitchTimer) { clearTimeout(sideSwitchTimer); sideSwitchTimer = null; }
    sideSwitchToast?.remove();
    sideSwitchToast = null;
}

export function toggleUnilateral(btn) {
    const block = btn.closest('.exercise-row');
    if (!block) return;
    const name = getBlockName(block);
    const on = block.dataset.unilateral !== '1';
    saveUnilateral(name, on);
    block.dataset.unilateral = on ? '1' : '0';
    btn.classList.toggle('on', on);
    btn.setAttribute('aria-pressed', on ? 'true' : 'false');
    btn.textContent = on ? '↔ Por lado' : '↔';
    btn.title = on ? 'Unilateral: cada serie se marca por lado (tocá para desactivar)' : 'Marcar como unilateral (de a un lado)';
    if (!on) {
        // Las series que habían quedado a medias vuelven a estar sin hacer.
        block.querySelectorAll('.set-row.half').forEach(r => {
            r.classList.remove('half');
            const check = r.querySelector('.set-check');
            if (check) check.textContent = '✓';
        });
    }
    saveWorkoutDraft();
    showToast(on ? `↔ ${name}: cada serie se marca de un lado y del otro, sin descanso en el medio` : `${name}: ya no es unilateral`, 'success', 2600);
}

// ---- Contraer un bloque terminado ----
export function isBlockComplete(block) {
    const rows = [...block.querySelectorAll('.set-row')];
    return rows.length > 0 && rows.every(r => r.classList.contains('done'));
}

export function setBlockCollapsed(block, collapsed) {
    if (!block) return;
    block.classList.toggle('collapsed', collapsed);
    const btn = block.querySelector('.collapse-btn');
    if (btn) {
        btn.setAttribute('aria-expanded', collapsed ? 'false' : 'true');
        btn.textContent = collapsed ? '▸' : '▾';
        btn.setAttribute('aria-label', `${collapsed ? 'Expandir' : 'Contraer'} ${getBlockName(block)}`);
    }
    const summary = block.querySelector('.exercise-done-summary');
    if (summary) {
        const rows = [...block.querySelectorAll('.set-row')];
        const done = rows.filter(r => r.classList.contains('done')).length;
        const text = formatSetsSummary(readBlockSets(block).filter(s => s.done && !s.warmup), block.dataset.type);
        summary.textContent = done === 0
            ? (rows.length === 1 ? '1 serie por hacer' : `${rows.length} series por hacer`)
            : `${done === rows.length ? '✓ ' : ''}${done} de ${rows.length} series${text ? ' · ' + text : ''}`;
        summary.classList.toggle('pending', done < rows.length);
        summary.hidden = !collapsed;
    }
    if (collapsed && block.contains(document.activeElement)) document.activeElement.blur();
}

export function toggleBlockCollapsed(btn) {
    const block = btn.closest('.exercise-row');
    if (!block) return;
    const collapsed = !block.classList.contains('collapsed');
    setBlockCollapsed(block, collapsed);
    rememberManualCollapse(block, collapsed);
}

export function toggleSetNote(btn) {
    const input = btn.closest('.set-row')?.querySelector('.set-note');
    if (!input) return;
    // Si queda vacía, se vuelve a esconder sola al salir del campo (listener focusout).
    input.hidden = false;
    input.focus();
}

export function addSet(btn) {
    const block = btn.closest('.exercise-row');
    const table = block?.querySelector('.sets-table');
    if (!table) return;
    const rows = table.querySelectorAll('.set-row');
    const n = rows.length + 1;
    const type = block.dataset.type;

    // Sugerencia para la serie nueva: esa misma serie de la última sesión o, si
    // la vez pasada hiciste menos series, lo que tiene la serie de arriba.
    const prevSets = getBlockPrevSets(getBlockName(block), type);
    let prev = prevSets[n - 1];
    if (!prev && rows.length > 0) {
        prev = {};
        rows[rows.length - 1].querySelectorAll('input[data-f]').forEach(el => {
            if (el.dataset.f === 'note') return;
            const v = el.value.trim() || el.dataset.prev || '';
            if (!v) return;
            prev[el.dataset.f] = el.dataset.f === 'time' ? formatSecondsClock(parseTimeInput(v, el.dataset.unit))
                : el.dataset.f === 'km' ? displayStringToKm(v) : el.dataset.f === 'kg' ? displayStringToKg(v) : v;
        });
    }

    table.insertAdjacentHTML('beforeend', buildSetRowHtml(type, String(n), {}, prev || {}, block.dataset.timeUnit || getTimeUnit(getBlockName(block), type)));
    renumberSets(block);
    updateSetControls(block);
    saveWorkoutDraft();
}

export function removeLastSet(btn) {
    const block = btn.closest('.exercise-row');
    const rows = block?.querySelectorAll('.set-row') || [];
    if (rows.length <= 1) return;

    const last = rows[rows.length - 1];
    const hadData = setHasAnyData(readSetRow(last));
    const parent = last.parentNode;
    const next = last.nextSibling;
    last.remove();
    updateSetControls(block);
    saveWorkoutDraft();
    // Sin "¿Seguro?": si tenía datos, se puede volver atrás unos segundos (vuelve tal cual).
    if (hadData) {
        showUndoToast(`Serie quitada de ${getBlockName(block)}`, () => {
            parent.insertBefore(last, next && next.parentNode === parent ? next : null);
            updateSetControls(block);
            saveWorkoutDraft();
        });
    }
}

export function changeExerciseType(select) {
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
export function cycleTimeUnit(btn) {
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
export function describeBlockSessionData(block) {
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

