// Primer uso guiado (solo la primera vez y si todavía no hay sesiones): idioma, unidades,
// días de entrenamiento y cómo empezar (programa, rutina básica, crear una o traer historial).
// Todo se puede saltar y después cambiar en Ajustes. Si se cambia el idioma, la app se
// recarga y la guía sigue en el paso siguiente.
// Script clásico (no módulo): comparte el ámbito global con el resto de la app.

const ONBOARDING_STEPS = 4;
let onboardingStep = 1;
let onboardingDays = new Set([1, 3, 5]);
let onboardingTime = '19:00';

function shouldShowOnboarding() {
    try {
        if (db.get('onboardingDone') === '1') return false;
        if (repo.workouts.all().length > 0) return false; // quien ya usa la app no la necesita
        if (loadTrainingDaysPlanHistory().length > 0) return false; // ya armó su plan
    } catch (e) { return false; }
    return true;
}

function maybeStartOnboarding() {
    if (!shouldShowOnboarding()) return;
    let resume = 0;
    try { resume = parseInt(sessionStorage.getItem('onboardingStep') || '0', 10); } catch (e) {}
    openOnboarding(resume > 1 ? resume : 1);
}

function openOnboarding(step = 1) {
    const modal = document.getElementById('onboarding');
    if (!modal) return;
    onboardingStep = step;
    renderOnboarding();
    modal.classList.add('open');
}

function onboardingStepHtml(step) {
    if (step === 1) {
        let lang = 'auto';
        try { lang = localStorage.getItem('language') || 'auto'; } catch (e) {}
        return `<div class="ob-hero">🏋️</div>
            <h3>¡Bienvenido a ${escapeHtml(APP_BRAND.name)}!</h3>
            <p>Registrá tus entrenamientos, seguí tu progreso y hacé crecer tu flor cada semana. Te preparo la app en cuatro pasos.</p>
            <label for="obLanguage" class="settings-label">Idioma / Language / Idioma</label>
            <select id="obLanguage" translate="no">
                <option value="auto"${lang === 'auto' ? ' selected' : ''}>Automático / Auto</option>
                <option value="es"${lang === 'es' ? ' selected' : ''}>Español</option>
                <option value="en"${lang === 'en' ? ' selected' : ''}>English</option>
                <option value="pt"${lang === 'pt' ? ' selected' : ''}>Português (Brasil)</option>
                <option value="de"${lang === 'de' ? ' selected' : ''}>Deutsch</option>
                <option value="zh"${lang === 'zh' ? ' selected' : ''}>简体中文</option>
            </select>`;
    }
    if (step === 2) {
        const st = loadAppSettings();
        const opt = (v, cur, label) => `<button type="button" class="ob-choice${v === cur ? ' on' : ''}" data-value="${v}">${label}</button>`;
        const on = loadDisciplines();
        return `<h3>¿Qué entrenás?</h3>
            <p>Podés elegir más de una. La app te muestra solo lo tuyo.</p>
            <div class="discipline-chips ob-disciplines">${DISCIPLINES.map(([k, icon, label]) => `<button type="button" class="discipline-chip${on.includes(k) ? ' on' : ''}" data-discipline="${k}" aria-pressed="${on.includes(k)}">${icon} ${label}</button>`).join('')}</div>
            <h3>¿En qué unidades?</h3>
            <p>Se puede cambiar cuando quieras en Ajustes → General. Tu historial no cambia.</p>
            <p class="settings-label">Peso</p>
            <div class="ob-choices" data-ob="weight">${opt('kg', st.weightUnit, 'Kilos (kg)')}${opt('lb', st.weightUnit, 'Libras (lb)')}</div>
            <p class="settings-label">Distancia en cardio</p>
            <div class="ob-choices" data-ob="distance">${opt('km', st.distanceUnit, 'Kilómetros (km)')}${opt('mi', st.distanceUnit, 'Millas (mi)')}</div>`;
    }
    if (step === 3) {
        const chips = WEEKDAYS.map(w => `<button type="button" class="ob-day${onboardingDays.has(w.n) ? ' on' : ''}" data-day="${w.n}" aria-pressed="${onboardingDays.has(w.n)}">${w.short}</button>`).join('');
        return `<h3>¿Qué días entrenás?</h3>
            <p>Con tu plan, la app te dice qué toca cada día y tu flor crece con cada semana cumplida.</p>
            <div class="ob-days">${chips}</div>
            <label for="obTime" class="settings-label">¿A qué hora, más o menos?</label>
            <select id="obTime">${['07:00', '08:00', '09:00', '12:00', '13:00', '17:00', '18:00', '19:00', '20:00', '21:00'].map(t => `<option${t === onboardingTime ? ' selected' : ''}>${t}</option>`).join('')}</select>`;
    }
    return `<h3>¿Cómo querés empezar?</h3>
        <p>Elegí una opción (después podés cambiar o sumar todas las rutinas que quieras).</p>
        <div class="ob-starts">
            <button type="button" class="ob-start" data-start="programs"><b>📚 Un programa armado</b><small>Con progresión automática: la app te dice qué peso y cuántas reps hacer.</small></button>
            <button type="button" class="ob-start" data-start="basic"><b>🏋️ Una rutina básica</b><small>Torso y pierna, lista para entrenar hoy.</small></button>
            <button type="button" class="ob-start" data-start="create"><b>✏️ Armar la mía</b><small>Le ponés nombre y le sumás tus ejercicios.</small></button>
            <button type="button" class="ob-start" data-start="import"><b>📥 Traer mi historial</b><small>De Hevy, Strong o Fitbod (archivo CSV).</small></button>
        </div>
        <div class="ob-legal">Al usar la app aceptás los términos y la política de privacidad. Tus datos quedan en tu celular.
            <div class="legal-links"><button type="button" class="link-btn" ${fnAttrs('openLegal', 'privacy')}>Política de privacidad</button><span aria-hidden="true">·</span><button type="button" class="link-btn" ${fnAttrs('openLegal', 'terms')}>Términos y condiciones</button></div>
        </div>`;
}

function renderOnboarding() {
    const box = document.getElementById('onboardingBody');
    if (!box) return;
    box.innerHTML = onboardingStepHtml(onboardingStep);
    document.getElementById('onboardingDots').innerHTML = Array.from({ length: ONBOARDING_STEPS }, (_, i) => `<span class="${i + 1 === onboardingStep ? 'on' : ''}"></span>`).join('');
    const next = document.querySelector('#onboarding [data-ob-action="next"]');
    if (next) next.hidden = onboardingStep === ONBOARDING_STEPS;
    const back = document.querySelector('#onboarding [data-ob-action="back"]');
    if (back) back.hidden = onboardingStep === 1;
}

function onboardingNext() {
    if (onboardingStep === 1) {
        const lang = document.getElementById('obLanguage')?.value || 'auto';
        let current = 'auto';
        try { current = localStorage.getItem('language') || 'auto'; } catch (e) {}
        if (lang !== current) {
            // Cambiar el idioma recarga la app: la guía sigue en el paso 2.
            try { sessionStorage.setItem('onboardingStep', '2'); } catch (e) {}
            setAppLanguage(lang);
            return;
        }
    }
    if (onboardingStep === 3) saveOnboardingPlan();
    onboardingStep = Math.min(ONBOARDING_STEPS, onboardingStep + 1);
    try { sessionStorage.setItem('onboardingStep', String(onboardingStep)); } catch (e) {}
    renderOnboarding();
}

function saveOnboardingPlan() {
    const days = [...onboardingDays];
    if (!days.length) return;
    const time = onboardingTime || DEFAULT_PLAN_TIME;
    const times = Object.fromEntries(days.map(d => [d, time]));
    try {
        saveCurrentPlan(new TrainingPlan({ days, times }));
        renderPlanSection();
    } catch (e) {
        showToast(`❌ No se pudo guardar el plan. ${e.message}`, 'error', 5000);
    }
}

function finishOnboarding(start) {
    try { db.set('onboardingDone', '1'); sessionStorage.removeItem('onboardingStep'); } catch (e) {}
    document.getElementById('onboarding')?.classList.remove('open');
    const wu = document.getElementById('weightUnitSelect');
    if (wu) wu.value = loadAppSettings().weightUnit;
    const du = document.getElementById('distanceUnitSelect');
    if (du) du.value = loadAppSettings().distanceUnit;
    if (start === 'programs') openProgramsModal();
    else if (start === 'basic') { showScreen('entrenar', true); const sel = document.getElementById('routine'); if (sel) { sel.value = 'A'; loadRoutineExercises(); } }
    else if (start === 'create') { showScreen('entrenar', true); setTimeout(() => document.getElementById('newRoutineName')?.focus(), 150); }
    else if (start === 'import') goToSection('ajustes', 'importHistorySection');
}

function bindOnboarding() {
    const modal = document.getElementById('onboarding');
    if (!modal) return;
    modal.addEventListener('click', e => {
        const action = e.target.closest('[data-ob-action]')?.dataset.obAction;
        if (action === 'next') { onboardingNext(); return; }
        if (action === 'back') { onboardingStep = Math.max(1, onboardingStep - 1); renderOnboarding(); return; }
        if (action === 'skip') { finishOnboarding(null); return; }
        const disc = e.target.closest('[data-discipline]');
        if (disc) { toggleDiscipline(disc.dataset.discipline); renderOnboarding(); return; }
        const choice = e.target.closest('.ob-choice');
        if (choice) {
            const group = choice.closest('[data-ob]').dataset.ob;
            if (group === 'weight') changeWeightUnit(choice.dataset.value);
            if (group === 'distance') changeDistanceUnit(choice.dataset.value);
            renderOnboarding();
            return;
        }
        const day = e.target.closest('.ob-day');
        if (day) {
            const n = +day.dataset.day;
            if (onboardingDays.has(n)) onboardingDays.delete(n); else onboardingDays.add(n);
            renderOnboarding();
            return;
        }
        const start = e.target.closest('[data-start]');
        if (start) { finishOnboarding(start.dataset.start); }
    });
    modal.addEventListener('change', e => {
        if (e.target.id === 'obTime') onboardingTime = e.target.value;
    });
}
