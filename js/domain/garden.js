// La flor del plan semanal: crece con cada semana cumplida según tu plan.
// Se calcula siempre a partir del historial (sesiones y planes), no se guarda: un backup o
// una sincronización nunca la "rompen". Diseño en docs/GAMIFICACION.md.
//
// - Semana cumplida: entrenaste tantos días distintos como pide el plan de esa semana. La
//   semana en curso cuenta apenas se cumple (no hace falta esperar al domingo).
// - Semana libre (como el protector de racha): si una semana terminada no se cumplió y
//   queda alguna, se usa sola. Se empieza con 2 y se suma 1 por mes, hasta 3.
// - Si no quedan semanas libres, la flor se marchita un poco (pierde color y pétalos) pero
//   no retrocede: vuelve a estar bien con la próxima semana cumplida. Nunca vuelve a cero.
// Script clásico (no módulo): comparte el ámbito global con el resto de la app.

const GARDEN_STAGES = [
    { id: 'seed', label: 'Semilla', weeks: 0 },
    { id: 'sprout', label: 'Brote', weeks: 1 },
    { id: 'bud', label: 'Capullo', weeks: 3 },
    { id: 'flower', label: 'Flor', weeks: 6 },
    { id: 'fruit', label: 'Flor con frutos', weeks: 10 }
];
const GARDEN_FRUIT_EVERY = 4;
const GARDEN_FREE_WEEKS = { initial: 2, perMonth: 1, max: 3 };

function gardenDateStr(d) {
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function gardenMonday(date) {
    const d = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    d.setDate(d.getDate() - ((d.getDay() + 6) % 7));
    return d;
}

/**
 * Estado de la flor.
 * @param workouts     sesiones (las borradas no cuentan)
 * @param planHistory  entradas { date, days } del plan semanal
 * @param today        fecha de hoy (para probar)
 * @returns { hasPlan, grown, stageIndex, stage, next, weeksToNext, fruits, wilted, freeWeeks,
 *            current: { start, planned, trained, done }, weeks: [{ start, planned, trained, status }] }
 *          status: 'cumplida' | 'libre' | 'no' | 'sin-plan' | 'en-curso'
 */
function computeGarden({ workouts = [], planHistory = [], today = new Date() } = {}) {
    const trainedDays = new Set((workouts || []).filter(w => w && w.date && !w.deletedAt).map(w => w.date));
    const plans = (planHistory || []).filter(p => p && p.date && Array.isArray(p.days) && p.days.length);
    const thisMonday = gardenMonday(today);
    const empty = { hasPlan: false, grown: 0, stageIndex: 0, stage: GARDEN_STAGES[0], next: GARDEN_STAGES[1], weeksToNext: 1, fruits: 0, wilted: false, freeWeeks: GARDEN_FREE_WEEKS.initial, current: { start: gardenDateStr(thisMonday), planned: 0, trained: 0, done: false }, weeks: [] };
    if (!plans.length) return empty;

    // Desde la semana del primer plan (o de la primera sesión, si el plan es "de siempre").
    const firstPlanMonday = gardenMonday(new Date(plans.map(p => p.date).sort()[0] + 'T00:00:00'));
    const firstWorkout = [...trainedDays].sort()[0];
    let start = firstPlanMonday;
    if (firstWorkout) {
        const fw = gardenMonday(new Date(firstWorkout + 'T00:00:00'));
        if (fw > start) start = fw;
    }
    if (start > thisMonday) start = thisMonday;

    const weeks = [];
    let grown = 0;
    let freeWeeks = GARDEN_FREE_WEEKS.initial;
    let lastMonth = null;
    let lastFinishedFailed = false;
    for (let monday = new Date(start); monday <= thisMonday; monday.setDate(monday.getDate() + 7)) {
        const startStr = gardenDateStr(monday);
        const month = startStr.slice(0, 7);
        if (lastMonth && month !== lastMonth) freeWeeks = Math.min(GARDEN_FREE_WEEKS.max, freeWeeks + GARDEN_FREE_WEEKS.perMonth);
        lastMonth = month;

        const planned = TrainingPlan.forWeek(plans, startStr).days.length;
        let trained = 0;
        for (let i = 0; i < 7; i++) {
            const d = new Date(monday.getFullYear(), monday.getMonth(), monday.getDate() + i);
            if (trainedDays.has(gardenDateStr(d))) trained++;
        }
        const isCurrent = monday.getTime() === thisMonday.getTime();
        let status;
        if (!planned) status = 'sin-plan';
        else if (trained >= planned) status = 'cumplida';
        else if (isCurrent) status = 'en-curso';
        else if (freeWeeks > 0) { status = 'libre'; freeWeeks--; }
        else status = 'no';

        if (status === 'cumplida') grown++;
        if (!isCurrent && (status === 'cumplida' || status === 'libre' || status === 'no')) lastFinishedFailed = status === 'no';
        if (isCurrent && status === 'cumplida') lastFinishedFailed = false;
        weeks.push({ start: startStr, planned, trained, status });
    }

    let stageIndex = 0;
    GARDEN_STAGES.forEach((s, i) => { if (grown >= s.weeks) stageIndex = i; });
    const last = GARDEN_STAGES.length - 1;
    const fruits = grown >= GARDEN_STAGES[last].weeks ? Math.floor((grown - GARDEN_STAGES[last].weeks) / GARDEN_FRUIT_EVERY) + 1 : 0;
    const next = GARDEN_STAGES[stageIndex + 1] || null;
    const cur = weeks[weeks.length - 1];
    return {
        hasPlan: true,
        grown,
        stageIndex,
        stage: GARDEN_STAGES[stageIndex],
        next,
        weeksToNext: next ? next.weeks - grown : GARDEN_FRUIT_EVERY - ((grown - GARDEN_STAGES[last].weeks) % GARDEN_FRUIT_EVERY),
        fruits,
        wilted: lastFinishedFailed,
        freeWeeks,
        current: { start: cur.start, planned: cur.planned, trained: cur.trained, done: cur.status === 'cumplida' },
        weeks
    };
}
