// Calculadora de discos: qué discos poner de cada lado de la barra para un peso.
// Se abre con 🧮 al tocar el campo de kg de una serie; recuerda la barra y los discos que
// tenés (preferencia "plateCalculator"). "Usar este peso" lo pasa a la serie.

let plateTargetInput = null; // campo de kg de la serie desde donde se abrió

function loadPlatePrefs() {
    const saved = db.get('plateCalculator');
    return {
        bar: BAR_OPTIONS.some(([v]) => v === saved.bar) ? saved.bar : 20,
        plates: Array.isArray(saved.plates) && saved.plates.length ? saved.plates : DEFAULT_PLATES
    };
}

function savePlatePrefs(prefs) {
    try { db.set('plateCalculator', prefs); } catch (e) {}
}

function openPlateCalculator(kgInput) {
    plateTargetInput = kgInput || null;
    const prefs = loadPlatePrefs();
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
}
