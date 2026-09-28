// Ajustes generales: día en que empieza la semana, tiempo para cambiar de lado en los
// unilaterales, unidad de distancia (km / millas) y color de la app.
// Script clásico (no módulo): comparte el ámbito global.

const WEEK_START_OPTIONS = [[1, 'Lunes'], [0, 'Domingo'], [6, 'Sábado']];

const SIDE_SWITCH_DEFAULT = 5;

// Color de acento: botones, destacados y el mapa de músculos. [clave, nombre, muestra]
// [clave, nombre, muestra en tema oscuro, muestra en tema claro] (los mismos tonos de css/tokens.css)
const ACCENT_OPTIONS = [
    ['naranja', 'Naranja', '#ff6b35', '#c2410c'],
    ['turquesa', 'Turquesa', '#2dd4bf', '#0f766e'],
    ['azul', 'Azul', '#60a5fa', '#1d4ed8'],
    ['fucsia', 'Rosa fucsia', '#f472b6', '#be185d'],
    ['verde', 'Verde', '#4ade80', '#166534'],
    ['violeta', 'Violeta', '#a78bfa', '#6d28d9']
];

function currentAccent() {
    const saved = db.get('accentColor');
    return ACCENT_OPTIONS.some(([k]) => k === saved) ? saved : 'naranja';
}

function applyAccent(key) {
    if (key === 'naranja') document.documentElement.removeAttribute('data-accent');
    else document.documentElement.setAttribute('data-accent', key);
}

function loadAppSettings() {
    const saved = db.get('appSettings') || {};
    const weekStart = WEEK_START_OPTIONS.some(([v]) => v === saved.weekStart) ? saved.weekStart : 1;
    const side = Number(saved.sideSwitchSeconds);
    return {
        weekStart,
        sideSwitchSeconds: Number.isFinite(side) && side >= 0 && side <= 30 ? side : SIDE_SWITCH_DEFAULT,
        distanceUnit: DISTANCE_UNITS[saved.distanceUnit] ? saved.distanceUnit : 'km'
    };
}

function saveAppSettings(patch) {
    try {
        db.set('appSettings', { ...loadAppSettings(), ...patch });
    } catch (e) {
        showToast('No se pudo guardar el ajuste', 'error');
    }
}

// Cambiar la unidad con series cargadas: se leen en la unidad vieja y se redibujan en la nueva.
function changeDistanceUnit(unit) {
    const blocks = [...document.querySelectorAll('.exercise-row[data-type="km"]')];
    const sets = blocks.map(b => readBlockSets(b));
    setDistanceUnit(unit);
    saveAppSettings({ distanceUnit: unit });
    blocks.forEach((b, i) => {
        renderBlockSets(b, 'km', sets[i]);
        const last = b.querySelector('.exercise-last');
        if (last) last.innerHTML = buildLastSummaryText(exerciseStats[getBlockName(b)] || {}, 'km');
    });
    hideSetStepper();
}

function bindGeneralSettings() {
    const week = document.getElementById('weekStartSelect');
    const side = document.getElementById('sideSwitchSelect');
    const st = loadAppSettings();
    setDistanceUnit(st.distanceUnit);
    const dist = document.getElementById('distanceUnitSelect');
    if (dist) {
        dist.innerHTML = Object.entries(DISTANCE_UNITS).map(([k, d]) => `<option value="${k}">${d.name}</option>`).join('');
        dist.value = st.distanceUnit;
        dist.addEventListener('change', () => changeDistanceUnit(dist.value));
    }
    if (week) {
        week.innerHTML = WEEK_START_OPTIONS.map(([v, l]) => `<option value="${v}">${l}</option>`).join('');
        week.value = String(st.weekStart);
        week.addEventListener('change', () => {
            saveAppSettings({ weekStart: parseInt(week.value, 10) });
            renderMuscleMap();
        });
    }
    const accents = document.getElementById('accentChoices');
    if (accents) {
        const render = () => {
            const cur = currentAccent();
            accents.innerHTML = ACCENT_OPTIONS.map(([k, label, dark, light]) =>
                `<button type="button" class="accent-choice${k === cur ? ' on' : ''}" role="radio" aria-checked="${k === cur}" data-accent="${k}" style="--swatch-dark:${dark};--swatch-light:${light}" title="${label}"><span></span>${label}</button>`).join('');
        };
        render();
        accents.addEventListener('click', e => {
            const b = e.target.closest('[data-accent]');
            if (!b) return;
            try { db.set('accentColor', b.dataset.accent); } catch (err) {}
            applyAccent(b.dataset.accent);
            render();
        });
    }
    if (side) {
        side.innerHTML = [0, 3, 5, 8, 10, 15].map(s => `<option value="${s}">${s === 0 ? 'Sin pausa' : s + ' segundos'}</option>`).join('');
        side.value = String(st.sideSwitchSeconds);
        side.addEventListener('change', () => saveAppSettings({ sideSwitchSeconds: parseInt(side.value, 10) }));
    }
}
