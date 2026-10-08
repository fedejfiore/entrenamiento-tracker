// Biblioteca → Ejercicios, en el módulo Pilates: el catálogo de mat y reformer con filtros
// (clase, nivel, músculo, elemento, búsqueda) agrupado por nivel o por músculo, la ficha de
// cada ejercicio (pasos, respiración, errores y corrección, variantes, precauciones, resortes
// sugeridos, video) y "Aprender el método". La ficha también se abre desde Entrenar (📖).
// Script clásico (no módulo): comparte el ámbito global con el resto de la app.

const pilatesFilters = { kind: 'all', lvl: 'all', muscle: 'all', equip: 'all', q: '', group: 'lvl' };

const PILATES_DIR_TEXT = {
    up: 'Más resorte = más difícil',
    down: 'Menos resorte = más difícil (más control)',
    control: 'El resorte no es la meta: progresá en control y repeticiones'
};

const PILATES_LEARN = [
    ['🎯 Centro (powerhouse)', 'Todo movimiento nace del centro: abdomen profundo, suelo pélvico, multífidos (músculos chiquitos de la columna) y diafragma. No es "meter la panza": es un cinturón que sostiene la columna mientras brazos y piernas se mueven.'],
    ['🧠 Concentración', 'La atención está en cómo te movés, no en cuántas veces. Pocas repeticiones bien hechas valen más que muchas apuradas.'],
    ['🎛️ Control', 'Joseph Pilates llamó a su método "contrología". Nada se hace por impulso: subir, sostener y volver tienen la misma calidad.'],
    ['📍 Precisión', 'Cada ejercicio tiene una forma: dónde van la pelvis, las costillas y los hombros. La precisión evita lesiones y hace que trabaje el músculo correcto.'],
    ['🌬️ Respiración', 'Respiración lateral: el aire va a los costados y a la espalda sin soltar el abdomen. En general se exhala en el esfuerzo. Respirar bien también estabiliza la columna.'],
    ['🌊 Fluidez', 'Los movimientos se encadenan sin pausas bruscas, como una coreografía. La fluidez aparece cuando los otros principios ya están.'],
    ['🦴 Columna neutra e impronta', 'Neutra: la pelvis conserva su curva natural (huesos de la cadera y pubis en el mismo plano). Impronta: la zona lumbar se acerca al piso. Se usa la impronta cuando las piernas están en el aire y todavía no hay fuerza para sostener la neutra.'],
    ['🔩 Movilidad y estabilidad', 'Algunas partes tienen que moverse (columna torácica, cadera) y otras sostenerse (zona lumbar, escápulas). Muchos dolores aparecen cuando se invierte: se mueve lo que debería estabilizar.'],
    ['🛏️ Cómo funcionan los resortes', 'En el reformer los resortes a veces resisten (empujar en el footwork) y a veces asisten (sostener el carro en una plancha). Por eso menos resorte no siempre es más fácil: en los ejercicios de control, menos resorte exige más.'],
    ['💪 Por qué fortalece', 'El músculo se adapta a la tensión y al tiempo bajo tensión. En pilates se suman las dos cosas con movimientos lentos y controlados, y además se entrena la coordinación entre músculos (control motor), que mejora la postura.']
];

function pilatesKindsAvailable() {
    return ['mat', 'reformer'].filter(k => hasDiscipline(k));
}

function filteredPilatesExercises() {
    const kinds = pilatesKindsAvailable();
    const f = pilatesFilters;
    const q = normalizeForCompare(f.q || '');
    return PILATES_EXERCISES.filter(e => kinds.includes(e.kind)
        && (f.kind === 'all' || e.kind === f.kind)
        && (f.lvl === 'all' || e.lvl === +f.lvl)
        && (f.muscle === 'all' || e.muscle === f.muscle || (e.also || []).includes(f.muscle))
        && (f.equip === 'all' || e.equip === f.equip)
        && (!q || normalizeForCompare(`${e.name} ${e.en}`).includes(q)));
}

function pilatesChip(label, cls = '') {
    return `<span class="pl-chip ${cls}">${escapeHtml(label)}</span>`;
}

function pilatesItemHtml(e) {
    const springs = e.kind === 'reformer' ? suggestedSpringsFor(e) : '';
    return `<button type="button" class="pl-item" data-pilates-info="${escapeHtml(e.name)}">
            <strong translate="no">${escapeHtml(e.name)}</strong>
            <span class="pl-chips">${pilatesChip(PILATES_LEVELS[e.lvl], `lvl-${e.lvl}`)}${pilatesChip(`${MUSCLE_GROUPS[e.muscle]?.icon || ''} ${e.muscle}`)}${pilatesChip(`${PILATES_EQUIPMENT[e.equip][0]} ${PILATES_EQUIPMENT[e.equip][1]}`)}${springs ? `<span class="pl-chip pl-springs" translate="no">${springs}</span>` : ''}</span>
        </button>`;
}

function renderPilatesCatalog() {
    const box = document.getElementById('pilatesCatalog');
    if (!box) return;
    const kinds = pilatesKindsAvailable();
    if (!kinds.length) { box.innerHTML = ''; return; }
    const f = pilatesFilters;
    if (f.kind !== 'all' && !kinds.includes(f.kind)) f.kind = 'all';
    const opt = (v, label, cur) => `<option value="${v}"${String(v) === String(cur) ? ' selected' : ''}>${escapeHtml(label)}</option>`;
    const muscles = [...new Set(PILATES_EXERCISES.filter(e => kinds.includes(e.kind)).flatMap(e => [e.muscle, ...(e.also || [])]))]
        .sort((a, b) => Object.keys(MUSCLE_GROUPS).indexOf(a) - Object.keys(MUSCLE_GROUPS).indexOf(b));
    const equips = [...new Set(PILATES_EXERCISES.filter(e => kinds.includes(e.kind)).map(e => e.equip))];
    const list = filteredPilatesExercises();
    const groupKey = e => (f.group === 'muscle' ? e.muscle : e.lvl);
    const groups = [...new Set(list.map(groupKey))].sort((a, b) => (f.group === 'muscle'
        ? Object.keys(MUSCLE_GROUPS).indexOf(a) - Object.keys(MUSCLE_GROUPS).indexOf(b) : a - b));
    const groupTitle = g => (f.group === 'muscle' ? `${MUSCLE_GROUPS[g]?.icon || ''} ${g}` : `${'●'.repeat(g)}${'○'.repeat(3 - g)} ${PILATES_LEVELS[g]}`);
    box.innerHTML = `<div class="pl-filters">
            ${kinds.length > 1 ? `<label>Clase<select data-pl-filter="kind">${opt('all', 'Mat y reformer', f.kind)}${opt('mat', 'Mat', f.kind)}${opt('reformer', 'Reformer', f.kind)}</select></label>` : ''}
            <label>Nivel<select data-pl-filter="lvl">${opt('all', 'Todos', f.lvl)}${[1, 2, 3].map(n => opt(n, PILATES_LEVELS[n], f.lvl)).join('')}</select></label>
            <label>Músculo<select data-pl-filter="muscle">${opt('all', 'Todos', f.muscle)}${muscles.map(m => opt(m, m, f.muscle)).join('')}</select></label>
            ${equips.length > 1 ? `<label>Elemento<select data-pl-filter="equip">${opt('all', 'Todos', f.equip)}${equips.map(k => opt(k, `${PILATES_EQUIPMENT[k][0]} ${PILATES_EQUIPMENT[k][1]}`, f.equip)).join('')}</select></label>` : ''}
            <label>Agrupar por<select data-pl-filter="group">${opt('lvl', 'Nivel', f.group)}${opt('muscle', 'Músculo', f.group)}</select></label>
            <input type="search" data-pl-filter="q" value="${escapeHtml(f.q)}" placeholder="Buscar (ej. cien, footwork, puente)" aria-label="Buscar ejercicio de pilates" autocomplete="off">
        </div>
        <p class="pl-count">${list.length === 1 ? '1 ejercicio' : `${list.length} ejercicios`}</p>
        ${groups.map((g, i) => {
            const items = list.filter(e => groupKey(e) === g);
            return `<details class="pl-group"${i === 0 || groups.length <= 3 ? ' open' : ''}><summary>${escapeHtml(groupTitle(g))} <small>(${items.length})</small></summary>${items.map(pilatesItemHtml).join('')}</details>`;
        }).join('') || '<p class="lib-empty">No hay ejercicios con esos filtros.</p>'}`;
}

function renderPilatesLearn() {
    const box = document.getElementById('pilatesLearn');
    if (!box || box.dataset.ready) return;
    box.dataset.ready = '1';
    box.innerHTML = PILATES_LEARN.map(([t, text]) => `<details class="pl-learn"><summary>${escapeHtml(t)}</summary><p>${escapeHtml(text)}</p></details>`).join('');
}

// ---- Ficha ----
function pilatesErrorPair(x) {
    return typeof x === 'string' ? PILATES_ERRORS[x] : x;
}

function openPilatesInfo(name) {
    const e = pilatesExerciseInfo(name);
    const modal = document.getElementById('pilatesInfoModal');
    if (!e || !modal) return;
    const breath = PILATES_BREATH[e.breath] || e.breath;
    const springs = e.kind === 'reformer' ? suggestedSpringsFor(e) : '';
    const load = e.kind === 'reformer' ? springsLoad(springs, loadReformer()) : 0;
    const routinesOptions = Object.keys(customRoutines).filter(k => isRoutineVisible(k) && routineInActiveModule(k))
        .map(k => `<option value="${escapeHtml(k)}">${escapeHtml(routineLabelOf(k))}</option>`).join('');
    document.getElementById('pilatesInfoBody').innerHTML = `
        <h3 translate="no">${escapeHtml(e.name)}</h3>
        <div class="pl-chips">${pilatesChip(PILATES_LEVELS[e.lvl], `lvl-${e.lvl}`)}${pilatesChip(`${PILATES_EQUIPMENT[e.equip][0]} ${PILATES_EQUIPMENT[e.equip][1]}`)}${[e.muscle, ...(e.also || [])].map(m => pilatesChip(`${MUSCLE_GROUPS[m]?.icon || ''} ${m}`)).join('')}</div>
        <p class="pl-target">🎯 ${escapeHtml(e.reps)}</p>
        ${e.kind === 'reformer' ? `<div class="pl-springs-box">
            <div>Resortes sugeridos con tu reformer: <b translate="no">${springs || '0'}</b> · ${escapeHtml(springLevelLabel(load))}</div>
            <small>${escapeHtml(PILATES_DIR_TEXT[e.dir])}. Ajustalo a tu cuerpo: es un punto de partida.</small>
        </div>` : ''}
        <h4>🌬️ Respiración</h4><p>${escapeHtml(breath)}</p>
        <h4>📋 Cómo se hace</h4><ol>${e.steps.map(s => `<li>${escapeHtml(s)}</li>`).join('')}</ol>
        <h4>🛠️ Errores comunes y cómo corregirlos</h4>
        <ul class="pl-errors">${e.err.map(pilatesErrorPair).filter(Boolean).map(([err, fix]) => `<li><span class="pl-err">✗ ${escapeHtml(err)}</span><span class="pl-fix">✓ ${escapeHtml(fix)}</span></li>`).join('')}</ul>
        <h4>↕️ Variantes</h4>
        <p><b>Más fácil:</b> ${escapeHtml(e.easier)}<br><b>Más difícil:</b> ${escapeHtml(e.harder)}</p>
        ${e.caution.length ? `<h4>⚠️ Precauciones</h4><ul class="pl-cautions">${e.caution.map(c => `<li>${escapeHtml(PILATES_CAUTIONS[c])}</li>`).join('')}</ul>` : ''}
        <p class="pl-disclaimer">Orientativo: no reemplaza la guía de un instructor ni la consulta con un profesional de la salud. Si algo duele, pará.</p>
        <a class="pl-video" href="${escapeHtml(pilatesVideoUrl(e))}" target="_blank" rel="noopener noreferrer">🎥 Ver videos de la técnica en YouTube</a>
        ${routinesOptions ? `<div class="pl-add">
            <select id="pilatesAddRoutine" aria-label="Rutina a la que agregar el ejercicio">${routinesOptions}</select>
            <button type="button" class="success" data-pilates-add="${escapeHtml(e.name)}">➕ Agregar a la rutina</button>
        </div>` : '<p class="pl-add-hint">Creá una rutina en Entrenar para agregar ejercicios desde acá.</p>'}`;
    modal.classList.add('open');
}

function closePilatesInfo() {
    document.getElementById('pilatesInfoModal')?.classList.remove('open');
}

function addPilatesExerciseToRoutine(key, name) {
    loadCustomRoutines();
    if (!customRoutines[key]) return;
    if (customRoutines[key].some(n => normalizeForCompare(n) === normalizeForCompare(name))) {
        showToast(`"${name}" ya está en esa rutina`, 'error');
        return;
    }
    customRoutines[key].push(name);
    saveCustomRoutines();
    if (!exercisePrefs.hasType(name)) saveExerciseType(name, pilatesExerciseInfo(name)?.type || 'pilates');
    if (document.getElementById('routine')?.value === key) loadRoutineExercises();
    renderLibrary();
    showToast(`➕ "${name}" agregado a ${routineLabelOf(key)}`, 'success');
}

function initPilatesLibrary() {
    const box = document.getElementById('pilatesCatalog');
    box?.addEventListener('change', e => {
        const key = e.target.dataset.plFilter;
        if (!key || key === 'q') return;
        pilatesFilters[key] = e.target.value;
        renderPilatesCatalog();
    });
    box?.addEventListener('input', e => {
        if (e.target.dataset.plFilter !== 'q') return;
        pilatesFilters.q = e.target.value;
        const pos = e.target.selectionStart;
        renderPilatesCatalog();
        const input = box.querySelector('[data-pl-filter="q"]');
        input?.focus();
        try { input?.setSelectionRange(pos, pos); } catch (err) { /* sin selección */ }
    });
    document.addEventListener('click', e => {
        const info = e.target.closest('[data-pilates-info]');
        if (info) { openPilatesInfo(info.dataset.pilatesInfo); return; }
        const add = e.target.closest('[data-pilates-add]');
        if (add) { addPilatesExerciseToRoutine(document.getElementById('pilatesAddRoutine')?.value, add.dataset.pilatesAdd); closePilatesInfo(); }
    });
    const modal = document.getElementById('pilatesInfoModal');
    modal?.addEventListener('click', e => {
        if (e.target === modal || e.target.closest('[data-pilates-close]')) closePilatesInfo();
    });
    renderPilatesCatalog();
    renderPilatesLearn();
}

// ---- Nivel del elemento (banda, pelota, aro…) ----
function equipLevelOf(name) {
    return (db.get('exerciseEquipLevels') || {})[normalizeForCompare(name || '')] || '';
}

function saveEquipLevel(name, level) {
    const map = db.get('exerciseEquipLevels') || {};
    const key = normalizeForCompare(name || '');
    if (level) map[key] = level; else delete map[key];
    try { db.set('exerciseEquipLevels', map); } catch (e) { showToast('No se pudo guardar el elemento', 'error'); }
}

/** Chip del elemento en Entrenar, solo para ejercicios del catálogo que usan uno. */
function equipLevelChipHtml(name) {
    const info = typeof pilatesExerciseInfo === 'function' ? pilatesExerciseInfo(name) : null;
    if (!info || !EQUIPMENT_WITH_LEVEL.includes(info.equip)) return '';
    const [icon, label] = PILATES_EQUIPMENT[info.equip];
    const current = equipLevelOf(name);
    return `<select class="type-chip equip-chip" data-change="equip-level" aria-label="Nivel del elemento: ${escapeHtml(label)}" title="${escapeHtml(label)}: elegí el nivel una vez">
            <option value="">${icon} ${escapeHtml(label)}</option>
            ${EQUIPMENT_LEVELS.map(([v, l]) => `<option value="${v}"${v === current ? ' selected' : ''}>${icon} ${escapeHtml(l)}</option>`).join('')}
        </select>`;
}
