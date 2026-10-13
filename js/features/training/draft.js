// Borrador del entrenamiento en curso (se recupera si se cierra la app).

// Auto-guarda lo que se va tipeando (reps/peso/pausa/notas/series tildadas) para
// no perderlo si la app se cierra o se recarga a mitad de un entrenamiento.
import { getLocalDateString } from '../../core/utils.js';
import { setsFromLegacy } from '../../domain/legacy-format.js';
import { db } from '../../data/repositories.js';
import { showToast } from '../../ui/toast.js';
import { selectedMood, setSelectedMood } from './routines-ui.js';
import { applySetsToBlock, getBlockName, readBlockSets } from './exercise-block.js';
import { loadRoutineExercises } from './workout.js';
import { focusCurrentExercise } from './focus.js';
import { ensureModuleForRoutine } from '../disciplines.js';

export function saveWorkoutDraft() {
    const routine = document.getElementById('routine')?.value;
    if (!routine) { clearWorkoutDraft(); return; }

    // Indexado por nombre de ejercicio (no por posición): así sobrevive a que se
    // reordenen los bloques con drag & drop.
    const exercises = {};
    document.querySelectorAll('#exercisesContainer .exercise-row').forEach(block => {
        const name = getBlockName(block);
        if (!name) return;
        exercises[name] = {
            sets: readBlockSets(block),
            note: block.querySelector('.exercise-note')?.value || ''
        };
    });

    const draft = {
        v: 2,
        date: getLocalDateString(),
        routine,
        sessionNotes: document.getElementById('sessionNotes')?.value || '',
        mood: selectedMood,
        exercises
    };
    try { db.set('workoutDraft', draft); } catch (e) {}
}

export function clearWorkoutDraft() {
    try { db.remove('workoutDraft'); } catch (e) {}
}

export function restoreWorkoutDraft() {
    let draft;
    try { draft = db.get('workoutDraft'); } catch (e) { return; }
    if (!draft || !draft.routine) return;

    // Un draft de un día distinto es una sesión abandonada: se descarta.
    if (draft.date !== getLocalDateString()) { clearWorkoutDraft(); return; }

    const routineSelect = document.getElementById('routine');
    if (!routineSelect) return;
    ensureModuleForRoutine(draft.routine);
    routineSelect.value = draft.routine;
    loadRoutineExercises();

    if (draft.v === 2) {
        document.querySelectorAll('#exercisesContainer .exercise-row').forEach(block => {
            const saved = (draft.exercises || {})[getBlockName(block)];
            if (saved) applySetsToBlock(block, saved.sets, saved.note);
        });
    } else {
        // Draft del formato viejo (strings "15-15-15" por posición): se convierte a series.
        Object.keys(draft.rows || {}).forEach(idx => {
            const r = draft.rows[idx];
            const block = document.getElementById(`row_${idx}`);
            if (!block || !r) return;
            const sets = setsFromLegacy({ reps: r.reps, weight: r.weight, pause: r.pause }, block.dataset.type);
            (r.checkedSeries || []).forEach(s => { if (sets[s - 1]) sets[s - 1].done = true; });
            applySetsToBlock(block, sets, r.note);
        });
    }

    if (draft.sessionNotes) {
        const sn = document.getElementById('sessionNotes');
        if (sn) sn.value = draft.sessionNotes;
    }
    if (draft.mood) {
        setSelectedMood(draft.mood);
        document.querySelectorAll('.emoji-btn').forEach(b => {
            b.classList.toggle('selected', parseInt(b.dataset.mood, 10) === draft.mood);
        });
    }

    focusCurrentExercise();
    showToast('🔄 Se recuperaron los datos de tu entrenamiento sin guardar', 'success', 4500);
}

