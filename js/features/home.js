// Inicio: resumen, promedios recientes, calendario y estado de la semana.
// Script clásico (no módulo): comparte el ámbito global con el resto de la app.

const WEEK_STATUS_LABELS = {
    'sin-plan': '⚪ Configurá tus días',
    'dias-respetados': '✅ Vas al día',
    'cantidad-cumplida': '✅ Cantidad cumplida (no en los días planeados)',
    'en-curso': '🔵 Semana en curso (todavía a tiempo)',
    'incumplido': '🔴 Sin cumplir'
};

function updateSidebar() {
    const workouts = repo.workouts.all();
    document.getElementById('totalWorkouts').textContent = workouts.length;

    if (workouts.length > 0) {
        document.getElementById('lastWorkout').textContent = workouts[workouts.length-1].date;
    }
    updateSuggestedRoutine();
    if (!currentSessionStartTime) updateSessionDurationDisplay();

    renderPlanSection(); // plan semanal, estado de la semana y aviso de "hoy toca"
    renderGarden(); // la flor del plan semanal
    renderProgramsSection(); // programa en curso y próximo día

    const weeklyVolumeEl = document.getElementById('weeklyVolume');
    if (weeklyVolumeEl) {
        const { thisWeek, lastWeek, lastWeekToDate } = getWeeklyVolumeStats(workouts);
        if (thisWeek === 0 && lastWeek === 0) {
            weeklyVolumeEl.textContent = '-';
        } else {
            const kg = formatWeightTotal(thisWeek);
            if (lastWeekToDate > 0) {
                const pctChange = Math.round(((thisWeek - lastWeekToDate) / lastWeekToDate) * 100);
                const arrow = pctChange > 0 ? '📈' : pctChange < 0 ? '📉' : '➡️';
                weeklyVolumeEl.textContent = `${kg} ${arrow} ${pctChange > 0 ? '+' : ''}${pctChange}%`;
                weeklyVolumeEl.title = 'Comparado con lo que llevabas la semana pasada a esta misma altura (no la semana completa)';
            } else {
                weeklyVolumeEl.textContent = kg;
            }
        }
    }

    updateStartDateAndWeeklyAverage(workouts);
    renderRecentRoutineAverages(workouts);
    renderMonthCalendar();
}

// Fecha del primer entrenamiento guardado + promedio de entrenamientos por semana
// desde entonces (incluye Tabata: cualquier sesión cuenta como "entrenaste ese día").
function updateStartDateAndWeeklyAverage(workouts) {
    const startDateEl = document.getElementById('startDate');
    const weeklyAvgEl = document.getElementById('weeklyAvgWorkouts');
    if (!startDateEl && !weeklyAvgEl) return;

    const dates = workouts.map(w => w?.date).filter(Boolean).sort();
    if (dates.length === 0) {
        if (startDateEl) startDateEl.textContent = '-';
        if (weeklyAvgEl) weeklyAvgEl.textContent = '-';
        return;
    }

    const firstDate = dates[0];
    if (startDateEl) startDateEl.textContent = firstDate;

    if (weeklyAvgEl) {
        const weeksSinceStart = Math.max(1, (new Date() - new Date(firstDate + 'T00:00:00')) / (7 * 86400000));
        const avg = workouts.length / weeksSinceStart;
        weeklyAvgEl.textContent = `${avg.toFixed(1)} / semana`;
    }
}

const RECENT_ROUTINES_COLLAPSED_COUNT = 5;

const RECENT_ROUTINES_EXPANDED_COUNT = 15;

let recentRoutinesExpanded = false;

function toggleRecentRoutinesExpanded() {
    recentRoutinesExpanded = !recentRoutinesExpanded;
    let workouts = repo.workouts.all();
    if (!Array.isArray(workouts)) workouts = [];
    renderRecentRoutineAverages(workouts);
}

function renderRecentRoutineAverages(workouts) {
    const container = document.getElementById('recentRoutineAverages');
    if (!container) return;

    const allSummaries = getRecentRoutineSummaries(workouts, RECENT_ROUTINES_EXPANDED_COUNT);
    if (allSummaries.length === 0) {
        container.innerHTML = emptyStateHtml('Todavía no hay sesiones de fuerza guardadas: acá vas a ver el peso y las reps promedio de las últimas.', ['train']);
        return;
    }

    const visibleCount = recentRoutinesExpanded ? allSummaries.length : Math.min(RECENT_ROUTINES_COLLAPSED_COUNT, allSummaries.length);
    const summaries = allSummaries.slice(0, visibleCount);

    let html = summaries.map(s => `
        <div class="stat-box" style="display:flex; justify-content:space-between; align-items:center; gap:8px;">
            <div>
                <div style="font-weight:600; font-size:13px;">${escapeHtml(s.routineLabel)}</div>
                <small style="color:var(--text-faint);">${escapeHtml(s.date)}</small>
            </div>
            <div style="text-align:right; font-size:12px; color:var(--text-muted);">
                ${s.avgWeight != null ? `Peso prom: <strong style="color:var(--text);">${escapeHtml(formatWeight(s.avgWeight))}</strong><br>` : ''}
                ${s.avgReps != null ? `Reps prom: <strong style="color:var(--text);">${s.avgReps}</strong>` : ''}
            </div>
        </div>
    `).join('');

    if (allSummaries.length > RECENT_ROUTINES_COLLAPSED_COUNT) {
        html += recentRoutinesExpanded
            ? `<button type="button" class="small" style="width:100%; margin-top:4px;" ${fnAttrs('toggleRecentRoutinesExpanded')}>▲ Ver menos</button>`
            : `<button type="button" class="small" style="width:100%; margin-top:4px;" ${fnAttrs('toggleRecentRoutinesExpanded')}>▼ Ver ${allSummaries.length - RECENT_ROUTINES_COLLAPSED_COUNT} más</button>`;
    }

    container.innerHTML = html;
}

// Calendario mensual tipo "tablero de programador": un color por día según si se entrenó,
// con intensidad según el volumen de ese día. Navegable mes a mes (no se puede ir a futuro).
let calendarMonthOffset = 0;

function changeCalendarMonth(delta) {
    calendarMonthOffset = Math.min(0, calendarMonthOffset + delta);
    renderMonthCalendar();
}

function renderMonthCalendar() {
    const container = document.getElementById('trainingCalendar');
    const labelEl = document.getElementById('calendarMonthLabel');
    if (!container) return;

    let workouts = repo.workouts.all();
    if (!Array.isArray(workouts)) workouts = [];

    const base = new Date();
    base.setDate(1);
    base.setMonth(base.getMonth() + calendarMonthOffset);
    const year = base.getFullYear();
    const month = base.getMonth();

    if (labelEl) {
        const label = base.toLocaleDateString(appLocale(), { month: 'long', year: 'numeric' });
        labelEl.textContent = label.charAt(0).toUpperCase() + label.slice(1);
    }

    const byDate = {};
    workouts.forEach(w => {
        if (!w || !w.date) return;
        if (!byDate[w.date]) byDate[w.date] = [];
        byDate[w.date].push(w);
    });

    const firstOfMonth = new Date(year, month, 1);
    const startWeekday = (firstOfMonth.getDay() + 6) % 7; // 0 = lunes
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const todayStr = getLocalDateString();

    let html = '<div class="calendar-weekdays">' + ['L','M','X','J','V','S','D'].map(d => `<div>${d}</div>`).join('') + '</div>';
    html += '<div class="calendar-grid">';
    for (let i = 0; i < startWeekday; i++) html += '<div class="calendar-cell empty"></div>';

    for (let day = 1; day <= daysInMonth; day++) {
        const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        const dayWorkouts = byDate[dateStr] || [];
        const trained = dayWorkouts.length > 0;
        const totalVol = dayWorkouts.reduce((s, w) => s + (w.volume || 0), 0);

        let intensity = '';
        if (trained) intensity = totalVol > 3000 ? 'high' : totalVol > 800 ? 'mid' : 'low';

        const label = dayWorkouts.map(w => w.type === 'tabata' ? `Tabata: ${w.name || ''}` : (customRoutineLabels[w.routine] || ROUTINE_LABELS[w.routine] || w.routine || 'Entreno')).join(' + ');
        const title = trained ? `${dateStr}: ${label}` : dateStr;
        const isToday = dateStr === todayStr;

        html += `<div class="calendar-cell ${trained ? 'trained ' + intensity : ''}${isToday ? ' today' : ''}" title="${escapeHtml(title)}">${day}</div>`;
    }
    html += '</div>';
    container.innerHTML = html;
}

// Devuelve: 'sin-plan' | 'dias-respetados' | 'cantidad-cumplida' | 'en-curso' | 'incumplido'
// "Cumplida" exige SIEMPRE el plan completo (no solo los días que ya pasaron esta
// semana): si el plan pide 5 días y llevás 2, todavía no está cumplida aunque esos
// 2 hayan sido los correctos. Mientras la semana en curso no llegue al total, queda
// "en-curso" (ni verde todavía, ni roja porque todavía hay tiempo).
function getWeekStatus(workouts, plan, weekStart) {
    if (!plan || plan.length === 0) return 'sin-plan';

    const weekEnd = new Date(weekStart.getTime() + 6 * 86400000);

    const trainedWeekdays = new Set(
        workouts
            .map(w => w.date)
            .filter(Boolean)
            .filter(ds => {
                const d = new Date(ds + 'T00:00:00');
                return d >= weekStart && d <= weekEnd;
            })
            .map(ds => new Date(ds + 'T00:00:00').getDay())
    );

    const diasRespetados = plan.every(d => trainedWeekdays.has(d));
    if (diasRespetados) return 'dias-respetados';

    const cantidadCumplida = trainedWeekdays.size >= plan.length;
    if (cantidadCumplida) return 'cantidad-cumplida';

    const isCurrentWeek = weekStart.getTime() === getMonday(new Date()).getTime();
    if (isCurrentWeek) return 'en-curso';

    return 'incumplido';
}

