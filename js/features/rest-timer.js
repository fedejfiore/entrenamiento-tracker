// Timer de descanso entre series (widget flotante, ±15 s, avisos).
// Script clásico (no módulo): comparte el ámbito global con el resto de la app.

let restTimerInterval = null;

function runRestTimer(totalSeconds) {
    if (tabataInterval) { clearInterval(tabataInterval); tabataInterval = null; tabataState = null; }
    if (restTimerInterval) clearInterval(restTimerInterval);

    const widget = document.getElementById('restTimer');
    const valueEl = document.getElementById('restTimerValue');
    const phaseEl = document.getElementById('restTimerPhase');
    const roundEl = document.getElementById('restTimerRound');
    if (!widget || !valueEl) return;

    widget.style.background = '#333';
    widget.classList.add('rest-mode');
    document.body.classList.add('rest-timer-open');
    if (phaseEl) phaseEl.style.display = 'none';
    if (roundEl) roundEl.style.display = 'none';

    // Se cuenta contra una hora de fin (no restando 1 por tick): si el celular
    // frena los intervalos con la pantalla apagada, el tiempo igual es exacto.
    restTimerEndsAt = Date.now() + totalSeconds * 1000;
    restTimerWarned = totalSeconds <= REST_WARN_SECONDS + 2; // descansos cortos: sin aviso previo
    widget.style.display = 'block';
    tickRestTimer();
    restTimerInterval = setInterval(tickRestTimer, 250);
}

let restTimerEndsAt = null;

let restTimerWarned = false;

function restTimerRemainingSeconds() {
    return restTimerEndsAt == null ? 0 : Math.max(0, Math.ceil((restTimerEndsAt - Date.now()) / 1000));
}

function tickRestTimer() {
    const valueEl = document.getElementById('restTimerValue');
    const remaining = restTimerRemainingSeconds();
    if (valueEl) {
        const m = Math.floor(remaining / 60).toString().padStart(2, '0');
        const sec = (remaining % 60).toString().padStart(2, '0');
        valueEl.textContent = `${m}:${sec}`;
    }
    if (remaining > 0 && remaining <= REST_WARN_SECONDS && !restTimerWarned) {
        restTimerWarned = true;
        playTick(880, 0.1);
        speakCue(['restWarn'], 'Quedan diez segundos', 'restWarn');
    }
    if (remaining > 0) return;

    clearInterval(restTimerInterval);
    restTimerInterval = null;
    restTimerEndsAt = null;
    playRestTimerBeep();
    // Después del beep, para que no se pisen.
    setTimeout(() => speakCue(['restEnd'], '¡Vamos! A la próxima serie', 'restEnd'), 900);
    setTimeout(() => {
        // Solo si en el medio no arrancó otro descanso (o un Tabata).
        if (!restTimerInterval && !tabataState) hideTimerWidget();
    }, 2000);
}

// ±15 s al descanso en curso. Bajar de cero lo termina (suena el aviso).
function adjustRestTimer(deltaSeconds) {
    if (!restTimerInterval || restTimerEndsAt == null) return;
    restTimerEndsAt += deltaSeconds * 1000;
    if (restTimerEndsAt < Date.now()) restTimerEndsAt = Date.now();
    // Si con +15s volvió a quedar más de 10 s, se vuelve a avisar.
    if (restTimerRemainingSeconds() > REST_WARN_SECONDS) restTimerWarned = false;
    tickRestTimer();
}

function hideTimerWidget() {
    const widget = document.getElementById('restTimer');
    if (widget) {
        widget.style.display = 'none';
        widget.classList.remove('rest-mode');
    }
    document.body.classList.remove('rest-timer-open');
}

// Corta cualquier timer activo (descanso de serie o Tabata) sin guardar nada.
// Es la red de seguridad que se llama, por ejemplo, al guardar la sesión.
function cancelRestTimer() {
    if (restTimerInterval) {
        clearInterval(restTimerInterval);
        restTimerInterval = null;
    }
    if (tabataInterval) {
        clearInterval(tabataInterval);
        tabataInterval = null;
    }
    tabataState = null;
    restTimerEndsAt = null;
    hideTimerWidget();
}

// Lo que se ejecuta al tocar el widget flotante: si hay un Tabata en curso, lo
// corta y guarda el progreso parcial. En un descanso de serie no hace nada: ahí
// están los botones ±15s y Saltar (así un toque sin querer no lo cancela).
function onTimerWidgetClick() {
    if (tabataState) {
        cancelTabata();
    } else if (!restTimerInterval) {
        cancelRestTimer();
    }
}

