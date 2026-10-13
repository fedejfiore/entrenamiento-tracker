// Biblioteca → Ejercicios de gimnasio: tocar un músculo en la figura (frente y espalda) y ver
// sus ejercicios, filtrados por equipo y nivel, con la ficha de cada uno (cómo se hace,
// errores comunes, precauciones, alternativas y video). "Mi equipo" deja ver solo lo que se
// puede hacer en tu gimnasio o en tu casa. La ficha también se abre desde Entrenar (📖).
import { escapeHtml, normalizeForCompare } from '../core/utils.js';
import { MUSCLE_GROUPS } from '../domain/catalog.js';
import { GYM_CAUTIONS, GYM_EQUIPMENT, GYM_ERRORS, GYM_EXERCISES, GYM_LEVELS, gymExerciseInfo, gymVideoUrl } from '../domain/gym-catalog.js';
import { exercisePrefs, saveExerciseType } from '../data/exercise-prefs.js';
import { customRoutines, isRoutineVisible, loadCustomRoutines, saveCustomRoutines } from '../data/routines-store.js';
import { showToast } from '../ui/toast.js';
import { loadRoutineExercises } from './training/workout.js';
import { routineLabelOf } from './progress.js';
import { BODY_BACK, BODY_FRONT, MAPPED_GROUPS, muscleFigureSvg } from './muscle-map.js';
import { loadAppSettings, saveAppSettings } from './general-settings.js';
import { routineInActiveModule } from './disciplines.js';
import { closePilatesInfo, pilatesChip } from './pilates-library.js';
import { renderLibrary } from './library.js';

export const gymFilters = { muscle: 'all', equip: 'all', lvl: 'all', q: '', mine: true };

/** El equipo que tenés (se elige acá, en "Mi equipo"). Sin elegir, todo. */
export function loadGymEquipment() {
    const saved = loadAppSettings().gymEquipment;
    const valid = Array.isArray(saved) ? saved.filter(k => GYM_EQUIPMENT[k]) : [];
    return valid.length ? valid : Object.keys(GYM_EQUIPMENT);
}

export function toggleGymEquipment(key) {
    if (!GYM_EQUIPMENT[key]) return;
    const mine = new Set(loadGymEquipment());
    if (mine.has(key)) mine.delete(key); else mine.add(key);
    if (!mine.size) { showToast('Dejá al menos un tipo de equipo', 'error'); return; }
    saveAppSettings({ gymEquipment: [...mine] });
    renderGymCatalog();
}

export function filteredGymExercises() {
    const f = gymFilters;
    const mine = new Set(loadGymEquipment());
    const q = normalizeForCompare(f.q || '');
    return GYM_EXERCISES.filter(e => (f.muscle === 'all' || e.muscle === f.muscle || e.also.includes(f.muscle))
        && (f.equip === 'all' || e.equip === f.equip)
        && (f.lvl === 'all' || e.lvl === Number(f.lvl))
        && (!f.mine || mine.has(e.equip))
        && (!q || normalizeForCompare(`${e.name} ${e.en} ${e.aliases.join(' ')}`).includes(q)));
}

export function gymItemHtml(e) {
    const [icon, label] = GYM_EQUIPMENT[e.equip];
    const main = e.muscle === gymFilters.muscle || gymFilters.muscle === 'all';
    return `<button type="button" class="pl-item" data-gym-info="${escapeHtml(e.name)}">
            <strong translate="no">${escapeHtml(e.name)}</strong>
            <span class="pl-chips">${pilatesChip(GYM_LEVELS[e.lvl], `lvl-${e.lvl}`)}${pilatesChip(`${icon} ${label}`)}${main ? '' : pilatesChip('Secundario')}</span>
        </button>`;
}

/** Figura de frente y espalda: tocar un músculo lo elige (y tocarlo de nuevo lo suelta). */
export function gymBodyPickerHtml() {
    const selected = gymFilters.muscle;
    const mark = svg => svg.replace(/data-group="([^"]+)"/g, (all, g) => `${all} class="pick${g === selected ? ' on' : ''}" data-gym-muscle="${g}"`);
    return `<div class="gym-body">${muscleFigureSvg(mark(BODY_FRONT), 'Frente')}${muscleFigureSvg(mark(BODY_BACK), 'Espalda')}</div>`;
}

export function renderGymCatalog() {
    const box = document.getElementById('gymCatalog');
    if (!box) return;
    const f = gymFilters;
    const mine = new Set(loadGymEquipment());
    const opt = (v, label, cur) => `<option value="${v}"${String(v) === String(cur) ? ' selected' : ''}>${escapeHtml(label)}</option>`;
    const muscles = MAPPED_GROUPS.filter(m => GYM_EXERCISES.some(e => e.muscle === m));
    const list = filteredGymExercises();
    // Primero los que trabajan el músculo como principal; después, ordenados por nivel.
    const groups = f.muscle === 'all'
        ? muscles.map(m => [`${MUSCLE_GROUPS[m]?.icon || ''} ${m}`, list.filter(e => e.muscle === m)])
        : [[`${MUSCLE_GROUPS[f.muscle]?.icon || ''} ${f.muscle}`, list.filter(e => e.muscle === f.muscle)], ['También lo trabajan', list.filter(e => e.muscle !== f.muscle)]];
    const byLevel = items => [...items].sort((a, b) => a.lvl - b.lvl || a.name.localeCompare(b.name, 'es'));
    box.innerHTML = `${gymBodyPickerHtml()}
        <p class="gym-body-hint">${f.muscle === 'all' ? 'Tocá un músculo para ver sus ejercicios.' : `<button type="button" class="link-btn" data-gym-muscle="all">✕ Ver todos los músculos</button>`}</p>
        <div class="gym-equipment">
            <span class="settings-label">Mi equipo</span>
            <div class="discipline-chips">${Object.entries(GYM_EQUIPMENT).map(([k, [icon, label]]) => `<button type="button" class="discipline-chip${mine.has(k) ? ' on' : ''}" data-gym-equip-toggle="${k}" aria-pressed="${mine.has(k)}">${icon} ${escapeHtml(label)}</button>`).join('')}</div>
            <label class="toggle-row gym-mine"><input type="checkbox" data-gym-filter="mine"${f.mine ? ' checked' : ''}><span>Solo lo que puedo hacer con mi equipo</span></label>
        </div>
        <div class="pl-filters">
            <label>Músculo<select data-gym-filter="muscle">${opt('all', 'Todos', f.muscle)}${muscles.map(m => opt(m, `${MUSCLE_GROUPS[m]?.icon || ''} ${m}`, f.muscle)).join('')}</select></label>
            <label>Equipo<select data-gym-filter="equip">${opt('all', 'Todos', f.equip)}${Object.entries(GYM_EQUIPMENT).map(([k, [icon, label]]) => opt(k, `${icon} ${label}`, f.equip)).join('')}</select></label>
            <label>Nivel<select data-gym-filter="lvl">${opt('all', 'Todos', f.lvl)}${[1, 2, 3].map(n => opt(n, GYM_LEVELS[n], f.lvl)).join('')}</select></label>
            <input type="search" data-gym-filter="q" value="${escapeHtml(f.q)}" placeholder="Buscar (ej. remo, sentadilla, curl)" aria-label="Buscar ejercicio de gimnasio" autocomplete="off">
        </div>
        <p class="pl-count">${list.length === 1 ? '1 ejercicio' : `${list.length} ejercicios`}</p>
        ${groups.filter(([, items]) => items.length).map(([title, items], i) => `<details class="pl-group"${i === 0 || f.muscle !== 'all' ? ' open' : ''}><summary>${escapeHtml(title)} <small>(${items.length})</small></summary>${byLevel(items).map(gymItemHtml).join('')}</details>`).join('')
            || '<p class="lib-empty">No hay ejercicios con esos filtros. Probá sumar equipo o sacar algún filtro.</p>'}`;
}

// ---- Ficha ----
export function gymErrorPair(x) {
    return typeof x === 'string' ? GYM_ERRORS[x] : x;
}

export function openGymInfo(name) {
    const e = gymExerciseInfo(name);
    const modal = document.getElementById('pilatesInfoModal');
    if (!e || !modal) return;
    const [icon, label] = GYM_EQUIPMENT[e.equip];
    const routinesOptions = Object.keys(customRoutines).filter(k => isRoutineVisible(k) && routineInActiveModule(k))
        .map(k => `<option value="${escapeHtml(k)}">${escapeHtml(routineLabelOf(k))}</option>`).join('');
    const alts = e.alt.filter(a => gymExerciseInfo(a));
    document.getElementById('pilatesInfoBody').innerHTML = `
        <h3 translate="no">${escapeHtml(e.name)}</h3>
        <div class="pl-chips">${pilatesChip(GYM_LEVELS[e.lvl], `lvl-${e.lvl}`)}${pilatesChip(`${icon} ${label}`)}${[e.muscle, ...e.also].map((m, i) => pilatesChip(`${i ? '' : '★ '}${MUSCLE_GROUPS[m]?.icon || ''} ${m}`)).join('')}</div>
        <h4>📋 Cómo se hace</h4><ol>${e.steps.map(s => `<li>${escapeHtml(s)}</li>`).join('')}</ol>
        <h4>🛠️ Errores comunes y cómo corregirlos</h4>
        <ul class="pl-errors">${e.err.map(gymErrorPair).filter(Boolean).map(([err, fix]) => `<li><span class="pl-err">✗ ${escapeHtml(err)}</span><span class="pl-fix">✓ ${escapeHtml(fix)}</span></li>`).join('')}</ul>
        ${alts.length ? `<h4>🔁 Alternativas</h4><div class="gym-alts">${alts.map(a => `<button type="button" class="small lib-secondary" data-gym-info="${escapeHtml(a)}" translate="no">${escapeHtml(a)}</button>`).join('')}</div>` : ''}
        ${e.caution.length ? `<h4>⚠️ Precauciones</h4><ul class="pl-cautions">${e.caution.map(c => `<li>${escapeHtml(GYM_CAUTIONS[c])}</li>`).join('')}</ul>` : ''}
        <p class="pl-disclaimer">Orientativo: no reemplaza la guía de un entrenador ni la consulta con un profesional de la salud. Si algo duele, pará.</p>
        <a class="pl-video" href="${escapeHtml(gymVideoUrl(e))}" target="_blank" rel="noopener noreferrer">🎥 Ver videos de la técnica en YouTube</a>
        ${routinesOptions ? `<div class="pl-add">
            <select id="gymAddRoutine" aria-label="Rutina a la que agregar el ejercicio">${routinesOptions}</select>
            <button type="button" class="success" data-gym-add="${escapeHtml(e.name)}">➕ Agregar a la rutina</button>
        </div>` : '<p class="pl-add-hint">Creá una rutina en Entrenar para agregar ejercicios desde acá.</p>'}`;
    modal.querySelector('.modal-content')?.scrollTo?.(0, 0);
    modal.classList.add('open');
}

export function addGymExerciseToRoutine(key, name) {
    loadCustomRoutines();
    if (!customRoutines[key]) return;
    if (customRoutines[key].some(n => normalizeForCompare(n) === normalizeForCompare(name))) {
        showToast(`"${name}" ya está en esa rutina`, 'error');
        return;
    }
    customRoutines[key].push(name);
    saveCustomRoutines();
    if (!exercisePrefs.hasType(name)) saveExerciseType(name, gymExerciseInfo(name)?.type || 'kg');
    if (document.getElementById('routine')?.value === key) loadRoutineExercises();
    renderLibrary();
    showToast(`➕ "${name}" agregado a ${routineLabelOf(key)}`, 'success');
}

export function initGymLibrary() {
    const box = document.getElementById('gymCatalog');
    box?.addEventListener('change', e => {
        const key = e.target.dataset.gymFilter;
        if (!key || key === 'q') return;
        gymFilters[key] = key === 'mine' ? e.target.checked : e.target.value;
        renderGymCatalog();
    });
    box?.addEventListener('input', e => {
        if (e.target.dataset.gymFilter !== 'q') return;
        gymFilters.q = e.target.value;
        const pos = e.target.selectionStart;
        renderGymCatalog();
        const input = box.querySelector('[data-gym-filter="q"]');
        input?.focus();
        try { input?.setSelectionRange(pos, pos); } catch (err) { /* sin selección */ }
    });
    box?.addEventListener('click', e => {
        const muscle = e.target.closest('[data-gym-muscle]')?.dataset.gymMuscle;
        if (muscle) { gymFilters.muscle = muscle === gymFilters.muscle ? 'all' : muscle; renderGymCatalog(); return; }
        const equip = e.target.closest('[data-gym-equip-toggle]')?.dataset.gymEquipToggle;
        if (equip) toggleGymEquipment(equip);
    });
    document.addEventListener('click', e => {
        const info = e.target.closest('[data-gym-info]');
        if (info) { openGymInfo(info.dataset.gymInfo); return; }
        const add = e.target.closest('[data-gym-add]');
        if (add) { addGymExerciseToRoutine(document.getElementById('gymAddRoutine')?.value, add.dataset.gymAdd); closePilatesInfo(); }
    });
    renderGymCatalog();
}
