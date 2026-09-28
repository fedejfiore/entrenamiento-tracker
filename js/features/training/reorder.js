// Reordenar bloques de ejercicio con drag & drop (touch, mouse y teclado).
//
// Cómo se usa: mantener apretados los puntos ⠿ hasta que se llenan de color (y vibra),
// y recién ahí arrastrar. El "mantener" evita mover un bloque sin querer al tocar.
// Mientras se arrastra, los bloques se achican a su encabezado para moverlos cómodo.
//
// Robustez (antes el gesto podía quedar "trabado" y las series escondidas):
// - El fin del gesto se escucha en toda la ventana, no solo en la manija: en el celular
//   el "soltar" puede llegar a otro elemento, sobre todo porque al mover el bloque en la
//   página el navegador pierde el seguimiento del dedo sobre la manija.
// - Cualquier final (soltar, cancelar, salir de la app, volver a cargar la rutina) pasa
//   por finish(), que SIEMPRE devuelve la vista a la normalidad.

const REORDER_HOLD_MS = { touch: 700, mouse: 300 };
const REORDER_HOLD_TOLERANCE_PX = 10; // moverse más que esto durante el "mantener" lo cancela

class ReorderController {
    constructor(containerId) {
        this.containerId = containerId;
        this.state = null;
        this.onMove = this.onMove.bind(this);
        this.onEnd = this.onEnd.bind(this);
        this.onHidden = this.onHidden.bind(this);
    }

    get container() { return document.getElementById(this.containerId); }

    onPointerDown(e) {
        const handle = e.target.closest?.('.drag-handle');
        if (!handle) return;
        if (e.pointerType === 'mouse' && e.button !== 0) return;
        const block = handle.closest('.exercise-row');
        if (!block) return;

        // Un gesto anterior que quedó sin terminar no puede bloquear este.
        if (this.state) this.finish();

        e.preventDefault();
        const holdMs = e.pointerType === 'mouse' ? REORDER_HOLD_MS.mouse : REORDER_HOLD_MS.touch;
        this.state = {
            block, handle,
            pointerId: e.pointerId,
            startX: e.clientX,
            startY: e.clientY,
            lastClientY: e.clientY,
            grabOffset: e.clientY - block.getBoundingClientRect().top,
            active: false,
            raf: null,
            holdTimer: setTimeout(() => this.arm(), holdMs)
        };
        handle.style.setProperty('--hold-ms', `${holdMs}ms`);
        handle.classList.add('drag-holding');

        window.addEventListener('pointermove', this.onMove, { passive: false });
        window.addEventListener('pointerup', this.onEnd);
        window.addEventListener('pointercancel', this.onEnd);
        window.addEventListener('blur', this.onHidden);
        document.addEventListener('visibilitychange', this.onHidden);
    }

    /** Terminó el "mantener apretado": ya se puede arrastrar. */
    arm() {
        const st = this.state;
        if (!st) return;
        st.active = true;
        st.orderBefore = getExerciseOrder();
        st.handle.classList.remove('drag-holding');
        st.handle.classList.add('drag-armed');
        try { navigator.vibrate && navigator.vibrate(25); } catch (err) {}

        this.container.classList.add('is-reordering');
        st.block.classList.add('reordering');

        // Al achicarse los bloques todo se corre: se scrollea para que el bloque siga bajo el dedo.
        const rect = st.block.getBoundingClientRect();
        const grab = Math.min(st.grabOffset, rect.height / 2);
        window.scrollBy(0, rect.top - (st.lastClientY - grab));

        st.startNaturalTop = st.block.offsetTop;
        st.startPointerDocY = st.lastClientY + window.scrollY;
        st.raf = requestAnimationFrame(() => this.autoScrollTick());
    }

    onMove(e) {
        const st = this.state;
        if (!st || e.pointerId !== st.pointerId) return;
        e.preventDefault();
        st.lastClientY = e.clientY;
        if (!st.active) {
            // Si se mueve mucho antes de completar el "mantener", no era un arrastre.
            const moved = Math.hypot(e.clientX - st.startX, e.clientY - st.startY);
            if (moved > REORDER_HOLD_TOLERANCE_PX) this.finish();
            return;
        }
        this.update(e.clientY);
    }

    onEnd(e) {
        const st = this.state;
        if (!st || (e.pointerId !== undefined && e.pointerId !== st.pointerId)) return;
        this.finish();
    }

    // La ventana perdió el foco (llamada, notificación, cambio de app) o pasó a segundo plano.
    onHidden(e) {
        if (e.type === 'blur' || document.visibilityState === 'hidden') this.finish();
    }

    update(clientY) {
        const st = this.state;
        if (!st || !st.active) return;
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

    // Autoscroll cerca de los bordes, para llevar un bloque más allá de lo visible.
    autoScrollTick() {
        const st = this.state;
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
            if (window.scrollY !== before) this.update(y);
        }
        st.raf = requestAnimationFrame(() => this.autoScrollTick());
    }

    /** Termina el gesto (del modo que sea) y guarda el orden si cambió. */
    finish() {
        const st = this.state;
        if (!st) { this.resetView(); return; }
        this.state = null;
        clearTimeout(st.holdTimer);
        if (st.raf) cancelAnimationFrame(st.raf);
        window.removeEventListener('pointermove', this.onMove);
        window.removeEventListener('pointerup', this.onEnd);
        window.removeEventListener('pointercancel', this.onEnd);
        window.removeEventListener('blur', this.onHidden);
        document.removeEventListener('visibilitychange', this.onHidden);
        st.handle.classList.remove('drag-holding', 'drag-armed');
        this.resetView();
        if (!st.active) return;

        // Al expandir todo de nuevo, que el bloque soltado quede a la vista.
        st.block.scrollIntoView({ block: 'center' });
        if (getExerciseOrder() !== st.orderBefore) {
            persistExerciseOrder();
            saveWorkoutDraft();
        }
    }

    /** Vista normal: ningún bloque achicado ni desplazado. */
    resetView() {
        const container = this.container;
        if (!container) return;
        container.classList.remove('is-reordering');
        container.querySelectorAll('.exercise-row').forEach(el => {
            el.classList.remove('reordering');
            el.style.transition = '';
            el.style.transform = '';
        });
    }

    // Accesible con teclado: foco en la manija + flechas arriba/abajo.
    onKeyDown(e) {
        const handle = e.target.closest?.('.drag-handle');
        if (!handle || (e.key !== 'ArrowUp' && e.key !== 'ArrowDown')) return;
        e.preventDefault();
        const block = handle.closest('.exercise-row');
        const sibling = exerciseBlockSiblings(block, e.key === 'ArrowUp' ? -1 : 1);
        if (!sibling) return;
        if (e.key === 'ArrowUp') block.parentNode.insertBefore(block, sibling);
        else block.parentNode.insertBefore(sibling, block);
        handle.focus();
        persistExerciseOrder();
        saveWorkoutDraft();
    }
}

const reorderController = new ReorderController('exercisesContainer');

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
