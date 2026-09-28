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
    return (Math.round(n * 100) / 100).toLocaleString('es-AR');
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

function getMonday(date) {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    const day = d.getDay();
    const diff = day === 0 ? -6 : 1 - day;
    d.setDate(d.getDate() + diff);
    return d;
}

