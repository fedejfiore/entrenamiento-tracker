// Calculadora de peso: qué discos poner de cada lado de la barra o, en una máquina de
// placas (polea), en qué placa va la clavija. Se abre con 🧮 al tocar el campo de kg de una
// serie; recuerda la barra, los discos que tenés y, por ejercicio, si es de barra o de placas
// y cómo es esa máquina (preferencia "plateCalculator"). "Usar este peso" lo pasa a la serie.

let plateTargetInput = null; // campo de kg de la serie desde donde se abrió

let plateExercise = '';       // ejercicio de esa serie (para recordar barra / placas)

function loadPlatePrefs() {
    const saved = db.get('plateCalculator');
    return {
        bar: BAR_OPTIONS.some(([v]) => v === saved.bar) ? saved.bar : 20,
        // Solo discos conocidos (lo guardado puede venir de un backup).
        plates: Array.isArray(saved.plates) && saved.plates.some(p => ALL_PLATES.includes(p)) ? saved.plates.filter(p => ALL_PLATES.includes(p)) : DEFAULT_PLATES,
        modes: saved.modes && typeof saved.modes === 'object' ? saved.modes : {},
        stacks: saved.stacks && typeof saved.stacks === 'object' ? saved.stacks : {}
    };
}

function savePlatePrefs(prefs) {
    try { db.set('plateCalculator', { ...loadPlatePrefs(), ...prefs }); } catch (e) {}
}

// ¿El ejercicio se hace en una máquina de placas? Lo elegido a mano, o por el nombre.
function plateModeFor(name) {
    const saved = loadPlatePrefs().modes[normalizeForCompare(name || '')];
    return saved === 'stack' || saved === 'bar' ? saved : (isLikelyStackMachine(name) ? 'stack' : 'bar');
}

function stackFor(name) {
    return { ...DEFAULT_STACK, ...(loadPlatePrefs().stacks[normalizeForCompare(name || '')] || {}) };
}

// Texto corto para la barra +/- de la serie: "placa 7" en las máquinas de placas.
function stackHintText(name, kg) {
    if (!name || !(kg > 0) || plateModeFor(name) !== 'stack') return '';
    const r = calculateStack(kg, stackFor(name));
    return r.pin === 0 ? 'sin placas' : `placa ${r.pin}${r.exact ? '' : ' ≈'}`;
}

function openPlateCalculator(kgInput) {
    plateTargetInput = kgInput || null;
    plateExercise = kgInput ? getBlockName(kgInput.closest('.exercise-row')) : '';
    const prefs = loadPlatePrefs();
    const mode = plateExercise ? plateModeFor(plateExercise) : 'bar';
    const stack = stackFor(plateExercise);
    document.getElementById('plateMode').value = mode;
    document.getElementById('stackEmpty').value = String(stack.empty).replace('.', ',');
    document.getElementById('stackFirst').value = String(stack.first).replace('.', ',');
    document.getElementById('stackStep').value = String(stack.step).replace('.', ',');
    document.getElementById('stackCount').value = String(stack.count);
    document.getElementById('plateForExercise').textContent = plateExercise ? `Para: ${plateExercise}` : '';
    const start = parseDecimal(kgInput?.value) || parseDecimal(kgInput?.dataset.prev) || 60;
    document.getElementById('plateTarget').value = String(start).replace('.', ',');
    document.getElementById('plateBar').innerHTML = BAR_OPTIONS
        .map(([v, label]) => `<option value="${v}"${v === prefs.bar ? ' selected' : ''}>${label}</option>`).join('');
    document.getElementById('plateChoices').innerHTML = ALL_PLATES
        .map(p => `<button type="button" class="plate-choice${prefs.plates.includes(p) ? ' on' : ''}" data-plate="${p}" aria-pressed="${prefs.plates.includes(p)}">${formatNumber(p)}</button>`).join('');
    document.getElementById('plateUse').hidden = !plateTargetInput;
    renderPlateResult();
    document.getElementById('plateModal').classList.add('open');
}

function closePlateCalculator() {
    document.getElementById('plateModal')?.classList.remove('open');
    plateTargetInput = null;
}

function currentStackInputs() {
    const num = (id, def) => { const v = parseDecimal(document.getElementById(id).value); return v >= 0 ? v : def; };
    return {
        empty: num('stackEmpty', DEFAULT_STACK.empty),
        first: num('stackFirst', DEFAULT_STACK.first),
        step: num('stackStep', DEFAULT_STACK.step) || DEFAULT_STACK.step,
        count: Math.min(60, Math.max(1, Math.round(num('stackCount', DEFAULT_STACK.count)))) || DEFAULT_STACK.count
    };
}

// Pila de placas: la clavija marcada en la placa que corresponde.
function stackVisualHtml(pin, count) {
    const shown = Math.min(count, Math.max(pin + 3, 8));
    const rows = Array.from({ length: shown }, (_, i) => {
        const n = i + 1;
        return `<span class="stack-plate${n <= pin ? ' lifted' : ''}${n === pin ? ' pinned' : ''}">${n === pin ? '📍 ' : ''}${n}</span>`;
    }).join('');
    return `<div class="stack-visual" aria-hidden="true">${rows}${shown < count ? '<span class="stack-more">…</span>' : ''}</div>`;
}

function renderStackResult(target) {
    const stack = currentStackInputs();
    if (plateExercise) {
        const prefs = loadPlatePrefs();
        savePlatePrefs({ stacks: { ...prefs.stacks, [normalizeForCompare(plateExercise)]: stack } });
    }
    const box = document.getElementById('plateResult');
    const useBtn = document.getElementById('plateUse');
    if (!target) { box.innerHTML = '<p class="plate-msg">Escribí el peso.</p>'; useBtn.disabled = true; return; }
    const r = calculateStack(target, stack);
    const w = kg => `${formatNumber(kg)} kg`;
    const warn = r.exact ? '' : `<p class="plate-warn">No hay una placa con ${w(target)} exacto. Lo más cercano: <b>placa ${r.below.pin} (${w(r.below.weight)})</b>${r.above ? ` o <b>placa ${r.above.pin} (${w(r.above.weight)})</b>` : ''}.</p>`;
    box.innerHTML = `${warn}
        <p class="plate-side-text">Clavija en la <b>${r.pin === 0 ? 'ninguna placa (solo el carro)' : 'placa ' + r.pin}</b></p>
        ${stackVisualHtml(r.pin, stack.count)}
        <p class="plate-total">≈ <b>${w(r.achieved)}</b> · sin placas ${w(stack.empty)}, 1ª placa ${w(stack.first)}, +${w(stack.step)} por placa. Son aproximados: cada máquina (y las poleas con roldanas) cambia.</p>`;
    useBtn.disabled = false;
    useBtn.dataset.weight = r.achieved;
    useBtn.textContent = `Usar ${formatNumber(r.achieved)} kg en la serie`;
}

function currentPlateInputs() {
    return {
        target: parseDecimal(document.getElementById('plateTarget').value),
        bar: parseFloat(document.getElementById('plateBar').value) || 0,
        plates: [...document.querySelectorAll('#plateChoices .plate-choice.on')].map(b => parseFloat(b.dataset.plate))
    };
}

// Un disco más ancho cuanto más pesado, para que el dibujo se lea como una barra cargada.
function plateVisualHtml(perSide) {
    const plate = p => `<span class="plate" style="height:${Math.round(34 + p * 2.2)}px">${formatNumber(p)}</span>`;
    return `<div class="plate-visual" aria-hidden="true">
            <span class="plate-side">${[...perSide].reverse().map(plate).join('')}</span>
            <span class="plate-bar"></span>
            <span class="plate-side">${perSide.map(plate).join('')}</span>
        </div>`;
}

function renderPlateResult() {
    const mode = document.getElementById('plateMode').value;
    document.getElementById('plateBarFields').hidden = mode === 'stack';
    document.getElementById('plateStackFields').hidden = mode !== 'stack';
    document.getElementById('plateTitle').textContent = mode === 'stack' ? '🧮 Máquina de placas' : '🧮 Calculadora de discos';
    if (mode === 'stack') { renderStackResult(parseDecimal(document.getElementById('plateTarget').value)); return; }
    const { target, bar, plates } = currentPlateInputs();
    savePlatePrefs({ bar, plates });
    const box = document.getElementById('plateResult');
    const useBtn = document.getElementById('plateUse');
    if (!target) { box.innerHTML = '<p class="plate-msg">Escribí el peso total.</p>'; useBtn.disabled = true; return; }
    if (!plates.length) { box.innerHTML = '<p class="plate-msg">Elegí al menos un disco.</p>'; useBtn.disabled = true; return; }

    const r = calculatePlates(target, bar, plates);
    useBtn.disabled = false;
    useBtn.dataset.weight = r.achieved;
    if (r.belowBar) {
        box.innerHTML = `<p class="plate-msg">El peso es menor que la barra (${formatNumber(bar)} kg).</p>`;
        useBtn.disabled = true;
        return;
    }
    const side = r.perSide.length ? r.perSide.map(formatNumber).join(' + ') + ' kg' : 'nada (solo la barra)';
    const warn = r.exact ? '' : `<p class="plate-warn">No se puede exacto con estos discos. Lo más cercano: <b>${formatNumber(r.below)} kg</b>${r.above ? ` o <b>${formatNumber(r.above)} kg</b>` : ''}.</p>`;
    box.innerHTML = `${warn}
        <p class="plate-side-text">De cada lado: <b>${side}</b></p>
        ${plateVisualHtml(r.perSide)}
        <p class="plate-total">Total: <b>${formatNumber(r.achieved)} kg</b> (barra ${formatNumber(bar)} + ${formatNumber(r.achieved - bar)} en discos)</p>`;
    useBtn.textContent = `Usar ${formatNumber(r.achieved)} kg en la serie`;
}

function usePlateWeight() {
    const weight = parseFloat(document.getElementById('plateUse').dataset.weight);
    if (plateTargetInput && weight) {
        plateTargetInput.value = String(weight).replace('.', ',');
        plateTargetInput.dispatchEvent(new Event('input', { bubbles: true }));
    }
    closePlateCalculator();
}

function bindPlateCalculator() {
    const modal = document.getElementById('plateModal');
    if (!modal) return;
    modal.addEventListener('click', e => {
        if (e.target === modal) { closePlateCalculator(); return; }
        const choice = e.target.closest('.plate-choice');
        if (choice) {
            choice.classList.toggle('on');
            choice.setAttribute('aria-pressed', choice.classList.contains('on'));
            renderPlateResult();
            return;
        }
        const action = e.target.closest('[data-plate-action]')?.dataset.plateAction;
        if (action === 'close') closePlateCalculator();
        if (action === 'use') usePlateWeight();
    });
    document.getElementById('plateTarget').addEventListener('input', e => {
        e.target.value = sanitizeDecimalInput(e.target.value);
        renderPlateResult();
    });
    document.getElementById('plateBar').addEventListener('change', renderPlateResult);
    document.getElementById('plateMode').addEventListener('change', e => {
        if (plateExercise) {
            const prefs = loadPlatePrefs();
            savePlatePrefs({ modes: { ...prefs.modes, [normalizeForCompare(plateExercise)]: e.target.value } });
        }
        renderPlateResult();
    });
    ['stackEmpty', 'stackFirst', 'stackStep', 'stackCount'].forEach(id => {
        document.getElementById(id).addEventListener('input', e => {
            e.target.value = id === 'stackCount' ? e.target.value.replace(/\D/g, '') : sanitizeDecimalInput(e.target.value);
            renderPlateResult();
        });
    });
}
