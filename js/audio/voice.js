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
    style: 'neutro',     // estilo de las frases y el tono (js/audio/voice-styles.js)
    pitch: 1,            // tono propio (más grave < 1 < más agudo); se combina con el del estilo
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

// Voces del idioma de la app (español, inglés o portugués), con las más comunes primero.
const PREFERRED_VOICE_LANGS = { es: /es-(AR|419|US|MX)/i, en: /en-(US|GB)/i, pt: /pt-BR/i, de: /de-DE/i, zh: /zh-CN/i };

function getAppVoices() {
    if (!voiceSupported()) return [];
    const re = new RegExp(`^${appLanguage}(-|_|$)`, 'i');
    return speechSynthesis.getVoices().filter(v => re.test(v.lang));
}

function pickVoice(settings) {
    const voices = getAppVoices();
    return voices.find(v => v.voiceURI === settings.voiceURI)
        || voices.find(v => (PREFERRED_VOICE_LANGS[appLanguage] || PREFERRED_VOICE_LANGS.es).test(v.lang))
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
        // Lo que dice la voz también va en el idioma de la app.
        const u = new SpeechSynthesisUtterance(tr(text));
        const voice = pickVoice(st);
        if (voice) u.voice = voice;
        u.lang = voice?.lang || appLocale();
        // El estilo elegido (tierno, militar…) ajusta tono y velocidad de la voz.
        const style = typeof currentVoiceStyle === 'function' ? currentVoiceStyle() : { pitch: 1, rate: 1 };
        u.rate = Math.min(2, st.rate * style.rate);
        u.pitch = Math.min(2, Math.max(0, style.pitch * (Number(st.pitch) || 1)));
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
    const styleSel = document.getElementById('voiceStyleSelect');
    if (styleSel && typeof VOICE_STYLES !== 'undefined') {
        styleSel.innerHTML = Object.entries(VOICE_STYLES).map(([k, v]) => `<option value="${k}">${v.label}</option>`).join('');
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
    if (['prepSeconds', 'tempo', 'rate', 'pitch'].includes(key)) value = parseFloat(value);
    const st = saveVoiceSettings({ [key]: value });
    updateVoiceLabels(st);
}

function updateVoiceLabels(st) {
    const set = (id, txt) => { const el = document.getElementById(id); if (el) el.textContent = txt; };
    set('voiceRateLabel', `${formatNumber(st.rate)}×`);
    const p = Number(st.pitch) || 1;
    set('voicePitchLabel', p < 0.9 ? 'más grave' : p > 1.1 ? 'más agudo' : 'normal');
    set('voiceTempoLabel', `${formatNumber(st.tempo)} s por rep`);
    set('voicePrepLabel', `${st.prepSeconds} s`);
    const opts = document.getElementById('voiceOptions');
    if (opts) opts.style.opacity = st.enabled ? '1' : '0.5';
}

function populateVoiceSelect() {
    const sel = document.getElementById('voiceSelect');
    if (!sel) return;
    const st = loadVoiceSettings();
    const voices = getAppVoices();
    sel.innerHTML = `<option value="">Automática (${escapeHtml(APP_LANGUAGES[appLanguage].name)})</option>`
        + voices.map(v => `<option value="${escapeHtml(v.voiceURI)}">${escapeHtml(v.name)} (${escapeHtml(v.lang)})</option>`).join('');
    sel.value = voices.some(v => v.voiceURI === st.voiceURI) ? st.voiceURI : '';
}

function testVoice() {
    unlockAudio();
    speak(styledCueText(['repFive', 'repLast'], '¡Dale! Quedan cinco. ¡Última!'));
}


// Pasos para instalar o cambiar voces según el sistema. Una web no puede abrir los ajustes
// del sistema (en la app nativa, este botón va a abrirlos directamente).
function showVoiceInstallHelp() {
    const box = document.getElementById('voiceInstallHelp');
    if (!box) return;
    const ua = navigator.userAgent;
    const steps = /Android/i.test(ua)
        ? ['Abrí <b>Ajustes</b> del celular.', 'Entrá a <b>Sistema → Idiomas y entrada</b> (en algunos: <b>Administración general → Idioma</b>).', 'Tocá <b>Salida de texto a voz</b>.', 'Elegí <b>Motor de Google</b> y tocá ⚙️ → <b>Instalar datos de voz</b> → <b>Español</b>.', 'Ahí elegís entre varias voces (de hombre y de mujer). Volvé a la app: aparecen en la lista <b>Voz</b>.']
        : /iPhone|iPad|iPod/i.test(ua)
            ? ['Abrí <b>Ajustes</b>.', 'Entrá a <b>Accesibilidad → Contenido leído → Voces</b>.', 'Elegí <b>Español</b> y descargá las voces que quieras (hay de hombre y de mujer, y "mejoradas").', 'Volvé a la app: aparecen en la lista <b>Voz</b>.']
            : ['En la compu, las voces vienen del sistema operativo.', '<b>Windows:</b> Configuración → Hora e idioma → Voz → Agregar voces.', '<b>Mac:</b> Configuración del Sistema → Accesibilidad → Contenido leído → Voz del sistema.', 'Reiniciá el navegador y aparecen en la lista <b>Voz</b>.'];
    box.innerHTML = '<ol>' + steps.map(s => '<li>' + s + '</li>').join('') + '</ol>';
    box.hidden = !box.hidden;
}
