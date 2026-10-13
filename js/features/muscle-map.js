// Progreso → "Músculos trabajados": figura de frente y espalda coloreada según las series
// efectivas por músculo (sin calentamiento), por semana, para compararlas con el rango
// habitual de 10 a 20 series por semana. Las semanas empiezan el día elegido en Ajustes; la
// semana en curso muestra lo que va hasta hoy. Tocar un músculo muestra su detalle.
import { escapeHtml, formatNumber } from '../core/utils.js';
import { appLocale } from '../core/i18n.js';
import { MUSCLE_LEVELS, muscleLevel, muscleMapRange, muscleRangeNote, muscleSetsByGroup } from '../domain/training-tools.js';
import { repo } from '../data/repositories.js';
import { getMuscleGroup } from '../data/exercise-prefs.js';
import { loadAppSettings } from './general-settings.js';

export const MUSCLE_MAP_PERIODS = {
    last7: 'Últimos 7 días',
    week: 'Esta semana (en curso)',
    lastweek: 'Semana pasada',
    '4w': 'Últimas 4 semanas (promedio)',
    '12w': 'Últimas 12 semanas (promedio)'
};

export let muscleMapSelected = null;

export const MUSCLE_PATTERN_SVG = `<svg width="0" height="0" style="position:absolute" aria-hidden="true"><defs>
    <pattern id="muscleHighPattern" patternUnits="userSpaceOnUse" width="5" height="5" patternTransform="rotate(45)">
        <rect width="5" height="5" fill="var(--heat-4)"/><rect width="2" height="5" fill="var(--heat-4-stripe)"/>
    </pattern></defs></svg>`;

// Figura anatómica (frente y espalda): la silueta de base y encima cada músculo con su forma
// real y su grupo (data-group). Se dibuja solo la mitad izquierda de la figura y la derecha
// sale espejada (simétrica y fácil de ajustar). viewBox 0 0 100 212, eje del cuerpo en x = 50.
export const mirrorHalf = half => `${half}<g transform="matrix(-1 0 0 1 100 0)">${half}</g>`;

export const BODY_BASE = `
    <ellipse cx="50" cy="12" rx="8.5" ry="10"/>
    <path d="M45 19 L45 27 L55 27 L55 19 Z"/>` + mirrorHalf(`
    <path d="M50 25 L37 27 Q25 29 21.5 39 Q20 46 22 51 L26 51 L33 49 L34 76 Q34.5 90 33 97 L50 99 Z"/>
    <path d="M21.5 40 Q16.5 52 17.5 64 L26.5 66 Q28.5 56 28.5 46 Z"/>
    <path d="M17.5 63 Q13.5 76 14.5 88 L20.5 89.5 Q24.5 78 26.5 66 Z"/>
    <ellipse cx="17" cy="94.5" rx="3.6" ry="5.5"/>
    <path d="M33 95 Q30.5 104 31.5 111 L50 113 L50 98 Z"/>
    <path d="M31.5 105 Q27.5 126 30.5 150 L44 156 Q49.5 138 49.5 112 Z"/>
    <path d="M31.5 151 Q29.5 170 33.5 192 L42 194 Q46.5 172 44 156 Z"/>
    <path d="M33.5 191 L32 199 Q37.5 203.5 44 200.5 L42.5 192 Z"/>`);

// Frente: deltoides, pectorales, bíceps, recto abdominal y oblicuos, cuádriceps.
export const BODY_FRONT = mirrorHalf(`
    <path data-group="Hombros" d="M34 29.5 Q25 30 22 38.5 Q21 44.5 23 49 Q27.5 42.5 33.5 39.5 Q35.5 34 34 29.5 Z"/>
    <path data-group="Pecho" d="M49.2 31.5 L49.2 49.5 Q42.5 53 36 50.5 Q31.5 47 33.5 40 Q36 33.5 42 31.5 Q46 30.8 49.2 31.5 Z"/>
    <path data-group="Bíceps" d="M22.4 48.6 Q19.2 56.2 20 64.8 Q23.6 69.4 27.6 64.8 Q29.2 56.6 28.4 48.9 Q25.4 45.9 22.4 48.6 Z"/>
    <rect data-group="Core" x="42.3" y="53.5" width="6.6" height="8.3" rx="2"/>
    <rect data-group="Core" x="42.3" y="62.8" width="6.6" height="8.3" rx="2"/>
    <rect data-group="Core" x="42.6" y="72.1" width="6.3" height="9.6" rx="2"/>
    <path data-group="Core" d="M42.8 83 L48.9 83 L48.9 95.5 Q45 95 43.4 91 Z"/>
    <path data-group="Core" d="M35 52.5 Q39.5 54.5 41.2 59.5 L41.2 84 Q37.5 87 34.6 82 Q32.6 67 35 52.5 Z"/>
    <path data-group="Espalda" d="M49.2 24.5 L49.2 28.6 Q42.5 29.6 36.5 28.6 Q43 26.8 47.2 24.6 Z"/>
    <path data-group="Gemelos" d="M32.8 160 Q31.2 170.5 33.4 182 Q35.8 185.5 37.6 181.4 Q38.6 170 37.2 160.2 Q35.2 157 32.8 160 Z"/>
    <path data-group="Cuádriceps" d="M34.2 104 Q29.8 121 31.6 139 Q34.4 151.5 40.8 154 Q46.2 148 47.3 133 Q48.4 116 46.3 104.5 Q40.2 100.5 34.2 104 Z"/>`);

// Espalda: trapecio, dorsales y lumbares (espalda), deltoides posterior, tríceps, glúteos,
// isquiotibiales y gemelos.
export const BODY_BACK = mirrorHalf(`
    <path data-group="Espalda" d="M49.2 21.5 L49.2 47 Q42.5 40.5 34.5 32 Q41 26.5 49.2 21.5 Z"/>
    <path data-group="Hombros" d="M34 29.5 Q25 30 22 38.5 Q21 44.5 23 49 Q27.5 42.5 33.5 39.5 Q35.5 34 34 29.5 Z"/>
    <path data-group="Espalda" d="M47.6 48.5 Q40.5 45 33.6 40.5 Q31.2 52.5 35.2 64.5 Q41 72.5 47.6 76.5 Z"/>
    <path data-group="Espalda" d="M47.6 78 L47.6 93 Q44.6 95.2 42.4 92.6 L42.4 75 Q45 77 47.6 78 Z"/>
    <path data-group="Tríceps" d="M22.4 48.6 Q19.2 56.2 20 64.8 Q23.6 69.4 27.6 64.8 Q29.2 56.6 28.4 48.9 Q25.4 45.9 22.4 48.6 Z"/>
    <path data-group="Glúteos" d="M49.2 96.5 Q40.5 94.5 34.2 100.5 Q31.8 110 36.8 116.2 Q43.5 119.5 49.2 114.5 Z"/>
    <path data-group="Isquios" d="M35.2 120 Q31.8 134 33.8 148 Q37.6 156 42.2 154.2 Q47.2 146 47.2 132 Q47 122.5 44.2 118.4 Z"/>
    <path data-group="Gemelos" d="M35.6 161.5 Q32.6 172 35.6 184 Q39 188.5 42.2 184 Q45.2 172 43.2 161.8 Q39.6 157.6 35.6 161.5 Z"/>`);

// Cuádriceps se ve de frente e isquios de espaldas (la cara posterior del muslo).
export const MAPPED_GROUPS = ['Pecho', 'Espalda', 'Hombros', 'Bíceps', 'Tríceps', 'Cuádriceps', 'Isquios', 'Glúteos', 'Gemelos', 'Core'];

export function muscleFigureSvg(regions, caption) {
    return `<figure class="muscle-figure">
            <svg viewBox="0 0 100 212" role="img" aria-label="Músculos trabajados, vista de ${caption.toLowerCase()}">
                <g class="body-base">${BODY_BASE}</g>
                <g class="body-muscles">${regions}</g>
            </svg>
            <figcaption>${caption}</figcaption>
        </figure>`;
}

export function muscleMapData() {
    const select = document.getElementById('muscleMapPeriod');
    const period = MUSCLE_MAP_PERIODS[select?.value] ? select.value : 'last7';
    const range = muscleMapRange(period, new Date(), loadAppSettings().weekStart);
    const byGroup = muscleSetsByGroup(repo.workouts.all(), range.from, range.to, getMuscleGroup);
    const weekly = sets => Math.round(sets / range.weeks * 2) / 2; // de a media serie (las indirectas valen 0,5)
    return { byGroup, weekly, range };
}

export function renderMuscleMap() {
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
        const d = str => new Date(str + 'T00:00:00').toLocaleDateString(appLocale(), { day: 'numeric', month: 'numeric' });
        info.textContent = `Del ${d(range.from)} al ${d(range.to)}` + (range.inProgress
            ? ` · semana en curso, ${range.daysLeft === 0 ? 'último día' : range.daysLeft === 1 ? 'queda 1 día' : `quedan ${range.daysLeft} días`}`
            : range.weeks > 1 ? ` · promedio de ${range.weeks} semanas` : '');
    }
    renderMuscleMapList(byGroup, weekly, range);
}

export function renderMuscleMapList(byGroup, weekly, range) {
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

export function bindMuscleMap() {
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
