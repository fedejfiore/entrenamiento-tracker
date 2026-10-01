// Progreso → "Análisis de Progresión": cada ejercicio comparado contra una sesión anterior,
// agrupado como se elija (todo, última sesión, por rutina o por grupo muscular). Tocar un
// ejercicio abre su detalle con los gráficos (peso, 1RM, reps, volumen) y el grupo muscular.
// Script clásico (no módulo): comparte el ámbito global con el resto de la app.

let exerciseDetailChart = null;

let currentExerciseDetailData = null;

let currentExerciseDetailName = null;

// Tocar el nombre de un ejercicio mientras se está entrenando abre directamente
// su gráfico de progreso (sin tener que ir a la pantalla Progreso a buscarlo).
function openExerciseDetailFromRow(idx) {
    const el = document.getElementById(`exname_${idx}`);
    if (!el) return;
    openExerciseDetail(el.textContent.trim());
}

function openExerciseDetail(exName) {
    const modal = document.getElementById('exerciseDetailModal');
    const titleEl = document.getElementById('exerciseDetailTitle');
    if (!modal || !titleEl) return;

    const data = getExerciseHistoryData(exName).sort((a, b) => a.date.localeCompare(b.date)).slice(-30);
    titleEl.textContent = exName;
    currentExerciseDetailName = exName;
    currentExerciseDetailData = data;

    // Grupo muscular: se cambia desde acá (antes era arrastrando tarjetas en otra sección).
    const group = document.getElementById('exerciseDetailGroup');
    if (group) {
        group.innerHTML = muscleGroupOptionsHtml(getMuscleGroup(exName));
    }
    const empty = document.getElementById('exerciseDetailEmpty');
    if (empty) empty.hidden = data.length > 0;
    document.querySelector('#exerciseDetailModal .chart-large').hidden = data.length === 0;
    document.querySelector('#exerciseDetailModal .checkbox-group').hidden = data.length === 0;
    modal.classList.add('open');
    renderExerciseDetailChart();
}

function changeExerciseDetailGroup(group) {
    if (!currentExerciseDetailName) return;
    saveGroupOverride(currentExerciseDetailName, group);
    showToast(`${currentExerciseDetailName} → ${group}`, 'success', 1800);
    generateProgressionAnalysis();
    renderMuscleMap();
}

// Cada métrica vive en su propia escala (peso/1RM en kg, reps en unidades, volumen
// en kg pero con números mucho más grandes) — mezclarlas en un solo eje Y aplastaría
// las líneas más chicas. Cada una se prende/apaga con su checkbox y arma su propio
// eje sólo si está tildada, así el gráfico no queda con ejes vacíos de más.
const EXERCISE_CHART_METRICS = [
    { checkboxId: 'exmetric_weight', field: 'weight', label: () => `Peso promedio (${weightUnitDef().label})`, color: () => cssVar('--brand'), axis: 'kg', weight: true },
    { checkboxId: 'exmetric_1rm', field: 'oneRM', label: () => `1RM estimado (${weightUnitDef().label})`, weight: true, color: () => cssVar('--danger'), axis: 'kg', dash: [5, 5] },
    { checkboxId: 'exmetric_reps', field: 'totalReps', label: 'Reps totales', color: () => '#3498db', axis: 'reps' },
    { checkboxId: 'exmetric_volume', field: 'volume', label: () => `Volumen total (${weightUnitDef().label})`, color: () => '#8b5cf6', axis: 'volume', weight: true }
];

const EXERCISE_CHART_AXIS_META = {
    kg: { position: 'left', title: () => weightUnitDef().label },
    reps: { position: 'right', title: () => 'reps' },
    volume: { position: 'right', title: () => `volumen (${weightUnitDef().label})` }
};

function renderExerciseDetailChart() {
    const canvas = document.getElementById('exerciseDetailChart');
    if (exerciseDetailChart) { exerciseDetailChart.destroy(); exerciseDetailChart = null; }
    if (!canvas || !currentExerciseDetailData || !currentExerciseDetailData.length || typeof Chart === 'undefined') return;
    const data = currentExerciseDetailData;

    const datasets = [];
    const axesUsed = new Set();
    EXERCISE_CHART_METRICS.forEach(def => {
        const checkbox = document.getElementById(def.checkboxId);
        if (!checkbox || !checkbox.checked) return;
        const color = def.color();
        axesUsed.add(def.axis);
        datasets.push({
            label: typeof def.label === 'function' ? def.label() : def.label,
            data: data.map(d => (d[def.field] == null ? null : def.weight ? Math.round(kgToDisplay(d[def.field]) * 10) / 10 : d[def.field])),
            borderColor: color,
            backgroundColor: 'transparent',
            borderDash: def.dash || [],
            tension: 0.3,
            pointRadius: 3,
            pointBackgroundColor: color,
            spanGaps: true,
            yAxisID: def.axis
        });
    });
    if (datasets.length === 0) return; // ningún checkbox tildado: no hay nada para graficar

    const scales = { x: { grid: { color: cssVar('--border') }, ticks: { color: cssVar('--text-muted') } } };
    axesUsed.forEach(axis => {
        const meta = EXERCISE_CHART_AXIS_META[axis];
        scales[axis] = {
            position: meta.position,
            grid: { drawOnChartArea: axis === 'kg', color: cssVar('--border') },
            ticks: { color: cssVar('--text-muted') },
            title: { display: true, text: meta.title(), color: cssVar('--text-muted') }
        };
    });

    exerciseDetailChart = new Chart(canvas.getContext('2d'), {
        type: 'line',
        data: { labels: data.map(d => d.date), datasets },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { labels: { color: cssVar('--text-muted') } } },
            scales
        }
    });
}

function closeExerciseDetail() {
    const modal = document.getElementById('exerciseDetailModal');
    if (modal) modal.classList.remove('open');
}

// ---------- Análisis de Progresión ----------

// Umbral para considerar el volumen "igual" entre dos sesiones (evita que un
// redondeo mínimo se lea como mejora o retroceso).
const VOLUME_FLAT_THRESHOLD_PCT = 2;

const PROGRESSION_GROUPINGS = {
    all: 'Todos los ejercicios',
    last: 'Última sesión',
    routine: 'Por rutina',
    muscle: 'Por grupo muscular'
};

function routineLabelOf(key) {
    if (!key) return 'Sin rutina';
    return customRoutineLabels[key] || ROUTINE_LABELS[key] || `Rutina ${key}`;
}

/** Historial por ejercicio (volumen, reps y peso máximo por sesión) y la rutina más reciente de cada uno. */
function buildProgressionHistory(workouts) {
    const history = {};
    const lastRoutine = {};
    [...workouts].sort((a, b) => (a.date || '').localeCompare(b.date || '')).forEach(w => {
        if (!w || !w.date || !Array.isArray(w.exercises)) return;
        w.exercises.forEach(ex => {
            if (!ex || !ex.name) return;
            const weights = parseWeightList(ex.weight, ex.reps);
            const totalReps = calculateExerciseTotalReps(ex);
            if (weights.length === 0 && totalReps === 0) return;
            (history[ex.name] ||= []).push({
                date: w.date,
                volume: calculateExerciseVolume(ex),
                totalReps,
                maxWeight: weights.length > 0 ? Math.max(...weights) : 0
            });
            lastRoutine[ex.name] = w.routine || '';
        });
    });
    return { history, lastRoutine };
}

function progressionRowHtml(exName, history, timeframe) {
    const last = history[history.length - 1];
    const candidates = history.slice(0, history.length - 1);
    let baseline;
    if (timeframe === 'last') {
        baseline = candidates[candidates.length - 1];
    } else {
        const refDate = new Date(last.date + 'T00:00:00');
        refDate.setMonth(refDate.getMonth() - parseInt(timeframe, 10));
        baseline = findClosestSession(candidates, refDate);
    }

    // Señal principal: volumen total (peso × reps de todas las series). Es lo que indica
    // progreso cuando sube el peso pero bajan las reps (o viceversa).
    const volumePct = baseline.volume > 0 ? ((last.volume - baseline.volume) / baseline.volume) * 100 : (last.volume > 0 ? 100 : 0);
    const arrow = volumePct > VOLUME_FLAT_THRESHOLD_PCT ? '📈' : volumePct < -VOLUME_FLAT_THRESHOLD_PCT ? '📉' : '➡️';
    const sign = n => (n > 0 ? '+' : '') + n;
    const repsDiff = last.totalReps - baseline.totalReps;
    const weightDiff = Math.round((last.maxWeight - baseline.maxWeight) * 10) / 10;
    // Con temporalidades largas la sesión más cercana puede no caer justo en la fecha pedida.
    const baselineDateNote = timeframe === 'last' ? '' : ` <small class="progression-vs">(vs. ${escapeHtml(baseline.date)})</small>`;
    return `<button type="button" class="progression-row" data-exercise="${escapeHtml(exName)}">
            <span class="progression-name"><strong>${escapeHtml(exName)}</strong> ${arrow}${baselineDateNote}</span>
            <small>Volumen: ${formatWeightTotal(baseline.volume)} → ${formatWeightTotal(last.volume)} (${sign(Math.round(volumePct))}%) · Reps: ${baseline.totalReps}→${last.totalReps} (${sign(repsDiff)}) · Peso máx: ${formatWeight(baseline.maxWeight)}→${formatWeight(last.maxWeight)} (${sign(Math.round(kgToDisplay(weightDiff) * 10) / 10)}${weightUnitDef().label})</small>
            <span class="progression-open" aria-hidden="true">📊</span>
        </button>`;
}

function generateProgressionAnalysis() {
    const box = document.getElementById('progressionData');
    if (!box) return;
    const workouts = repo.workouts.all();
    const timeframe = document.getElementById('progressionTimeframe')?.value || 'last';
    const grouping = document.getElementById('progressionGrouping')?.value || 'all';
    const { history, lastRoutine } = buildProgressionHistory(Array.isArray(workouts) ? workouts : []);

    let names = Object.keys(history).filter(n => history[n].length >= 2);
    if (grouping === 'last') {
        const latest = [...workouts].filter(w => w && w.date && Array.isArray(w.exercises))
            .sort((a, b) => a.date.localeCompare(b.date) || (a.id || 0) - (b.id || 0)).pop();
        const inLatest = new Set((latest?.exercises || []).map(e => e && e.name));
        names = names.filter(n => inLatest.has(n));
    }
    if (names.length === 0) {
        box.innerHTML = emptyStateHtml('Todavía no hay datos suficientes: cada ejercicio necesita al menos dos sesiones para compararlo.', repo.workouts.all().length ? ['train'] : ['train', 'import']);
        return;
    }

    const groupOf = grouping === 'routine' ? n => routineLabelOf(lastRoutine[n])
        : grouping === 'muscle' ? n => getMuscleGroup(n) : () => '';
    const groups = {};
    names.forEach(n => { (groups[groupOf(n)] ||= []).push(n); });
    const order = grouping === 'muscle'
        ? [...Object.keys(MUSCLE_GROUPS), 'Otro'].filter(g => groups[g])
        : Object.keys(groups).sort((a, b) => a.localeCompare(b, 'es'));

    box.innerHTML = order.map(g => {
        const rows = groups[g].sort((a, b) => a.localeCompare(b, 'es')).map(n => progressionRowHtml(n, history[n], timeframe)).join('');
        if (!g) return rows;
        const icon = grouping === 'muscle' ? ((MUSCLE_GROUPS[g] || {}).icon || '📌') + ' ' : '';
        return `<details class="progression-group">
                <summary>${icon}${escapeHtml(g)} <small>(${groups[g].length})</small></summary>
                ${rows}
            </details>`;
    }).join('');
}

function bindProgression() {
    const box = document.getElementById('progressionData');
    box?.addEventListener('click', e => {
        const row = e.target.closest('.progression-row');
        if (row) openExerciseDetail(row.dataset.exercise);
    });
    document.getElementById('progressionGrouping')?.addEventListener('change', generateProgressionAnalysis);
    document.getElementById('exerciseDetailGroup')?.addEventListener('change', e => changeExerciseDetailGroup(e.target.value));
}
