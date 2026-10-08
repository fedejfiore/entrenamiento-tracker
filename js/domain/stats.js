// Estadísticas: últimas series, máximos, volumen, 1RM, récords y resúmenes.
// Script clásico (no módulo): comparte el ámbito global con el resto de la app.

let exerciseStats = {};

function calculateStats() {
    exerciseStats = {};
    let workouts = repo.workouts.all();
    if (!Array.isArray(workouts)) workouts = [];
    
    workouts.forEach(w => {
        if (!w || !w.exercises || !Array.isArray(w.exercises)) return;
        
        w.exercises.forEach(ex => {
            if (!ex || !ex.name) return;
            
            if (!exerciseStats[ex.name]) {
                exerciseStats[ex.name] = {
                    lastReps: '',
                    lastWeight: '',
                    lastPause: '',
                    lastNote: '',
                    maxWeight: 0,
                    maxReps: 0,
                    maxVolume: 0,
                    allNotes: [],
                    lastSets: []
                };
            }

            // Series de la última vez (para sugerir valores en la próxima sesión).
            const lastSets = Array.isArray(ex.sets) && ex.sets.length > 0
                ? ex.sets
                : setsFromLegacy(ex, ex.type || getExerciseType(ex.name));
            if (lastSets.length > 0) exerciseStats[ex.name].lastSets = lastSets;

            // Récords de cardio / tiempo (distancia, ritmo, velocidad, duración).
            const exType = ex.type || getExerciseType(ex.name);
            if (isCardioType(exType)) {
                const c = cardioMetrics(lastSets);
                const st = exerciseStats[ex.name];
                st.maxKm = Math.max(st.maxKm || 0, c.totalKm);
                st.maxTotalSec = Math.max(st.maxTotalSec || 0, c.totalSec);
                st.maxSetSec = Math.max(st.maxSetSec || 0, c.maxSetSec);
                if (c.bestSpeed && (!st.bestSpeed || c.bestSpeed > st.bestSpeed)) st.bestSpeed = c.bestSpeed;
            }
            if (typeof isPilatesType === 'function' && isPilatesType(exType)) {
                updatePilatesStats(exerciseStats[ex.name], lastSets, exType, ex.name, typeof loadReformer === 'function' ? loadReformer() : undefined);
            }

            const weightStr = ex.weight || '';
            const repsStr = ex.reps || '';
            const weights = parseWeightList(weightStr, repsStr);
            const reps = parseRepsList(repsStr);

            if (weights.length > 0) {
                exerciseStats[ex.name].lastWeight = ex.weight;
                exerciseStats[ex.name].maxWeight = Math.max(exerciseStats[ex.name].maxWeight, ...weights);
            }
            if (reps.length > 0) {
                exerciseStats[ex.name].lastReps = ex.reps;
                exerciseStats[ex.name].maxReps = Math.max(exerciseStats[ex.name].maxReps, ...reps);
            }
            exerciseStats[ex.name].maxVolume = Math.max(exerciseStats[ex.name].maxVolume, calculateExerciseVolume(ex));
            if (ex.pause) {
                exerciseStats[ex.name].lastPause = ex.pause;
            }
            if (ex.note) {
                exerciseStats[ex.name].lastNote = ex.note;
                exerciseStats[ex.name].allNotes.push({date: w.date, note: ex.note});
            }
        });
    });
}

function calculateExerciseVolume(ex) {
    const weights = parseWeightList(ex.weight, ex.reps);
    const reps = parseRepsList(ex.reps);
    const len = Math.min(weights.length, reps.length);
    let volume = 0;
    for (let i = 0; i < len; i++) {
        volume += weights[i] * reps[i];
    }
    return volume;
}

function calculateSessionVolume(exercises) {
    if (!Array.isArray(exercises)) return 0;
    return exercises.reduce((sum, ex) => sum + calculateExerciseVolume(ex), 0);
}

// Suma de reps de todas las series (a diferencia de maxReps, que solo mira la serie más alta)
function calculateExerciseTotalReps(ex) {
    const reps = parseRepsList(ex.reps);
    return reps.reduce((sum, r) => sum + r, 0);
}

// Fórmula de Epley: 1RM = peso × (1 + reps/30)
function estimate1RMForExercise(ex) {
    const weights = parseWeightList(ex.weight, ex.reps);
    const reps = parseRepsList(ex.reps);
    const len = Math.min(weights.length, reps.length);
    let max1RM = 0;
    for (let i = 0; i < len; i++) {
        const e1rm = weights[i] * (1 + reps[i] / 30);
        if (e1rm > max1RM) max1RM = e1rm;
    }
    return max1RM > 0 ? Math.round(max1RM * 10) / 10 : null;
}

// Promedio del descanso entre series (string tipo "90-90-120" -> segundos promedio).
function averagePauseSeconds(pauseStr) {
    const parts = parsePauseList(pauseStr);
    if (parts.length === 0) return null;
    return parts.reduce((a, b) => a + b, 0) / parts.length;
}

// Compara contra exerciseStats (calculado ANTES de guardar la sesión actual).
// Un PR no es solo "más peso" o "más reps" mirados por separado: si subís el peso
// pero bajan las reps (o viceversa), puede que la CARGA TOTAL igual haya subido, y
// eso también es progreso. Y si peso y reps quedaron iguales pero descansaste menos
// entre series, también es una mejora aunque ningún número "máximo" se haya movido.
// Devuelve { prs, notes }: `prs` son logros claros; `notes` son señales mixtas (ej.
// bajó el descanso pero también bajó el peso o las reps) que no son un logro pero
// tampoco conviene que pasen desapercibidas.
function detectPRs(exercises, previousStats) {
    const prs = [];
    const notes = [];

    exercises.forEach(ex => {
        const prev = previousStats[ex.name];
        if (!prev) return;

        if (isCardioType(ex.type)) {
            prs.push(...detectCardioPRs(ex, prev));
            return;
        }
        // Pilates: resortes según el sentido de dificultad del ejercicio, reps y dominio.
        if (typeof isPilatesType === 'function' && isPilatesType(ex.type)) {
            prs.push(...detectPilatesPRs(ex, prev, typeof loadReformer === 'function' ? loadReformer() : undefined));
            return;
        }

        const weights = parseWeightList(ex.weight, ex.reps);
        const reps = parseRepsList(ex.reps);
        const maxWeight = weights.length > 0 ? Math.max(...weights) : 0;
        const maxReps = reps.length > 0 ? Math.max(...reps) : 0;
        const volume = calculateExerciseVolume(ex);

        let hasPR = false;

        if (prev.maxWeight > 0 && maxWeight > prev.maxWeight) {
            prs.push(`${ex.name}: ${formatWeight(maxWeight)} (antes ${formatWeight(prev.maxWeight)})`);
            hasPR = true;
        }
        if (prev.maxReps > 0 && maxReps > prev.maxReps) {
            prs.push(`${ex.name}: ${maxReps} reps (antes ${prev.maxReps})`);
            hasPR = true;
        }
        if (prev.maxVolume > 0 && volume > prev.maxVolume) {
            prs.push(`${ex.name}: volumen total ${formatWeightTotal(volume)} (antes ${formatWeightTotal(prev.maxVolume)})`);
            hasPR = true;
        }

        const avgPause = averagePauseSeconds(ex.pause);
        const avgPrevPause = averagePauseSeconds(prev.lastPause);
        const pauseImproved = avgPause != null && avgPrevPause != null && avgPause < avgPrevPause;

        // Solo tiene sentido comparar el descanso cuando de verdad fue "lo mismo":
        // mismo peso máximo, mismas reps máximas Y el volumen total no bajó (que las
        // series máximas coincidan no garantiza que el total no haya caído — ej. invertir
        // qué peso se lleva más reps cambia el volumen aunque los picos no se muevan).
        if (!hasPR && maxWeight > 0 && maxWeight === prev.maxWeight && maxReps > 0 && maxReps === prev.maxReps && volume >= prev.maxVolume && pauseImproved) {
            prs.push(`${ex.name}: mismo peso y reps con menos descanso (${Math.round(avgPause)}s, antes ${Math.round(avgPrevPause)}s)`);
            hasPR = true;
        }

        // Sin logro claro: si bajó el descanso pero el peso o las reps también
        // bajaron respecto a la última vez, no es una mejora — pero merece una
        // mención en vez de quedar en silencio, porque "hiciste menos, más rápido"
        // es información útil aunque no sea un PR.
        if (!hasPR && pauseImproved) {
            const lastWeights = parseWeightList(prev.lastWeight, prev.lastReps);
            const lastReps = parseRepsList(prev.lastReps);
            const lastMaxWeight = lastWeights.length > 0 ? Math.max(...lastWeights) : null;
            const lastMaxReps = lastReps.length > 0 ? Math.max(...lastReps) : null;

            const weightDropped = lastMaxWeight != null && maxWeight > 0 && maxWeight < lastMaxWeight;
            const repsDropped = lastMaxReps != null && maxReps > 0 && maxReps < lastMaxReps;

            if (weightDropped || repsDropped) {
                const changes = [];
                if (weightDropped) changes.push(`el peso (${formatWeight(lastMaxWeight)} → ${formatWeight(maxWeight)})`);
                if (repsDropped) changes.push(`las reps (${lastMaxReps} → ${maxReps})`);
                notes.push(`${ex.name}: bajaste el descanso (${Math.round(avgPrevPause)}s → ${Math.round(avgPause)}s), pero también bajó ${changes.join(' y ')} — no está claro si mejoraste.`);
            }
        }
    });

    return { prs, notes };
}

// Compara el volumen de esta semana (todavía en curso) contra el volumen que
// llevaba la semana pasada EN EL MISMO PUNTO (mismo día de la semana), no contra
// la semana pasada completa — si no, mitad de semana siempre "pierde" contra una
// semana entera ya cerrada, aunque hayas mejorado sesión a sesión.
function getWeeklyVolumeStats(workouts) {
    const monday = getMonday(new Date());
    const prevMonday = new Date(monday.getTime() - 7 * 86400000);
    const nextMonday = new Date(monday.getTime() + 7 * 86400000);
    const todayOffsetDays = Math.floor((new Date() - monday) / 86400000);
    const prevWeekSamePointCutoff = new Date(prevMonday.getTime() + (todayOffsetDays + 1) * 86400000);

    let thisWeek = 0, lastWeek = 0, lastWeekToDate = 0;

    workouts.forEach(w => {
        if (!w || !w.date) return;
        const d = new Date(w.date + 'T00:00:00');
        const vol = w.volume != null ? w.volume : calculateSessionVolume(w.exercises || []);
        if (d >= monday && d < nextMonday) {
            thisWeek += vol;
        } else if (d >= prevMonday && d < monday) {
            lastWeek += vol;
            if (d < prevWeekSamePointCutoff) lastWeekToDate += vol;
        }
    });

    return { thisWeek, lastWeek, lastWeekToDate };
}

// Por sesión: distancia total, tiempo total, serie más larga y mejor velocidad
// (de la mejor serie con km y tiempo). Las series de calentamiento no cuentan.
function cardioMetrics(sets) {
    let totalKm = 0, totalSec = 0, maxSetSec = 0, bestSpeed = null;
    (sets || []).filter(s => s && !s.warmup).forEach(s => {
        const km = parseDecimal(s.km);
        const sec = parseTimeSeconds(s.time);
        if (km > 0) totalKm += km;
        if (sec) {
            totalSec += sec;
            maxSetSec = Math.max(maxSetSec, sec);
        }
        const speed = computeSpeed(sec, km);
        if (speed && (bestSpeed == null || speed > bestSpeed)) bestSpeed = speed;
    });
    return { totalKm: Math.round(totalKm * 100) / 100, totalSec, maxSetSec, bestSpeed };
}

function detectCardioPRs(ex, prev) {
    const prs = [];
    const c = cardioMetrics(ex.sets);
    if (ex.type === 'km') {
        if (prev.maxKm > 0 && c.totalKm > prev.maxKm) {
            prs.push(`${ex.name}: distancia ${formatDistance(c.totalKm)} (antes ${formatDistance(prev.maxKm)})`);
        }
        if (prev.bestSpeed && c.bestSpeed && Math.round(c.bestSpeed * 10) > Math.round(prev.bestSpeed * 10)) {
            prs.push(`${ex.name}: velocidad ${formatSpeed(c.bestSpeed)} (antes ${formatSpeed(prev.bestSpeed)})`);
        }
        if (prev.maxTotalSec > 0 && c.totalSec > prev.maxTotalSec) {
            prs.push(`${ex.name}: duración ${formatDurationHuman(c.totalSec)} (antes ${formatDurationHuman(prev.maxTotalSec)})`);
        }
    } else if (prev.maxSetSec > 0 && c.maxSetSec > prev.maxSetSec) {
        prs.push(`${ex.name}: ${formatDurationHuman(c.maxSetSec)} (antes ${formatDurationHuman(prev.maxSetSec)})`);
    }
    return prs;
}

// Lo que se sugiere en gris: la última sesión o, si nunca se hizo, un valor típico.
function getPrevSets(name, type) {
    const last = (exerciseStats[name] || {}).lastSets || [];
    if (last.length > 0) return last;
    if (type === 'min' && /futbol|partido/.test(normalizeForCompare(name || ''))) {
        return [{ time: formatSecondsClock(DEFAULT_MATCH_MINUTES * 60) }];
    }
    return [];
}

// Historial de peso promedio + 1RM estimado de un ejercicio, sesión a sesión.
function getExerciseHistoryData(exName) {
    let workouts = repo.workouts.all();
    if (!Array.isArray(workouts)) workouts = [];

    const data = [];
    workouts.forEach(w => {
        if (!w || !w.exercises || !Array.isArray(w.exercises)) return;
        w.exercises.forEach(e => {
            if (e && e.name === exName && e.weight) {
                const weights = parseWeightList(e.weight, e.reps);
                if (weights.length > 0) {
                    const avg = weights.reduce((a, b) => a + b) / weights.length;
                    data.push({
                        date: w.date,
                        weight: Math.round(avg * 10) / 10,
                        oneRM: estimate1RMForExercise(e),
                        totalReps: calculateExerciseTotalReps(e),
                        volume: calculateExerciseVolume(e)
                    });
                }
            }
        });
    });
    return data;
}

// Entre las sesiones anteriores a la última, busca la más cercana a una fecha de
// referencia (ej. "hace 3 meses"). No exige una coincidencia exacta: con pocos datos,
// agarra la disponible más próxima y se lo dejamos explícito al usuario mostrando su fecha.
function findClosestSession(candidates, refDate) {
    return candidates.reduce((best, c) => {
        const cDiff = Math.abs(new Date(c.date + 'T00:00:00') - refDate);
        const bestDiff = Math.abs(new Date(best.date + 'T00:00:00') - refDate);
        return cDiff < bestDiff ? c : best;
    }, candidates[0]);
}

// Promedio de peso y reps (de todas las series cargadas) en las últimas sesiones de fuerza,
// para ver de un vistazo si las últimas rutinas vienen subiendo o bajando en conjunto.
function getRecentRoutineSummaries(workouts, count = 5) {
    const strengthWorkouts = workouts.filter(w => w && w.date && Array.isArray(w.exercises) && w.exercises.length > 0);
    // Por fecha, no por orden de carga — si cargás una sesión de otro día después
    // (backfill, o editaste la fecha), tiene que ubicarse donde corresponde, no
    // aparecer como "la más reciente" solo por haberse guardado último.
    const recent = [...strengthWorkouts]
        .sort((a, b) => b.date.localeCompare(a.date))
        .slice(0, count);

    return recent.map(w => {
        let totalWeight = 0, weightCount = 0, totalReps = 0, repsCount = 0;
        w.exercises.forEach(ex => {
            parseWeightList(ex.weight, ex.reps).forEach(x => { totalWeight += x; weightCount++; });
            parseRepsList(ex.reps).forEach(x => { totalReps += x; repsCount++; });
        });
        const routineLabel = w.routine ? (customRoutineLabels[w.routine] || ROUTINE_LABELS[w.routine] || `Rutina ${w.routine}`) : 'Sin rutina';
        return {
            date: w.date,
            routineLabel,
            avgWeight: weightCount > 0 ? Math.round((totalWeight / weightCount) * 10) / 10 : null,
            avgReps: repsCount > 0 ? Math.round(totalReps / repsCount) : null
        };
    });
}

