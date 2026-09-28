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
const MUSCLE_LEVELS = [
    { min: 0, label: 'Sin trabajo' },
    { min: 0.5, label: 'Poco (menos de 6 por semana)' },
    { min: 6, label: 'Moderado (6 a 9)' },
    { min: 10, label: 'Rango ideal (10 a 20)' },
    { min: 20.5, label: 'Mucho (más de 20)' }
];

function muscleLevel(weeklySets) {
    let level = 0;
    MUSCLE_LEVELS.forEach((l, i) => { if (weeklySets >= l.min) level = i; });
    return level;
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
