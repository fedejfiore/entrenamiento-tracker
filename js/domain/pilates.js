// Pilates: resortes del reformer, "Mi reformer" y récords. Sin pantalla: se prueba en
// tests/pilates.test.js. El catálogo de ejercicios está en js/domain/pilates-catalog.js.
// Script clásico (no módulo): comparte el ámbito global con el resto de la app.
//
// Resortes: cada serie guarda los resortes como los colores que se ven en la máquina
// ("🔴🔴🔵" = dos rojos y un azul). Un color se puede repetir: hay reformers con varios
// resortes iguales. Cada color tiene una carga relativa (100 = un resorte completo) que
// depende de la marca: eso es "Mi reformer", y sirve para comparar y para sugerir.

const SPRING_COLORS = [
    ['🔴', 'Rojo'], ['🔵', 'Azul'], ['🟡', 'Amarillo'], ['🟢', 'Verde'], ['⚪', 'Blanco'],
    ['🟣', 'Violeta'], ['🟠', 'Naranja'], ['⚫', 'Negro'], ['🟤', 'Marrón']
];
const SPRING_LOADS = [[25, 'Muy liviano'], [50, 'Liviano'], [75, 'Medio'], [100, 'Completo'], [125, 'Muy pesado']];

// Puntos de partida por marca (aproximados: cada equipo puede variar, por eso se editan).
const REFORMER_PRESETS = {
    bb: { name: 'Balanced Body', springs: [{ color: '🔴', load: 100, count: 3 }, { color: '🔵', load: 50, count: 1 }, { color: '🟡', load: 25, count: 1 }, { color: '🟢', load: 125, count: 0 }] },
    merrithew: { name: 'Merrithew (STOTT)', springs: [{ color: '🔴', load: 100, count: 3 }, { color: '🔵', load: 50, count: 1 }, { color: '⚪', load: 25, count: 1 }] },
    peak: { name: 'Peak Pilates', springs: [{ color: '🔴', load: 100, count: 1 }, { color: '🟡', load: 75, count: 2 }, { color: '🔵', load: 50, count: 2 }] },
    otro: { name: 'Otro / mi equipo', springs: [{ color: '🔴', load: 100, count: 3 }, { color: '🔵', load: 50, count: 1 }, { color: '🟡', load: 25, count: 1 }] }
};
const DEFAULT_REFORMER = { brand: 'bb', springs: REFORMER_PRESETS.bb.springs };

/** Reformer guardado, validado (si no hay o está roto, el de Balanced Body). */
function normalizeReformer(saved) {
    const springs = Array.isArray(saved?.springs) ? saved.springs
        .filter(s => s && SPRING_COLORS.some(([c]) => c === s.color))
        .map(s => ({ color: s.color, load: Number(s.load) > 0 ? Math.min(300, Number(s.load)) : 100, count: Math.max(0, Math.min(9, parseInt(s.count, 10) || 0)) }))
        : [];
    const unique = springs.filter((s, i) => springs.findIndex(t => t.color === s.color) === i);
    if (!unique.length) return { ...DEFAULT_REFORMER, springs: DEFAULT_REFORMER.springs.map(s => ({ ...s })) };
    return { brand: REFORMER_PRESETS[saved.brand] ? saved.brand : 'otro', springs: unique };
}

/** "🔴🔴🔵" → ['🔴','🔴','🔵']. Ignora lo que no sea un color de resorte. "0" = sin resortes. */
function parseSprings(value) {
    const s = String(value || '').replace(/️/g, '');
    return Array.from(s).filter(ch => SPRING_COLORS.some(([c]) => c === ch));
}

function springsLoad(value, reformer) {
    const loads = Object.fromEntries(normalizeReformer(reformer).springs.map(s => [s.color, s.load]));
    return parseSprings(value).reduce((sum, c) => sum + (loads[c] || 0), 0);
}

/** Ordena los resortes de más pesado a más liviano, como se suelen enganchar. */
function sortSprings(value, reformer) {
    const order = normalizeReformer(reformer).springs.map(s => s.color);
    return parseSprings(value).sort((a, b) => order.indexOf(a) - order.indexOf(b)).join('');
}

function springLevelLabel(load) {
    if (load <= 0) return 'Sin resortes';
    // 100 = un resorte completo. El footwork suele ir con 3 o 4 completos (pesado).
    if (load <= 50) return 'Liviano';
    if (load <= 150) return 'Medio';
    if (load <= 300) return 'Pesado';
    return 'Muy pesado';
}

/**
 * Combinación de resortes de MI reformer que más se acerca a una carga objetivo (100 = un
 * resorte completo), sin pasarse de los que tiene la máquina. Prefiere menos resortes.
 */
function suggestSprings(target, reformer) {
    if (!(target > 0)) return '';
    const springs = normalizeReformer(reformer).springs.filter(s => s.count > 0).sort((a, b) => b.load - a.load);
    let best = { diff: Infinity, n: Infinity, combo: [] };
    const walk = (i, load, combo) => {
        const diff = Math.abs(target - load);
        if (combo.length && (diff < best.diff - 1e-9 || (Math.abs(diff - best.diff) < 1e-9 && combo.length < best.n))) best = { diff, n: combo.length, combo: [...combo] };
        if (i >= springs.length || combo.length >= 6) return;
        for (let k = 0; k <= springs[i].count; k++) {
            walk(i + 1, load + k * springs[i].load, [...combo, ...Array(k).fill(springs[i].color)]);
        }
    };
    walk(0, 0, []);
    return best.combo.join('');
}

// ---- Estadísticas y récords ----
// En pilates "más" no siempre es "mejor": en algunos ejercicios menos resorte es más difícil
// (estabilidad, control). Cada ejercicio del catálogo dice hacia dónde va la dificultad:
//   up      más resorte = más difícil (ej. footwork, remos)
//   down    menos resorte = más difícil (ej. long stretch, rodillas)
//   control el resorte no es la meta: se progresa en reps y dominio

function pilatesDirection(name) {
    return (typeof pilatesExerciseInfo === 'function' && pilatesExerciseInfo(name)?.dir) || 'up';
}

/** ¿La carga a es más difícil que b para ese ejercicio? */
function harderLoad(a, b, dir) {
    if (dir === 'down') return a < b;
    if (dir === 'up') return a > b;
    return false;
}

/** Mejor serie de pilates: la de carga más difícil y, con esa carga, más reps. */
function bestPilatesSet(sets, type, dir, reformer) {
    let best = null;
    (sets || []).filter(s => s && !s.warmup).forEach(s => {
        const reps = parseInt(s.reps, 10) || 0;
        if (!reps) return;
        const load = type === 'springs' ? springsLoad(s.springs, reformer) : 0;
        if (!best || harderLoad(load, best.load, dir) || (load === best.load && reps > best.reps)) best = { load, reps, springs: s.springs || '' };
    });
    return best;
}

/** Suma lo de una sesión a las estadísticas del ejercicio (calculateStats). */
function updatePilatesStats(st, sets, type, name, reformer) {
    const dir = pilatesDirection(name);
    const best = bestPilatesSet(sets, type, dir, reformer);
    if (best && (!st.pilatesBest || harderLoad(best.load, st.pilatesBest.load, dir) || (best.load === st.pilatesBest.load && best.reps > st.pilatesBest.reps))) st.pilatesBest = best;
    if ((sets || []).some(s => s && s.effort === 'dominado')) st.mastered = true;
}

/** Récords de pilates de una sesión, contra las estadísticas previas. */
function detectPilatesPRs(ex, prev, reformer) {
    const prs = [];
    const dir = pilatesDirection(ex.name);
    const best = bestPilatesSet(ex.sets, ex.type, dir, reformer);
    const before = prev.pilatesBest;
    const show = b => (ex.type === 'springs' ? `${b.springs || '0'} × ${b.reps}` : `${b.reps} reps`);
    if (best && before) {
        const harder = ex.type === 'springs' && harderLoad(best.load, before.load, dir);
        const moreReps = best.load === before.load && best.reps > before.reps;
        if (harder || moreReps) prs.push(`${ex.name}: ${show(best)} (antes ${show(before)})`);
    }
    if (!prev.mastered && (ex.sets || []).some(s => s && s.effort === 'dominado')) prs.push(`${ex.name}: ⭐ dominado por primera vez`);
    return prs;
}

function isPilatesType(type) {
    return type === 'pilates' || type === 'springs';
}
