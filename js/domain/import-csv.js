// Traer el historial de otras apps (Hevy, Strong, Fitbod) desde su exportación en CSV, y
// exportar el propio a CSV (que esta misma app también importa). Es la barrera número uno
// para cambiarse de app: nadie quiere perder lo que ya registró.
//
// Todo lo que llega de un archivo es dato externo: se valida fila por fila, lo que no se
// entiende se cuenta como error (no se inventa) y nada se guarda sin que la persona lo
// confirme. Las sesiones importadas llevan `importKey`, así importar dos veces el mismo
// archivo no las duplica.
// Script clásico (no módulo): comparte el ámbito global con el resto de la app.

const IMPORT_SOURCES = {
    hevy: 'Hevy',
    strong: 'Strong',
    fitbod: 'Fitbod',
    esoagon: 'Esō Agōn (CSV)'
};
const IMPORT_LIMITS = { maxBytes: 20 * 1024 * 1024, maxRows: 200000, maxName: 80 };
const LB_TO_KG = 0.45359237;
const MILE_TO_KM = 1.609344;

// ---------- CSV ----------

/** Texto CSV → { headers, rows: [{ encabezado normalizado: valor }] }. Detecta , ; o tabulador. */
function parseCsv(text) {
    const s = String(text || '').replace(/^﻿/, '');
    const firstLine = s.slice(0, s.search(/\r?\n|$/));
    const counts = { ',': 0, ';': 0, '\t': 0 };
    let quoted = false;
    for (const ch of firstLine) {
        if (ch === '"') quoted = !quoted;
        else if (!quoted && ch in counts) counts[ch]++;
    }
    const sep = Object.entries(counts).sort((a, b) => b[1] - a[1])[0][1] > 0 ? Object.entries(counts).sort((a, b) => b[1] - a[1])[0][0] : ',';

    const records = [];
    let field = '';
    let record = [];
    let inQuotes = false;
    for (let i = 0; i < s.length; i++) {
        const ch = s[i];
        if (inQuotes) {
            if (ch === '"') {
                if (s[i + 1] === '"') { field += '"'; i++; } else inQuotes = false;
            } else field += ch;
        } else if (ch === '"') inQuotes = true;
        else if (ch === sep) { record.push(field); field = ''; }
        else if (ch === '\n' || ch === '\r') {
            if (ch === '\r' && s[i + 1] === '\n') i++;
            record.push(field); field = '';
            if (record.some(v => v.trim() !== '')) records.push(record);
            record = [];
            if (records.length > IMPORT_LIMITS.maxRows) break;
        } else field += ch;
    }
    record.push(field);
    if (record.some(v => v.trim() !== '')) records.push(record);

    const headers = (records.shift() || []).map(h => h.trim().toLowerCase());
    const rows = records.map(r => {
        const o = {};
        headers.forEach((h, i) => { o[h] = (r[i] ?? '').trim(); });
        return o;
    });
    return { headers, rows };
}

/** Celda CSV: entre comillas si hace falta. */
function csvCell(v) {
    const s = String(v ?? '');
    return /[",\n\r;]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

/** ¿De qué app es el archivo? Por los encabezados. */
function detectCsvSource(headers) {
    const has = h => headers.includes(h);
    if (has('exercise_title') && has('start_time')) return 'hevy';
    if (has('exercise name') && has('set order')) return 'strong';
    if (has('exercise') && has('reps') && headers.some(h => h.startsWith('weight('))) return 'fitbod';
    if (has('fecha') && has('ejercicio') && has('peso (kg)')) return 'esoagon';
    return null;
}

// ---------- Fechas y números ----------

const IMPORT_MONTHS = { jan: 1, ene: 1, feb: 2, mar: 3, apr: 4, abr: 4, may: 5, jun: 6, jul: 7, aug: 8, ago: 8, sep: 9, set: 9, oct: 10, nov: 11, dec: 12, dic: 12 };

/**
 * "2024-09-30 18:05:00", "30 Sep 2024, 18:05", "30/9/2024" → { date: 'AAAA-MM-DD', time: 'HH:MM' | null } o null.
 * Con barras, si el primer número pasa de 12 es el día; si no, se toma día/mes (como en Argentina)
 * salvo que `monthFirst` diga lo contrario.
 */
function parseImportDate(str, { monthFirst = false } = {}) {
    const s = String(str || '').trim();
    const pad = n => String(n).padStart(2, '0');
    const ok = (y, m, d) => y >= 1990 && y <= 2100 && m >= 1 && m <= 12 && d >= 1 && d <= 31;
    const out = (y, m, d, hh, mm) => ok(y, m, d) ? { date: `${y}-${pad(m)}-${pad(d)}`, time: hh != null ? `${pad(hh)}:${pad(mm)}` : null } : null;
    let m = s.match(/^(\d{4})-(\d{1,2})-(\d{1,2})(?:[ T](\d{1,2}):(\d{2}))?/);
    if (m) return out(+m[1], +m[2], +m[3], m[4] != null ? +m[4] : null, m[5]);
    m = s.match(/^(\d{1,2})\s+([A-Za-zé]{3,})\.?\s+(\d{4})(?:,?\s+(\d{1,2}):(\d{2}))?/);
    if (m) {
        const month = IMPORT_MONTHS[normalizeForCompare(m[2]).slice(0, 3)];
        return month ? out(+m[3], month, +m[1], m[4] != null ? +m[4] : null, m[5]) : null;
    }
    m = s.match(/^([A-Za-z]{3,})\.?\s+(\d{1,2}),?\s+(\d{4})(?:,?\s+(\d{1,2}):(\d{2}))?/);
    if (m) {
        const month = IMPORT_MONTHS[normalizeForCompare(m[1]).slice(0, 3)];
        return month ? out(+m[3], month, +m[2], m[4] != null ? +m[4] : null, m[5]) : null;
    }
    m = s.match(/^(\d{1,2})[/.](\d{1,2})[/.](\d{4})(?:,?\s+(\d{1,2}):(\d{2}))?/);
    if (m) {
        let [a, b] = [+m[1], +m[2]];
        const swap = a > 12 ? false : b > 12 ? true : monthFirst;
        const [d, mo] = swap ? [b, a] : [a, b];
        return out(+m[3], mo, d, m[4] != null ? +m[4] : null, m[5]);
    }
    return null;
}

function importNumber(v) {
    const n = parseDecimal(String(v ?? '').replace(/[^\d.,-]/g, ''));
    return n != null && isFinite(n) && n >= 0 ? n : null;
}

/** RPE (6 a 10) → reps en reserva (F, 1, 2, 3, 4+) como las guarda la app. */
function rpeToRir(rpe) {
    const n = importNumber(rpe);
    if (n == null || n < 1 || n > 10) return '';
    return String(Math.max(0, Math.min(4, Math.round(10 - n))));
}

/** "1h 5m", "45m", "3600" (segundos) → minutos, o null. */
function importDurationMinutes(v) {
    const s = String(v || '').trim().toLowerCase();
    if (!s) return null;
    if (/^\d+$/.test(s)) return Math.round(+s / 60);
    const h = s.match(/(\d+)\s*h/);
    const m = s.match(/(\d+)\s*m(?!s)/);
    if (!h && !m) return null;
    return (h ? +h[1] * 60 : 0) + (m ? +m[1] : 0);
}

// ---------- Filas de cada app → filas comunes ----------
// Fila común: { date, time, title, key, exercise, warmup, kg, reps, seconds, km, rir, note, workoutNote, durationMin }

function importRowsFrom(source, rows, { weightUnit = 'kg', monthFirst = false } = {}) {
    const out = [];
    const errors = [];
    rows.forEach((r, i) => {
        let row = null;
        if (source === 'hevy') {
            const d = parseImportDate(r.start_time, { monthFirst });
            const kgCol = r.weight_kg !== undefined ? importNumber(r.weight_kg) : importNumber(r.weight_lbs) != null ? importNumber(r.weight_lbs) * LB_TO_KG : null;
            const km = r.distance_km !== undefined ? importNumber(r.distance_km) : importNumber(r.distance_miles) != null ? importNumber(r.distance_miles) * MILE_TO_KM : null;
            const end = parseImportDate(r.end_time, { monthFirst });
            let durationMin = null;
            if (d?.time && end?.time && d.date === end.date) {
                const [h1, m1] = d.time.split(':').map(Number), [h2, m2] = end.time.split(':').map(Number);
                durationMin = Math.max(0, h2 * 60 + m2 - h1 * 60 - m1);
            }
            row = d && { date: d.date, time: d.time, title: r.title, key: `${r.start_time}|${r.title}`, exercise: r.exercise_title,
                warmup: /warm/i.test(r.set_type || ''), kg: kgCol, reps: importNumber(r.reps), seconds: importNumber(r.duration_seconds), km,
                rir: rpeToRir(r.rpe), note: r.exercise_notes, workoutNote: r.description, durationMin };
        } else if (source === 'strong') {
            const d = parseImportDate(r.date, { monthFirst });
            const unit = /lb/i.test(r['weight unit'] || '') ? 'lb' : /kg/i.test(r['weight unit'] || '') ? 'kg' : weightUnit;
            const w = importNumber(r.weight);
            const dist = importNumber(r.distance);
            const distMiles = /mi/i.test(r['distance unit'] || '') || (!r['distance unit'] && unit === 'lb');
            row = d && { date: d.date, time: d.time, title: r['workout name'], key: `${r.date}|${r['workout name']}`, exercise: r['exercise name'],
                warmup: /^w/i.test(r['set order'] || ''), kg: w != null ? (unit === 'lb' ? w * LB_TO_KG : w) : null, reps: importNumber(r.reps),
                seconds: importNumber(r.seconds), km: dist != null ? (distMiles ? dist * MILE_TO_KM : dist) : null,
                rir: rpeToRir(r.rpe), note: r.notes, workoutNote: r['workout notes'], durationMin: importDurationMinutes(r.duration) };
        } else if (source === 'fitbod') {
            const d = parseImportDate(r.date, { monthFirst });
            const wKey = Object.keys(r).find(h => h.startsWith('weight('));
            const w = importNumber(r[wKey]);
            const distM = importNumber(r['distance(m)']);
            row = d && { date: d.date, time: d.time, title: 'Fitbod', key: r.date, exercise: r.exercise,
                warmup: /true|1|yes/i.test(r.iswarmup || ''), kg: w != null ? (/lb/.test(wKey) ? w * LB_TO_KG : w) : null, reps: importNumber(r.reps),
                seconds: importNumber(r['duration(s)']), km: distM != null ? distM / 1000 : null, rir: '', note: r.note, workoutNote: '', durationMin: null };
        } else if (source === 'esoagon') {
            const d = parseImportDate(r.fecha);
            row = d && { date: d.date, time: r.hora || null, title: r['sesión'] || r.sesion, key: `${r.fecha}|${r.hora}|${r['sesión'] || r.sesion}`, exercise: r.ejercicio,
                warmup: /^s/i.test(r.calentamiento || ''), kg: importNumber(r['peso (kg)']), reps: importNumber(r.reps), seconds: importNumber(r['tiempo (s)']),
                km: importNumber(r['distancia (km)']), rir: /^[0-4]$/.test(r.rir || '') ? r.rir : '', note: r.nota, workoutNote: '', durationMin: importNumber(r['duración (min)']) };
        }
        if (!row) { errors.push(`Fila ${i + 2}: fecha no reconocida`); return; }
        row.exercise = cleanShareText(row.exercise, IMPORT_LIMITS.maxName);
        if (!row.exercise) { errors.push(`Fila ${i + 2}: falta el ejercicio`); return; }
        if (!(row.kg > 0 || row.reps > 0 || row.seconds > 0 || row.km > 0)) return; // fila vacía (ej. ejercicio sin series)
        out.push(row);
    });
    return { rows: out, errors };
}

// ---------- Filas comunes → sesiones de la app ----------

const roundStr = (n, d = 3) => String(Math.round(n * 10 ** d) / 10 ** d);

function importExerciseType(sets) {
    if (sets.some(s => s.kg > 0)) return 'kg';
    if (sets.some(s => s.km > 0)) return 'km';
    if (sets.some(s => s.reps > 0)) return 'bw';
    return 'time';
}

/**
 * Agrupa las filas en sesiones con el mismo formato que guarda la app (series, textos viejos
 * para récords y gráficos, volumen). existingKeys: importKey ya importados (no se repiten).
 */
function buildImportedWorkouts(source, rows, existingKeys = new Set()) {
    const bySession = new Map();
    rows.forEach(r => {
        const key = `${source}|${r.key}`;
        if (!bySession.has(key)) bySession.set(key, { key, first: r, exercises: new Map() });
        const ses = bySession.get(key);
        if (!ses.exercises.has(r.exercise)) ses.exercises.set(r.exercise, { rows: [], note: r.note || '' });
        const ex = ses.exercises.get(r.exercise);
        ex.rows.push(r);
        if (!ex.note && r.note) ex.note = r.note; // la nota suele venir en una sola fila
    });
    const workouts = [];
    let skipped = 0;
    let idBase = Date.now();
    [...bySession.values()].sort((a, b) => (a.first.date + (a.first.time || '')).localeCompare(b.first.date + (b.first.time || ''))).forEach(ses => {
        if (existingKeys.has(ses.key)) { skipped++; return; }
        const exercises = [...ses.exercises.entries()].map(([name, ex]) => {
            const type = importExerciseType(ex.rows);
            const sets = ex.rows.map(r => {
                const set = {};
                if (r.reps > 0) set.reps = String(Math.round(r.reps));
                if (type === 'kg' && r.kg > 0) set.kg = roundStr(r.kg);
                if (type === 'km' && r.km > 0) set.km = roundStr(r.km);
                if ((type === 'time' || type === 'km') && r.seconds > 0) set.time = formatSecondsClock(Math.round(r.seconds));
                if (r.rir) set.effort = r.rir;
                if (r.warmup) set.warmup = true;
                set.done = true;
                return set;
            });
            return new ExerciseLog({ name, type, sets, note: cleanShareText(ex.note, 300) }).toJSON();
        });
        const f = ses.first;
        const workout = {
            id: idBase++,
            uid: generateId(),
            date: f.date,
            routine: cleanShareText(f.title, IMPORT_LIMITS.maxName) || IMPORT_SOURCES[source],
            exercises,
            mood: 3,
            notes: cleanShareText(f.workoutNote, 500),
            volume: Math.round(calculateSessionVolume(exercises)),
            importedFrom: source,
            importKey: ses.key,
            updatedAt: new Date().toISOString()
        };
        if (f.durationMin) workout.duration = f.durationMin;
        if (f.time) workout.startTime = `${f.date}T${f.time}:00`;
        WorkoutSession.validate(workout, `Sesión del ${f.date}`);
        workouts.push(workout);
    });
    return { workouts, skipped };
}

/** Archivo CSV de otra app → resumen para confirmar y las sesiones listas para guardar. */
function prepareCsvImport(text, { weightUnit = 'kg', monthFirst = false, existingKeys = new Set() } = {}) {
    if (String(text || '').length > IMPORT_LIMITS.maxBytes) throw new ValidationError('El archivo es demasiado grande (más de 20 MB).');
    const { headers, rows } = parseCsv(text);
    const source = detectCsvSource(headers);
    if (!source) throw new ValidationError('No reconozco el archivo. Tiene que ser la exportación en CSV de Hevy, Strong o Fitbod (o la de esta app).');
    const parsed = importRowsFrom(source, rows, { weightUnit, monthFirst });
    const { workouts, skipped } = buildImportedWorkouts(source, parsed.rows, existingKeys);
    const exerciseNames = new Set();
    let sets = 0;
    workouts.forEach(w => w.exercises.forEach(e => { exerciseNames.add(e.name); sets += e.sets.length; }));
    const dates = workouts.map(w => w.date).sort();
    return { source, label: IMPORT_SOURCES[source], workouts, skipped, errors: parsed.errors, sets, exercises: [...exerciseNames], from: dates[0] || null, to: dates[dates.length - 1] || null };
}

// ---------- Exportar ----------

const EXPORT_CSV_HEADERS = ['Fecha', 'Hora', 'Sesión', 'Ejercicio', 'Serie', 'Calentamiento', 'Reps', 'Peso (kg)', 'Tiempo (s)', 'Distancia (km)', 'RIR', 'Nota', 'Duración (min)'];

/** Historial → CSV (para planillas u otras apps; esta app también lo importa). */
function workoutsToCsv(workouts, labelOf = key => key) {
    const lines = [EXPORT_CSV_HEADERS.join(',')];
    (workouts || []).filter(w => w && !w.deletedAt && w.type !== 'tabata' && Array.isArray(w.exercises))
        .slice().sort((a, b) => (a.date || '').localeCompare(b.date || ''))
        .forEach(w => {
            const time = /T(\d{2}:\d{2})/.exec(w.startTime || '')?.[1] || '';
            w.exercises.forEach(e => {
                const sets = Array.isArray(e.sets) && e.sets.length ? e.sets : setsFromLegacy(e, e.type || 'kg');
                let n = 0;
                sets.forEach(s => {
                    if (!s) return;
                    const secs = s.time ? parseTimeSeconds(s.time) : null;
                    lines.push([w.date, time, labelOf(w.routine), e.name, s.warmup ? 'C' : String(++n), s.warmup ? 'Sí' : 'No',
                        s.reps || '', s.kg ? String(parseDecimal(s.kg)) : '', secs ?? '', s.km ? String(parseDecimal(s.km)) : '',
                        /^[0-4]$/.test(s.effort || '') ? s.effort : '', s.note || '', w.duration ?? ''].map(csvCell).join(','));
                });
            });
        });
    return lines.join('\r\n') + '\r\n';
}
