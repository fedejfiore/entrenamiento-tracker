// Progreso → "Músculos trabajados": figura de frente y espalda coloreada según las series
// efectivas por músculo (sin calentamiento), llevadas a promedio semanal para compararlas
// con el rango habitual de 10 a 20 series por semana. Tocar un músculo muestra su detalle.

const MUSCLE_MAP_PERIODS = {
    '7': { label: 'Últimos 7 días', days: 7 },
    '30': { label: 'Últimos 30 días', days: 30 },
    '90': { label: 'Últimos 3 meses', days: 90 }
};

let muscleMapSelected = null;

// Figura estilizada: la silueta de base y encima cada músculo con su grupo (data-group).
const BODY_BASE = `
    <circle cx="50" cy="14" r="10"/>
    <rect x="45" y="22" width="10" height="8" rx="3"/>
    <path d="M28 32 Q50 25 72 32 L75 98 Q50 108 25 98 Z"/>
    <ellipse cx="20" cy="60" rx="7" ry="16"/><ellipse cx="80" cy="60" rx="7" ry="16"/>
    <ellipse cx="16" cy="88" rx="5" ry="15"/><ellipse cx="84" cy="88" rx="5" ry="15"/>
    <path d="M27 97 Q50 110 73 97 L71 116 Q50 122 29 116 Z"/>
    <ellipse cx="40" cy="140" rx="10" ry="28"/><ellipse cx="60" cy="140" rx="10" ry="28"/>
    <ellipse cx="40" cy="186" rx="7" ry="22"/><ellipse cx="60" cy="186" rx="7" ry="22"/>`;

const BODY_FRONT = `
    <ellipse data-group="Hombros" cx="27" cy="38" rx="8" ry="7"/><ellipse data-group="Hombros" cx="73" cy="38" rx="8" ry="7"/>
    <ellipse data-group="Pecho" cx="40" cy="47" rx="10" ry="8"/><ellipse data-group="Pecho" cx="60" cy="47" rx="10" ry="8"/>
    <rect data-group="Core" x="42" y="58" width="16" height="38" rx="5"/>
    <ellipse data-group="Core" cx="34" cy="78" rx="4" ry="13"/><ellipse data-group="Core" cx="66" cy="78" rx="4" ry="13"/>
    <ellipse data-group="Bíceps" cx="20" cy="58" rx="5" ry="12"/><ellipse data-group="Bíceps" cx="80" cy="58" rx="5" ry="12"/>
    <ellipse data-group="Piernas" cx="40" cy="138" rx="9" ry="25"/><ellipse data-group="Piernas" cx="60" cy="138" rx="9" ry="25"/>`;

const BODY_BACK = `
    <ellipse data-group="Espalda" cx="50" cy="35" rx="13" ry="7"/>
    <ellipse data-group="Hombros" cx="27" cy="38" rx="8" ry="7"/><ellipse data-group="Hombros" cx="73" cy="38" rx="8" ry="7"/>
    <ellipse data-group="Espalda" cx="38" cy="62" rx="9" ry="17"/><ellipse data-group="Espalda" cx="62" cy="62" rx="9" ry="17"/>
    <rect data-group="Espalda" x="44" y="78" width="12" height="18" rx="4"/>
    <ellipse data-group="Tríceps" cx="20" cy="58" rx="5" ry="12"/><ellipse data-group="Tríceps" cx="80" cy="58" rx="5" ry="12"/>
    <ellipse data-group="Glúteos" cx="41" cy="108" rx="10" ry="9"/><ellipse data-group="Glúteos" cx="59" cy="108" rx="10" ry="9"/>
    <ellipse data-group="Piernas" cx="40" cy="142" rx="8" ry="22"/><ellipse data-group="Piernas" cx="60" cy="142" rx="8" ry="22"/>
    <ellipse data-group="Gemelos" cx="40" cy="184" rx="7" ry="16"/><ellipse data-group="Gemelos" cx="60" cy="184" rx="7" ry="16"/>`;

const MAPPED_GROUPS = ['Pecho', 'Espalda', 'Hombros', 'Bíceps', 'Tríceps', 'Piernas', 'Glúteos', 'Gemelos', 'Core'];

function muscleFigureSvg(regions, caption) {
    return `<figure class="muscle-figure">
            <svg viewBox="0 0 100 212" role="img" aria-label="Músculos trabajados, vista de ${caption.toLowerCase()}">
                <g class="body-base">${BODY_BASE}</g>
                <g class="body-muscles">${regions}</g>
            </svg>
            <figcaption>${caption}</figcaption>
        </figure>`;
}

function muscleMapData() {
    const periodKey = document.getElementById('muscleMapPeriod')?.value || '7';
    const days = (MUSCLE_MAP_PERIODS[periodKey] || MUSCLE_MAP_PERIODS['7']).days;
    const to = getLocalDateString();
    const fromDate = new Date();
    fromDate.setDate(fromDate.getDate() - (days - 1));
    const from = formatDateLocal(fromDate);
    const byGroup = muscleSetsByGroup(repo.workouts.all(), from, to, getMuscleGroup);
    const weekly = sets => Math.round(sets * 7 / days * 10) / 10;
    return { byGroup, weekly, days };
}

function renderMuscleMap() {
    const box = document.getElementById('muscleMap');
    if (!box) return;
    const { byGroup, weekly } = muscleMapData();
    box.innerHTML = muscleFigureSvg(BODY_FRONT, 'Frente') + muscleFigureSvg(BODY_BACK, 'Espalda');
    box.querySelectorAll('[data-group]').forEach(el => {
        const g = el.dataset.group;
        const level = muscleLevel(weekly(byGroup[g]?.sets || 0));
        el.setAttribute('class', `muscle lvl-${level}${muscleMapSelected === g ? ' selected' : ''}`);
        el.setAttribute('tabindex', '0');
        el.innerHTML = `<title>${g}: ${formatNumber(weekly(byGroup[g]?.sets || 0))} series por semana</title>`;
    });

    const legend = document.getElementById('muscleMapLegend');
    if (legend) {
        legend.innerHTML = MUSCLE_LEVELS.map((l, i) => `<span class="muscle-legend-item"><i class="lvl-${i}"></i>${l.label}</span>`).join('');
    }
    renderMuscleMapList(byGroup, weekly);
}

function renderMuscleMapList(byGroup, weekly) {
    const list = document.getElementById('muscleMapList');
    if (!list) return;
    const groups = [...MAPPED_GROUPS, ...Object.keys(byGroup).filter(g => !MAPPED_GROUPS.includes(g))];
    const rows = groups
        .map(g => ({ g, sets: byGroup[g]?.sets || 0, exercises: byGroup[g]?.exercises || {} }))
        .filter(r => r.sets > 0 || MAPPED_GROUPS.includes(r.g))
        .sort((a, b) => b.sets - a.sets);
    const visible = muscleMapSelected ? rows.filter(r => r.g === muscleMapSelected) : rows;
    list.innerHTML = visible.map(r => {
        const w = weekly(r.sets);
        const level = muscleLevel(w);
        const detail = Object.entries(r.exercises).sort((a, b) => b[1] - a[1]).map(([n, s]) => `${escapeHtml(n)} (${s})`).join(', ');
        const offMap = !MAPPED_GROUPS.includes(r.g) ? ' <small>(no se muestra en la figura)</small>' : '';
        return `<div class="muscle-row" data-group="${escapeHtml(r.g)}">
                <span class="muscle-dot lvl-${level}"></span>
                <div class="muscle-row-text">
                    <strong>${escapeHtml(r.g)}</strong>${offMap} · ${formatNumber(w)} series/semana
                    ${detail ? `<small>${detail}</small>` : '<small>Sin series en este período</small>'}
                </div>
            </div>`;
    }).join('') + (muscleMapSelected ? '<button type="button" class="small" data-muscle-action="all">Ver todos los músculos</button>' : '');
}

function bindMuscleMap() {
    document.getElementById('muscleMapPeriod')?.addEventListener('change', renderMuscleMap);
    const section = document.getElementById('muscleMapSection');
    const select = g => { muscleMapSelected = muscleMapSelected === g ? null : g; renderMuscleMap(); };
    section?.addEventListener('click', e => {
        if (e.target.closest('[data-muscle-action="all"]')) { muscleMapSelected = null; renderMuscleMap(); return; }
        const el = e.target.closest('.muscle[data-group], .muscle-row[data-group]');
        if (el) select(el.dataset.group);
    });
    section?.addEventListener('keydown', e => {
        const el = e.target.closest('.muscle[data-group]');
        if (el && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); select(el.dataset.group); }
    });
}
