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
    renderTodayCard(plan);
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

// Qué rutina toca ese día (opcional): "Automática" deja que la app la elija.
function planRoutineSelectHtml(w, plan, on) {
    const current = plan.routineFor(w.n) || '';
    const options = [...document.querySelectorAll('#routine option')].filter(o => o.value)
        .map(o => `<option value="${escapeHtml(o.value)}"${o.value === current ? ' selected' : ''}>${escapeHtml(o.textContent)}</option>`).join('');
    return `<select class="plan-routine" data-day="${w.n}" aria-label="Rutina del ${w.long}"${on ? '' : ' disabled'}>
            <option value="">Rutina: automática</option>${options}</select>`;
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
                ${planRoutineSelectHtml(w, plan, on)}
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

// ---------- Tarjeta "Hoy toca" (arriba de Inicio) ----------
// Qué entrenar hoy con un toque: la rutina del programa en curso o, si no hay, la que hace
// más que no hacés. Se puede cambiar desde la misma tarjeta. Si hay una sesión empezada,
// ofrece seguirla; los días de descanso o ya entrenados lo dice, y deja entrenar igual.

let todayCardChoice = null; // rutina elegida a mano en la tarjeta (solo por hoy)

function todayRoutineKey(weekday = new Date().getDay()) {
    const keys = [...document.querySelectorAll('#routine option')].map(o => o.value).filter(Boolean);
    if (todayCardChoice && keys.includes(todayCardChoice)) return todayCardChoice;
    const planned = getCurrentPlan().routineFor(weekday);
    if (planned && keys.includes(planned)) return planned;
    const byName = keys.filter(k => routineLabelMatchesWeekday(routineLabelOf(k), weekday));
    if (byName.length === 1) return byName[0];
    const active = repo.routines.activeProgram();
    const program = active && findProgram(active.id);
    if (program) {
        const { key } = nextProgramDay(program);
        if (keys.includes(key)) return key;
    }
    return suggestedRoutineKey && keys.includes(suggestedRoutineKey) ? suggestedRoutineKey : (keys[0] || null);
}

function todayRoutinePreviewHtml(key) {
    const names = routineExercisesOf(key);
    const shown = names.slice(0, 5).map(escapeHtml).join(' · ');
    const last = lastDoneOf(key);
    const days = last ? Math.floor((Date.now() - new Date(last + 'T00:00:00').getTime()) / 86400000) : null;
    const when = days === null ? 'Nunca la hiciste' : days === 0 ? 'La hiciste hoy' : `La última vez: hace ${days} ${days === 1 ? 'día' : 'días'}`;
    return `<small class="today-exercises">${shown}${names.length > 5 ? ` · +${names.length - 5} más` : ''}</small>
        <small class="today-when">${names.length} ${names.length === 1 ? 'ejercicio' : 'ejercicios'} · ${when}</small>`;
}

function renderTodayCard(plan) {
    const card = document.getElementById('todayPlanBanner');
    if (!card) return;
    card.hidden = false;
    const weekday = new Date().getDay();
    const draftRoutine = document.getElementById('routine')?.value;
    const inProgress = !!(currentSessionStartTime && draftRoutine);
    let head;
    let state;
    if (inProgress) {
        const min = Math.max(1, Math.round((Date.now() - currentSessionStartTime) / 60000));
        state = 'progress';
        head = `⏱️ <strong>Sesión en curso</strong> · ${escapeHtml(routineLabelOf(draftRoutine))} · ${min} min`;
    } else if (!plan.isEmpty && plan.includes(weekday) && !trainedToday()) {
        state = 'due';
        head = `🏋️ <strong>Hoy toca entrenar</strong> · ${plan.timeFor(weekday)}`;
    } else if (!plan.isEmpty && trainedToday()) {
        state = 'done';
        const tomorrow = new Date();
        tomorrow.setHours(24, 0, 0, 0);
        const next = plan.nextSession(tomorrow);
        head = `✅ <strong>Hoy ya entrenaste.</strong> ¡Bien!${next ? ` Próximo: ${escapeHtml(describeNext(next))}.` : ''}`;
    } else if (!plan.isEmpty) {
        state = 'rest';
        head = `💤 <strong>Hoy es día de descanso.</strong> Próximo: ${escapeHtml(describeNext(plan.nextSession()))}.`;
    } else {
        state = 'free';
        head = '🎯 <strong>Rutina sugerida</strong>';
    }
    card.className = `plan-banner today-card today-${state}`;
    if (inProgress) {
        card.innerHTML = `<div class="today-head">${head}</div>
            <button type="button" class="success today-go" data-today="continue">▶ Seguir entrenando</button>`;
        return;
    }
    const nextDay = (state === 'rest' || state === 'done') ? plan.nextSession(state === 'done' ? (() => { const t = new Date(); t.setHours(24, 0, 0, 0); return t; })() : new Date()) : null;
    const key = todayRoutineKey(nextDay ? nextDay.weekday : weekday);
    if (!key) {
        card.innerHTML = `<div class="today-head">${head}</div><small>Creá tu primera rutina en Entrenar o elegí un programa.</small>`;
        return;
    }
    const options = [...document.querySelectorAll('#routine option')].filter(o => o.value)
        .map(o => `<option value="${escapeHtml(o.value)}"${o.value === key ? ' selected' : ''}>${escapeHtml(o.textContent)}</option>`).join('');
    const primary = state === 'due' || state === 'free';
    card.innerHTML = `<div class="today-head">${head}</div>
        <div class="today-routine">
            <strong class="today-name">${escapeHtml(routineLabelOf(key))}</strong>
            ${todayRoutinePreviewHtml(key)}
        </div>
        <div class="today-actions">
            <button type="button" class="${primary ? 'success' : 'today-secondary'} today-go" data-today="start">▶ ${primary ? 'Empezar' : 'Entrenar igual'}</button>
            <select class="today-pick" aria-label="Elegir otra rutina para hoy">${options}</select>
        </div>`;
}

function startTodayRoutine() {
    const key = document.querySelector('#todayPlanBanner .today-pick')?.value || todayRoutineKey();
    if (!key) return;
    showScreen('entrenar', true);
    const sel = document.getElementById('routine');
    if (!sel) return;
    sel.value = key;
    loadRoutineExercises();
    saveWorkoutDraft();
    todayCardChoice = null;
}

/** Al abrir la app un día de entrenamiento (sin haber entrenado): un aviso, una vez por día. */
function maybeRemindTodayPlan() {
    const plan = getCurrentPlan();
    const today = getLocalDateString();
    if (plan.isEmpty || !plan.includes(new Date().getDay()) || trainedToday()) return;
    // En Inicio ya lo dice la tarjeta "Hoy toca": el aviso es para cuando la app abre en otra pantalla.
    if (document.querySelector('.screen-active')?.dataset.screen === 'inicio') return;
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
    const routines = {};
    document.querySelectorAll('#planEditor .plan-routine').forEach(el => { if (el.value) routines[el.dataset.day] = el.value; });
    return new TrainingPlan({ days, times, remind, routines });
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
        row.querySelectorAll('.plan-time select, .plan-routine').forEach(s => { s.disabled = !e.target.checked; });
    });
    const onAction = e => {
        const el = e.target.closest('[data-plan-action]');
        if (!el) return;
        if (el.dataset.planAction === 'save') savePlanFromEditor();
        if (el.dataset.planAction === 'ics') exportPlanIcs();
    };
    section?.addEventListener('click', onAction);
    const card = document.getElementById('todayPlanBanner');
    card?.addEventListener('click', e => {
        const el = e.target.closest('[data-today]');
        if (!el) return;
        if (el.dataset.today === 'start') startTodayRoutine();
        if (el.dataset.today === 'continue') showScreen('entrenar', true);
    });
    card?.addEventListener('change', e => {
        if (!e.target.classList.contains('today-pick')) return;
        todayCardChoice = e.target.value;
        renderTodayCard(getCurrentPlan());
    });
}
