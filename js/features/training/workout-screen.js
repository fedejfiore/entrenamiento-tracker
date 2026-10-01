// Pantalla Entrenar: un único controlador recibe todos los eventos del contenedor de
// ejercicios (delegación) y los despacha según el atributo del elemento tocado:
//   data-action="…"     al tocar          data-dblaction="…"  al tocar dos veces
//   data-change="…"     al cambiar        data-input="…"      al escribir
// Así el HTML generado no lleva código (onclick=…), los datos viajan escapados en
// atributos data-* y todo lo que hace la pantalla está listado en un solo lugar.

class WorkoutScreen {
    constructor(containerId) {
        this.containerId = containerId;
    }

    get container() { return document.getElementById(this.containerId); }

    /** Rutina elegida en el selector de arriba. */
    get routine() { return document.getElementById('routine')?.value || ''; }

    /** Índice del bloque (row_<idx>) que contiene al elemento. */
    static blockIndex(el) {
        const id = el.closest('.exercise-row')?.id || '';
        const m = id.match(/^row_(\d+)$/);
        return m ? parseInt(m[1], 10) : null;
    }

    // ---- Acciones (el nombre es el valor de data-action / data-change / …) ----
    get clickActions() {
        return {
            'toggle-warmup': el => toggleWarmup(el),
            'toggle-done': el => toggleSetDone(el),
            'toggle-set-note': el => toggleSetNote(el),
            'cycle-time-unit': el => cycleTimeUnit(el),
            'open-detail': el => openExerciseDetailFromRow(WorkoutScreen.blockIndex(el)),
            'archive-exercise': el => archiveExerciseFromRow(WorkoutScreen.blockIndex(el), this.routine),
            'remove-exercise': el => deleteRowQuick(WorkoutScreen.blockIndex(el), this.routine),
            'remove-set': el => removeLastSet(el),
            'add-set': el => addSet(el),
            'count-reps': el => startRepCounter(el),
            'toggle-unilateral': el => toggleUnilateral(el),
            'toggle-collapse': el => toggleBlockCollapsed(el),
            'restore-archived': el => restoreArchivedExercise(this.routine, el.dataset.exercise),
            'toggle-collapsible': el => toggleVariantGroup(el.dataset.target),
            'quick-add': () => quickAddExercise(this.routine),
            'superset': el => openSupersetModal(el.closest('.exercise-row'))
        };
    }

    get dblClickActions() {
        return {
            'rename-exercise': el => editExerciseName(WorkoutScreen.blockIndex(el), this.routine)
        };
    }

    get changeActions() {
        return {
            'change-type': el => changeExerciseType(el),
            'quick-add-type': el => { el.dataset.touched = '1'; },
            'quick-add-group': el => { el.dataset.touched = '1'; }
        };
    }

    get inputActions() {
        return {
            'quick-add-name': () => onQuickAddNameInput(this.routine)
        };
    }

    static dispatch(actions, attr, e) {
        const el = e.target.closest?.(`[data-${attr}]`);
        if (!el) return false;
        const action = actions[el.dataset[attr.replace(/-(\w)/g, (_, c) => c.toUpperCase())]];
        if (!action) return false;
        action(el, e);
        return true;
    }

    bind() {
        const c = this.container;
        if (!c) return;

        c.addEventListener('click', e => WorkoutScreen.dispatch(this.clickActions, 'action', e));
        c.addEventListener('dblclick', e => WorkoutScreen.dispatch(this.dblClickActions, 'dblaction', e));

        c.addEventListener('input', e => {
            if (WorkoutScreen.dispatch(this.inputActions, 'input', e)) return;
            if (e.target.dataset?.f && e.target.closest?.('.set-row')) {
                if (e.isTrusted) sanitizeSetInput(e.target);
                updateSetCalc(e.target.closest('.set-row'));
                if (e.target.dataset.f === 'kg') updateStepperHint(e.target.closest('.set-row'));
            }
            if (e.target.classList?.contains('set-note')) {
                e.target.closest('.set-row')?.querySelector('.set-note-btn')?.classList.toggle('has-note', !!e.target.value.trim());
            }
            if (isSessionDataEvent(e)) maybeAutoStartSessionTimer();
            saveWorkoutDraft();
        });

        c.addEventListener('change', e => {
            if (WorkoutScreen.dispatch(this.changeActions, 'change', e)) return;
            if (e.target.dataset?.f === 'time' && e.target.value.trim()) {
                const unit = e.target.dataset.unit;
                e.target.value = formatTimeForUnit(parseTimeInput(e.target.value, unit), unit);
            }
            if (isSessionDataEvent(e)) maybeAutoStartSessionTimer();
            saveWorkoutDraft();
        });

        // Nota de serie vacía: al salir del campo se vuelve a esconder.
        c.addEventListener('focusout', e => {
            if (e.target.classList?.contains('set-note') && !e.target.value.trim()) e.target.hidden = true;
        });
        c.addEventListener('focusin', e => {
            if (e.target.closest?.('.set-row') && e.target.dataset?.f) showSetStepper(e.target);
        });

        // Reordenar: mantener apretados los puntos y arrastrar (o flechas con teclado).
        c.addEventListener('pointerdown', e => reorderController.onPointerDown(e));
        c.addEventListener('keydown', e => reorderController.onKeyDown(e));
        // En Android, mantener apretado abre el menú contextual y corta el gesto.
        c.addEventListener('contextmenu', e => { if (e.target.closest?.('.drag-handle')) e.preventDefault(); });
    }
}

const workoutScreen = new WorkoutScreen('exercisesContainer');

// Lista de rutinas archivadas (Ajustes): mismas reglas, sin código en el HTML.
function bindArchivedRoutinesList() {
    document.getElementById('archivedRoutinesList')?.addEventListener('click', e => {
        const el = e.target.closest('[data-action]');
        if (!el) return;
        if (el.dataset.action === 'restore-routine') restoreRoutine(el.dataset.routine);
        if (el.dataset.action === 'delete-routine') deleteCustomRoutineForever(el.dataset.routine);
    });
}
