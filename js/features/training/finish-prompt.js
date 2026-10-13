// Al tildar la última serie de la sesión (todas las de todos los ejercicios), la app
// pregunta si guardar: resumen, cómo te sentiste y "Guardar sesión" o "Seguir entrenando".
// Así no hace falta bajar hasta el final de Entrenar. Si quedó algún ejercicio sin hacer, no
// pregunta: se guarda como siempre desde "Finalizar Sesión".
import { EXERCISE_TYPES } from '../../domain/catalog.js';
import { setHasMetric } from '../../domain/sets.js';
import { showToast } from '../../ui/toast.js';
import { speakCue } from '../../audio/recordings.js';
import { currentSessionStartTime } from './session-clock.js';
import { saveWorkoutDraft } from './draft.js';
import { selectedMood, setSelectedMood } from './routines-ui.js';
import { isBlockComplete, readSetRow } from './exercise-block.js';
import { saveWorkoutSession } from './workout.js';

export function isSessionComplete() {
    const blocks = [...document.querySelectorAll('#exercisesContainer .exercise-row')];
    return blocks.length > 0 && blocks.every(isBlockComplete);
}

export function finishPromptSummary() {
    const blocks = [...document.querySelectorAll('#exercisesContainer .exercise-row')];
    const sets = blocks.reduce((n, b) => n + b.querySelectorAll('.set-row.done').length, 0);
    const minutes = currentSessionStartTime ? Math.max(1, Math.round((Date.now() - currentSessionStartTime) / 60000)) : null;
    const parts = [`${blocks.length} ${blocks.length === 1 ? 'ejercicio' : 'ejercicios'}`, `${sets} ${sets === 1 ? 'serie' : 'series'}`];
    if (minutes) parts.push(`${minutes} min`);
    return parts.join(' · ');
}

export function openFinishPrompt() {
    const modal = document.getElementById('finishPrompt');
    if (!modal) return;
    document.getElementById('finishPromptSummary').textContent = finishPromptSummary();
    modal.querySelectorAll('[data-mood]').forEach(b => b.classList.toggle('selected', +b.dataset.mood === selectedMood));
    modal.classList.add('open');
    speakCue(['tabataDone'], '¡Misión cumplida!');
    modal.querySelector('[data-finish="save"]')?.focus();
}

export function closeFinishPrompt() {
    document.getElementById('finishPrompt')?.classList.remove('open');
}

export function bindFinishPrompt() {
    bindPendingSetsPrompt();
    const modal = document.getElementById('finishPrompt');
    if (!modal) return;
    modal.addEventListener('click', e => {
        const mood = e.target.closest('[data-mood]');
        if (mood) {
            // El ánimo es el mismo de "Finalizar Sesión": se marca en los dos lugares.
            setSelectedMood(+mood.dataset.mood);
            document.querySelectorAll('.emoji-btn[data-mood]').forEach(b => b.classList.toggle('selected', +b.dataset.mood === selectedMood));
            saveWorkoutDraft();
            return;
        }
        if (e.target === modal || e.target.closest('[data-finish="keep"]')) { closeFinishPrompt(); return; }
        if (e.target.closest('[data-finish="save"]')) { closeFinishPrompt(); finishSession(); }
    });
}

// ---- Terminar con series sin marcar ----
// Solo cuentan las series tildadas (✓). Si al terminar quedan series sin marcar, se pregunta:
// marcarlas todas como hechas, guardar sin ellas (no cuentan como realizadas) o seguir.

export function pendingSetRows() {
    return [...document.querySelectorAll('#exercisesContainer .exercise-row .set-row:not(.done)')];
}

/** Marca una serie como hecha sin descanso ni avisos: completa lo que se ve en gris. */
export function markSetRowDone(row) {
    const block = row.closest('.exercise-row');
    const type = block?.dataset.type;
    (EXERCISE_TYPES[type] || EXERCISE_TYPES.kg).cols.forEach(f => {
        const el = row.querySelector(`[data-f="${f}"]`);
        if (el && !el.value.trim() && el.dataset.prev) el.value = el.dataset.prev;
    });
    if (!setHasMetric(readSetRow(row), type)) return false;
    row.classList.remove('half');
    row.classList.add('done');
    const btn = row.querySelector('.set-check');
    if (btn) { btn.textContent = '✓'; btn.setAttribute('aria-pressed', 'true'); }
    return true;
}

export function finishSession() {
    const pending = pendingSetRows();
    if (pending.length === 0) { saveWorkoutSession(); return; }
    const modal = document.getElementById('pendingSetsPrompt');
    if (!modal) { saveWorkoutSession(); return; }
    document.getElementById('pendingSetsSummary').textContent = pending.length === 1
        ? 'Queda 1 serie sin marcar. Si guardás sin marcarla, no cuenta como hecha.'
        : `Quedan ${pending.length} series sin marcar. Si guardás sin marcarlas, no cuentan como hechas.`;
    modal.classList.add('open');
    modal.querySelector('[data-pending="mark"]')?.focus();
}

export function bindPendingSetsPrompt() {
    const modal = document.getElementById('pendingSetsPrompt');
    if (!modal) return;
    modal.addEventListener('click', e => {
        const action = e.target === modal ? 'keep' : e.target.closest('[data-pending]')?.dataset.pending;
        if (!action) return;
        modal.classList.remove('open');
        if (action === 'keep') return;
        if (action === 'mark') {
            const left = pendingSetRows().filter(row => !markSetRowDone(row)).length;
            if (left) showToast(left === 1 ? '1 serie sin valores quedó sin marcar' : `${left} series sin valores quedaron sin marcar`, 'error', 4000);
            saveWorkoutDraft();
        }
        saveWorkoutSession();
    });
}
