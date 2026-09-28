// Tiempos: unidades de carga (seg, m:ss, min, h:mm), forma guardada y textos legibles.
// Script clásico (no módulo): comparte el ámbito global con el resto de la app.

function formatDuration(value) {
    // Solo números: la duración puede venir de un backup (dato externo) y se muestra como HTML.
    const minutes = Math.round(Number(value));
    if (value == null || !Number.isFinite(minutes)) return null;
    if (minutes < 60) return `${minutes} min`;
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return `${h}h ${m}min`;
}

function formatTimeHM(ts) {
    return new Date(ts).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' });
}

// Se guarda siempre igual ("m:ss" o "h:mm:ss"); lo que cambia es cómo se CARGA,
// según la unidad que cada uno prefiera para cada ejercicio (se cambia tocando el
// encabezado de la columna):
//   seg → segundos                               "45"
//   mss → minutos:segundos, tipo microondas      "145" → 1:45
//   min → minutos, con coma o punto              "60", "32,5"
//   hmm → horas:minutos, tipo microondas         "105" → 1:05
const TIME_UNITS = {
    seg: { head: 'Seg', label: 'segundos', inputmode: 'numeric', hint: 's' },
    mss: { head: 'm:ss', label: 'minutos:segundos', inputmode: 'numeric', hint: 'm:ss' },
    min: { head: 'Min', label: 'minutos', inputmode: 'decimal', hint: 'min' },
    hmm: { head: 'h:mm', label: 'horas:minutos', inputmode: 'numeric', hint: 'h:mm' }
};

const TIME_UNIT_ORDER = ['seg', 'mss', 'min', 'hmm'];

const DEFAULT_TIME_UNIT_BY_TYPE = { time: 'mss', min: 'min', km: 'min' };

// Botones de ajuste rápido del tiempo, en segundos, según la unidad.
const TIME_STEPS = {
    seg: [-15, -5, 5, 15],
    mss: [-60, -15, 15, 60],
    min: [-300, -60, 60, 300],
    hmm: [-900, -300, 300, 900]
};

// Forma guardada -> segundos. Un número suelto (fútbol viejo "60") son minutos.
function parseTimeSeconds(str) {
    const s = String(str || '').trim();
    if (!s) return null;
    if (!s.includes(':')) {
        const min = parseDecimal(s);
        return min == null ? null : Math.round(min * 60);
    }
    const parts = s.split(':').map(x => parseInt(x, 10) || 0);
    return parts.reduce((acc, p) => acc * 60 + p, 0);
}

// Lo que se tipeó en un campo -> segundos, según la unidad de ese campo.
function parseTimeInput(raw, unit) {
    let s = String(raw ?? '').trim();
    if (!s) return null;
    if (unit === 'seg') {
        const n = parseDecimal(s.replace(/[^\d.,]/g, ''));
        return n == null ? null : Math.round(n);
    }
    if (unit === 'min' && !s.includes(':')) {
        const n = parseDecimal(s);
        return n == null ? null : Math.round(n * 60);
    }
    if (!s.includes(':')) s = formatTimeDigits(s);
    const p = s.split(':').map(x => parseInt(x, 10) || 0);
    if (p.length >= 3) return p[0] * 3600 + p[1] * 60 + p[2];
    return unit === 'hmm' ? p[0] * 3600 + p[1] * 60 : p[0] * 60 + p[1];
}

// Segundos -> cómo se muestra dentro del campo, según la unidad.
function formatTimeForUnit(sec, unit) {
    if (sec == null || isNaN(sec)) return '';
    sec = Math.max(0, Math.round(sec));
    const pad = n => String(n).padStart(2, '0');
    if (unit === 'seg') return String(sec);
    if (unit === 'min') return String(Math.round(sec / 60 * 100) / 100).replace('.', ',');
    if (unit === 'hmm') {
        const totalMin = Math.round(sec / 60);
        return `${Math.floor(totalMin / 60)}:${pad(totalMin % 60)}`;
    }
    return `${Math.floor(sec / 60)}:${pad(sec % 60)}`;
}

function timeInputValue(saved, unit) {
    return formatTimeForUnit(parseTimeSeconds(saved), unit);
}

function formatSecondsClock(total) {
    if (total == null || isNaN(total)) return '';
    total = Math.max(0, Math.round(total));
    const h = Math.floor(total / 3600);
    const m = Math.floor((total % 3600) / 60);
    const s = String(total % 60).padStart(2, '0');
    return h > 0 ? `${h}:${String(m).padStart(2, '0')}:${s}` : `${m}:${s}`;
}

// Mientras se tipea: los dígitos entran por la derecha, como en un microondas.
// "4" → "0:04", "45" → "0:45", "145" → "1:45". Sirve para m:ss y para h:mm.
function formatTimeDigits(raw) {
    const digits = String(raw || '').replace(/\D/g, '').replace(/^0+/, '').slice(0, 6);
    if (!digits) return '';
    const padded = digits.padStart(3, '0');
    return `${parseInt(padded.slice(0, -2), 10)}:${padded.slice(-2)}`;
}

// Forma guardada: siempre "m:ss" (o "h:mm:ss" desde una hora).
function formatTimeValue(v) {
    const sec = parseTimeSeconds(v);
    return sec == null ? '' : formatSecondsClock(sec);
}

// Para leer: la forma más simple, siempre con unidades.
// "45 s", "1 min 30 s", "32 min", "1 h", "1 h 05 min", "1 h 05 min 30 s".
function formatDurationHuman(sec) {
    if (sec == null) return '';
    sec = Math.round(sec);
    const h = Math.floor(sec / 3600);
    const m = Math.floor((sec % 3600) / 60);
    const sc = sec % 60;
    const pad = n => String(n).padStart(2, '0');
    if (h) return `${h} h${m ? ` ${pad(m)} min` : ''}${sc ? ` ${pad(sc)} s` : ''}`;
    if (m) return `${m} min${sc ? ` ${pad(sc)} s` : ''}`;
    return `${sc} s`;
}

// km/h a partir de segundos y km (null si falta alguno).
function computeSpeed(sec, km) {
    return sec > 0 && km > 0 ? km / (sec / 3600) : null;
}

// Descanso: "90" = 90 segundos (acá sí, un número suelto son segundos).
function parseRestSeconds(str) {
    const s = String(str || '').trim();
    if (!s) return null;
    if (s.includes(':')) return parseTimeSeconds(s);
    const n = parseInt(s.replace(/\D/g, ''), 10);
    return isNaN(n) ? null : n;
}

