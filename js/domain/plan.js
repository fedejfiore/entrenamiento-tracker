// Plan semanal de entrenamiento: qué días y a qué hora se entrena, y los recordatorios.
//
// Una web no puede programar notificaciones confiables sin un servidor, así que los avisos
// se delegan al calendario del celular: eventos semanales con alarma, en formato estándar
// (.ics, sirve para iPhone y casi cualquier calendario) o un link a Google Calendar. En
// la app nativa esto se reemplaza por notificaciones locales (docs/MIGRACION-NATIVA.md).
//
// Entrada guardada en trainingDaysPlanHistory (una por semana en que se cambió el plan):
//   { date: "2026-09-28", days: [1, 3, 5], times: { "1": "19:00", "3": "19:00", "5": "08:30" }, remind: 30 }
//   days: getDay() de JS (0 = domingo … 6 = sábado)   remind: minutos de aviso previo

const WEEKDAYS = [
    { n: 1, short: 'Lun', long: 'lunes', ics: 'MO' },
    { n: 2, short: 'Mar', long: 'martes', ics: 'TU' },
    { n: 3, short: 'Mié', long: 'miércoles', ics: 'WE' },
    { n: 4, short: 'Jue', long: 'jueves', ics: 'TH' },
    { n: 5, short: 'Vie', long: 'viernes', ics: 'FR' },
    { n: 6, short: 'Sáb', long: 'sábado', ics: 'SA' },
    { n: 0, short: 'Dom', long: 'domingo', ics: 'SU' }
];
const DEFAULT_PLAN_TIME = '19:00';
const DEFAULT_REMIND_MINUTES = 30;
const REMIND_OPTIONS = [[0, 'A la hora'], [15, '15 min antes'], [30, '30 min antes'], [60, '1 h antes'], [120, '2 h antes']];

const TIME_RE = /^([01]\d|2[0-3]):[0-5]\d$/;

class TrainingPlan {
    constructor({ days = [], times = {}, remind = DEFAULT_REMIND_MINUTES, routines = {} } = {}) {
        this.days = [...new Set(days.map(Number).filter(d => d >= 0 && d <= 6))].sort((a, b) => a - b);
        this.times = {};
        this.days.forEach(d => { this.times[d] = TIME_RE.test(times[d] || '') ? times[d] : DEFAULT_PLAN_TIME; });
        this.remind = Number.isFinite(Number(remind)) ? Math.max(0, Number(remind)) : DEFAULT_REMIND_MINUTES;
        // Rutina elegida para cada día (opcional): solo de los días del plan.
        this.routines = {};
        this.days.forEach(d => { if (typeof routines?.[d] === 'string' && routines[d]) this.routines[d] = routines[d]; });
    }

    /** Rutina elegida para ese día de la semana, o null si la decide la app. */
    routineFor(weekday) { return this.routines[weekday] || null; }

    get isEmpty() { return this.days.length === 0; }

    /** Plan vigente para la semana que arranca el lunes weekStartStr (AAAA-MM-DD). */
    static forWeek(history, weekStartStr) {
        const applicable = (history || [])
            .filter(e => e && e.date <= weekStartStr)
            .sort((a, b) => a.date.localeCompare(b.date));
        return new TrainingPlan(applicable.length ? applicable[applicable.length - 1] : {});
    }

    toJSON() {
        const out = { days: this.days, times: this.times, remind: this.remind };
        if (Object.keys(this.routines).length) out.routines = this.routines;
        return out;
    }

    sameAs(other) { return JSON.stringify(this.toJSON()) === JSON.stringify(other.toJSON()); }

    includes(weekday) { return this.days.includes(weekday); }

    timeFor(weekday) { return this.times[weekday] || null; }

    /** Días agrupados por horario: cada grupo es UN evento semanal en el calendario. */
    groups() {
        const byTime = {};
        WEEKDAYS.forEach(w => {
            if (!this.includes(w.n)) return;
            (byTime[this.times[w.n]] ||= []).push(w);
        });
        return Object.entries(byTime)
            .map(([time, days]) => ({ time, days }))
            .sort((a, b) => a.time.localeCompare(b.time));
    }

    /** Próximo entrenamiento a partir de `from` (incluye hoy si todavía no pasó la hora). */
    /**
     * Próximo entrenamiento a partir de `from`. "Hoy" y "mañana" se cuentan contra `today`
     * (la fecha real), no contra `from`: si ya entrenaste hoy se busca desde mañana, y ese
     * entrenamiento es "mañana", no "hoy".
     */
    nextSession(from = new Date(), today = new Date()) {
        if (this.isEmpty) return null;
        const dayKey = x => `${x.getFullYear()}-${x.getMonth()}-${x.getDate()}`;
        const tomorrow = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);
        for (let i = 0; i < 8; i++) {
            const d = new Date(from.getFullYear(), from.getMonth(), from.getDate() + i);
            if (!this.includes(d.getDay())) continue;
            const [h, m] = this.times[d.getDay()].split(':').map(Number);
            const at = new Date(d.getFullYear(), d.getMonth(), d.getDate(), h, m);
            if (at >= from || i === 0) {
                return { date: at, weekday: d.getDay(), time: this.times[d.getDay()], isToday: dayKey(d) === dayKey(today), isTomorrow: dayKey(d) === dayKey(tomorrow) };
            }
        }
        return null;
    }
}

/**
 * ¿El nombre de la rutina dice el día? "Torso C (jue)", "Pierna sábado", "Lunes - pecho".
 * Sirve para proponerla ese día cuando el plan no tiene una rutina asignada.
 */
function routineLabelMatchesWeekday(label, weekday) {
    const w = WEEKDAYS.find(x => x.n === weekday);
    if (!w || !label) return false;
    const n = normalizeForCompare(label);
    const short = normalizeForCompare(w.short);
    const long = normalizeForCompare(w.long);
    return new RegExp(`(^|[^a-z])(${short}|${long})([^a-z]|$)`).test(n);
}

// ---------- Calendario ----------

const pad2 = n => String(n).padStart(2, '0');

/** Fecha y hora "flotante" (sin zona): el calendario la toma en la hora local del usuario. */
function formatCalendarLocal(date) {
    return `${date.getFullYear()}${pad2(date.getMonth() + 1)}${pad2(date.getDate())}T${pad2(date.getHours())}${pad2(date.getMinutes())}00`;
}

function formatCalendarUtc(date) {
    return date.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
}

/** Primera fecha (desde hoy) que cae en alguno de los días del grupo, a su hora. */
function firstOccurrence(group, from = new Date()) {
    const [h, m] = group.time.split(':').map(Number);
    for (let i = 0; i < 7; i++) {
        const d = new Date(from.getFullYear(), from.getMonth(), from.getDate() + i, h, m);
        if (group.days.some(w => w.n === d.getDay())) return d;
    }
    return null;
}

function icsEscape(text) {
    return String(text).replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\n/g, '\\n');
}

// Las líneas de un .ics no deben pasar de 75 bytes: se cortan y siguen con un espacio.
function icsFold(line) {
    const bytes = new TextEncoder().encode(line);
    if (bytes.length <= 75) return line;
    const out = [];
    let current = '';
    for (const ch of line) {
        if (new TextEncoder().encode(current + ch).length > (out.length ? 74 : 75)) {
            out.push(current);
            current = ch;
        } else {
            current += ch;
        }
    }
    out.push(current);
    return out.join('\r\n ');
}

/**
 * Archivo .ics con un evento semanal por horario y una alarma `plan.remind` minutos antes.
 * @param opts { title, description, durationMin, now }
 */
function buildPlanIcs(plan, { title = '🏋️ Entrenar', description = '', durationMin = 60, now = new Date() } = {}) {
    const lines = [
        'BEGIN:VCALENDAR',
        'VERSION:2.0',
        'PRODID:-//Inquieto//Gymnastes//ES',
        'CALSCALE:GREGORIAN',
        'METHOD:PUBLISH'
    ];
    plan.groups().forEach((group, i) => {
        const start = firstOccurrence(group, now);
        lines.push(
            'BEGIN:VEVENT',
            `UID:entreno-plan-${formatCalendarUtc(now)}-${i}@entrenamiento-tracker`,
            `DTSTAMP:${formatCalendarUtc(now)}`,
            `DTSTART:${formatCalendarLocal(start)}`,
            `DURATION:PT${Math.max(15, Math.round(durationMin))}M`,
            `RRULE:FREQ=WEEKLY;BYDAY=${group.days.map(w => w.ics).join(',')}`,
            `SUMMARY:${icsEscape(title)}`,
            `DESCRIPTION:${icsEscape(description)}`,
            'BEGIN:VALARM',
            'ACTION:DISPLAY',
            `DESCRIPTION:${icsEscape('Hoy toca entrenar')}`,
            `TRIGGER:-PT${plan.remind}M`,
            'END:VALARM',
            'END:VEVENT'
        );
    });
    lines.push('END:VCALENDAR');
    return lines.map(icsFold).join('\r\n') + '\r\n';
}

/** Un link de Google Calendar por horario (Google no importa varios eventos juntos). */
function planGoogleCalendarLinks(plan, { title = '🏋️ Entrenar', description = '', durationMin = 60, now = new Date() } = {}) {
    return plan.groups().map(group => {
        const start = firstOccurrence(group, now);
        const end = new Date(start.getTime() + Math.max(15, Math.round(durationMin)) * 60000);
        const params = new URLSearchParams({
            action: 'TEMPLATE',
            text: title,
            dates: `${formatCalendarLocal(start)}/${formatCalendarLocal(end)}`,
            recur: `RRULE:FREQ=WEEKLY;BYDAY=${group.days.map(w => w.ics).join(',')}`,
            details: description
        });
        return {
            label: `${group.days.map(w => w.short).join(', ')} · ${group.time}`,
            url: `https://calendar.google.com/calendar/render?${params.toString()}`
        };
    });
}

// ---- Movido desde las pantallas (etapa 2 de arquitectura) ----

// Devuelve: 'sin-plan' | 'dias-respetados' | 'cantidad-cumplida' | 'en-curso' | 'incumplido'
// "Cumplida" exige SIEMPRE el plan completo (no solo los días que ya pasaron esta
// semana): si el plan pide 5 días y llevás 2, todavía no está cumplida aunque esos
// 2 hayan sido los correctos. Mientras la semana en curso no llegue al total, queda
// "en-curso" (ni verde todavía, ni roja porque todavía hay tiempo).
function getWeekStatus(workouts, plan, weekStart, today = new Date()) {
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

    const isCurrentWeek = weekStart.getTime() === getMonday(today).getTime();
    if (isCurrentWeek) return 'en-curso';

    return 'incumplido';
}

function describeNext(next) {
    if (!next) return '';
    const day = WEEKDAYS.find(w => w.n === next.weekday);
    if (next.isToday) return `hoy a las ${next.time}`;
    if (next.isTomorrow) return `mañana a las ${next.time}`;
    return `el ${day.long} a las ${next.time}`;
}

/**
 * Un mes del calendario: los días con sus sesiones, si se entrenó y con qué intensidad (según
 * el volumen del día), y cuántas celdas vacías van antes del día 1 (la semana empieza el lunes).
 * @param offset  0 = el mes de hoy, -1 = el anterior…
 */
function calendarMonth(workouts, offset = 0, today = new Date()) {
    const base = new Date(today.getFullYear(), today.getMonth() + offset, 1);
    const year = base.getFullYear();
    const month = base.getMonth();
    const byDate = {};
    (workouts || []).forEach(w => { if (w && w.date) (byDate[w.date] ||= []).push(w); });
    const pad = n => String(n).padStart(2, '0');
    const todayStr = `${today.getFullYear()}-${pad(today.getMonth() + 1)}-${pad(today.getDate())}`;
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const days = [];
    for (let day = 1; day <= daysInMonth; day++) {
        const date = `${year}-${pad(month + 1)}-${pad(day)}`;
        const sessions = byDate[date] || [];
        const volume = sessions.reduce((sum, w) => sum + (w.volume || 0), 0);
        const trained = sessions.length > 0;
        days.push({ day, date, sessions, trained, volume, isToday: date === todayStr,
            intensity: trained ? (volume > 3000 ? 'high' : volume > 800 ? 'mid' : 'low') : '' });
    }
    return { year, month, leadingEmpty: (new Date(year, month, 1).getDay() + 6) % 7, days };
}
