// Medallas (Perfil): se calculan con el historial, no se guardan aparte. Así un backup o una
// restauración nunca las "rompen" y no se pueden inventar editando un archivo de logros.
// Script clásico (no módulo): comparte el ámbito global con el resto de la app.

const MEDAL_TIERS = [
    { name: 'Bronce', color: '#cd7f32' },
    { name: 'Plata', color: '#c0c0c0' },
    { name: 'Oro', color: '#ffc83d' },
    { name: 'Platino', color: '#8fd3ff' },
    { name: 'Diamante', color: '#b388ff' },
    { name: 'Leyenda', color: '#ff5c8a' }
];

// Cada familia de medallas: umbrales por nivel (Bronce, Plata, Oro…).
const ACHIEVEMENTS = [
    { id: 'sessions', icon: '🏋️', title: 'Constancia', unit: 'sesiones', tiers: [1, 10, 50, 100, 250, 500], value: s => s.sessions },
    { id: 'streak', icon: '🔥', title: 'Semanas seguidas', unit: 'semanas', tiers: [2, 4, 12, 26, 52, 104], value: s => s.bestWeekStreak },
    { id: 'volume', icon: '🏗️', title: 'Kilos levantados', unit: 'kg', tiers: [1000, 10000, 50000, 100000, 500000, 1000000], value: s => s.totalVolume },
    { id: 'records', icon: '🏆', title: 'Récords', unit: 'récords', tiers: [1, 10, 25, 50, 100, 250], value: s => s.records },
    { id: 'hours', icon: '⏱️', title: 'Horas entrenadas', unit: 'horas', tiers: [1, 10, 50, 100, 250, 500], value: s => s.hours },
    { id: 'cardio', icon: '🚴', title: 'Distancia de cardio', unit: 'km', tiers: [10, 50, 100, 500, 1000, 5000], value: s => s.totalKm }
];

/**
 * Estadísticas de uso a partir de las sesiones guardadas.
 * weekStartDay: día en que empieza la semana (para las rachas).
 */
function computeUsageStats(workouts, weekStartDay = 1) {
    const list = (workouts || []).filter(w => w && w.date && !w.deletedAt);
    const stats = {
        sessions: list.length, totalVolume: 0, records: 0, totalKm: 0, hours: 0,
        bestWeekStreak: 0, currentWeekStreak: 0, activeDays: 0, firstDate: null,
        avgMinutes: null, favoriteExercise: null
    };
    if (!list.length) return stats;

    const exerciseCount = {};
    let minutes = 0, withDuration = 0;
    const days = new Set();
    const weeks = new Set();
    list.forEach(w => {
        days.add(w.date);
        weeks.add(formatDateLocal(getWeekStart(new Date(w.date + 'T00:00:00'), weekStartDay)));
        if (Array.isArray(w.prs)) stats.records += w.prs.length;
        if (w.duration > 0) { minutes += w.duration; withDuration++; }
        (Array.isArray(w.exercises) ? w.exercises : []).forEach(ex => {
            if (!ex || !ex.name) return;
            exerciseCount[ex.name] = (exerciseCount[ex.name] || 0) + 1;
            stats.totalVolume += calculateExerciseVolume(ex) || 0;
            (Array.isArray(ex.sets) ? ex.sets : []).forEach(s => {
                if (s && !s.warmup) stats.totalKm += parseDecimal(s.km) || 0;
            });
        });
    });
    stats.totalVolume = Math.round(stats.totalVolume);
    stats.totalKm = Math.round(stats.totalKm * 10) / 10;
    stats.hours = Math.round(minutes / 60 * 10) / 10;
    stats.avgMinutes = withDuration ? Math.round(minutes / withDuration) : null;
    stats.activeDays = days.size;
    stats.firstDate = [...days].sort()[0];
    stats.favoriteExercise = Object.entries(exerciseCount).sort((a, b) => b[1] - a[1])[0]?.[0] || null;

    // Rachas: semanas consecutivas con al menos una sesión.
    const sortedWeeks = [...weeks].sort();
    let run = 0, prev = null;
    sortedWeeks.forEach(wk => {
        const d = new Date(wk + 'T00:00:00');
        const expected = prev ? new Date(prev.getTime()) : null;
        if (expected) expected.setDate(expected.getDate() + 7);
        run = expected && formatDateLocal(expected) === wk ? run + 1 : 1;
        stats.bestWeekStreak = Math.max(stats.bestWeekStreak, run);
        prev = d;
    });
    // La racha actual sigue viva si la última semana con sesiones es esta o la anterior.
    const thisWeek = getWeekStart(new Date(), weekStartDay);
    const lastWeek = new Date(thisWeek.getTime()); lastWeek.setDate(lastWeek.getDate() - 7);
    const lastTrained = sortedWeeks[sortedWeeks.length - 1];
    stats.currentWeekStreak = [formatDateLocal(thisWeek), formatDateLocal(lastWeek)].includes(lastTrained) ? run : 0;
    return stats;
}

/** Nivel alcanzado en cada familia y cuánto falta para el siguiente. */
function evaluateAchievements(stats) {
    return ACHIEVEMENTS.map(a => {
        const value = a.value(stats) || 0;
        let level = 0;
        a.tiers.forEach((t, i) => { if (value >= t) level = i + 1; });
        const next = a.tiers[level] ?? null;
        const prevT = level > 0 ? a.tiers[level - 1] : 0;
        return {
            id: a.id, icon: a.icon, title: a.title, unit: a.unit, value, level,
            tier: level > 0 ? MEDAL_TIERS[level - 1] : null,
            next,
            progress: next ? Math.max(0, Math.min(1, (value - prevT) / (next - prevT))) : 1
        };
    });
}
