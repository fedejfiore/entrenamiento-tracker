// Ajustes generales: día en que empieza la semana y tiempo para cambiar de lado en los
// ejercicios unilaterales. Script clásico (no módulo): comparte el ámbito global.

const WEEK_START_OPTIONS = [[1, 'Lunes'], [0, 'Domingo'], [6, 'Sábado']];

const SIDE_SWITCH_DEFAULT = 5;

function loadAppSettings() {
    const saved = db.get('appSettings') || {};
    const weekStart = WEEK_START_OPTIONS.some(([v]) => v === saved.weekStart) ? saved.weekStart : 1;
    const side = Number(saved.sideSwitchSeconds);
    return {
        weekStart,
        sideSwitchSeconds: Number.isFinite(side) && side >= 0 && side <= 30 ? side : SIDE_SWITCH_DEFAULT
    };
}

function saveAppSettings(patch) {
    try {
        db.set('appSettings', { ...loadAppSettings(), ...patch });
    } catch (e) {
        showToast('No se pudo guardar el ajuste', 'error');
    }
}

function bindGeneralSettings() {
    const week = document.getElementById('weekStartSelect');
    const side = document.getElementById('sideSwitchSelect');
    const st = loadAppSettings();
    if (week) {
        week.innerHTML = WEEK_START_OPTIONS.map(([v, l]) => `<option value="${v}">${l}</option>`).join('');
        week.value = String(st.weekStart);
        week.addEventListener('change', () => {
            saveAppSettings({ weekStart: parseInt(week.value, 10) });
            renderMuscleMap();
        });
    }
    if (side) {
        side.innerHTML = [0, 3, 5, 8, 10, 15].map(s => `<option value="${s}">${s === 0 ? 'Sin pausa' : s + ' segundos'}</option>`).join('');
        side.value = String(st.sideSwitchSeconds);
        side.addEventListener('change', () => saveAppSettings({ sideSwitchSeconds: parseInt(side.value, 10) }));
    }
}
