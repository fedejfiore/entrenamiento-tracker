// Entrenar → "Para progresar hoy": opciones debajo de cada ejercicio (subir el peso, sumar una
// rep o bajar el descanso). La app sugiere y marca con ★ la que recomienda el programa, pero no
// cambia nada sola: lo que se ve en gris es siempre lo de la última vez. Al tocar una opción,
// se completan las series que faltan (se puede deshacer).
import { formatNumber, html } from '../../core/utils.js';
import { displayIncrement, weightUnitDef } from '../../core/units.js';
import { PROGRESSION_FIELD, PROGRESSION_KINDS, progressedValue } from '../../domain/programs.js';
import { exerciseStats } from '../../domain/stats.js';
import { showToast, showUndoToast } from '../../ui/toast.js';
import { getExerciseTarget, programSuggestion, targetIncrement } from '../programs.js';
import { plateModeFor, stackFor } from '../plate-calculator.js';
import { saveWorkoutDraft } from './draft.js';
import { features } from '../feature-settings.js';
import { getBlockName, updateSetCalc } from './exercise-block.js';

const DEFAULT_KG_STEP = 2.5;

/** Cuánto sube el peso: el salto del programa, una placa en máquinas, o 2,5 kg (en la unidad elegida). */
export function progressionIncrement(routine, name) {
    const target = getExerciseTarget(routine, name);
    const kgStep = target ? targetIncrement(name, target) : plateModeFor(name) === 'stack' ? stackFor(name).step : DEFAULT_KG_STEP;
    return displayIncrement(kgStep || DEFAULT_KG_STEP);
}

function choiceLabel(kind, inc) {
    if (kind === 'weight') return `⬆ +${formatNumber(inc)} ${weightUnitDef().label}`;
    if (kind === 'reps') return '＋1 rep';
    return '⏱ −15 s de descanso';
}

/** Las opciones de un ejercicio (nada si es la primera vez o si el tipo no tiene opciones). */
export function progressionChoicesHtml(routine, name, type) {
    const kinds = PROGRESSION_KINDS[type];
    const last = (exerciseStats[name] || {}).lastSets || [];
    if (!kinds || !last.some(s => s && !s.warmup)) return '';
    const s = programSuggestion(routine, name);
    const recommended = features.isOn('programs') && s && (s.action === 'weight' || s.action === 'reps') ? s.action : null;
    const inc = progressionIncrement(routine, name);
    return html`<div class="progress-choices" data-feature="nextStep">
            <span class="progress-choices-label">Para progresar hoy:</span>
            ${kinds.map(k => html`<button type="button" class="progress-chip${k === recommended ? ' rec' : ''}" data-action="apply-progression" data-kind="${k}" aria-pressed="false"${k === recommended ? html` title="Lo que recomienda el programa"` : ''}>${k === recommended ? '★ ' : ''}${choiceLabel(k, inc)}</button>`)}
        </div>`;
}

/** Aplica la opción elegida a las series que faltan (las hechas y las de calentamiento no se tocan). */
export function applyProgression(btn) {
    const block = btn.closest('.exercise-row');
    const kind = btn.dataset.kind;
    const field = PROGRESSION_FIELD[kind];
    if (!block || !field) return;
    const routine = document.getElementById('routine')?.value;
    const inc = progressionIncrement(routine, getBlockName(block));
    const changes = [];
    block.querySelectorAll('.set-row:not(.done):not(.warmup)').forEach(row => {
        const input = row.querySelector(`[data-f="${field}"]`);
        if (!input) return;
        const next = progressedValue(kind, input.value.trim() || input.dataset.prev, { inc });
        if (next == null) return;
        changes.push({ row, input, before: input.value, beforeKg: input.dataset.kg });
        input.value = next;
        delete input.dataset.kg; // el valor exacto guardado ya no corresponde
        updateSetCalc(row);
    });
    if (!changes.length) {
        showToast('No hay series pendientes con valores de la vez pasada para cambiar', 'error');
        return;
    }
    btn.setAttribute('aria-pressed', 'true');
    saveWorkoutDraft();
    const n = changes.length === 1 ? '1 serie' : `${changes.length} series`;
    showUndoToast(`${choiceLabel(kind, inc)} en ${n}`, () => {
        changes.forEach(c => {
            c.input.value = c.before;
            if (c.beforeKg) c.input.dataset.kg = c.beforeKg;
            updateSetCalc(c.row);
        });
        btn.setAttribute('aria-pressed', 'false');
        saveWorkoutDraft();
    });
}
