// Reordenar bloques con drag & drop (mouse, touch y teclado).
// Script clásico (no módulo): comparte el ámbito global con el resto de la app.

// Pointer Events: el mismo código sirve para mouse y touch. La manija tiene
// touch-action:none (arrastrar desde ahí no scrollea), pero deslizar el dedo sobre
// el resto del bloque scrollea normal. Mientras se arrastra, los bloques se colapsan
// a su encabezado para poder mover ejercicios largos sin recorrer media pantalla.
const REORDER_START_THRESHOLD_PX = 5;

let reorderState = null;

function exerciseBlockSiblings(block, dir) {
    let el = dir < 0 ? block.previousElementSibling : block.nextElementSibling;
    while (el && !el.classList.contains('exercise-row')) el = dir < 0 ? el.previousElementSibling : el.nextElementSibling;
    return el;
}

function getExerciseOrder() {
    return [...document.querySelectorAll('#exercisesContainer .exercise-row')].map(getBlockName).join('\n');
}

// Anima al vecino desde donde estaba hasta su lugar nuevo (FLIP).
function flipFrom(el, oldTop) {
    const delta = oldTop - el.offsetTop;
    if (!delta) return;
    el.style.transition = 'none';
    el.style.transform = `translateY(${delta}px)`;
    void el.offsetHeight;
    el.style.transition = 'transform 150ms ease';
    el.style.transform = '';
}

function onReorderHandlePointerDown(e) {
    const handle = e.target.closest('.drag-handle');
    if (!handle || reorderState) return;
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    const block = handle.closest('.exercise-row');
    const container = document.getElementById('exercisesContainer');
    if (!block || !container) return;

    e.preventDefault();
    try { handle.setPointerCapture(e.pointerId); } catch (err) {}

    reorderState = {
        block, handle, container,
        pointerId: e.pointerId,
        startClientY: e.clientY,
        lastClientY: e.clientY,
        grabOffset: e.clientY - block.getBoundingClientRect().top,
        active: false,
        raf: null
    };
    handle.addEventListener('pointermove', onReorderPointerMove);
    handle.addEventListener('pointerup', onReorderPointerEnd);
    handle.addEventListener('pointercancel', onReorderPointerEnd);
}

// Recién arranca al mover unos píxeles: un toque suelto en la manija no colapsa nada.
function beginReorder(clientY) {
    const st = reorderState;
    st.active = true;
    st.orderBefore = getExerciseOrder();
    st.container.classList.add('is-reordering');
    st.block.classList.add('reordering');
    try { navigator.vibrate && navigator.vibrate(15); } catch (err) {}

    // Al colapsar, todo se corre: se scrollea para que el bloque siga bajo el dedo.
    const rect = st.block.getBoundingClientRect();
    const grab = Math.min(st.grabOffset, rect.height / 2);
    window.scrollBy(0, rect.top - (clientY - grab));

    st.startNaturalTop = st.block.offsetTop;
    st.startPointerDocY = clientY + window.scrollY;
    st.raf = requestAnimationFrame(reorderAutoScrollTick);
}

function updateReorder(clientY) {
    const st = reorderState;
    if (!st || !st.active) return;
    st.lastClientY = clientY;
    const block = st.block;
    const desiredTop = st.startNaturalTop + (clientY + window.scrollY - st.startPointerDocY);

    let prev = exerciseBlockSiblings(block, -1);
    while (prev && desiredTop < prev.offsetTop + prev.offsetHeight / 2) {
        const oldTop = prev.offsetTop;
        block.parentNode.insertBefore(block, prev);
        flipFrom(prev, oldTop);
        prev = exerciseBlockSiblings(block, -1);
    }
    let next = exerciseBlockSiblings(block, 1);
    while (next && desiredTop + block.offsetHeight > next.offsetTop + next.offsetHeight / 2) {
        const oldTop = next.offsetTop;
        block.parentNode.insertBefore(next, block);
        flipFrom(next, oldTop);
        next = exerciseBlockSiblings(block, 1);
    }

    block.style.transform = `translateY(${desiredTop - block.offsetTop}px)`;
}

function onReorderPointerMove(e) {
    const st = reorderState;
    if (!st || e.pointerId !== st.pointerId) return;
    e.preventDefault();
    if (!st.active) {
        if (Math.abs(e.clientY - st.startClientY) < REORDER_START_THRESHOLD_PX) return;
        beginReorder(e.clientY);
    }
    updateReorder(e.clientY);
}

function reorderAutoScrollTick() {
    const st = reorderState;
    if (!st || !st.active) return;
    const y = st.lastClientY;
    const vh = window.innerHeight;
    let delta = 0;
    if (y < DRAG_EDGE_SCROLL_ZONE_PX) {
        delta = -Math.ceil((DRAG_EDGE_SCROLL_ZONE_PX - y) / DRAG_EDGE_SCROLL_ZONE_PX * DRAG_EDGE_SCROLL_MAX_SPEED);
    } else if (y > vh - DRAG_EDGE_SCROLL_ZONE_PX) {
        delta = Math.ceil((y - (vh - DRAG_EDGE_SCROLL_ZONE_PX)) / DRAG_EDGE_SCROLL_ZONE_PX * DRAG_EDGE_SCROLL_MAX_SPEED);
    }
    if (delta !== 0) {
        const before = window.scrollY;
        window.scrollBy(0, delta);
        if (window.scrollY !== before) updateReorder(y);
    }
    st.raf = requestAnimationFrame(reorderAutoScrollTick);
}

function onReorderPointerEnd(e) {
    const st = reorderState;
    if (!st || e.pointerId !== st.pointerId) return;
    const { block, handle, container, active, orderBefore } = st;
    if (st.raf) cancelAnimationFrame(st.raf);
    handle.removeEventListener('pointermove', onReorderPointerMove);
    handle.removeEventListener('pointerup', onReorderPointerEnd);
    handle.removeEventListener('pointercancel', onReorderPointerEnd);
    reorderState = null;
    if (!active) return;

    container.querySelectorAll('.exercise-row').forEach(el => { el.style.transition = ''; el.style.transform = ''; });
    block.classList.remove('reordering');
    container.classList.remove('is-reordering');
    // Al expandir todo de nuevo, que el bloque soltado quede a la vista.
    block.scrollIntoView({ block: 'center' });

    if (getExerciseOrder() !== orderBefore) {
        persistExerciseOrder();
        saveWorkoutDraft();
    }
}

// Accesible con teclado: foco en la manija + flechas arriba/abajo.
function onReorderHandleKeyDown(e) {
    const handle = e.target.closest('.drag-handle');
    if (!handle || (e.key !== 'ArrowUp' && e.key !== 'ArrowDown')) return;
    e.preventDefault();
    const block = handle.closest('.exercise-row');
    if (e.key === 'ArrowUp') {
        const prev = exerciseBlockSiblings(block, -1);
        if (!prev) return;
        block.parentNode.insertBefore(block, prev);
    } else {
        const next = exerciseBlockSiblings(block, 1);
        if (!next) return;
        block.parentNode.insertBefore(next, block);
    }
    handle.focus();
    persistExerciseOrder();
    saveWorkoutDraft();
}

// El orden nuevo queda guardado en la rutina (la próxima vez aparece igual).
// Los ejercicios que no están en pantalla (archivados o quitados solo por hoy)
// conservan su lugar; los visibles se reacomodan en los lugares que ocupaban.
function persistExerciseOrder() {
    const routine = document.getElementById('routine')?.value;
    if (!routine) return;
    loadCustomRoutines();
    const list = [...(customRoutines[routine] || routines[routine] || [])];
    const domNames = [...document.querySelectorAll('#exercisesContainer .exercise-row')].map(getBlockName);
    const domSet = new Set(domNames.map(normalizeForCompare));
    const slots = list.filter(n => domSet.has(normalizeForCompare(n))).length;
    if (slots !== domNames.length) return;

    let k = 0;
    customRoutines[routine] = list.map(n => domSet.has(normalizeForCompare(n)) ? domNames[k++] : n);
    saveCustomRoutines();
}

