// Ajustes → Mi reformer: la marca y los resortes de tu máquina (color, carga y cuántos tiene).
// Con eso la app muestra cuánta carga es cada combinación y traduce lo que sugieren los
// ejercicios ("medio", "pesado") a los resortes de tu equipo. Solo se ve si entrenás reformer.
// Script clásico (no módulo): comparte el ámbito global con el resto de la app.

function loadReformer() {
    return normalizeReformer((db.get('appSettings') || {}).reformer);
}

function saveReformer(reformer) {
    saveAppSettings({ reformer: normalizeReformer(reformer) });
}

function springColorName(color) {
    return (SPRING_COLORS.find(([c]) => c === color) || [])[1] || '';
}

/** Resortes sugeridos para un ejercicio del catálogo, con tu reformer. */
function suggestedSpringsFor(info) {
    if (!info || !(info.load > 0)) return '';
    return suggestSprings(info.load, loadReformer());
}

function renderReformerSettings() {
    const section = document.getElementById('reformerSection');
    if (!section) return;
    section.style.display = hasDiscipline('reformer') ? '' : 'none';
    const reformer = loadReformer();
    const brand = document.getElementById('reformerBrand');
    if (brand) {
        brand.innerHTML = Object.entries(REFORMER_PRESETS).map(([k, p]) => `<option value="${k}"${k === reformer.brand ? ' selected' : ''}>${escapeHtml(p.name)}</option>`).join('');
    }
    const list = document.getElementById('reformerSprings');
    if (!list) return;
    const used = reformer.springs.map(s => s.color);
    list.innerHTML = reformer.springs.map((s, i) => `<div class="reformer-spring" data-i="${i}">
            <select data-r="color" aria-label="Color del resorte">${SPRING_COLORS.filter(([c]) => c === s.color || !used.includes(c)).map(([c, name]) => `<option value="${c}"${c === s.color ? ' selected' : ''}>${c} ${name}</option>`).join('')}</select>
            <select data-r="load" aria-label="Carga de ese color">${SPRING_LOADS.map(([v, name]) => `<option value="${v}"${v === s.load ? ' selected' : ''}>${name}</option>`).join('')}</select>
            <select data-r="count" aria-label="Cuántos resortes de ese color tiene">${[0, 1, 2, 3, 4, 5, 6].map(n => `<option value="${n}"${n === s.count ? ' selected' : ''}>×${n}</option>`).join('')}</select>
            <button type="button" class="small reformer-remove" data-r="remove" aria-label="Quitar ese color">✕</button>
        </div>`).join('');
    const add = document.getElementById('reformerAddSpring');
    if (add) add.disabled = reformer.springs.length >= SPRING_COLORS.length;
}

function initReformerSettings() {
    const section = document.getElementById('reformerSection');
    if (!section) return;
    section.addEventListener('change', e => {
        if (e.target.id === 'reformerBrand') {
            const preset = REFORMER_PRESETS[e.target.value];
            if (preset) saveReformer({ brand: e.target.value, springs: preset.springs.map(s => ({ ...s })) });
            renderReformerSettings();
            return;
        }
        const row = e.target.closest('.reformer-spring');
        const field = e.target.dataset.r;
        if (!row || !field) return;
        const reformer = loadReformer();
        const spring = reformer.springs[+row.dataset.i];
        if (!spring) return;
        spring[field] = field === 'color' ? e.target.value : Number(e.target.value);
        saveReformer({ ...reformer, brand: 'otro' });
        renderReformerSettings();
        if (typeof renderPilatesCatalog === 'function') renderPilatesCatalog();
    });
    section.addEventListener('click', e => {
        if (e.target.id === 'reformerAddSpring') {
            const reformer = loadReformer();
            const free = SPRING_COLORS.find(([c]) => !reformer.springs.some(s => s.color === c));
            if (!free) return;
            saveReformer({ ...reformer, brand: 'otro', springs: [...reformer.springs, { color: free[0], load: 50, count: 1 }] });
            renderReformerSettings();
            return;
        }
        if (e.target.dataset.r === 'remove') {
            const reformer = loadReformer();
            if (reformer.springs.length <= 1) { showToast('Tu reformer necesita al menos un resorte', 'error'); return; }
            const i = +e.target.closest('.reformer-spring').dataset.i;
            saveReformer({ ...reformer, brand: 'otro', springs: reformer.springs.filter((_, j) => j !== i) });
            renderReformerSettings();
        }
    });
    renderReformerSettings();
}
