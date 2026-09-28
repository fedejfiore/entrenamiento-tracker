// Contador de reps con cadencia, preparación y ánimo por voz.
// Script clásico (no módulo): comparte el ámbito global con el resto de la app.

// ▶ en un bloque cuenta la próxima serie sin tildar: primero unos segundos para
// prepararse, después un tic por rep al ritmo elegido (con un tic más grave a mitad
// de cada rep para marcar el cambio de dirección: ida / vuelta) y ánimo por voz. Al terminar
// marca la serie como hecha, lo que arranca el descanso. En los unilaterales cuenta un
// lado, da unos segundos para cambiar de lado (sin descanso) y cuenta el otro.
const REP_TEMPO_MIN = 1;

const REP_TEMPO_MAX = 8;

const REP_TEMPO_STEP = 0.5;

let repState = null;

let repTimer = null;

function startRepCounter(btn) {
    const block = btn.closest('.exercise-row');
    if (!block) return;
    const row = [...block.querySelectorAll('.set-row')].find(r => !r.classList.contains('done'));
    if (!row) {
        showToast('Todas las series están hechas. Agregá una con "+ Agregar serie".', 'error');
        return;
    }
    unlockAudio();
    stopRepCounter(true);
    cancelRestTimer();

    const st = loadVoiceSettings();
    const name = getBlockName(block);
    const repsEl = row.querySelector('[data-f="reps"]');
    const target = parseInt(repsEl?.value || repsEl?.dataset.prev, 10) || 10;
    const tempo = loadExerciseTempos()[normalizeForCompare(name)] || st.tempo;
    const unilateral = block.dataset.unilateral === '1';

    repState = {
        block, row, name, target, tempo, unilateral,
        side: unilateral && row.classList.contains('half') ? 2 : 1,
        phase: 'prep',
        prepSeconds: st.prepSeconds,
        prepEndsAt: Date.now() + st.prepSeconds * 1000,
        lastPrepSecond: null,
        rep: 0,
        repStartedAt: 0,
        midCued: false,
        pausedAt: null
    };

    renderRepCounterTitle();
    const panel = document.getElementById('repCounter');
    panel.hidden = false;
    document.body.classList.add('rep-counter-open');
    maybeAutoStartSessionTimer();
    speakCue(['repPrep'], 'Preparate');
    renderRepCounter();
    repTimer = setInterval(repCounterTick, 50);
}

function renderRepCounterTitle() {
    const s = repState;
    const label = s.row.querySelector('.set-num')?.textContent || '';
    const side = s.unilateral ? ` · Lado ${s.side}` : '';
    document.getElementById('repCounterTitle').textContent = `${s.name} · ${label === WARMUP_LABEL ? 'Calentamiento' : 'Serie ' + label}${side}`;
}

function repCounterTick() {
    const s = repState;
    if (!s || s.pausedAt) return;
    const now = Date.now();

    if (s.phase === 'prep') {
        const left = Math.ceil((s.prepEndsAt - now) / 1000);
        if (left !== s.lastPrepSecond) {
            s.lastPrepSecond = left;
            // 3-2-1 en voz alta (sin pisar el "Preparate" del arranque).
            if (left > 0 && left <= 3 && left < s.prepSeconds) {
                playTick(880, 0.1);
                speak(String(left));
            }
        }
        if (left <= 0) {
            s.phase = 'reps';
            s.switching = false;
            s.rep = 1;
            s.repStartedAt = now;
            s.midCued = false;
            onRepStart(true);
        }
        renderRepCounter();
        return;
    }

    if (s.phase !== 'reps') return;
    const repMs = s.tempo * 1000;
    const elapsed = now - s.repStartedAt;
    if (!s.midCued && elapsed >= repMs / 2) {
        s.midCued = true;
        playTick(520, 0.06, 0.35);
        // El ánimo va a mitad de la rep, DESPUÉS del número: el conteo nunca se pierde.
        const cue = repCue(s.rep, s.target, loadVoiceSettings().encourage);
        if (cue) speakCue(cue.ids, cue.text, null, { interrupt: false });
    }
    if (elapsed >= repMs) {
        if (s.rep >= s.target) {
            finishRepCounter();
            return;
        }
        s.rep++;
        // Suma exacta (no "ahora"): así la cadencia no se va corriendo con los ticks.
        s.repStartedAt += repMs;
        s.midCued = false;
        onRepStart(false);
    }
    renderRepCounter();
}

// Ánimo para una rep (se dice a mitad de la rep, después de su número), o null.
function repCue(rep, target, encourage) {
    const left = target - rep + 1; // incluye la que empieza
    if (encourage) {
        if (rep === target && target > 1) return { ids: ['repLast'], text: '¡Última!' };
        if (left === 2 && target >= 4) return { ids: ['repTwo'], text: '¡Quedan dos!' };
        const half = target >= 6 && rep === Math.floor(target / 2) + 1;
        if (half && left === 5) return { ids: ['repHalf', 'repFive'], text: '¡La mitad! ¡Quedan cinco!' };
        if (left === 5 && target >= 8) return { ids: ['repFive'], text: '¡Dale, quedan cinco!' };
        if (half) return { ids: ['repHalf'], text: '¡Dale, la mitad!' };
    }
    return null;
}

function onRepStart(first) {
    const s = repState;
    const st = loadVoiceSettings();
    playTick(1200, 0.08);
    // Al empezar cada rep se dice su número (la primera es el "¡Ya!").
    if (first) speakCue(['repGo'], '¡Ya!');
    else if (st.countAloud) speak(String(s.rep));
}

function finishRepCounter() {
    const s = repState;
    // Unilateral: terminado el primer lado, pausa corta para cambiar y se cuenta el otro.
    if (s.unilateral && s.side === 1) {
        s.side = 2;
        s.row.classList.add('half');
        const check = s.row.querySelector('.set-check');
        if (check) check.textContent = '½';
        saveWorkoutDraft();
        const secs = Math.max(2, loadAppSettings().sideSwitchSeconds);
        s.phase = 'prep';
        s.switching = true;
        s.prepSeconds = secs;
        s.prepEndsAt = Date.now() + secs * 1000;
        s.lastPrepSecond = null;
        s.rep = 0;
        speakCue(['repSwitch'], 'Cambiá de lado');
        renderRepCounterTitle();
        renderRepCounter();
        return;
    }
    clearInterval(repTimer);
    repTimer = null;
    s.phase = 'done';
    renderRepCounter();
    speakCue(['repDone'], '¡Bien! Serie terminada');

    // Las reps contadas quedan cargadas en la serie (si no había escrito otra cosa),
    // y se marca como hecha: eso completa el peso sugerido y arranca el descanso.
    const repsEl = s.row.querySelector('[data-f="reps"]');
    if (repsEl && !repsEl.value.trim()) repsEl.value = String(s.target);
    const check = s.row.querySelector('.set-check');
    setTimeout(() => {
        if (repState !== s) return; // ya arrancó otro contador en el medio
        closeRepCounterPanel();
        repState = null;
        if (check && !s.row.classList.contains('done')) toggleSetDone(check);
    }, 1200);
}

function stopRepCounter(silent) {
    if (repTimer) { clearInterval(repTimer); repTimer = null; }
    const s = repState;
    repState = null;
    closeRepCounterPanel();
    if (!silent && s && s.phase === 'reps') {
        showToast(`Contador detenido en la rep ${s.rep} de ${s.target}`);
    }
    if (!silent && voiceSupported()) speechSynthesis.cancel();
}

function closeRepCounterPanel() {
    const panel = document.getElementById('repCounter');
    if (panel) panel.hidden = true;
    document.body.classList.remove('rep-counter-open');
}

function toggleRepCounterPause() {
    const s = repState;
    if (!s || s.phase === 'done') return;
    if (s.pausedAt) {
        // Se corre todo lo que falta por el tiempo que estuvo en pausa.
        const pausedFor = Date.now() - s.pausedAt;
        s.prepEndsAt += pausedFor;
        s.repStartedAt += pausedFor;
        s.pausedAt = null;
        speak('Seguimos');
    } else {
        s.pausedAt = Date.now();
        if (voiceSupported()) speechSynthesis.cancel();
    }
    renderRepCounter();
}

// Más lento / más rápido: cambia desde la próxima rep y queda guardado para ese ejercicio.
function adjustRepTempo(delta) {
    const s = repState;
    if (!s) return;
    s.tempo = Math.min(REP_TEMPO_MAX, Math.max(REP_TEMPO_MIN, Math.round((s.tempo + delta) * 2) / 2));
    saveExerciseTempo(s.name, s.tempo);
    renderRepCounter();
}

function adjustRepTarget(delta) {
    const s = repState;
    if (!s) return;
    s.target = Math.max(Math.max(1, s.rep), s.target + delta);
    renderRepCounter();
}

function renderRepCounter() {
    const s = repState;
    if (!s) return;
    const phaseEl = document.getElementById('repCounterPhase');
    const valueEl = document.getElementById('repCounterValue');
    const subEl = document.getElementById('repCounterSub');
    const bar = document.getElementById('repCounterProgress');
    const tempoEl = document.getElementById('repCounterTempo');
    const pauseBtn = document.getElementById('repCounterPauseBtn');
    const now = s.pausedAt || Date.now();

    tempoEl.textContent = `${formatNumber(s.tempo)} s/rep`;
    pauseBtn.textContent = s.pausedAt ? '▶ Seguir' : '⏸ Pausa';

    if (s.phase === 'prep') {
        const left = Math.max(0, Math.ceil((s.prepEndsAt - now) / 1000));
        phaseEl.textContent = s.pausedAt ? 'En pausa' : s.switching ? 'Cambiá de lado' : 'Preparate';
        valueEl.textContent = String(left);
        subEl.textContent = `${s.target} reps`;
        bar.style.width = '0%';
    } else if (s.phase === 'reps') {
        const frac = Math.min(1, (now - s.repStartedAt) / (s.tempo * 1000));
        // Ida / vuelta (neutro: en un curl se sube primero, en una sentadilla se baja).
        phaseEl.textContent = s.pausedAt ? 'En pausa' : (frac < 0.5 ? 'Ida' : 'Vuelta');
        valueEl.textContent = String(s.rep);
        subEl.textContent = `de ${s.target} reps`;
        bar.style.width = `${Math.round(frac * 100)}%`;
    } else {
        phaseEl.textContent = '¡Listo!';
        valueEl.textContent = '✓';
        subEl.textContent = `${s.target} reps`;
        bar.style.width = '100%';
    }
}

