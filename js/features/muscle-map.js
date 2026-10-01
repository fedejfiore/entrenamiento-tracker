// Progreso → "Músculos trabajados": figura de frente y espalda coloreada según las series
// efectivas por músculo (sin calentamiento), por semana, para compararlas con el rango
// habitual de 10 a 20 series por semana. Las semanas empiezan el día elegido en Ajustes; la
// semana en curso muestra lo que va hasta hoy. Tocar un músculo muestra su detalle.

const MUSCLE_MAP_PERIODS = {
    last7: 'Últimos 7 días',
    week: 'Esta semana (en curso)',
    lastweek: 'Semana pasada',
    '4w': 'Últimas 4 semanas (promedio)',
    '12w': 'Últimas 12 semanas (promedio)'
};

let muscleMapSelected = null;

const MUSCLE_PATTERN_SVG = `<svg width="0" height="0" style="position:absolute" aria-hidden="true"><defs>
    <pattern id="muscleHighPattern" patternUnits="userSpaceOnUse" width="5" height="5" patternTransform="rotate(45)">
        <rect width="5" height="5" fill="var(--heat-4)"/><rect width="2" height="5" fill="var(--heat-4-stripe)"/>
    </pattern></defs></svg>`;

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
    <ellipse data-group="Cuádriceps" cx="40" cy="138" rx="9" ry="25"/><ellipse data-group="Cuádriceps" cx="60" cy="138" rx="9" ry="25"/>`;

const BODY_BACK = `
    <ellipse data-group="Espalda" cx="50" cy="35" rx="13" ry="7"/>
    <ellipse data-group="Hombros" cx="27" cy="38" rx="8" ry="7"/><ellipse data-group="Hombros" cx="73" cy="38" rx="8" ry="7"/>
    <ellipse data-group="Espalda" cx="38" cy="62" rx="9" ry="17"/><ellipse data-group="Espalda" cx="62" cy="62" rx="9" ry="17"/>
    <rect data-group="Espalda" x="44" y="78" width="12" height="18" rx="4"/>
    <ellipse data-group="Tríceps" cx="20" cy="58" rx="5" ry="12"/><ellipse data-group="Tríceps" cx="80" cy="58" rx="5" ry="12"/>
    <ellipse data-group="Glúteos" cx="41" cy="108" rx="10" ry="9"/><ellipse data-group="Glúteos" cx="59" cy="108" rx="10" ry="9"/>
    <ellipse data-group="Isquios" cx="40" cy="142" rx="8" ry="22"/><ellipse data-group="Isquios" cx="60" cy="142" rx="8" ry="22"/>
    <ellipse data-group="Gemelos" cx="40" cy="184" rx="7" ry="16"/><ellipse data-group="Gemelos" cx="60" cy="184" rx="7" ry="16"/>`;

// Cuádriceps se ve de frente e isquios de espaldas (la cara posterior del muslo).
const MAPPED_GROUPS = ['Pecho', 'Espalda', 'Hombros', 'Bíceps', 'Tríceps', 'Cuádriceps', 'Isquios', 'Glúteos', 'Gemelos', 'Core'];

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
    const select = document.getElementById('muscleMapPeriod');
    const period = MUSCLE_MAP_PERIODS[select?.value] ? select.value : 'last7';
    const range = muscleMapRange(period, new Date(), loadAppSettings().weekStart);
    const byGroup = muscleSetsByGroup(repo.workouts.all(), range.from, range.to, getMuscleGroup);
    const weekly = sets => Math.round(sets / range.weeks * 2) / 2; // de a media serie (las indirectas valen 0,5)
    return { byGroup, weekly, range };
}

function renderMuscleMap() {
    const box = document.getElementById('muscleMap');
    if (!box) return;
    const { byGroup, weekly, range } = muscleMapData();
    // Rayas para el nivel "alto": se definen una vez y las usan la figura, la leyenda y la lista.
    box.innerHTML = MUSCLE_PATTERN_SVG + muscleFigureSvg(BODY_FRONT, 'Frente') + muscleFigureSvg(BODY_BACK, 'Espalda');
    box.querySelectorAll('[data-group]').forEach(el => {
        const g = el.dataset.group;
        const level = muscleLevel(weekly(byGroup[g]?.sets || 0));
        el.setAttribute('class', `muscle lvl-${level}${muscleMapSelected === g ? ' selected' : ''}`);
        el.setAttribute('tabindex', '0');
        el.innerHTML = `<title>${escapeHtml(g)}: ${formatNumber(weekly(byGroup[g]?.sets || 0))} series${range.weeks > 1 ? ' por semana' : ''}</title>`;
    });

    const legend = document.getElementById('muscleMapLegend');
    if (legend) {
        legend.innerHTML = MUSCLE_LEVELS.map((l, i) => `<span class="muscle-legend-item"><svg viewBox="0 0 14 14" aria-hidden="true"><rect class="muscle lvl-${i}" width="14" height="14" rx="3"/></svg>${l.label}</span>`).join('');
    }
    const info = document.getElementById('muscleMapRangeInfo');
    if (info) {
        const d = str => new Date(str + 'T00:00:00').toLocaleDateString('es-AR', { day: 'numeric', month: 'numeric' });
        info.textContent = `Del ${d(range.from)} al ${d(range.to)}` + (range.inProgress
            ? ` · semana en curso, ${range.daysLeft === 0 ? 'último día' : range.daysLeft === 1 ? 'queda 1 día' : `quedan ${range.daysLeft} días`}`
            : range.weeks > 1 ? ` · promedio de ${range.weeks} semanas` : '');
    }
    renderMuscleMapList(byGroup, weekly, range);
}

// Texto de cada músculo respecto del rango ideal (en la semana en curso, lo que falta).
function muscleRangeNote(w, range) {
    const { min, max } = MUSCLE_IDEAL_RANGE;
    if (w > max) return 'por encima del rango';
    if (w >= min) return 'en rango ✓';
    if (range.inProgress) return w > 0 ? `faltan ${formatNumber(Math.ceil(min - w))} para el rango` : 'todavía sin series';
    return w > 0 ? 'por debajo del rango' : '';
}

function renderMuscleMapList(byGroup, weekly, range) {
    const list = document.getElementById('muscleMapList');
    if (!list) return;
    const groups = [...MAPPED_GROUPS, ...Object.keys(byGroup).filter(g => !MAPPED_GROUPS.includes(g))];
    const rows = groups
        .map(g => ({ g, sets: byGroup[g]?.sets || 0, direct: byGroup[g]?.direct || 0, indirect: byGroup[g]?.indirect || 0, exercises: byGroup[g]?.exercises || {} }))
        .filter(r => r.sets > 0 || MAPPED_GROUPS.includes(r.g))
        .sort((a, b) => b.sets - a.sets);
    const visible = muscleMapSelected ? rows.filter(r => r.g === muscleMapSelected) : rows;
    list.innerHTML = visible.map(r => {
        const w = weekly(r.sets);
        const level = muscleLevel(w);
        const detail = Object.entries(r.exercises).sort((a, b) => b[1] - a[1]).map(([n, s]) => `${escapeHtml(n)} (${s})`).join(', ');
        const offMap = !MAPPED_GROUPS.includes(r.g) ? ' <small>(no se muestra en la figura)</small>' : '';
        return `<div class="muscle-row" data-group="${escapeHtml(r.g)}">
                <svg class="muscle-dot" viewBox="0 0 14 14" aria-hidden="true"><rect class="muscle lvl-${level}" width="14" height="14" rx="7"/></svg>
                <div class="muscle-row-text">
                    <strong>${escapeHtml(r.g)}</strong>${offMap} · ${formatNumber(w)} series${range.weeks > 1 ? '/semana' : ''}${r.indirect ? ` <span class="muscle-note">(${formatNumber(weekly(r.direct))} directas + ${formatNumber(weekly(r.indirect))} indirectas)</span>` : ''}${muscleRangeNote(w, range) ? ` · <span class="muscle-note">${muscleRangeNote(w, range)}</span>` : ''}
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
