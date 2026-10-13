// Reloj de la sesión: inicio / fin manual o automático.
import { formatDateLocal, getLocalDateString } from '../../core/utils.js';
import { formatDuration, formatTimeHM } from '../../core/time.js';
import { db, repo } from '../../data/repositories.js';
import { showToast } from '../../ui/toast.js';

export let currentSessionStartTime = null;

export let currentSessionEndTime = null;

export let sessionDurationInterval = null;

// Si no hay sesión corriendo ahora, mostrar la duración de la última sesión
// guardada hoy (en vez de dejar el dato en blanco aunque ya hayas entrenado).
export function getTodaysLastSessionDurationLabel() {
    const today = getLocalDateString();
    let workouts = repo.workouts.all();
    if (!Array.isArray(workouts)) workouts = [];
    const todays = workouts.filter(w => w && w.date === today && w.duration != null);
    if (todays.length === 0) return '-';
    return `${formatDuration(todays[todays.length - 1].duration)} (hoy)`;
}

export function updateSessionDurationDisplay() {
    const el = document.getElementById('currentSessionDuration');
    if (!el) return;
    if (!currentSessionStartTime) {
        el.textContent = getTodaysLastSessionDurationLabel();
        return;
    }
    const endMs = currentSessionEndTime || Date.now();
    const elapsedMs = endMs - currentSessionStartTime;
    const totalSeconds = Math.floor(elapsedMs / 1000);
    const m = Math.floor(totalSeconds / 60).toString().padStart(2, '0');
    const s = (totalSeconds % 60).toString().padStart(2, '0');
    el.textContent = `${m}:${s}`;
}

export function updateRoutineTimeStatusUI() {
    const btnStart = document.getElementById('btnStartRoutine');
    const btnFinish = document.getElementById('btnFinishRoutine');
    const btnReset = document.getElementById('btnResetRoutineTimer');
    const status = document.getElementById('routineTimeStatus');
    if (!btnStart || !btnFinish || !btnReset || !status) return;

    if (!currentSessionStartTime) {
        btnStart.style.display = '';
        btnFinish.style.display = 'none';
        btnReset.style.display = 'none';
        status.textContent = '';
        return;
    }

    btnStart.style.display = 'none';
    btnFinish.style.display = currentSessionEndTime ? 'none' : '';
    btnReset.style.display = '';
    status.textContent = currentSessionEndTime
        ? `Iniciada ${formatTimeHM(currentSessionStartTime)} · Finalizada ${formatTimeHM(currentSessionEndTime)} — guardá la sesión o reiniciá para empezar otra`
        : `Iniciada ${formatTimeHM(currentSessionStartTime)}`;
}

export function resetRoutineTimer() {
    if (currentSessionStartTime && !confirm('¿Reiniciar el marcado de tiempo? Se perderá la hora de inicio/fin actual (no afecta ejercicios ya cargados).')) return;
    stopSessionTimer();
}

export function startRoutineManually() {
    if (!document.getElementById('routine').value) {
        showToast('Seleccioná una rutina primero', 'error');
        return;
    }
    if (currentSessionStartTime) return;
    currentSessionStartTime = Date.now();
    currentSessionEndTime = null;
    db.transaction(tx => {
        tx.set('activeSessionStart', String(currentSessionStartTime));
        tx.remove('activeSessionEnd');
    });
    updateSessionDurationDisplay();
    updateRoutineTimeStatusUI();
    if (!sessionDurationInterval) {
        sessionDurationInterval = setInterval(updateSessionDurationDisplay, 1000);
    }
}

// El reloj de la sesión arranca solo recién con la PRIMERA interacción real con
// los datos (tipear reps/peso, tildar una serie) — elegir una rutina solo para
// mirar qué tiene no cuenta como "empezaste a entrenar".
export function maybeAutoStartSessionTimer() {
    if (!currentSessionStartTime && document.getElementById('routine').value) {
        startRoutineManually();
    }
}

export function finishRoutineManually() {
    if (!currentSessionStartTime) {
        showToast('Primero iniciá la rutina', 'error');
        return;
    }
    if (currentSessionEndTime) return;
    currentSessionEndTime = Date.now();
    db.set('activeSessionEnd', String(currentSessionEndTime));
    if (sessionDurationInterval) {
        clearInterval(sessionDurationInterval);
        sessionDurationInterval = null;
    }
    updateSessionDurationDisplay();
    updateRoutineTimeStatusUI();
}

export function stopSessionTimer() {
    currentSessionStartTime = null;
    currentSessionEndTime = null;
    clearStoredSessionTimes();
    if (sessionDurationInterval) {
        clearInterval(sessionDurationInterval);
        sessionDurationInterval = null;
    }
    updateSessionDurationDisplay();
    updateRoutineTimeStatusUI();
}

export function restoreSessionTimer() {
    const savedStart = db.get('activeSessionStart');
    if (!savedStart) return;
    currentSessionStartTime = parseInt(savedStart, 10);
    if (isNaN(currentSessionStartTime)) {
        currentSessionStartTime = null;
        return;
    }

    // Si el marcado quedó de un día distinto a hoy, es una sesión abandonada
    // (se inició/finalizó pero nunca se guardó): se descarta para no arrastrar
    // una hora vieja a la próxima sesión que se guarde.
    if (formatDateLocal(new Date(currentSessionStartTime)) !== formatDateLocal(new Date())) {
        currentSessionStartTime = null;
        clearStoredSessionTimes();
        return;
    }

    const savedEnd = db.get('activeSessionEnd');
    currentSessionEndTime = savedEnd ? parseInt(savedEnd, 10) : null;
    if (isNaN(currentSessionEndTime)) currentSessionEndTime = null;

    updateSessionDurationDisplay();
    updateRoutineTimeStatusUI();
    if (!currentSessionEndTime) {
        sessionDurationInterval = setInterval(updateSessionDurationDisplay, 1000);
    }
}

// Inicio y fin de la sesión en curso se borran juntos (nunca queda uno sin el otro).
export function clearStoredSessionTimes() {
    db.transaction(tx => {
        tx.remove('activeSessionStart');
        tx.remove('activeSessionEnd');
    });
}
