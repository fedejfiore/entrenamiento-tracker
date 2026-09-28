// Herramientas de entrenamiento sin pantalla: calculadora de discos, series por músculo
// (para el mapa de músculos) y orden dentro de una superserie.

// ---------- Calculadora de discos ----------

const BAR_OPTIONS = [
    [20, 'Barra olímpica · 20 kg'],
    [15, 'Barra olímpica corta · 15 kg'],
    [10, 'Barra técnica · 10 kg'],
    [7, 'Barra Z (EZ) · 7 kg'],
    [0, 'Sin barra (máquina o solo discos)']
];
const ALL_PLATES = [25, 20, 15, 10, 5, 2.5, 2, 1.25, 1, 0.5];
const DEFAULT_PLATES = [25, 20, 15, 10, 5, 2.5, 1.25];
const PLATE_UNIT = 0.05; // kg: todo se calcula en enteros de 50 g para evitar errores de coma

/**
 * Discos por lado para llegar a `target` con una barra de `bar` kg y los discos disponibles
 * (se asume que hay pares de sobra de cada uno). Busca la combinación con MENOS discos:
 * a diferencia de "siempre el más grande", encuentra solución aunque falten discos
 * (ej. sin el de 5: 30 por lado = 20 + 10, y 40 = 20 + 20 aunque falte el de 25).
 * Si no se puede exacto, devuelve además el peso posible más cercano por debajo y por encima.
 */
function calculatePlates(target, bar, plates) {
    const unit = kg => Math.round(kg / PLATE_UNIT);
    const sizes = [...new Set(plates.filter(p => p > 0))].sort((a, b) => b - a);
    const perSide = (target - bar) / 2;
    if (!(target > 0) || perSide < 0) {
        return { perSide: [], achieved: bar, exact: target === bar, below: null, above: bar, belowBar: target < bar };
    }
    const goal = unit(perSide);
    const maxUnits = goal + (sizes.length ? unit(sizes[sizes.length - 1]) : 0);
    // best[u] = cantidad mínima de discos para sumar u unidades por lado; from[u] = último disco usado
    const best = new Array(maxUnits + 1).fill(Infinity);
    const from = new Array(maxUnits + 1).fill(-1);
    best[0] = 0;
    for (let u = 1; u <= maxUnits; u++) {
        sizes.forEach((p, i) => {
            const pu = unit(p);
            if (pu <= u && best[u - pu] + 1 < best[u]) { best[u] = best[u - pu] + 1; from[u] = i; }
        });
    }
    const rebuild = u => {
        const out = [];
        while (u > 0 && from[u] >= 0) { out.push(sizes[from[u]]); u -= unit(sizes[from[u]]); }
        return out.sort((a, b) => b - a);
    };
    const total = u => Math.round((bar + 2 * u * PLATE_UNIT) * 100) / 100;

    if (best[goal] !== Infinity) {
        return { perSide: rebuild(goal), achieved: total(goal), exact: true, below: null, above: null };
    }
    let lo = goal; while (lo > 0 && best[lo] === Infinity) lo--;
    let hi = goal; while (hi <= maxUnits && best[hi] === Infinity) hi++;
    return {
        perSide: rebuild(lo),
        achieved: total(lo),
        exact: false,
        below: total(lo),
        above: hi <= maxUnits ? total(hi) : null
    };
}

// ---------- Series por músculo (mapa de músculos) ----------

// Series efectivas de un ejercicio guardado: sin calentamiento. Las sesiones viejas (sin
// `sets`) cuentan una serie por cada rep anotada ("12-10-8" = 3 series).
function effectiveSetCount(ex) {
    if (Array.isArray(ex.sets) && ex.sets.length) return ex.sets.filter(s => s && !s.warmup).length;
    const reps = parseRepsList(ex.reps).length;
    return reps || parseWeightList(ex.weight, ex.reps).length;
}

/**
 * Series por grupo muscular entre dos fechas (AAAA-MM-DD, inclusive).
 * @param groupOf nombre de ejercicio → grupo muscular (getMuscleGroup en la app)
 * @returns { [grupo]: { sets, exercises: { [nombre]: series } } }
 */
function muscleSetsByGroup(workouts, fromStr, toStr, groupOf) {
    const out = {};
    (workouts || []).forEach(w => {
        if (!w || w.deletedAt || w.type === 'tabata' || !Array.isArray(w.exercises)) return;
        if (w.date < fromStr || w.date > toStr) return;
        w.exercises.forEach(ex => {
            if (!ex || !ex.name) return;
            const n = effectiveSetCount(ex);
            if (!n) return;
            const group = groupOf(ex.name);
            const g = (out[group] ||= { sets: 0, exercises: {} });
            g.sets += n;
            g.exercises[ex.name] = (g.exercises[ex.name] || 0) + n;
        });
    });
    return out;
}

// Nivel de color según series por semana (el rango habitual para ganar músculo es 10-20).
// La escala es de un solo color: más oscuro / intenso cuanto más se entrenó.
const MUSCLE_LEVELS = [
    { min: 0, label: 'Sin trabajo' },
    { min: 0.5, label: '1 a 5' },
    { min: 6, label: '6 a 9' },
    { min: 10, label: '10 a 15 (rango ideal)' },
    { min: 15.5, label: '16 a 20 (rango ideal)' },
    { min: 20.5, label: 'Más de 20' }
];

const MUSCLE_IDEAL_RANGE = { min: 10, max: 20 };

/**
 * Rango de fechas de cada período del mapa, respetando el día en que empieza la semana.
 * 'week' = semana en curso (hasta hoy), 'lastweek' = la anterior completa, '4w' / '12w' =
 * semanas completas anteriores a la actual. weeks = por cuánto dividir para el promedio.
 */
function muscleMapRange(period, today, weekStartDay = 1) {
    const start = getWeekStart(today, weekStartDay);
    const shift = (d, days) => { const x = new Date(d); x.setDate(x.getDate() + days); return x; };
    if (period === 'week') {
        const dayIndex = Math.round((new Date(today).setHours(0, 0, 0, 0) - start.getTime()) / 86400000);
        return { from: formatDateLocal(start), to: formatDateLocal(today), weeks: 1, inProgress: true, daysLeft: 6 - dayIndex };
    }
    const weeks = period === '12w' ? 12 : period === '4w' ? 4 : 1;
    return { from: formatDateLocal(shift(start, -7 * weeks)), to: formatDateLocal(shift(start, -1)), weeks, inProgress: false, daysLeft: 0 };
}

function muscleLevel(weeklySets) {
    let level = 0;
    MUSCLE_LEVELS.forEach((l, i) => { if (weeklySets >= l.min) level = i; });
    return level;
}

// ---------- Máquinas de placas (poleas) ----------

// Valores típicos de una polea o máquina de placas: sin clavija pesa unos 5 kg (el carro y
// el cable), con la clavija en la primera placa unos 10 kg, y cada placa suma 5 kg.
const DEFAULT_STACK = { empty: 5, first: 10, step: 5, count: 20 };

// Nombres que suelen ser de polea o máquina de placas (se puede cambiar a mano).
function isLikelyStackMachine(name) {
    const n = normalizeForCompare(name || '');
    return /polea|cable|maquina|jalon|pec ?deck|cruce|crossover|face ?pull|extension de (cuadriceps|piernas)|curl femoral|aductor|abductor|remo sentado|remo bajo|tricep(s)? (en )?polea|pullover en polea/.test(n);
}

/**
 * Placa donde va la clavija para acercarse a `target` kg en una máquina de placas.
 * Peso con la clavija en la placa n (1 = la primera): first + (n - 1) * step; sin clavija, empty.
 * Devuelve la placa del peso exacto o, si no hay, las dos más cercanas (abajo y arriba).
 */
function calculateStack(target, stack = DEFAULT_STACK) {
    const { empty, first, step } = { ...DEFAULT_STACK, ...stack };
    const count = Math.max(1, Math.round(stack.count || DEFAULT_STACK.count));
    const weightAt = n => Math.round((n === 0 ? empty : first + (n - 1) * step) * 100) / 100;
    if (!(target > 0) || !(step > 0)) return { pin: 0, achieved: weightAt(0), exact: false, below: null, above: null };
    let pin = 0;
    for (let n = 1; n <= count; n++) if (weightAt(n) <= target + 1e-9) pin = n;
    const achieved = weightAt(pin);
    const exact = Math.abs(achieved - target) < 1e-9;
    const above = !exact && pin < count ? { pin: pin + 1, weight: weightAt(pin + 1) } : null;
    return { pin, achieved, exact, below: exact ? null : { pin, weight: achieved }, above, max: weightAt(count) };
}

// ---------- Superseries ----------

/** Letra de la próxima superserie libre en una rutina: A, B, C… */
function nextSupersetLetter(usedLetters) {
    for (let i = 0; i < 26; i++) {
        const letter = String.fromCharCode(65 + i);
        if (!usedLetters.includes(letter)) return letter;
    }
    return 'Z';
}

/**
 * Dentro de una superserie se encadenan los ejercicios sin descanso y se descansa recién
 * al terminar la vuelta. Dado el orden en pantalla y la letra de cada ejercicio, devuelve
 * el ejercicio que sigue al actual en su superserie, o null si es el último (→ descanso).
 */
function nextInSuperset(orderedNames, letterOf, currentName) {
    const letter = letterOf(currentName);
    if (!letter) return null;
    const members = orderedNames.filter(n => letterOf(n) === letter);
    const i = members.indexOf(currentName);
    return i >= 0 && i < members.length - 1 ? members[i + 1] : null;
}
