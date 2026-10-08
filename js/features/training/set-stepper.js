// Barra de ajuste rápido (+/-) bajo la serie activa.
// Script clásico (no módulo): comparte el ámbito global con el resto de la app.

// Al tocar un campo de la serie aparece debajo una barra con botones para
// subir/bajar (±2,5 / ±5 kg, ±1 rep, ±15 s...). Se va sola al terminar de editar: cuando
// el foco sale de la serie (Listo en el teclado, tocar afuera) o se marca como hecha.
let setStepperEl = null;

// La barra ocupa lugar: al abrirse, moverse o cerrarse corre todo lo de abajo. Si eso pasa
// justo cuando el dedo toca otra serie, el toque cae en la de más abajo. Por eso se compensa
// el desplazamiento: lo que se está tocando queda exactamente donde estaba en la pantalla.
function keepInPlace(el, change) {
    const before = el && el.isConnected ? el.getBoundingClientRect().top : null;
    change();
    if (before == null || !el.isConnected) return;
    const shift = el.getBoundingClientRect().top - before;
    if (Math.abs(shift) > 1) window.scrollBy(0, shift);
}

function showSetStepper(input) {
    const field = input.dataset.f;
    if (field === 'springs') { showSpringsStepper(input); return; }
    const timeUnit = field === 'time' ? (input.dataset.unit || 'mss') : null;
    const steps = timeUnit ? TIME_STEPS[timeUnit] : field === 'kg' ? weightUnitDef().steps : SET_STEPS[field];
    const row = input.closest('.set-row');
    if (!steps || !row) { hideSetStepper(); return; }
    if (setStepperEl && setStepperEl.parentNode === row && setStepperEl.dataset.field === field && setStepperEl.dataset.unit === (timeUnit || '')) { updateStepperApply(row); return; }

    keepInPlace(input, hideSetStepper);
    const unit = field === 'kg' ? weightUnitDef().label : field === 'km' ? distanceUnitDef().label : (field === 'time' || field === 'rest') ? 's' : '';
    const label = s => {
        const sign = s > 0 ? '+' : '−';
        const abs = Math.abs(s);
        if (field === 'time' && abs >= 60) return `${sign}${abs / 60}m`;
        return `${sign}${abs.toLocaleString(appLocale())}${unit}`;
    };
    setStepperEl = document.createElement('div');
    setStepperEl.className = 'set-stepper';
    setStepperEl.dataset.field = field;
    setStepperEl.dataset.unit = timeUnit || '';
    setStepperEl.innerHTML = `<span class="set-stepper-label">${field === 'rest' ? 'Desc.' : field === 'time' ? 'Tiempo' : field === 'km' ? distanceUnitDef().head : field === 'kg' ? weightUnitDef().head : SET_FIELDS[field].head}</span>`
        + steps.map(s => `<button type="button" data-step="${s}" class="${s > 0 ? 'up' : 'down'}">${label(s)}</button>`).join('')
        + (field === 'kg' ? '<span class="stepper-hint" aria-live="polite"></span><button type="button" class="stepper-tool" data-tool="plates" title="Calculadora de discos / placas" aria-label="Calculadora de discos o placas">🧮</button>' : '');
    // pointerdown sin foco: tocar un botón no cierra ni abre el teclado.
    setStepperEl.addEventListener('pointerdown', e => e.preventDefault());
    setStepperEl.addEventListener('click', e => {
        const b = e.target.closest('button[data-step]');
        if (b) stepSetField(row, field, parseFloat(b.dataset.step));
        if (e.target.closest('[data-tool="plates"]')) openPlateCalculator(row.querySelector('[data-f="kg"]'));
    });
    // Usar el mismo valor en las series siguientes (aparece solo si alguna tiene otro).
    setStepperEl.insertAdjacentHTML('beforeend', '<button type="button" class="stepper-apply" data-apply hidden></button>');
    setStepperEl.addEventListener('click', e => { if (e.target.closest('[data-apply]')) applyToFollowingSets(row, field); });
    // Justo después de los inputs visibles, antes de la nota de la serie.
    const note = row.querySelector('.set-note');
    row.insertBefore(setStepperEl, note);
    updateStepperHint(row);
    updateStepperApply(row);
    row.addEventListener('input', onStepperRowInput);
    // Terminó de editar: el foco se fue de la serie (los botones de la barra no lo mueven).
    row.addEventListener('focusout', onStepperRowFocusOut);
    requestAnimationFrame(ensureStepperVisible);
}

// La barra entera (con "Usar … en las series") tiene que quedar a la vista: arriba del teclado
// y de lo que está fijo abajo (barra de navegación, timer), sin que el campo que se está
// editando se vaya por arriba de la barra superior.
function ensureStepperVisible() {
    if (!setStepperEl?.isConnected) return;
    const vv = window.visualViewport;
    let bottom = (vv ? vv.offsetTop + vv.height : window.innerHeight) - 8;
    document.querySelectorAll('.bottom-nav, .rest-timer-widget').forEach(el => {
        const rect = el.getBoundingClientRect();
        if (rect.height > 0 && getComputedStyle(el).display !== 'none' && getComputedStyle(el).visibility !== 'hidden' && rect.top < bottom) bottom = rect.top - 8;
    });
    const top = (document.querySelector('.topbar')?.getBoundingClientRect().bottom || 0) + 8;
    const bar = setStepperEl.getBoundingClientRect();
    const row = setStepperEl.parentNode.getBoundingClientRect();
    const overflow = bar.bottom - bottom;
    if (overflow <= 0) return;
    const shift = Math.min(overflow, Math.max(0, row.top - top));
    if (shift > 1) window.scrollBy(0, shift);
}

function showSpringsStepper(input) {
    const row = input.closest('.set-row');
    if (!row) return;
    if (setStepperEl && setStepperEl.parentNode === row && setStepperEl.dataset.field === 'springs') { updateStepperApply(row); return; }
    keepInPlace(input, hideSetStepper);
    const reformer = loadReformer();
    setStepperEl = document.createElement('div');
    setStepperEl.className = 'set-stepper springs-stepper';
    setStepperEl.dataset.field = 'springs';
    setStepperEl.dataset.unit = '';
    setStepperEl.innerHTML = '<span class="set-stepper-label">Resortes</span>'
        + reformer.springs.map(s => `<button type="button" data-spring="${s.color}" aria-label="Sumar un resorte ${escapeHtml(springColorName(s.color))}">+${s.color}</button>`).join('')
        + '<button type="button" data-spring-action="back" aria-label="Quitar el último resorte">⌫</button>'
        + '<button type="button" data-spring-action="none" title="Sin resortes">0</button>'
        + '<span class="springs-load" aria-live="polite"></span>'
        + '<button type="button" class="stepper-apply" data-apply hidden></button>';
    setStepperEl.addEventListener('pointerdown', e => e.preventDefault());
    setStepperEl.addEventListener('click', e => {
        const add = e.target.closest('[data-spring]');
        const action = e.target.closest('[data-spring-action]')?.dataset.springAction;
        if (e.target.closest('[data-apply]')) { applyToFollowingSets(row, 'springs'); return; }
        if (!add && !action) return;
        const el = row.querySelector('[data-f="springs"]');
        const current = el.value.trim() === '0' ? [] : parseSprings(el.value.trim() || el.dataset.prev);
        let next;
        if (add) next = sortSprings([...current, add.dataset.spring].join(''), reformer);
        else if (action === 'back') next = current.slice(0, -1).join('');
        else next = '0';
        el.value = next;
        el.dispatchEvent(new Event('input', { bubbles: true }));
        updateSpringsLoad(row);
    });
    const note = row.querySelector('.set-note');
    row.insertBefore(setStepperEl, note);
    updateSpringsLoad(row);
    updateStepperApply(row);
    row.addEventListener('input', onStepperRowInput);
    row.addEventListener('focusout', onStepperRowFocusOut);
    requestAnimationFrame(ensureStepperVisible);
}

/** Debajo de los colores: cuánta carga es (liviano / medio / pesado) según Mi reformer. */
function updateSpringsLoad(row) {
    const out = setStepperEl?.querySelector('.springs-load');
    if (!out) return;
    const el = row.querySelector('[data-f="springs"]');
    const value = el.value.trim() || el.dataset.prev || '';
    out.textContent = value === '0' ? 'Sin resortes' : value ? springLevelLabel(springsLoad(value, loadReformer())) : '';
}

// En Android, cerrar el teclado con "atrás" no saca el foco del campo: se detecta porque
// la ventana visible vuelve a crecer. Tocar fuera de la serie también cierra la barra.
let stepperViewportHeight = 0;

function initSetStepperAutoHide() {
    const vv = window.visualViewport;
    if (vv) {
        stepperViewportHeight = vv.height;
        vv.addEventListener('resize', () => {
            const grew = vv.height - stepperViewportHeight > 120;
            const shrank = stepperViewportHeight - vv.height > 40;
            stepperViewportHeight = vv.height;
            if (shrank && setStepperEl) setTimeout(ensureStepperVisible, 60);
            if (grew && setStepperEl) {
                const active = document.activeElement;
                if (active && setStepperEl.parentNode?.contains(active)) active.blur();
                hideSetStepper();
            }
        });
    }
    // Tocar fuera de la serie cierra la barra; deslizar para bajar la pantalla, no (así se
    // puede llegar al botón "Usar … en las series"). Al deslizar, el navegador cancela el
    // toque (pointercancel) o el dedo se mueve: en esos casos no se cierra.
    let outside = null;
    document.addEventListener('pointerdown', e => {
        outside = setStepperEl && !setStepperEl.parentNode?.contains(e.target) ? { id: e.pointerId, x: e.clientX, y: e.clientY } : null;
    }, true);
    document.addEventListener('pointercancel', () => { outside = null; }, true);
    document.addEventListener('pointerup', e => {
        const start = outside;
        outside = null;
        if (!start || !setStepperEl || e.pointerId !== start.id) return;
        if (Math.hypot(e.clientX - start.x, e.clientY - start.y) > 10) return;
        if (setStepperEl.parentNode?.contains(e.target)) return;
        keepInPlace(e.target, hideSetStepper);
    }, true);
}

function onStepperRowFocusOut(e) {
    const row = e.currentTarget;
    setTimeout(() => {
        if (!setStepperEl || setStepperEl.parentNode !== row) return;
        if (!row.contains(document.activeElement)) keepInPlace(document.activeElement && document.activeElement !== document.body ? document.activeElement : null, hideSetStepper);
    }, 0);
}

// En máquinas de placas (poleas), junto al peso se ve en qué placa va la clavija.
function updateStepperHint(row) {
    const hint = setStepperEl?.parentNode === row ? setStepperEl.querySelector('.stepper-hint') : null;
    if (!hint) return;
    const el = row.querySelector('[data-f="kg"]');
    const kg = displayToKg(parseDecimal(el?.value.trim() || el?.dataset.prev || ''));
    hint.textContent = stackHintText(getBlockName(row.closest('.exercise-row')), kg);
}

function hideSetStepper() {
    if (!setStepperEl) return;
    setStepperEl.parentNode?.removeEventListener('focusout', onStepperRowFocusOut);
    setStepperEl.parentNode?.removeEventListener('input', onStepperRowInput);
    setStepperEl.remove();
    setStepperEl = null;
}

function stepSetField(row, field, delta) {
    const el = row.querySelector(`[data-f="${field}"]`);
    if (!el) return;
    const current = el.value.trim() || el.dataset.prev || '';
    let next;
    if (field === 'time') {
        const unit = el.dataset.unit || 'mss';
        next = formatTimeForUnit(Math.max(0, (parseTimeInput(current, unit) || 0) + delta), unit);
    } else if (field === 'rest') {
        next = String(Math.max(0, (parseRestSeconds(current) ?? DEFAULT_REST_SECONDS) + delta));
    } else {
        const base = parseDecimal(current) || 0;
        const v = Math.max(0, Math.round((base + delta) * 100) / 100);
        next = field === 'reps' ? String(Math.round(v)) : String(v).replace('.', ',');
    }
    el.value = next;
    // Mismo camino que tipear: auto-guardado del borrador y arranque del reloj de sesión.
    el.dispatchEvent(new Event('input', { bubbles: true }));
}


// ---- Usar el mismo peso / reps / descanso en las series siguientes ----

function onStepperRowInput(e) {
    updateStepperApply(e.currentTarget);
}

/** Series siguientes que todavía no se hicieron (las tildadas ya quedaron registradas). */
function followingPendingRows(row) {
    const rows = [...row.closest('.exercise-row').querySelectorAll('.set-row')];
    return rows.slice(rows.indexOf(row) + 1).filter(r => !r.classList.contains('done') && !r.classList.contains('half'));
}

function stepperApplyPlan(row, field) {
    const el = row.querySelector(`[data-f="${field}"]`);
    const value = el?.value.trim();
    if (!value) return null;
    const rows = followingPendingRows(row);
    const targets = rows.filter(r => {
        const t = r.querySelector(`[data-f="${field}"]`);
        return t && (t.value.trim() || t.dataset.prev || '') !== value;
    });
    if (!targets.length) return null;
    const allRows = [...row.closest('.exercise-row').querySelectorAll('.set-row')];
    const nums = targets.map(r => allRows.indexOf(r) + 1);
    return { value, targets, nums };
}

function stepperValueLabel(field, value) {
    if (field === 'springs') return value === '0' ? 'sin resortes' : value;
    if (field === 'kg') return `${value} ${weightUnitDef().label}`;
    if (field === 'reps') return `${value} reps`;
    if (field === 'rest') return `${value} s de descanso`;
    if (field === 'km') return `${value} ${distanceUnitDef().label}`;
    return value;
}

function updateStepperApply(row) {
    const btn = setStepperEl?.parentNode === row ? setStepperEl.querySelector('[data-apply]') : null;
    if (!btn) return;
    const plan = stepperApplyPlan(row, setStepperEl.dataset.field);
    const wasHidden = btn.hidden;
    btn.hidden = !plan;
    if (!plan) return;
    if (wasHidden) requestAnimationFrame(ensureStepperVisible);
    const which = plan.nums.length === 1 ? `la serie ${plan.nums[0]}`
        : plan.nums.length === plan.nums[plan.nums.length - 1] - plan.nums[0] + 1 ? `las series ${plan.nums[0]} a ${plan.nums[plan.nums.length - 1]}`
        : `las series ${plan.nums.join(', ')}`;
    btn.textContent = `⇊ Usar ${stepperValueLabel(setStepperEl.dataset.field, plan.value)} en ${which}`;
}

function applyToFollowingSets(row, field) {
    const plan = stepperApplyPlan(row, field);
    if (!plan) return;
    const previous = plan.targets.map(r => [r, r.querySelector(`[data-f="${field}"]`).value]);
    plan.targets.forEach(r => {
        const t = r.querySelector(`[data-f="${field}"]`);
        t.value = plan.value;
        t.dispatchEvent(new Event('input', { bubbles: true }));
    });
    updateStepperApply(row);
    showUndoToast(`${stepperValueLabel(field, plan.value)} en ${plan.targets.length} ${plan.targets.length === 1 ? 'serie' : 'series'} más`, () => {
        previous.forEach(([r, v]) => {
            const t = r.querySelector(`[data-f="${field}"]`);
            if (!t) return;
            t.value = v;
            t.dispatchEvent(new Event('input', { bubbles: true }));
        });
        updateStepperApply(row);
    });
}
