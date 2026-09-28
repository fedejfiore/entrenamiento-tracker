// Sonidos: beeps configurables, tics y desbloqueo de audio tras el primer toque.
// Script clásico (no módulo): comparte el ámbito global con el resto de la app.

let restTimerAudioCtx = null;

function loadSoundSettings() {
    let volume = 100;
    try {
        const saved = db.get('soundVolume');
        if (saved !== null) volume = Math.max(0, Math.min(100, parseInt(saved, 10)));
    } catch (e) {}
    const type = db.get('soundType') || 'classic';
    return { type, volume };
}

function initSoundSettingsUI() {
    const { type, volume } = loadSoundSettings();
    const typeEl = document.getElementById('soundType');
    const volEl = document.getElementById('soundVolume');
    const labelEl = document.getElementById('soundVolumeLabel');
    if (typeEl) typeEl.value = type;
    if (volEl) volEl.value = volume;
    if (labelEl) labelEl.textContent = volume + '%';
}

function saveSoundSettings() {
    const type = document.getElementById('soundType')?.value || 'classic';
    db.set('soundType', type);
}

function onSoundVolumeInput() {
    const vol = document.getElementById('soundVolume')?.value ?? '100';
    document.getElementById('soundVolumeLabel').textContent = vol + '%';
    db.set('soundVolume', vol);
}

function testSound() {
    playRestTimerBeep();
}

// Un tono simple: frecuencia, forma de onda y volumen pico (0-1, ya multiplicado
// por el volumen configurado por el usuario).
function playTone(ctx, startTime, freq, type, peakGain, dur) {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.value = freq;
    osc.type = type;
    gain.gain.setValueAtTime(peakGain, startTime);
    gain.gain.exponentialRampToValueAtTime(0.001, startTime + dur);
    osc.start(startTime);
    osc.stop(startTime + dur);
}

function playRestTimerBeep() {
    try {
        const { type, volume } = loadSoundSettings();
        if (type === 'silent' || volume === 0) return;

        if (!restTimerAudioCtx) restTimerAudioCtx = new (window.AudioContext || window.webkitAudioContext)();
        const ctx = restTimerAudioCtx;
        // El volumen configurado (0-100%) escala el pico de cada tono. Antes el pico
        // estaba fijo en 0.3 sin importar el volumen del teléfono — de ahí que sonara bajo.
        const peak = (volume / 100) * 0.9;

        if (type === 'sharp') {
            // Cuadrada: más armónicos que una senoidal, se percibe más fuerte/penetrante
            // al mismo volumen — útil en gimnasios ruidosos.
            for (let i = 0; i < 3; i++) {
                playTone(ctx, ctx.currentTime + i * 0.3, 1300, 'square', peak * 0.6, 0.22);
            }
        } else if (type === 'chime') {
            // Campana: dos tonos con caída lenta, más melódico que un beep de alarma.
            playTone(ctx, ctx.currentTime, 880, 'sine', peak, 0.5);
            playTone(ctx, ctx.currentTime + 0.18, 1318.5, 'sine', peak * 0.8, 0.6);
        } else {
            // Clásico: el triple beep de siempre.
            for (let i = 0; i < 3; i++) {
                playTone(ctx, ctx.currentTime + i * 0.35, 880, 'sine', peak, 0.3);
            }
        }
    } catch (err) {
        console.error('No se pudo reproducir el sonido de pausa:', err);
    }
}

// iPhone/Android solo dejan sonar audio después de un toque del usuario: la primera
// vez que se toca algo, se "despierta" la voz y el audio con un sonido mudo.
let audioUnlocked = false;

function unlockAudio() {
    if (audioUnlocked) return;
    audioUnlocked = true;
    try {
        if (voiceSupported()) {
            const u = new SpeechSynthesisUtterance(' ');
            u.volume = 0;
            speechSynthesis.speak(u);
        }
        const ctx = getAudioCtx();
        if (ctx && ctx.state === 'suspended') ctx.resume();
    } catch (e) {}
}

function getAudioCtx() {
    try {
        if (!restTimerAudioCtx) restTimerAudioCtx = new (window.AudioContext || window.webkitAudioContext)();
        if (restTimerAudioCtx.state === 'suspended') restTimerAudioCtx.resume();
        return restTimerAudioCtx;
    } catch (e) { return null; }
}

// Tic corto (cadencia, cuenta regresiva). Respeta "Silencio" y el volumen.
function playTick(freq = 1000, dur = 0.07, gain = 0.6) {
    const { type, volume } = loadSoundSettings();
    if (type === 'silent' || volume === 0) return;
    const ctx = getAudioCtx();
    if (!ctx) return;
    playTone(ctx, ctx.currentTime, freq, 'sine', (volume / 100) * gain, dur);
}

