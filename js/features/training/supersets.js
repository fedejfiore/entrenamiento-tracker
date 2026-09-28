// Superseries (y triseries / circuitos): ejercicios que se hacen seguidos, sin descanso
// entre ellos, y se descansa recién al terminar la vuelta.
//
// Se guardan por rutina: { claveRutina: { nombreNormalizado: "A" } }. Cada grupo es una
// letra; en pantalla se marca con 🔗 A y un borde de color. Al tildar una serie de un
// ejercicio que no es el último de su superserie, en vez de arrancar el descanso la app
// lleva al siguiente ejercicio (misma serie).

function supersetMap(routine) {
    return (db.get('routineSupersets')[routine]) || {};
}

// Solo una letra A-Z: el mapa viene de los datos guardados (o de un backup).
function getSupersetLetter(routine, name) {
    const letter = supersetMap(routine)[normalizeForCompare(name || '')];
    return typeof letter === 'string' && /^[A-Z]$/.test(letter) ? letter : null;
}

// Guarda el mapa de la rutina quitando las superseries que quedaron con un solo ejercicio.
function saveSupersetMap(routine, map) {
    const count = {};
    Object.values(map).forEach(l => { count[l] = (count[l] || 0) + 1; });
    Object.keys(map).forEach(k => { if (count[map[k]] < 2) delete map[k]; });
    db.transaction(tx => {
        const all = tx.get('routineSupersets');
        if (Object.keys(map).length) all[routine] = map;
        else delete all[routine];
        tx.set('routineSupersets', all);
    });
}

/** Marca en pantalla la superserie de cada bloque (sin volver a dibujar las series). */
function refreshSupersetBadges() {
    const routine = document.getElementById('routine')?.value;
    document.querySelectorAll('#exercisesContainer .exercise-row').forEach(block => {
        const letter = getSupersetLetter(routine, getBlockName(block));
        if (letter) block.dataset.superset = letter;
        else delete block.dataset.superset;
        const chip = block.querySelector('.superset-chip');
        if (chip) {
            chip.textContent = letter ? `🔗 ${letter}` : '🔗';
            chip.classList.toggle('on', !!letter);
            chip.title = letter ? `Superserie ${letter} (tocá para cambiarla)` : 'Armar una superserie con otro ejercicio';
        }
    });
}

// ---------- Elegir con qué ejercicios va ----------

let supersetEditing = null; // { routine, name }

function openSupersetModal(block) {
    const routine = document.getElementById('routine')?.value;
    if (!routine || !block) return;
    const name = getBlockName(block);
    const map = supersetMap(routine);
    const myLetter = map[normalizeForCompare(name)] || null;
    const others = [...document.querySelectorAll('#exercisesContainer .exercise-row')]
        .map(getBlockName)
        .filter(n => normalizeForCompare(n) !== normalizeForCompare(name));
    if (others.length === 0) {
        showToast('Agregá otro ejercicio a la rutina para armar una superserie', 'error');
        return;
    }

    supersetEditing = { routine, name };
    document.getElementById('supersetTitle').textContent = `Superserie con ${name}`;
    document.getElementById('supersetList').innerHTML = others.map(n => {
        const letter = map[normalizeForCompare(n)];
        const checked = myLetter && letter === myLetter;
        const note = letter && letter !== myLetter ? ` <small>(ya está en la superserie ${escapeHtml(letter)}: se mueve a esta)</small>` : '';
        return `<label class="toggle-row"><input type="checkbox" value="${escapeHtml(n)}"${checked ? ' checked' : ''}><span>${escapeHtml(n)}${note}</span></label>`;
    }).join('');
    document.getElementById('supersetRemove').hidden = !myLetter;
    document.getElementById('supersetModal').classList.add('open');
}

function closeSupersetModal() {
    document.getElementById('supersetModal')?.classList.remove('open');
    supersetEditing = null;
}

function saveSupersetFromModal() {
    if (!supersetEditing) return;
    const { routine, name } = supersetEditing;
    const selected = [...document.querySelectorAll('#supersetList input:checked')].map(i => i.value);
    const map = supersetMap(routine);
    const key = normalizeForCompare(name);
    const previous = map[key] || null;

    if (selected.length === 0) {
        delete map[key];
    } else {
        const letter = previous
            || selected.map(n => map[normalizeForCompare(n)]).find(Boolean)
            || nextSupersetLetter(Object.values(map));
        // Los que estaban en esta superserie y ya no se eligieron, salen.
        Object.keys(map).forEach(k => { if (map[k] === letter && k !== key) delete map[k]; });
        map[key] = letter;
        selected.forEach(n => { map[normalizeForCompare(n)] = letter; });
    }
    try {
        saveSupersetMap(routine, map);
    } catch (err) {
        showToast(`❌ No se pudo guardar la superserie. ${err.message}`, 'error', 6000);
        return;
    }
    closeSupersetModal();
    refreshSupersetBadges();
    const letter = getSupersetLetter(routine, name);
    showToast(letter ? `🔗 Superserie ${letter} lista: se hacen seguidos y se descansa al final de la vuelta` : 'Superserie quitada');
}

function removeFromSuperset() {
    if (!supersetEditing) return;
    document.querySelectorAll('#supersetList input').forEach(i => { i.checked = false; });
    saveSupersetFromModal();
}

/**
 * Llamado al tildar una serie: si el ejercicio sigue en su superserie, lleva al siguiente
 * (misma serie) y devuelve true para NO arrancar el descanso todavía.
 */
function goToNextInSuperset(block, row) {
    const routine = document.getElementById('routine')?.value;
    const blocks = [...document.querySelectorAll('#exercisesContainer .exercise-row')];
    const names = blocks.map(getBlockName);
    const nextName = nextInSuperset(names, n => getSupersetLetter(routine, n), getBlockName(block));
    if (!nextName) return false;

    const nextBlock = blocks[names.indexOf(nextName)];
    const rowIndex = [...block.querySelectorAll('.set-row')].indexOf(row);
    const target = nextBlock.querySelectorAll('.set-row')[rowIndex] || nextBlock.querySelector('.set-row:not(.done)');
    if (target) {
        target.scrollIntoView({ block: 'center', behavior: 'smooth' });
        target.classList.add('superset-next');
        setTimeout(() => target.classList.remove('superset-next'), 1800);
    }
    showToast(`🔗 Seguí con ${nextName}, sin descanso`, 'success', 2200);
    return true;
}

function bindSupersetModal() {
    const modal = document.getElementById('supersetModal');
    modal?.addEventListener('click', e => {
        if (e.target === modal) closeSupersetModal();
        const action = e.target.closest('[data-superset-action]')?.dataset.supersetAction;
        if (action === 'save') saveSupersetFromModal();
        if (action === 'remove') removeFromSuperset();
        if (action === 'close') closeSupersetModal();
    });
}
