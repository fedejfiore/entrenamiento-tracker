// Deslizar una serie con el pulgar: hacia la derecha la marca como hecha (como tocar ✓) y
// hacia la izquierda la desmarca. Solo con el dedo (no con el mouse) y solo si el gesto es
// claramente horizontal: el desplazamiento vertical de la pantalla sigue igual.
// Script clásico (no módulo): comparte el ámbito global con el resto de la app.

const SET_SWIPE = { decide: 12, trigger: 64, max: 90 };

function bindSetSwipe(container) {
    let s = null;
    const reset = () => {
        if (!s) return;
        s.row.style.transform = '';
        s.row.classList.remove('swiping', 'swipe-done', 'swipe-undo');
        s = null;
    };
    container.addEventListener('pointerdown', e => {
        if (e.pointerType === 'mouse') return;
        const row = e.target.closest('.set-row');
        if (!row || e.target.closest('.drag-handle')) return;
        s = { row, id: e.pointerId, x: e.clientX, y: e.clientY, horizontal: false, dx: 0 };
    });
    container.addEventListener('pointermove', e => {
        if (!s || e.pointerId !== s.id) return;
        const dx = e.clientX - s.x;
        const dy = e.clientY - s.y;
        if (!s.horizontal) {
            if (Math.abs(dy) > SET_SWIPE.decide) { s = null; return; } // es un scroll
            if (Math.abs(dx) < SET_SWIPE.decide || Math.abs(dx) < Math.abs(dy) * 1.5) return;
            s.horizontal = true;
            s.row.classList.add('swiping');
            try { s.row.setPointerCapture(e.pointerId); } catch (err) {}
        }
        s.dx = dx;
        const shown = Math.max(-SET_SWIPE.max, Math.min(SET_SWIPE.max, dx));
        s.row.style.transform = `translateX(${shown}px)`;
        const done = s.row.classList.contains('done');
        s.row.classList.toggle('swipe-done', dx >= SET_SWIPE.trigger && !done);
        s.row.classList.toggle('swipe-undo', dx <= -SET_SWIPE.trigger && done);
    });
    const end = e => {
        if (!s || e.pointerId !== s.id) return;
        const { row, dx, horizontal } = s;
        const done = row.classList.contains('done');
        reset();
        if (!horizontal) return;
        // Que el "toque" del final del gesto no marque/desmarque otra vez.
        const swallow = ev => { ev.stopPropagation(); ev.preventDefault(); };
        container.addEventListener('click', swallow, { capture: true, once: true });
        setTimeout(() => container.removeEventListener('click', swallow, { capture: true }), 350);
        const check = row.querySelector('.set-check');
        if (!check) return;
        if ((dx >= SET_SWIPE.trigger && !done) || (dx <= -SET_SWIPE.trigger && done)) toggleSetDone(check);
    };
    container.addEventListener('pointerup', end);
    container.addEventListener('pointercancel', e => { if (s && e.pointerId === s.id) reset(); });
}
