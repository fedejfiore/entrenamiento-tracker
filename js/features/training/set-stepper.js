// Barra de ajuste rápido (+/-) bajo la serie activa.
// Script clásico (no módulo): comparte el ámbito global con el resto de la app.

// Al tocar un campo de la serie aparece debajo una barra con botones para
// subir/bajar (±2,5 / ±5 kg, ±1 rep, ±15 s...). Queda visible aunque se cierre el
// teclado, hasta que se toque otro campo o se marque la serie como hecha.
let setStepperEl = null;

function showSetStepper(input) {
    const field = input.dataset.f;
    const timeUnit = field === 'time' ? (input.dataset.unit || 'mss') : null;
    const steps = timeUnit ? TIME_STEPS[timeUnit] : SET_STEPS[field];
    const row = input.closest('.set-row');
    if (!steps || !row) { hideSetStepper(); return; }
    if (setStepperEl && setStepperEl.parentNode === row && setStepperEl.dataset.field === field && setStepperEl.dataset.unit === (timeUnit || '')) return;

    hideSetStepper();
    const unit = field === 'kg' ? 'kg' : field === 'km' ? 'km' : (field === 'time' || field === 'rest') ? 's' : '';
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
    setStepperEl.innerHTML = `<span class="set-stepper-label">${field === 'rest' ? 'Desc.' : field === 'time' ? 'Tiempo' : SET_FIELDS[field].head}</span>`
        + steps.map(s => `<button type="button" data-step="${s}" class="${s > 0 ? 'up' : 'down'}">${label(s)}</button>`).join('')
        + (field === 'kg' ? '<button type="button" class="stepper-tool" data-tool="plates" title="Calculadora de discos" aria-label="Calculadora de discos">🧮</button>' : '');
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
}

function hideSetStepper() {
    if (setStepperEl) { setStepperEl.remove(); setStepperEl = null; }
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

