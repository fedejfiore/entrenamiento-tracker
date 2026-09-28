// Grabaciones propias para cada aviso: grabar, reproducir y pantalla de ajustes.
// El guardado en IndexedDB está en js/data/recording-repository.js.
// Script clásico (no módulo): comparte el ámbito global con el resto de la app.

// Cada aviso puede tener una grabación propia (tu voz, la de un entrenador). Si
// existe, suena esa; si no, la voz del celular. Los números (1, 2, 3...) siempre
// los dice la voz del celular. Las grabaciones viven en el celular (IndexedDB) y se
// incluyen en el backup, igual que el resto de los datos.
const VOICE_CUES = [
    { id: 'restWarn', group: 'Descanso', text: 'Quedan diez segundos' },
    { id: 'restEnd', group: 'Descanso', text: '¡Vamos! A la próxima serie' },
    { id: 'repPrep', group: 'Contador de reps', text: 'Preparate' },
    { id: 'repGo', group: 'Contador de reps', text: '¡Ya!' },
    { id: 'repHalf', group: 'Contador de reps', text: '¡Dale, la mitad!' },
    { id: 'repFive', group: 'Contador de reps', text: '¡Dale, quedan cinco!' },
    { id: 'repTwo', group: 'Contador de reps', text: '¡Quedan dos!' },
    { id: 'repLast', group: 'Contador de reps', text: '¡Última!' },
    { id: 'repSwitch', group: 'Contador de reps', text: 'Cambiá de lado' },
    { id: 'repDone', group: 'Contador de reps', text: '¡Bien! Serie terminada' },
    { id: 'tabataWork', group: 'Tabata', text: '¡Trabajo!' },
    { id: 'tabataRest', group: 'Tabata', text: 'Descanso' },
    { id: 'tabataLastRound', group: 'Tabata', text: '¡Última ronda!' },
    { id: 'tabataDone', group: 'Tabata', text: '¡Terminaste! Muy bien' },
    { id: 'record', group: 'Récords', text: '¡Nuevo récord!' }
];

const MAX_RECORDING_MS = 5000;

const recordingMeta = {};     // id -> { mime, duration, updatedAt }
const recordingBuffers = {};  // id -> AudioBuffer listo para sonar (sin silencios)
let recState = null;          // grabación en curso
let cueSources = [];          // grabaciones sonando ahora

function decodeAudio(arrayBuffer) {
    const ctx = getAudioCtx();
    if (!ctx) return Promise.reject(new Error('Sin audio'));
    // Copia: decodeAudioData "consume" el buffer que recibe.
    const copy = arrayBuffer.slice(0);
    return new Promise((resolve, reject) => {
        const p = ctx.decodeAudioData(copy, resolve, reject);
        if (p && p.then) p.then(resolve, reject);
    });
}

// Recorta el silencio del principio y del final (siempre hay un poco entre tocar
// "Grabar" y empezar a hablar), así el aviso suena en el momento justo.
function trimSilence(buffer) {
    const ctx = getAudioCtx();
    const data = buffer.getChannelData(0);
    const threshold = 0.02;
    let start = 0, end = data.length - 1;
    while (start < data.length && Math.abs(data[start]) < threshold) start++;
    while (end > start && Math.abs(data[end]) < threshold) end--;
    const pad = Math.floor(buffer.sampleRate * 0.05);
    start = Math.max(0, start - pad);
    end = Math.min(data.length - 1, end + pad);
    const length = end - start + 1;
    if (!ctx || length <= 0 || length >= data.length) return buffer;
    const out = ctx.createBuffer(buffer.numberOfChannels, length, buffer.sampleRate);
    for (let ch = 0; ch < buffer.numberOfChannels; ch++) {
        out.copyToChannel(buffer.getChannelData(ch).subarray(start, end + 1), ch);
    }
    return out;
}

async function loadRecordings() {
    let all = [];
    try { all = await recordingRepo.all(); } catch (e) { return; }
    for (const rec of all) {
        recordingMeta[rec.id] = { mime: rec.mime, duration: rec.duration, updatedAt: rec.updatedAt };
        try { recordingBuffers[rec.id] = trimSilence(await decodeAudio(rec.data)); }
        catch (e) { console.error('No se pudo leer la grabación', rec.id, e); }
    }
    renderRecordingsUI();
}

async function saveRecordingData(id, arrayBuffer, mime) {
    const decoded = await decodeAudio(arrayBuffer); // si no se puede leer, no se guarda
    const rec = { id, mime, data: arrayBuffer, duration: Math.round(decoded.duration * 10) / 10, updatedAt: Date.now() };
    await recordingRepo.put(rec);
    recordingMeta[id] = { mime, duration: rec.duration, updatedAt: rec.updatedAt };
    recordingBuffers[id] = trimSilence(decoded);
}

async function removeRecording(id) {
    if (!recordingMeta[id]) return;
    const cue = VOICE_CUES.find(c => c.id === id);
    if (!confirm(`¿Borrar tu grabación de «${cue?.text || id}»? Vuelve a sonar la voz del celular.`)) return;
    try { await recordingRepo.delete(id); } catch (e) {}
    delete recordingMeta[id];
    delete recordingBuffers[id];
    renderRecordingsUI();
}

// --- Reproducir ---
function stopCuePlayback() {
    cueSources.forEach(src => { try { src.stop(); } catch (e) {} });
    cueSources = [];
}

function playRecordings(ids, opts = {}) {
    const ctx = getAudioCtx();
    const buffers = ids.map(id => recordingBuffers[id]);
    if (!ctx || buffers.some(b => !b)) return false;
    if (opts.interrupt !== false) {
        stopCuePlayback();
        if (voiceSupported()) speechSynthesis.cancel();
    }
    const gain = ctx.createGain();
    gain.gain.value = Math.max(0.1, loadSoundSettings().volume / 100);
    gain.connect(ctx.destination);
    let t = ctx.currentTime + 0.02;
    buffers.forEach(buf => {
        const src = ctx.createBufferSource();
        src.buffer = buf;
        src.connect(gain);
        src.start(t);
        t += buf.duration + 0.05;
        cueSources.push(src);
    });
    return true;
}

// Aviso con posible grabación propia: ids = qué grabaciones sonarían (en orden),
// text = lo que dice la voz del celular si falta alguna, key = interruptor del aviso,
// opts.interrupt = false para no cortar lo que se está diciendo.
function speakCue(ids, text, key, opts = {}) {
    const st = loadVoiceSettings();
    if (!st.enabled || (key && st[key] === false)) return;
    if (st.useRecordings && ids.length > 0 && playRecordings(ids, opts)) return;
    speak(text, null, opts);
}

function previewCue(id) {
    unlockAudio();
    const cue = VOICE_CUES.find(c => c.id === id);
    if (!playRecordings([id])) speak(cue?.text || '');
}

// --- Grabar ---
function canRecord() {
    return !!(navigator.mediaDevices?.getUserMedia && window.MediaRecorder && window.isSecureContext !== false);
}

function pickRecordingMime() {
    const options = ['audio/webm;codecs=opus', 'audio/mp4', 'audio/webm', 'audio/ogg;codecs=opus'];
    return options.find(m => { try { return MediaRecorder.isTypeSupported(m); } catch (e) { return false; } }) || '';
}

async function toggleRecording(id) {
    if (recState) {
        const same = recState.id === id;
        recState.recorder.stop();
        if (same) return;
        await new Promise(r => setTimeout(r, 300));
    }
    startRecording(id);
}

async function startRecording(id) {
    if (!canRecord()) {
        showToast('Este navegador no permite grabar audio desde la app.', 'error', 4500);
        return;
    }
    unlockAudio();
    let stream;
    try {
        stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true } });
    } catch (e) {
        showToast('No hay permiso para usar el micrófono. Habilitalo en los permisos del navegador para esta app.', 'error', 5500);
        return;
    }
    stopCuePlayback();
    const mime = pickRecordingMime();
    let recorder;
    try { recorder = new MediaRecorder(stream, mime ? { mimeType: mime } : undefined); }
    catch (e) { recorder = new MediaRecorder(stream); }
    const chunks = [];
    recorder.ondataavailable = e => { if (e.data && e.data.size) chunks.push(e.data); };
    recorder.onstop = async () => {
        stream.getTracks().forEach(t => t.stop());
        clearInterval(recState?.uiTimer);
        clearTimeout(recState?.autoStop);
        recState = null;
        const type = recorder.mimeType || mime || 'audio/webm';
        const blob = new Blob(chunks, { type });
        if (blob.size < 200) {
            renderRecordingsUI();
            showToast('No se grabó nada. Probá de nuevo.', 'error');
            return;
        }
        try {
            await saveRecordingData(id, await blob.arrayBuffer(), type);
            renderRecordingsUI();
            showToast('🎙️ Grabación guardada');
            previewCue(id);
        } catch (e) {
            console.error(e);
            renderRecordingsUI();
            showToast('No se pudo guardar la grabación. Probá de nuevo.', 'error');
        }
    };
    recState = {
        id, recorder,
        startedAt: Date.now(),
        uiTimer: setInterval(updateRecordingCountdown, 200),
        autoStop: setTimeout(() => { if (recorder.state === 'recording') recorder.stop(); }, MAX_RECORDING_MS)
    };
    recorder.start();
    renderRecordingsUI();
}

function updateRecordingCountdown() {
    if (!recState) return;
    const btn = document.querySelector(`.rec-row[data-cue="${recState.id}"] .rec-record`);
    const left = Math.max(0, Math.ceil((MAX_RECORDING_MS - (Date.now() - recState.startedAt)) / 1000));
    if (btn) btn.textContent = `■ Listo (${left})`;
}

function renderRecordingsUI() {
    const box = document.getElementById('recordingsList');
    if (!box) return;
    if (!canRecord()) {
        box.innerHTML = '<p style="color:var(--text-faint); font-size:13px;">Este navegador no permite grabar audio desde la app (hace falta abrirla desde su dirección https, no como archivo).</p>';
        return;
    }
    let html = '';
    let lastGroup = '';
    VOICE_CUES.forEach(cue => {
        if (cue.group !== lastGroup) {
            html += `<div class="settings-subtitle">${cue.group}</div>`;
            lastGroup = cue.group;
        }
        const meta = recordingMeta[cue.id];
        const recording = recState && recState.id === cue.id;
        const status = recording ? 'Grabando… hablá ahora'
            : meta ? `🎙️ Tu grabación (${formatNumber(meta.duration)} s)` : 'Voz del celular';
        html += `<div class="rec-row${recording ? ' recording' : ''}${meta ? ' has-rec' : ''}" data-cue="${cue.id}">
                <div class="rec-info">
                    <div class="rec-label">«${escapeHtml(cue.text)}»</div>
                    <div class="rec-status">${status}</div>
                </div>
                <div class="rec-actions">
                    <button type="button" class="rec-btn rec-record" onclick="toggleRecording('${cue.id}')">${recording ? '■ Listo' : meta ? '● Regrabar' : '● Grabar'}</button>
                    <button type="button" class="rec-btn" onclick="previewCue('${cue.id}')" aria-label="Escuchar «${escapeHtml(cue.text)}»" title="Escuchar">▶</button>
                    <button type="button" class="rec-btn" onclick="removeRecording('${cue.id}')" aria-label="Borrar grabación de «${escapeHtml(cue.text)}»" title="Borrar"${meta ? '' : ' disabled'}>🗑</button>
                </div>
            </div>`;
    });
    box.innerHTML = html;
}
