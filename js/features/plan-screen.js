// Inicio → "Mi plan semanal": días y horarios de entrenamiento, estado de la semana,
// aviso de "hoy toca" y recordatorios en el calendario del celular.

function currentWeekStartStr() {
    return formatDateLocal(getMonday(new Date()));
}

function getCurrentPlan() {
    return TrainingPlan.forWeek(loadTrainingDaysPlanHistory(), currentWeekStartStr());
}

// El cambio rige desde la semana en curso: no reescribe cómo se evaluaron semanas pasadas.
function saveCurrentPlan(plan) {
    const history = loadTrainingDaysPlanHistory();
    const mondayStr = currentWeekStartStr();
    const entry = { date: mondayStr, ...plan.toJSON() };
    const last = history[history.length - 1];
    if (last && last.date === mondayStr) history[history.length - 1] = entry;
    else history.push(entry);
    repo.routines.savePlanHistory(history);
}

/** Duración típica de una sesión (promedio de las últimas 10 con duración), para el calendario. */
function typicalSessionMinutes() {
    const durations = repo.workouts.all().map(w => w.duration).filter(d => typeof d === 'number' && d > 0).slice(-10);
    return durations.length ? Math.round(durations.reduce((a, b) => a + b, 0) / durations.length) : 60;
}

function planCalendarOptions() {
    const appUrl = location.href.split(/[?#]/)[0];
    return {
        title: '🏋️ Entrenar',
        description: `Recordatorio de tu plan semanal. Abrí la app para registrar la sesión: ${appUrl}`,
        durationMin: typicalSessionMinutes(),
        now: new Date()
    };
}

function trainedToday() {
    const today = getLocalDateString();
    return repo.workouts.all().some(w => w.date === today);
}

function describeNext(next) {
    if (!next) return '';
    const day = WEEKDAYS.find(w => w.n === next.weekday);
    return next.isToday ? `hoy a las ${next.time}` : `el ${day.long} a las ${next.time}`;
}

// ---------- Dibujo ----------

function renderPlanSection() {
    const plan = getCurrentPlan();
    renderPlanEditor(plan);
    renderPlanStatus(plan);
    renderPlanCalendar(plan);
    renderTodayPlanBanner(plan);
}

// Hora y minutos con dos selectores (cada 5 minutos). El reloj nativo de Android abría un
// diálogo que no entraba en pantallas chicas.
function planTimeSelectsHtml(w, value, on) {
    const [hh, mm] = String(value).split(':');
    const pad = n => String(n).padStart(2, '0');
    const minutes = Array.from({ length: 12 }, (_, i) => pad(i * 5));
    if (!minutes.includes(mm)) minutes.push(mm);
    const opts = (list, cur) => list.map(v => `<option value="${v}"${v === cur ? ' selected' : ''}>${v}</option>`).join('');
    const dis = on ? '' : ' disabled';
    return `<span class="plan-time" data-day="${w.n}">
            <select class="plan-hh" aria-label="Hora del ${w.long}"${dis}>${opts(Array.from({ length: 24 }, (_, i) => pad(i)), hh)}</select>
            <span aria-hidden="true">:</span>
            <select class="plan-mm" aria-label="Minutos del ${w.long}"${dis}>${opts(minutes.sort(), mm)}</select>
        </span>`;
}

function renderPlanEditor(plan) {
    const editor = document.getElementById('planEditor');
    if (!editor) return;
    editor.innerHTML = WEEKDAYS.map(w => {
        const on = plan.includes(w.n);
        return `<div class="plan-day${on ? ' on' : ''}">
                <label class="plan-day-toggle">
                    <input type="checkbox" class="day-plan-checkbox" value="${w.n}"${on ? ' checked' : ''}>
                    <span>${w.short}</span>
                </label>
                ${planTimeSelectsHtml(w, plan.timeFor(w.n) || DEFAULT_PLAN_TIME, on)}
            </div>`;
    }).join('');
    const remind = document.getElementById('planRemind');
    if (remind) {
        remind.innerHTML = REMIND_OPTIONS.map(([v, label]) => `<option value="${v}"${v === plan.remind ? ' selected' : ''}>${label}</option>`).join('');
    }
}

function renderPlanStatus(plan) {
    const status = document.getElementById('weekStatus');
    if (status) {
        status.textContent = WEEK_STATUS_LABELS[getWeekStatus(repo.workouts.all(), plan.days, getMonday(new Date()))];
    }
    const next = document.getElementById('planNext');
    if (next) {
        next.textContent = plan.isEmpty ? 'Elegí qué días entrenás y a qué hora.' : `Próximo entrenamiento: ${describeNext(plan.nextSession())}.`;
    }
}

function renderPlanCalendar(plan) {
    const box = document.getElementById('planGoogleLinks');
    const icsBtn = document.querySelector('[data-plan-action="ics"]');
    if (icsBtn) icsBtn.disabled = plan.isEmpty;
    if (!box) return;
    if (plan.isEmpty) { box.innerHTML = ''; return; }
    box.innerHTML = planGoogleCalendarLinks(plan, planCalendarOptions())
        .map(l => `<a class="plan-gcal" href="${escapeHtml(l.url)}" target="_blank" rel="noopener">📅 Google Calendar · ${escapeHtml(l.label)}</a>`)
        .join('');
}

// Aviso de arriba en Inicio: hoy toca / ya entrenaste / hoy descansás.
function renderTodayPlanBanner(plan) {
    const banner = document.getElementById('todayPlanBanner');
    if (!banner) return;
    if (plan.isEmpty) { banner.hidden = true; return; }
    const today = new Date().getDay();
    banner.hidden = false;
    banner.className = 'plan-banner';
    if (plan.includes(today) && !trainedToday()) {
        banner.classList.add('due');
        const routine = suggestedRoutineKey ? (customRoutineLabels[suggestedRoutineKey] || ROUTINE_LABELS[suggestedRoutineKey] || suggestedRoutineKey) : '';
        banner.innerHTML = `<div><strong>🏋️ Hoy toca entrenar</strong> · ${plan.timeFor(today)}${routine ? `<br><small>Sugerida: ${escapeHtml(routine)}</small>` : ''}</div>
            <button type="button" class="small" data-plan-action="start">▶ Empezar</button>`;
    } else if (plan.includes(today)) {
        banner.classList.add('done');
        banner.innerHTML = '<div><strong>✅ Hoy ya entrenaste.</strong> ¡Bien!</div>';
    } else {
        banner.innerHTML = `<div>💤 Hoy es día de descanso. Próximo: ${escapeHtml(describeNext(plan.nextSession()))}.</div>`;
    }
}

/** Al abrir la app un día de entrenamiento (sin haber entrenado): un aviso, una vez por día. */
function maybeRemindTodayPlan() {
    const plan = getCurrentPlan();
    const today = getLocalDateString();
    if (plan.isEmpty || !plan.includes(new Date().getDay()) || trainedToday()) return;
    if (db.get('planReminderShown') === today) return;
    try { db.set('planReminderShown', today); } catch (e) {}
    showToast(`🏋️ Hoy toca entrenar (${plan.timeFor(new Date().getDay())})`, 'success', 4500);
}

// ---------- Acciones ----------

function readPlanFromEditor() {
    const days = [...document.querySelectorAll('#planEditor .day-plan-checkbox:checked')].map(cb => parseInt(cb.value, 10));
    const times = {};
    document.querySelectorAll('#planEditor .plan-time').forEach(el => { times[el.dataset.day] = `${el.querySelector('.plan-hh').value}:${el.querySelector('.plan-mm').value}`; });
    const remind = parseInt(document.getElementById('planRemind')?.value, 10);
    return new TrainingPlan({ days, times, remind });
}

function savePlanFromEditor() {
    const plan = readPlanFromEditor();
    if (plan.sameAs(getCurrentPlan())) {
        showToast('El plan ya estaba así', 'success', 1800);
        return;
    }
    try {
        saveCurrentPlan(plan);
    } catch (err) {
        showToast(`❌ No se pudo guardar el plan. ${err.message}`, 'error', 6000);
        return;
    }
    renderPlanSection();
    showToast(plan.isEmpty
        ? 'Plan borrado'
        : '✅ Plan guardado. Agregalo al calendario (abajo) para recibir los avisos con la app cerrada.', 'success', 4500);
}

// El .ics se comparte (el celular ofrece abrirlo con el calendario) o, si no se puede, se descarga.
async function exportPlanIcs() {
    const plan = getCurrentPlan();
    if (plan.isEmpty) return;
    const ics = buildPlanIcs(plan, planCalendarOptions());
    const name = 'plan-entrenamiento.ics';
    try {
        const file = new File([ics], name, { type: 'text/calendar' });
        if (navigator.canShare && navigator.canShare({ files: [file] })) {
            await navigator.share({ files: [file], title: 'Plan de entrenamiento' });
            return;
        }
    } catch (e) {
        if (e && e.name === 'AbortError') return; // el usuario cerró el menú de compartir
    }
    const url = URL.createObjectURL(new Blob([ics], { type: 'text/calendar' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = name;
    a.click();
    URL.revokeObjectURL(url);
    showToast('📥 Abrí el archivo descargado para agregarlo a tu calendario', 'success', 4500);
}

function bindPlanSection() {
    const section = document.getElementById('planSection');
    section?.addEventListener('change', e => {
        if (!e.target.classList.contains('day-plan-checkbox')) return;
        const row = e.target.closest('.plan-day');
        row.classList.toggle('on', e.target.checked);
        row.querySelectorAll('.plan-time select').forEach(s => { s.disabled = !e.target.checked; });
    });
    const onAction = e => {
        const el = e.target.closest('[data-plan-action]');
        if (!el) return;
        if (el.dataset.planAction === 'save') savePlanFromEditor();
        if (el.dataset.planAction === 'ics') exportPlanIcs();
        if (el.dataset.planAction === 'start') startSuggestedRoutine();
    };
    section?.addEventListener('click', onAction);
    document.getElementById('todayPlanBanner')?.addEventListener('click', onAction);
}
