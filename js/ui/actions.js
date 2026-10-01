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
// Script clásico (no módulo): comparte el ámbito global con el resto de la app.

const DECLARED_ACTIONS = new Set([
    'adjustRepTarget', 'adjustRepTempo', 'adjustRestTimer', 'archiveCurrentRoutine',
    'cancelRestTimer', 'changeCalendarMonth', 'closeDrawer', 'closeExerciseDetail',
    'createNewRoutine', 'displayWorkoutHistory', 'downloadData', 'finishRoutineManually',
    'finishTabataSession', 'generateProgressionAnalysis', 'loadRoutineExercises',
    'onHistoryViewModeChange', 'onSoundVolumeInput', 'onTimerWidgetClick', 'onVoiceSettingChange',
    'openMusic', 'previewCue', 'removeRecording', 'renameRoutine', 'renderExerciseDetailChart',
    'renderRecordingsUI', 'resetAllData', 'resetRoutineTimer', 'saveBodyMetrics', 'saveMusicLink',
    'saveSoundSettings', 'saveWorkoutDraft', 'saveWorkoutSession', 'showScreen',
    'showVoiceInstallHelp', 'startRoutineManually', 'startTabata',
    'stopRepCounter', 'testSound', 'testVoice', 'toggleDrawer', 'toggleRecentRoutinesExpanded',
    'toggleRecording', 'toggleRepCounterPause', 'toggleVariantGroup', 'toggleWakeLock',
    'triggerFileInput', 'unifyFromSelectors', 'updateBodyChart', 'uploadCueAudio',
    'openFeedback'
]);

/** Atributos para el HTML generado: `<button ${fnAttrs('previewCue', id)}>`. */
function fnAttrs(fn, ...args) {
    return `data-fn-click="${escapeHtml(fn)}"${args.length ? ` data-fn-args="${escapeHtml(JSON.stringify(args))}"` : ''}`;
}

function runDeclaredAction(event) {
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
        const fn = window[name];
        if (!DECLARED_ACTIONS.has(name) || typeof fn !== 'function') {
            console.warn('Acción no permitida o inexistente:', name);
            return;
        }
        fn(...args);
    });
}

// En fase de captura: se reciben también los eventos que no burbujean (los que dispara el
// código) y antes que los manejadores del propio elemento, como pasaba con onclick=…
['click', 'change', 'input'].forEach(type => document.addEventListener(type, runDeclaredAction, true));
