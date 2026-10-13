// Inicio: resumen, promedios recientes, calendario y estado de la semana.
import { escapeHtml } from '../core/utils.js';
import { appLocale } from '../core/i18n.js';
import { fnAttrs } from '../ui/actions.js';
import { formatWeight, formatWeightTotal } from '../core/units.js';
import { ROUTINE_LABELS } from '../domain/catalog.js';
import { formatSetsSummary } from '../domain/sets.js';
import { calendarMonth } from '../domain/plan.js';
import { repo } from '../data/repositories.js';
import { customRoutineLabels } from '../data/routines-store.js';
import { getRecentRoutineSummaries, getWeeklyVolumeStats } from '../domain/stats.js';
import { currentSessionStartTime, updateSessionDurationDisplay } from './training/session-clock.js';
import { updateSuggestedRoutine } from './training/routines-ui.js';
import { renderPlanSection } from './plan-screen.js';
import { renderGarden } from './garden.js';
import { renderProgramsSection } from './programs.js';
import { emptyStateHtml } from '../ui/navigation.js';

export const WEEK_STATUS_LABELS = {
    'sin-plan': '⚪ Configurá tus días',
    'dias-respetados': '✅ Vas al día',
    'cantidad-cumplida': '✅ Cantidad cumplida (no en los días planeados)',
    'en-curso': '🔵 Semana en curso (todavía a tiempo)',
    'incumplido': '🔴 Sin cumplir'
};

export function updateSidebar() {
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
export function updateStartDateAndWeeklyAverage(workouts) {
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

export const RECENT_ROUTINES_COLLAPSED_COUNT = 5;

export const RECENT_ROUTINES_EXPANDED_COUNT = 15;

export let recentRoutinesExpanded = false;

export function toggleRecentRoutinesExpanded() {
    recentRoutinesExpanded = !recentRoutinesExpanded;
    let workouts = repo.workouts.all();
    if (!Array.isArray(workouts)) workouts = [];
    renderRecentRoutineAverages(workouts);
}

export function renderRecentRoutineAverages(workouts) {
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
// Tocar un día muestra qué se hizo. El armado del mes está en el dominio (calendarMonth).
export class CalendarView {
    /**
     * @param {object} deps
     *   workouts()          sesiones guardadas
     *   routineLabel(key)   nombre de una rutina
     *   locale()            idioma para fechas
     *   sessionHtml(w)      detalle de una sesión
     */
    constructor(deps) {
        this.deps = deps;
        this.monthOffset = 0;
        this.selectedDate = null;
    }

    changeMonth(delta) {
        this.monthOffset = Math.min(0, this.monthOffset + delta);
        this.render();
    }

    render() {
        const container = document.getElementById('trainingCalendar');
        const labelEl = document.getElementById('calendarMonthLabel');
        if (!container) return;
        const workouts = this.deps.workouts();
        const m = calendarMonth(Array.isArray(workouts) ? workouts : [], this.monthOffset, new Date());
        if (labelEl) {
            const label = new Date(m.year, m.month, 1).toLocaleDateString(this.deps.locale(), { month: 'long', year: 'numeric' });
            labelEl.textContent = label.charAt(0).toUpperCase() + label.slice(1);
        }
        const name = w => (w.type === 'tabata' ? `Tabata: ${w.name || ''}` : this.deps.routineLabel(w.routine));
        let html = '<div class="calendar-weekdays">' + ['L', 'M', 'X', 'J', 'V', 'S', 'D'].map(d => `<div>${d}</div>`).join('') + '</div>';
        html += '<div class="calendar-grid">' + '<div class="calendar-cell empty"></div>'.repeat(m.leadingEmpty);
        m.days.forEach(d => {
            const title = d.trained ? `${d.date}: ${d.sessions.map(name).join(' + ')}` : d.date;
            const selected = d.date === this.selectedDate;
            html += `<button type="button" class="calendar-cell ${d.trained ? 'trained ' + d.intensity : ''}${d.isToday ? ' today' : ''}${selected ? ' selected' : ''}" data-cal-date="${d.date}" aria-pressed="${selected}" title="${escapeHtml(title)}">${d.day}</button>`;
        });
        container.innerHTML = html + '</div>';
        this.bind(container);
        this.renderDayDetail();
    }

    bind(container) {
        if (container.dataset.bound) return;
        container.dataset.bound = '1';
        container.addEventListener('click', e => {
            const cell = e.target.closest('[data-cal-date]');
            if (!cell) return;
            this.selectedDate = this.selectedDate === cell.dataset.calDate ? null : cell.dataset.calDate;
            this.render();
        });
    }

    renderDayDetail() {
        const box = document.getElementById('calendarDayDetail');
        if (!box) return;
        if (!this.selectedDate) { box.hidden = true; box.innerHTML = ''; return; }
        const date = new Date(this.selectedDate + 'T00:00:00');
        const title = date.toLocaleDateString(this.deps.locale(), { weekday: 'long', day: 'numeric', month: 'long' });
        const sessions = this.deps.workouts().filter(w => w && w.date === this.selectedDate);
        box.hidden = false;
        box.innerHTML = `<div class="cal-detail-head"><strong>${escapeHtml(title.charAt(0).toUpperCase() + title.slice(1))}</strong></div>`
            + (sessions.length ? sessions.map(w => this.deps.sessionHtml(w)).join('') : '<p class="cal-detail-empty">Sin entrenamientos este día.</p>');
    }
}

export const calendarView = new CalendarView({
    workouts: () => repo.workouts.all(),
    routineLabel: key => customRoutineLabels[key] || ROUTINE_LABELS[key] || key || 'Entreno',
    locale: () => appLocale(),
    sessionHtml: w => calendarSessionHtml(w)
});

// Lo que usan los botones (data-fn-click) y otras pantallas.
export function changeCalendarMonth(delta) { calendarView.changeMonth(delta); }
export function renderMonthCalendar() { calendarView.render(); }

export function calendarSessionHtml(w) {
    if (w.type === 'tabata') {
        const blocks = Array.isArray(w.blocks) ? w.blocks : [{ name: w.name, rounds: w.rounds, roundsCompleted: w.roundsCompleted }];
        return `<div class="cal-detail-session"><div class="cal-detail-title">🔥 Tabata${w.duration ? ` · ${w.duration} min` : ''}</div>`
            + `<ul>${blocks.map(b => `<li><span translate="no">${escapeHtml(b.name || 'Tabata')}</span> · ${b.roundsCompleted ?? b.rounds}/${b.rounds}</li>`).join('')}</ul></div>`;
    }
    const label = customRoutineLabels[w.routine] || ROUTINE_LABELS[w.routine] || w.routine || 'Entreno';
    const meta = [w.duration ? `${w.duration} min` : '', w.volume ? formatWeightTotal(w.volume) : ''].filter(Boolean).join(' · ');
    const exercises = (w.exercises || []).map(ex => {
        const summary = formatSetsSummary(ex.sets, ex.type || 'kg');
        return `<li><span translate="no">${escapeHtml(ex.name)}</span>${summary ? `: ${escapeHtml(summary)}` : ''}</li>`;
    }).join('');
    const prs = Array.isArray(w.prs) && w.prs.length ? `<div class="cal-detail-prs">🏆 ${w.prs.length === 1 ? '1 récord' : `${w.prs.length} récords`}</div>` : '';
    return `<div class="cal-detail-session"><div class="cal-detail-title"><span>${escapeHtml(label)}</span>${meta ? ` <small>${escapeHtml(meta)}</small>` : ''}</div><ul>${exercises}</ul>${prs}</div>`;
}

