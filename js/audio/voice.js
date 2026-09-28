// Voz del celular (speechSynthesis) y sus ajustes.
// Script clásico (no módulo): comparte el ámbito global con el resto de la app.

// Usa la voz del propio celular (speechSynthesis): funciona sin internet y no pesa
// nada. Cada aviso se prende o apaga por separado en Configuración.
const VOICE_DEFAULTS = {
    enabled: true,
    restWarn: true,      // descanso: "quedan 10 segundos"
    restEnd: true,       // descanso: "¡Vamos, a la próxima serie!"
    tabata: true,        // Tabata: trabajo / descanso / última ronda / 3-2-1
    records: true,       // "¡Nuevo récord!" al guardar
    repCounter: true,    // botón ▶ Contar reps en cada ejercicio
    countAloud: true,    // decir el número de cada rep
    encourage: true,     // mitad / quedan 5 / quedan 2 / ¡última!
    prepSeconds: 5,      // segundos para prepararse antes de la primera rep
    tempo: 3,            // segundos por rep (cadencia) por defecto
    rate: 1.05,          // velocidad de la voz
    voiceURI: '',        // voz elegida ('' = la primera en español)
    useRecordings: true  // si hay una grabación propia para un aviso, suena esa
};

const REST_WARN_SECONDS = 10;

function loadVoiceSettings() {
    try { return { ...VOICE_DEFAULTS, ...(db.get('voiceSettings') || {}) }; }
    catch (e) { return { ...VOICE_DEFAULTS }; }
}

function saveVoiceSettings(patch) {
    const next = { ...loadVoiceSettings(), ...patch };
    db.set('voiceSettings', next);
    applyVoiceSettingsToPage(next);
    return next;
}

function voiceSupported() {
    return 'speechSynthesis' in window && typeof SpeechSynthesisUtterance !== 'undefined';
}

function getSpanishVoices() {
    if (!voiceSupported()) return [];
    return speechSynthesis.getVoices().filter(v => /^es(-|_|$)/i.test(v.lang));
}

function pickVoice(settings) {
    const voices = getSpanishVoices();
    return voices.find(v => v.voiceURI === settings.voiceURI)
        || voices.find(v => /es-(AR|419|US|MX)/i.test(v.lang))
        || voices[0] || null;
}

// key: qué aviso es (para respetar su interruptor). Corta lo que se estaba diciendo:
// con reps rápidas es mejor decir el número actual que quedar atrasado.
// opts.interrupt = false: se encola detrás de lo que se está diciendo (el ánimo a mitad
// de rep no corta el número).
function speak(text, key, opts = {}) {
    const st = loadVoiceSettings();
    if (!st.enabled || (key && st[key] === false) || !voiceSupported()) return;
    try {
        if (opts.interrupt !== false) {
            stopCuePlayback();
            speechSynthesis.cancel();
        }
        const u = new SpeechSynthesisUtterance(text);
        const voice = pickVoice(st);
        if (voice) u.voice = voice;
        u.lang = voice?.lang || 'es-AR';
        u.rate = st.rate;
        u.volume = Math.max(0.1, loadSoundSettings().volume / 100);
        speechSynthesis.speak(u);
    } catch (e) {
        console.error('No se pudo usar la voz:', e);
    }
}

function applyVoiceSettingsToPage(st = loadVoiceSettings()) {
    // Sin contador de reps, el botón ▶ desaparece de los bloques.
    document.body.classList.toggle('rep-counter-off', !(st.enabled && st.repCounter));
}

// ---- Pantalla de Configuración ----
function initVoiceSettingsUI() {
    const st = loadVoiceSettings();
    applyVoiceSettingsToPage(st);
    const box = document.getElementById('voiceSettingsBox');
    if (!box) return;
    if (!voiceSupported()) {
        box.innerHTML = '<p style="color:var(--text-faint); font-size:13px;">Este navegador no tiene voz disponible. Los avisos siguen sonando con beeps.</p>';
    }
    document.querySelectorAll('[data-voice]').forEach(el => {
        const key = el.dataset.voice;
        if (el.type === 'checkbox') el.checked = !!st[key];
        else el.value = st[key];
    });
    updateVoiceLabels(st);
    populateVoiceSelect();
    if (voiceSupported()) speechSynthesis.addEventListener?.('voiceschanged', populateVoiceSelect);
}

function onVoiceSettingChange(el) {
    const key = el.dataset.voice;
    let value = el.type === 'checkbox' ? el.checked : el.value;
    if (['prepSeconds', 'tempo', 'rate'].includes(key)) value = parseFloat(value);
    const st = saveVoiceSettings({ [key]: value });
    updateVoiceLabels(st);
}

function updateVoiceLabels(st) {
    const set = (id, txt) => { const el = document.getElementById(id); if (el) el.textContent = txt; };
    set('voiceRateLabel', `${formatNumber(st.rate)}×`);
    set('voiceTempoLabel', `${formatNumber(st.tempo)} s por rep`);
    set('voicePrepLabel', `${st.prepSeconds} s`);
    const opts = document.getElementById('voiceOptions');
    if (opts) opts.style.opacity = st.enabled ? '1' : '0.5';
}

function populateVoiceSelect() {
    const sel = document.getElementById('voiceSelect');
    if (!sel) return;
    const st = loadVoiceSettings();
    const voices = getSpanishVoices();
    sel.innerHTML = '<option value="">Automática (español)</option>'
        + voices.map(v => `<option value="${escapeHtml(v.voiceURI)}">${escapeHtml(v.name)} (${escapeHtml(v.lang)})</option>`).join('');
    sel.value = voices.some(v => v.voiceURI === st.voiceURI) ? st.voiceURI : '';
}

function testVoice() {
    unlockAudio();
    speak('¡Dale! Quedan cinco. ¡Última!');
}

