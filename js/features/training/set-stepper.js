// Barra de ajuste rápido (+/-) bajo la serie activa.
// Script clásico (no módulo): comparte el ámbito global con el resto de la app.

// Al tocar un campo de la serie aparece debajo una barra con botones para
// subir/bajar (±2,5 / ±5 kg, ±1 rep, ±15 s...). Se va sola al terminar de editar: cuando
// el foco sale de la serie (Listo en el teclado, tocar afuera) o se marca como hecha.
let setStepperEl = null;

function showSetStepper(input) {
    const field = input.dataset.f;
    const timeUnit = field === 'time' ? (input.dataset.unit || 'mss') : null;
    const steps = timeUnit ? TIME_STEPS[timeUnit] : SET_STEPS[field];
    const row = input.closest('.set-row');
    if (!steps || !row) { hideSetStepper(); return; }
    if (setStepperEl && setStepperEl.parentNode === row && setStepperEl.dataset.field === field && setStepperEl.dataset.unit === (timeUnit || '')) return;

    hideSetStepper();
    const unit = field === 'kg' ? 'kg' : field === 'km' ? distanceUnitDef().label : (field === 'time' || field === 'rest') ? 's' : '';
    const label = s => {
        const sign = s > 0 ? '+' : '−';
        const abs = Math.abs(s);
        if (field === 'time' && abs >= 60) return `${sign}${abs / 60}m`;
        return `${sign}${abs.toLocaleString('es-AR')}${unit}`;
    };
    setStepperEl = document.createElement('div');
    setStepperEl.className = 'set-stepper';
    setStepperEl.dataset.field = field;
    setStepperEl.dataset.unit = timeUnit || '';
    setStepperEl.innerHTML = `<span class="set-stepper-label">${field === 'rest' ? 'Desc.' : field === 'time' ? 'Tiempo' : field === 'km' ? distanceUnitDef().head : SET_FIELDS[field].head}</span>`
        + steps.map(s => `<button type="button" data-step="${s}" class="${s > 0 ? 'up' : 'down'}">${label(s)}</button>`).join('')
        + (field === 'kg' ? '<span class="stepper-hint" aria-live="polite"></span><button type="button" class="stepper-tool" data-tool="plates" title="Calculadora de discos / placas" aria-label="Calculadora de discos o placas">🧮</button>' : '');
    // pointerdown sin foco: tocar un botón no cierra ni abre el teclado.
    setStepperEl.addEventListener('pointerdown', e => e.preventDefault());
    setStepperEl.addEventListener('click', e => {
        const b = e.target.closest('button[data-step]');
        if (b) stepSetField(row, field, parseFloat(b.dataset.step));
        if (e.target.closest('[data-tool="plates"]')) openPlateCalculator(row.querySelector('[data-f="kg"]'));
    });
    // Justo después de los inputs visibles, antes de la nota de la serie.
    const note = row.querySelector('.set-note');
    row.insertBefore(setStepperEl, note);
    updateStepperHint(row);
    // Terminó de editar: el foco se fue de la serie (los botones de la barra no lo mueven).
    row.addEventListener('focusout', onStepperRowFocusOut);
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
            stepperViewportHeight = vv.height;
            if (grew && setStepperEl) {
                const active = document.activeElement;
                if (active && setStepperEl.parentNode?.contains(active)) active.blur();
                hideSetStepper();
            }
        });
    }
    document.addEventListener('pointerdown', e => {
        if (setStepperEl && !setStepperEl.parentNode?.contains(e.target)) hideSetStepper();
    }, true);
}

function onStepperRowFocusOut(e) {
    const row = e.currentTarget;
    setTimeout(() => {
        if (!setStepperEl || setStepperEl.parentNode !== row) return;
        if (!row.contains(document.activeElement)) hideSetStepper();
    }, 0);
}

// En máquinas de placas (poleas), junto al peso se ve en qué placa va la clavija.
function updateStepperHint(row) {
    const hint = setStepperEl?.parentNode === row ? setStepperEl.querySelector('.stepper-hint') : null;
    if (!hint) return;
    const el = row.querySelector('[data-f="kg"]');
    const kg = parseDecimal(el?.value.trim() || el?.dataset.prev || '');
    hint.textContent = stackHintText(getBlockName(row.closest('.exercise-row')), kg);
}

function hideSetStepper() {
    if (!setStepperEl) return;
    setStepperEl.parentNode?.removeEventListener('focusout', onStepperRowFocusOut);
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

