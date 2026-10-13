// Entrenar enfocado: se ve abierto solo el ejercicio que toca (el primero con series
// pendientes) y, si es parte de una superserie, todos los de su grupo, así la vuelta se
// hace sin buscar. Los demás quedan plegados en una línea ("4 series por hacer"). Al
// terminar el grupo se abre solo el siguiente. Lo que la persona abre a mano se respeta.
// Se apaga en Ajustes → Funciones ("Un ejercicio a la vez").
import { setBlockCollapsed } from './exercise-block.js';
import { features } from '../feature-settings.js';

export function exerciseBlocks() {
    return [...document.querySelectorAll('#exercisesContainer .exercise-row')];
}

export function blockHasPending(block) {
    return !!block.querySelector('.set-row:not(.done)');
}

/** El grupo que toca: el primer ejercicio con series pendientes y su superserie. */
export function currentFocusGroup(blocks) {
    const first = blocks.find(blockHasPending);
    if (!first) return [];
    const letter = first.dataset.superset;
    return letter ? blocks.filter(b => b.dataset.superset === letter && blockHasPending(b)) : [first];
}

/**
 * Abre el grupo que toca y pliega el resto (los terminados ya se pliegan solos).
 * @param {{ scroll?: boolean }} opts  scroll: lleva la pantalla al grupo (al pasar de uno a otro)
 */
export function focusCurrentExercise(opts = {}) {
    if (typeof features !== 'undefined' && !features.isOn('focus')) return;
    const blocks = exerciseBlocks();
    const group = currentFocusGroup(blocks);
    if (!group.length) return;
    blocks.forEach(block => {
        if (group.includes(block)) setBlockCollapsed(block, false);
        else if (blockHasPending(block) && block.dataset.userOpen !== '1') setBlockCollapsed(block, true);
    });
    if (opts.scroll) {
        const target = group[0].querySelector('.set-row:not(.done)') || group[0];
        target.scrollIntoView({ block: 'center', behavior: 'smooth' });
    }
}

/** Al abrir o cerrar un ejercicio a mano, el modo enfocado no lo vuelve a tocar. */
export function rememberManualCollapse(block, collapsed) {
    if (collapsed) delete block.dataset.userOpen;
    else block.dataset.userOpen = '1';
}
