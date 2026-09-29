// Entrenar tiene dos modos: rutina (series con reps y peso) y Tabata / intervalos (bloques
// de tiempo). Antes Tabata era una pantalla aparte; ahora es una pestaña dentro de Entrenar.
// Script clásico (no módulo): comparte el ámbito global con el resto de la app.

function setTrainMode(mode) {
    const m = mode === 'tabata' ? 'tabata' : 'rutina';
    document.querySelectorAll('.train-mode').forEach(el => { el.hidden = el.dataset.mode !== m; });
    document.querySelectorAll('.mode-tab').forEach(t => {
        const on = t.dataset.trainMode === m;
        t.classList.toggle('active', on);
        t.setAttribute('aria-selected', on ? 'true' : 'false');
    });
    try { db.set('trainMode', m); } catch (e) {}
}

function currentTrainMode() {
    return document.querySelector('.mode-tab.active')?.dataset.trainMode || 'rutina';
}

function bindTrainMode() {
    document.querySelector('.mode-switch')?.addEventListener('click', e => {
        const tab = e.target.closest('[data-train-mode]');
        if (tab) setTrainMode(tab.dataset.trainMode);
    });
    // Se vuelve al modo en uso: si hay un Tabata a medio hacer, se abre ese.
    let saved = 'rutina';
    try { saved = db.get('trainMode') || 'rutina'; } catch (e) {}
    if (document.querySelector('#tabataSessionBlocks')?.children.length) saved = 'tabata';
    setTrainMode(saved);
}
