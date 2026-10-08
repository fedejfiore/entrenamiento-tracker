// Formato viejo de las sesiones ("12-10-8"): lectura tolerante y escritura compatible.
// Script clásico (no módulo): comparte el ámbito global con el resto de la app.

// Las sesiones viejas guardan cada columna como texto ("12-10-8", "50-55-60",
// "90s"). Cada usuario pudo haber tipeado distinto, así que se acepta cualquier
// separador razonable sin perder el orden de las series.

// Reps (siempre enteras): cualquier cosa que no sea un número separa series.
// "12-10-8" = "12,10,8" = "12 10 8" = "12/10/8"; "4x12" = 4 series de 12.
function parseRepsList(str) {
    const s = String(str ?? '').trim().toLowerCase();
    if (!s) return [];
    const nx = s.match(/^(\d+)\s*[x×*]\s*(\d+)$/);
    if (nx) return Array(Math.min(parseInt(nx[1], 10), 50)).fill(parseInt(nx[2], 10));
    return s.split(/\D+/).filter(Boolean).map(n => parseInt(n, 10));
}

// Pesos: "-", ";", "/", "+", "|" o espacios separan series; coma o punto es decimal.
// Caso ambiguo sin otro separador ("50,55"): son dos series solo si hay esa misma
// cantidad de series en reps, la parte decimal tiene 2+ dígitos y los dos números
// se parecen (50 y 55 sí; 22 y 5 no → 22,5 kg). Varias comas = lista ("50,55,60").
function parseWeightList(str, repsStr) {
    const s = String(str ?? '').trim().toLowerCase().replace(/kgs?|kilos?/g, ' ').trim();
    if (!s) return [];
    let parts;
    if (/[-;\/|+]/.test(s) || /\d\s+\d/.test(s)) {
        parts = s.split(/[-;\/|+]|\s+/);
    } else {
        const seps = s.match(/[.,]/g) || [];
        if (seps.length > 1) {
            parts = s.split(/[.,]/);
        } else if (seps.length === 1) {
            const [a, b] = s.split(/[.,]/);
            const na = parseFloat(a), nb = parseFloat(b);
            const setsInReps = parseRepsList(repsStr).length;
            const looksLikeTwoSets = setsInReps === 2 && b.length >= 2 && nb >= na * 0.5 && nb <= na * 2;
            parts = looksLikeTwoSets ? [a, b] : [s];
        } else {
            parts = [s];
        }
    }
    return parts.map(p => parseDecimal(p.replace(/[^\d.,]/g, ''))).filter(n => n != null);
}

// Pausas en segundos: "90", "90s", "1:30", "2m" / "2min"; separadas igual que las reps.
function parsePauseList(str) {
    const s = String(str ?? '').trim().toLowerCase();
    if (!s) return [];
    return s.split(/[-;\/|+,\s]+/).filter(Boolean).map(p => {
        if (p.includes(':')) return parseTimeSeconds(p);
        const n = parseDecimal(p.replace(/[^\d.]/g, ''));
        if (n == null) return null;
        return /m/.test(p) && !/ms/.test(p) ? Math.round(n * 60) : Math.round(n);
    }).filter(n => n != null);
}

// Convierte el formato viejo ("15-15-15" en reps, "50-50" en peso, "90-90" en pausa)
// a una lista de series. Si hay menos pesos que reps, el último peso se repite.
function setsFromLegacy(ex, type) {
    const reps = parseRepsList(ex.reps).map(String);
    const weights = parseWeightList(ex.weight, ex.reps).map(String);
    const pauses = parsePauseList(ex.pause).map(String);
    const pick = (arr, i) => arr.length === 0 ? '' : (arr[i] ?? arr[arr.length - 1]);

    if (isCardioType(type)) {
        // Cardio / fútbol viejo: "peso" guardaba minutos (o km) y "reps" la intensidad.
        if (weights.length === 0) return [];
        const effort = LEGACY_INTENSITY_TO_EFFORT[normalizeForCompare(ex.reps || '')] || '';
        // Si "reps" son números (ej. Bici "1-1" con peso "9"), cada uno es una vuelta
        // y el valor se repite: 2 series de 9 km. Con texto ("alta") es una sola.
        const rounds = reps.length;
        const count = Math.max(weights.length, rounds);
        return Array.from({ length: count }, (_, i) => pick(weights, i)).map((w, i) => type === 'km'
            ? { km: w, rest: pick(pauses, i), effort }
            : { time: formatTimeValue(w), rest: pick(pauses, i), effort });
    }

    const count = Math.max(reps.length, weights.length);
    return Array.from({ length: count }, (_, i) => ({
        reps: reps[i] || '',
        kg: type === 'kg' ? pick(weights, i) : '',
        rest: pick(pauses, i)
    }));
}

// Además de `sets`, se guardan los strings viejos ("12-10-8") para ejercicios de
// fuerza: PRs, volumen, 1RM, gráficos y el historial anterior siguen leyendo eso.
// Las series de calentamiento quedan afuera, así no inflan volumen ni récords.
function legacyStringsFromSets(sets, type) {
    const work = sets.filter(s => !s.warmup);
    const pause = work.map(s => s.rest).filter(Boolean).join('-');
    if (type !== 'kg' && type !== 'bw' && type !== 'pilates' && type !== 'springs') return { reps: '', weight: '', pause };
    const withReps = work.filter(s => s.reps);
    const hasKg = type === 'kg' && withReps.some(s => s.kg);
    return {
        reps: withReps.map(s => s.reps).join('-'),
        weight: hasKg ? withReps.map(s => s.kg || '0').join('-') : '',
        pause
    };
}

