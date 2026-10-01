// Utilidades generales sin estado: HTML seguro, texto, fechas y números.
// Script clásico (no módulo): comparte el ámbito global con el resto de la app.

// Lee el valor actual de una variable CSS del tema activo, para que los colores
// generados por JS (gráficos de Chart.js, principalmente) se adapten a oscuro/claro.
function cssVar(name) {
    return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}

function getLocalDateString() {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

function escapeHtml(str) {
    return String(str ?? '').replace(/[&<>"']/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]));
}

// "22,5", "22.5" → 22.5. Punto o coma, lo que traiga el teclado.
function parseDecimal(v) {
    const n = parseFloat(String(v ?? '').trim().replace(',', '.'));
    return isNaN(n) ? null : n;
}

// Normaliza para guardar: coma → punto, sin separador colgando ("22," → "22").
function normalizeDecimalString(v) {
    const n = parseDecimal(v);
    return n == null ? '' : String(n);
}

// Filtra lo que se tipea en un campo decimal: dígitos y UN separador (. o ,).
function sanitizeDecimalInput(v) {
    const s = String(v || '').replace(/[^\d.,]/g, '');
    const i = s.search(/[.,]/);
    return i < 0 ? s : s.slice(0, i + 1) + s.slice(i + 1).replace(/[.,]/g, '');
}

function formatNumber(n) {
    return (Math.round(n * 100) / 100).toLocaleString((typeof appLocale === 'function' ? appLocale() : 'es-AR'));
}

function youtubeSearchUrl(query) {
    return 'https://www.youtube.com/results?search_query=' + encodeURIComponent(query + ' técnica ejercicio');
}

const ACCENT_MAP = { 'á': 'a', 'é': 'e', 'í': 'i', 'ó': 'o', 'ú': 'u', 'ü': 'u', 'ñ': 'n' };

function normalizeForCompare(name) {
    return name
        .trim()
        .toLowerCase()
        .replace(/[áéíóúüñ]/g, ch => ACCENT_MAP[ch])
        .replace(/\s+/g, ' ');
}

function formatDateLocal(d) {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

// Primer día de la semana que contiene a date. startDay: 0 = domingo, 1 = lunes, 6 = sábado.
function getWeekStart(date, startDay = 1) {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() - ((d.getDay() - startDay + 7) % 7));
    return d;
}

function getMonday(date) {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    const day = d.getDay();
    const diff = day === 0 ? -6 : 1 - day;
    d.setDate(d.getDate() + diff);
    return d;
}

// Id único universal (UUID v4) para identificar registros entre dispositivos y una base
// de datos. crypto.randomUUID solo existe en contexto seguro (https); si no, se arma a mano.
function generateId() {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID();
    const bytes = new Uint8Array(16);
    if (typeof crypto !== 'undefined' && crypto.getRandomValues) crypto.getRandomValues(bytes);
    else for (let i = 0; i < 16; i++) bytes[i] = Math.floor(Math.random() * 256);
    bytes[6] = (bytes[6] & 0x0f) | 0x40;
    bytes[8] = (bytes[8] & 0x3f) | 0x80;
    const hex = [...bytes].map(b => b.toString(16).padStart(2, '0')).join('');
    return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

// Binario <-> texto base64 (el audio viaja así dentro del backup JSON).
function arrayBufferToBase64(buf) {
    const bytes = new Uint8Array(buf);
    let bin = '';
    for (let i = 0; i < bytes.length; i += 0x8000) bin += String.fromCharCode.apply(null, bytes.subarray(i, i + 0x8000));
    return btoa(bin);
}

function base64ToArrayBuffer(b64) {
    const bin = atob(b64);
    const bytes = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
    return bytes.buffer;
}

