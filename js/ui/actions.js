// Acciones declaradas en el HTML, sin código en línea (onclick=…). Así la política de
// seguridad (CSP) puede prohibir todo script en línea: aunque algún día se colara un dato
// sin escapar, no podría ejecutarse.
//   <button data-fn-click="adjustRestTimer" data-fn-args="[15]">
//   <select data-fn-change="loadRoutineExercises saveWorkoutDraft">   (varias, mismos argumentos)
//   "$this" en los argumentos es el propio elemento.
//   data-fn-self     solo si se tocó el elemento mismo y no algo de adentro (fondo de un modal)
//   data-fn-prevent  evita la acción por defecto (links)
//   data-fn-stop     corta la búsqueda: lo de adentro no dispara la acción del contenedor
// Solo se pueden llamar las funciones de esta lista.

// Mapa explícito nombre → función (no se busca nada por nombre en window). Se arma al primer
// uso: algunas de estas funciones se definen en archivos que cargan después.
import { appErrors } from '../core/errors.js';
import { escapeHtml } from '../core/utils.js';
import { toggleWakeLock } from './wake-lock.js';
import { onSoundVolumeInput, saveSoundSettings, testSound } from '../audio/sound.js';
import { onVoiceSettingChange, showVoiceInstallHelp, testVoice } from '../audio/voice.js';
import { previewCue, removeRecording, renderRecordingsUI, toggleRecording, uploadCueAudio } from '../audio/recordings.js';
import { adjustRestTimer, cancelRestTimer, onTimerWidgetClick } from '../features/rest-timer.js';
import { finishTabataSession, startTabata } from '../features/tabata.js';
import { adjustRepTarget, adjustRepTempo, stopRepCounter, toggleRepCounterPause } from '../features/rep-counter.js';
import { openMusic, saveMusicLink } from '../features/music.js';
import { finishRoutineManually, resetRoutineTimer, startRoutineManually } from '../features/training/session-clock.js';
import { saveWorkoutDraft } from '../features/training/draft.js';
import { archiveCurrentRoutine, createNewRoutine, renameRoutine } from '../features/training/routines-ui.js';
import { loadRoutineExercises, saveWorkoutSession } from '../features/training/workout.js';
import { finishSession } from '../features/training/finish-prompt.js';
import { toggleVariantGroup, unifyFromSelectors } from '../features/exercises.js';
import { displayWorkoutHistory, onHistoryViewModeChange } from '../features/history.js';
import { closeExerciseDetail, generateProgressionAnalysis, renderExerciseDetailChart } from '../features/progress.js';
import { saveBodyMetrics, updateBodyChart } from '../features/body-metrics.js';
import { changeCalendarMonth, toggleRecentRoutinesExpanded } from '../features/home.js';
import { downloadData, resetAllData, triggerFileInput } from '../features/backup.js';
import { openLegal } from '../features/help.js';
import { openFeedback } from '../features/feedback.js';
import { closeDrawer, showScreen, toggleDrawer } from './navigation.js';

export let declaredActionsCache = null;
export function declaredActions() {
    declaredActionsCache ||= {
        adjustRepTarget, adjustRepTempo, adjustRestTimer, archiveCurrentRoutine, cancelRestTimer,
        changeCalendarMonth, closeDrawer, closeExerciseDetail, createNewRoutine,
        displayWorkoutHistory, downloadData, finishRoutineManually, finishTabataSession,
        generateProgressionAnalysis, loadRoutineExercises, onHistoryViewModeChange,
        onSoundVolumeInput, onTimerWidgetClick, onVoiceSettingChange, openLegal, openMusic,
        previewCue, removeRecording, renameRoutine, renderExerciseDetailChart, renderRecordingsUI,
        resetAllData, resetRoutineTimer, saveBodyMetrics, saveMusicLink, finishSession,
        saveSoundSettings, saveWorkoutDraft, saveWorkoutSession, showScreen, showVoiceInstallHelp,
        startRoutineManually, startTabata, stopRepCounter, testSound, testVoice, toggleDrawer,
        toggleRecentRoutinesExpanded, toggleRecording, toggleRepCounterPause, toggleVariantGroup,
        toggleWakeLock, triggerFileInput, unifyFromSelectors, updateBodyChart, uploadCueAudio,
        openFeedback
    };
    return declaredActionsCache;
}

/** Atributos para el HTML generado: `<button ${fnAttrs('previewCue', id)}>`. */
export function fnAttrs(fn, ...args) {
    return `data-fn-click="${escapeHtml(fn)}"${args.length ? ` data-fn-args="${escapeHtml(JSON.stringify(args))}"` : ''}`;
}

export function runDeclaredAction(event) {
    const attr = 'data-fn-' + event.type;
    const start = event.target instanceof Element ? event.target : event.target?.parentElement;
    const el = start?.closest(`[${attr}], [data-fn-stop]`);
    if (!el || !el.hasAttribute(attr)) return;
    if (el.hasAttribute('data-fn-self') && event.target !== el) return;
    if (el.hasAttribute('data-fn-prevent')) event.preventDefault();
    let args = [];
    try { args = JSON.parse(el.getAttribute('data-fn-args') || '[]'); } catch (e) { args = []; }
    args = args.map(a => (a === '$this' ? el : a));
    el.getAttribute(attr).split(/\s+/).filter(Boolean).forEach(name => {
        const fn = Object.prototype.hasOwnProperty.call(declaredActions(), name) ? declaredActions()[name] : null;
        if (typeof fn !== 'function') {
            console.warn('Acción no permitida o inexistente:', name);
            return;
        }
        appErrors.run(() => fn(...args), `acción ${name}`);
    });
}

// En fase de captura: se reciben también los eventos que no burbujean (los que dispara el
// código) y antes que los manejadores del propio elemento, como pasaba con onclick=…
['click', 'change', 'input'].forEach(type => document.addEventListener(type, runDeclaredAction, true));
