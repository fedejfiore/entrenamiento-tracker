// Tabata / intervalos: bloques, fases y sesión.
// Script clásico (no módulo): comparte el ámbito global con el resto de la app.

// Varios bloques (ej. Burpees, Plancha, Bici) se acumulan en tabataSessionBlocks y
// se guardan juntos como UN solo entrenamiento al tocar "Finalizar sesión Tabata".
let tabataInterval = null;

let tabataState = null; // {name, workSec, restSec, rounds, currentRound, phase, roundsCompleted}
let tabataSessionBlocks = [];

function startTabata() {
    const name = (document.getElementById('tabataName').value || '').trim() || 'Tabata';
    const workSec = parseInt(document.getElementById('tabataWork').value, 10);
    const restSec = parseInt(document.getElementById('tabataRest').value, 10) || 0;
    const rounds = parseInt(document.getElementById('tabataRounds').value, 10);

    if (!workSec || workSec <= 0) {
        showToast('Ingresá los segundos de trabajo', 'error');
        return;
    }
    if (!rounds || rounds <= 0) {
        showToast('Ingresá la cantidad de rondas', 'error');
        return;
    }

    cancelRestTimer();
    tabataState = { name, workSec, restSec, rounds, currentRound: 1, phase: 'work', roundsCompleted: 0 };
    runTabataPhase(workSec, 'work');
}

function runTabataPhase(seconds, phase) {
    if (!tabataState) return;
    const widget = document.getElementById('restTimer');
    const valueEl = document.getElementById('restTimerValue');
    const phaseEl = document.getElementById('restTimerPhase');
    const roundEl = document.getElementById('restTimerRound');
    if (!widget || !valueEl || !phaseEl || !roundEl) return;

    tabataState.phase = phase;
    let remaining = seconds;

    const render = (s) => {
        const m = Math.floor(s / 60).toString().padStart(2, '0');
        const sec = (s % 60).toString().padStart(2, '0');
        valueEl.textContent = `${m}:${sec}`;
    };

    widget.style.display = 'block';
    widget.classList.remove('rest-mode');
    document.body.classList.add('rest-timer-open');
    widget.style.background = phase === 'work' ? '#27ae60' : '#e67e22';
    phaseEl.style.display = 'block';
    phaseEl.textContent = phase === 'work' ? `🔥 ${tabataState.name.toUpperCase()} — TRABAJO` : '😮‍💨 DESCANSO';
    roundEl.style.display = 'block';
    roundEl.textContent = `Ronda ${tabataState.currentRound} / ${tabataState.rounds}`;
    render(remaining);
    if (phase === 'work') {
        const lastRound = tabataState.currentRound === tabataState.rounds && tabataState.rounds > 1;
        if (lastRound) speakCue(['tabataLastRound', 'tabataWork'], '¡Última ronda! ¡Trabajo!', 'tabata');
        else speakCue(['tabataWork'], '¡Trabajo!', 'tabata');
    } else {
        speakCue(['tabataRest'], 'Descanso', 'tabata');
    }

    if (tabataInterval) clearInterval(tabataInterval);
    tabataInterval = setInterval(() => {
        remaining--;
        if (remaining <= 0) {
            clearInterval(tabataInterval);
            tabataInterval = null;
            playRestTimerBeep();
            advanceTabata();
        } else {
            render(remaining);
            if (remaining <= 3) speak(String(remaining), 'tabata');
        }
    }, 1000);
}

function advanceTabata() {
    if (!tabataState) return;
    if (tabataState.phase === 'work') {
        tabataState.roundsCompleted = tabataState.currentRound;
        if (tabataState.currentRound >= tabataState.rounds) {
            finishTabata();
        } else if (tabataState.restSec > 0) {
            runTabataPhase(tabataState.restSec, 'rest');
        } else {
            tabataState.currentRound++;
            runTabataPhase(tabataState.workSec, 'work');
        }
    } else {
        tabataState.currentRound++;
        runTabataPhase(tabataState.workSec, 'work');
    }
}

function finishTabata() {
    const state = tabataState;
    tabataInterval = null;
    tabataState = null;
    hideTimerWidget();
    speakCue(['tabataDone'], '¡Terminaste! Muy bien', 'tabata');
    addTabataBlockToSession(state, true);
}

function cancelTabata() {
    if (!tabataState) { cancelRestTimer(); return; }
    const state = tabataState;
    cancelRestTimer();
    if (state.roundsCompleted > 0) {
        addTabataBlockToSession(state, false);
    } else {
        showToast('Bloque cancelado (no llegaste a completar ni una ronda, no se guardó)', 'error');
    }
}

// Suma un bloque terminado (o cortado) a la sesión Tabata en curso. Todavía no se
// guarda en el historial: eso pasa recién al tocar "Finalizar sesión Tabata", para
// poder encadenar varios bloques (ej. Burpees + Plancha + Bici) como un solo entreno.
function addTabataBlockToSession(state, completed) {
    tabataSessionBlocks.push({
        name: state.name,
        workSec: state.workSec,
        restSec: state.restSec,
        rounds: state.rounds,
        roundsCompleted: state.roundsCompleted,
        completed
    });
    saveTabataSessionBlocksDraft();
    renderTabataSessionBlocks();

    showToast(completed
        ? `✅ Bloque completo: ${state.name} — ${state.roundsCompleted}/${state.rounds} rondas`
        : `⏹ Bloque guardado: ${state.name} — ${state.roundsCompleted}/${state.rounds} rondas (cortado)`);

    document.getElementById('tabataName').value = '';
}

function renderTabataSessionBlocks() {
    const container = document.getElementById('tabataSessionBlocks');
    const finishBtn = document.getElementById('btnFinishTabataSession');
    if (!container) return;

    if (tabataSessionBlocks.length === 0) {
        container.innerHTML = '';
        if (finishBtn) finishBtn.style.display = 'none';
        return;
    }

    container.innerHTML = `<div style="font-size:12px; color:var(--text-muted); margin-bottom:6px;">Bloques de esta sesión:</div>` +
        tabataSessionBlocks.map(b => `
            <div class="stat-box" style="font-size:12px;">
                🔥 <strong>${b.name}</strong> — ${b.roundsCompleted}/${b.rounds} rondas × (${b.workSec}s/${b.restSec}s)${b.completed ? '' : ' <small style="color:var(--text-faint);">(cortado)</small>'}
            </div>
        `).join('');

    if (finishBtn) finishBtn.style.display = '';
}

// Guarda TODOS los bloques acumulados como un único entrenamiento en el historial.
function finishTabataSession() {
    if (tabataSessionBlocks.length === 0) return;

    const totalDurationSec = tabataSessionBlocks.reduce((sum, b) => {
        const restRoundsElapsed = Math.max(0, b.roundsCompleted - 1);
        return sum + b.roundsCompleted * b.workSec + restRoundsElapsed * b.restSec;
    }, 0);

    let workouts = JSON.parse(localStorage.getItem('workouts') || '[]');
    workouts.push({
        id: Date.now(),
        date: getLocalDateString(),
        type: 'tabata',
        blocks: tabataSessionBlocks,
        duration: Math.max(1, Math.round(totalDurationSec / 60))
    });
    localStorage.setItem('workouts', JSON.stringify(workouts));

    showToast(`✅ Sesión Tabata guardada — ${tabataSessionBlocks.length} bloque(s)`);

    tabataSessionBlocks = [];
    localStorage.removeItem('activeTabataBlocks');
    renderTabataSessionBlocks();
    displayWorkoutHistory();
    updateSidebar();
}

function saveTabataSessionBlocksDraft() {
    try { localStorage.setItem('activeTabataBlocks', JSON.stringify(tabataSessionBlocks)); } catch (e) {}
}

function restoreTabataSessionBlocks() {
    try {
        const saved = JSON.parse(localStorage.getItem('activeTabataBlocks') || '[]');
        if (Array.isArray(saved) && saved.length > 0) {
            tabataSessionBlocks = saved;
            renderTabataSessionBlocks();
        }
    } catch (e) {}
}

