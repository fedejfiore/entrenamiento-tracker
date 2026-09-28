// Compartir una rutina por link (sin servidor): la rutina viaja codificada en el "#" del
// link (no se envía a ningún servidor). Sirve para que un entrenador le pase una rutina a
// sus alumnos por WhatsApp. Lo que llega de un link es dato externo: se valida y se limpia
// todo antes de usarlo, y nunca se guarda sin que el usuario lo confirme.
// Script clásico (no módulo): comparte el ámbito global con el resto de la app.

const ROUTINE_SHARE_VERSION = 1;
const ROUTINE_SHARE_LIMITS = { maxChars: 12000, maxExercises: 40, maxName: 80 };

function toBase64Url(text) {
    const bytes = new TextEncoder().encode(text);
    let bin = '';
    bytes.forEach(b => { bin += String.fromCharCode(b); });
    return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function fromBase64Url(code) {
    const b64 = code.replace(/-/g, '+').replace(/_/g, '/') + '==='.slice((code.length + 3) % 4);
    const bin = atob(b64);
    return new TextDecoder().decode(Uint8Array.from(bin, c => c.charCodeAt(0)));
}

// Texto seguro: sin caracteres de control, espacios normalizados y largo acotado.
// También se sacan < y > (ningún nombre de rutina o ejercicio los necesita): defensa extra
// contra código escondido en un link, además de que todo se escapa al mostrarse.
function cleanShareText(value, max) {
    return String(value ?? '')
        .replace(/[\u0000-\u001f\u007f-\u009f‪-‮⁦-⁩<>]/g, '')
        .replace(/\s+/g, ' ').trim().slice(0, max);
}

/** Rutina → código para el link. exercises: [{ name, type?, target? }] */
function encodeRoutineShare({ label, exercises }) {
    const payload = {
        v: ROUTINE_SHARE_VERSION,
        n: cleanShareText(label, ROUTINE_SHARE_LIMITS.maxName),
        e: exercises.slice(0, ROUTINE_SHARE_LIMITS.maxExercises).map(ex => {
            const out = { n: cleanShareText(ex.name, ROUTINE_SHARE_LIMITS.maxName) };
            if (ex.type && EXERCISE_TYPES[ex.type]) out.t = ex.type;
            if (ex.target) {
                const { sets, repsMin, repsMax, rest } = ex.target;
                out.g = [sets, repsMin, repsMax, rest];
            }
            return out;
        })
    };
    return toBase64Url(JSON.stringify(payload));
}

/**
 * Código del link → rutina validada, o lanza ValidationError con un mensaje para el usuario.
 * Devuelve { label, exercises: [{ name, type, target }] }.
 */
function decodeRoutineShare(code) {
    const fail = msg => { throw new ValidationError(msg); };
    if (typeof code !== 'string' || !code || code.length > ROUTINE_SHARE_LIMITS.maxChars) fail('El link de la rutina está incompleto o es demasiado largo.');
    if (!/^[A-Za-z0-9_-]+$/.test(code)) fail('El link de la rutina no es válido.');
    let data;
    try { data = JSON.parse(fromBase64Url(code)); } catch (e) { fail('El link de la rutina está dañado.'); }
    if (!data || typeof data !== 'object' || Array.isArray(data)) fail('El link de la rutina no es válido.');
    if (data.v !== ROUTINE_SHARE_VERSION) fail('El link es de otra versión de la app. Actualizá la app y probá de nuevo.');
    const label = cleanShareText(data.n, ROUTINE_SHARE_LIMITS.maxName) || 'Rutina compartida';
    if (!Array.isArray(data.e) || data.e.length === 0) fail('La rutina compartida no tiene ejercicios.');
    const seen = new Set();
    const exercises = [];
    data.e.slice(0, ROUTINE_SHARE_LIMITS.maxExercises).forEach(ex => {
        if (!ex || typeof ex !== 'object') return;
        const name = cleanShareText(ex.n, ROUTINE_SHARE_LIMITS.maxName);
        const key = normalizeForCompare(name);
        if (!name || seen.has(key)) return;
        seen.add(key);
        const type = typeof ex.t === 'string' && EXERCISE_TYPES[ex.t] ? ex.t : null;
        let target = null;
        if (Array.isArray(ex.g)) {
            const [sets, repsMin, repsMax, rest] = ex.g.map(n => Math.round(Number(n)));
            const ok = (n, lo, hi) => Number.isFinite(n) && n >= lo && n <= hi;
            if (ok(sets, 1, 20) && ok(repsMin, 1, 100) && ok(repsMax, repsMin, 100)) {
                target = { sets, repsMin, repsMax, rest: ok(rest, 0, 900) ? rest : 90, inc: 2.5 };
            }
        }
        exercises.push({ name, type, target });
    });
    if (exercises.length === 0) fail('La rutina compartida no tiene ejercicios válidos.');
    return { label, exercises };
}
