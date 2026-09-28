// Progreso: mini-gráficos por ejercicio, grupos musculares, detalle y análisis de progresión.
// Script clásico (no módulo): comparte el ámbito global con el resto de la app.

const miniCharts = {};

function miniChartId(exName) {
    return 'mini_' + normalizeForCompare(exName).replace(/[^a-z0-9]+/g, '_');
}

function drawMiniChart(canvasId, data) {
    const canvas = document.getElementById(canvasId);
    if (!canvas || typeof Chart === 'undefined') return;
    if (miniCharts[canvasId]) miniCharts[canvasId].destroy();
    miniCharts[canvasId] = new Chart(canvas.getContext('2d'), {
        type: 'line',
        data: {
            labels: data.map(d => d.date),
            datasets: [{
                data: data.map(d => d.weight),
                borderColor: cssVar('--brand'),
                backgroundColor: 'transparent',
                borderWidth: 2,
                pointRadius: 0,
                tension: 0.3
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            animation: false,
            plugins: { legend: { display: false }, tooltip: { enabled: false } },
            scales: { x: { display: false }, y: { display: false } }
        }
    });
}

// Grilla de mini-gráficos por ejercicio, agrupados por músculo y filtrables por
// rutina — reemplaza el gráfico multi-línea + selector que ocupaban toda la pantalla.
function renderProgressGrid() {
    const container = document.getElementById('progressExerciseGrid');
    if (!container) return;

    calculateStats();
    const routineFilter = document.getElementById('progresoRoutineFilter')?.value || '';

    let exerciseNames = Object.keys(exerciseStats);
    if (routineFilter) {
        loadCustomRoutines();
        const routineExercises = new Set((customRoutines[routineFilter] || routines[routineFilter] || []).map(normalizeForCompare));
        exerciseNames = exerciseNames.filter(name => routineExercises.has(normalizeForCompare(name)));
    }

    const byGroup = {};
    exerciseNames.forEach(name => {
        const data = getExerciseHistoryData(name);
        if (data.length === 0) return;
        const group = getMuscleGroup(name);
        if (!byGroup[group]) byGroup[group] = [];
        byGroup[group].push({ name, data });
    });

    const anyData = Object.keys(byGroup).length > 0;
    if (!anyData) {
        container.innerHTML = '<p style="color:var(--text-faint);">Todavía no hay suficiente peso cargado en tus sesiones para graficar.</p>';
        return;
    }

    // Solo se muestran los grupos que ya tienen algún ejercicio (si no, la pantalla
    // se llena de secciones vacías). Para mover un ejercicio a un grupo que todavía
    // no aparece acá, está el botón 📁 de cada tarjeta (abre la lista completa de
    // grupos), además de poder arrastrar entre los que ya están visibles.
    const groupOrder = Object.keys(MUSCLE_GROUPS).filter(g => byGroup[g]);
    if (byGroup['Otro']) groupOrder.push('Otro');

    let html = '';
    groupOrder.forEach(group => {
        const icon = (MUSCLE_GROUPS[group] || {}).icon || '📌';
        const items = byGroup[group] || [];
        html += `<h3 style="font-family:var(--font-heading); font-size:14px; font-weight:500; margin:16px 0 8px; color:var(--text-muted);">${icon} ${group}</h3>`;
        html += `<div class="mini-chart-grid" data-muscle-group="${group}">`;
        items.forEach(item => {
            const last = item.data[item.data.length - 1];
            const cid = miniChartId(item.name);
            html += `<div class="mini-chart-card">
                <button type="button" class="mini-chart-move-btn" title="Mover a otro grupo muscular">📁</button>
                <div class="mini-chart-title">${item.name}</div>
                <div class="mini-chart-canvas-wrap"><canvas id="${cid}"></canvas></div>
                <div class="mini-chart-last">${last.weight}kg último</div>
            </div>`;
        });
        html += `</div>`;
    });
    container.innerHTML = html;

    // Asignar el nombre real del ejercicio vía JS (no por atributo/onclick) para no
    // pelear con comillas o tildes al escapar el string dentro del HTML generado.
    const cards = container.querySelectorAll('.mini-chart-card');
    let cardIdx = 0;
    groupOrder.forEach(group => {
        (byGroup[group] || []).forEach(item => {
            const card = cards[cardIdx++];
            if (!card) return;
            setupExerciseCardDrag(card, item.name);
            const moveBtn = card.querySelector('.mini-chart-move-btn');
            if (moveBtn) {
                moveBtn.addEventListener('pointerdown', e => e.stopPropagation());
                moveBtn.addEventListener('click', e => {
                    e.stopPropagation();
                    openMoveGroupModal(item.name);
                });
            }
        });
    });

    groupOrder.forEach(group => {
        (byGroup[group] || []).forEach(item => drawMiniChart(miniChartId(item.name), item.data));
    });
}

// Complementa el arrastre entre tarjetas: sirve para mandar un ejercicio a un grupo
// que todavía no tiene ninguna tarjeta visible (y por lo tanto no aparece como sección
// en la grilla), algo que el arrastre solo no puede hacer.
let pendingMoveExerciseName = null;

function openMoveGroupModal(exerciseName) {
    pendingMoveExerciseName = exerciseName;
    const modal = document.getElementById('moveGroupModal');
    const nameEl = document.getElementById('moveGroupExerciseName');
    const list = document.getElementById('moveGroupList');
    if (!modal || !nameEl || !list) return;

    nameEl.textContent = `"${exerciseName}"`;
    const currentGroup = getMuscleGroup(exerciseName);
    const groups = [...Object.keys(MUSCLE_GROUPS), 'Otro'];
    list.innerHTML = groups.map(group => {
        const icon = (MUSCLE_GROUPS[group] || {}).icon || '📌';
        const isCurrent = group === currentGroup;
        return `<button type="button" onclick="chooseMoveGroup('${group.replace(/'/g, "\\'")}')" ${isCurrent ? 'disabled' : ''}>${icon} ${group}${isCurrent ? ' (actual)' : ''}</button>`;
    }).join('');

    modal.classList.add('open');
}

function closeMoveGroupModal() {
    const modal = document.getElementById('moveGroupModal');
    if (modal) modal.classList.remove('open');
    pendingMoveExerciseName = null;
}

function chooseMoveGroup(group) {
    if (!pendingMoveExerciseName) return;
    saveGroupOverride(pendingMoveExerciseName, group);
    const icon = (MUSCLE_GROUPS[group] || {}).icon || '📌';
    showToast(`✅ "${pendingMoveExerciseName}" movido a ${icon} ${group}`);
    closeMoveGroupModal();
    renderProgressGrid();
}

// Con Pointer Events en vez del drag-and-drop nativo de HTML5, porque este último
// no funciona de forma confiable con touch en celulares. Mantener presionado ~320ms
// sin mover mucho arranca el arrastre; soltar antes de eso (o moverse de golpe, que
// es scroll normal) lo cancela y, si no hubo arrastre, se interpreta como un tap.
const DRAG_LONG_PRESS_MS = 320;

const DRAG_MOVE_THRESHOLD_PX = 10;

const DRAG_EDGE_SCROLL_ZONE_PX = 80;

const DRAG_EDGE_SCROLL_MAX_SPEED = 16;

let dragGhostEl = null;

let dragOriginCard = null;

let dragOriginGroup = null;

let dragActiveDropTarget = null;

let dragLastClientX = 0;

let dragLastClientY = 0;

let dragAutoScrollRAF = null;

function setupExerciseCardDrag(card, exerciseName) {
    card.style.touchAction = 'pan-y';
    card.addEventListener('pointerdown', (e) => {
        if (e.pointerType === 'mouse' && e.button !== 0) return;
        onExerciseCardPointerDown(e, card, exerciseName);
    });
}

function onExerciseCardPointerDown(startEvent, card, exerciseName) {
    const pointerId = startEvent.pointerId;
    const startX = startEvent.clientX;
    const startY = startEvent.clientY;
    let dragging = false;
    let cancelled = false;

    const longPressTimer = setTimeout(() => {
        if (cancelled) return;
        dragging = true;
        beginCardDrag(card, startX, startY);
    }, DRAG_LONG_PRESS_MS);

    function onMove(e) {
        if (e.pointerId !== pointerId) return;
        const dx = e.clientX - startX;
        const dy = e.clientY - startY;
        if (!dragging) {
            if (Math.abs(dx) > DRAG_MOVE_THRESHOLD_PX || Math.abs(dy) > DRAG_MOVE_THRESHOLD_PX) {
                cancelled = true;
                clearTimeout(longPressTimer);
                cleanup();
            }
            return;
        }
        e.preventDefault();
        updateCardDrag(e.clientX, e.clientY);
    }

    function onUp(e) {
        if (e.pointerId !== pointerId) return;
        clearTimeout(longPressTimer);
        if (dragging) {
            endCardDrag(e.clientX, e.clientY, exerciseName);
        } else if (!cancelled) {
            openExerciseDetail(exerciseName);
        }
        cleanup();
    }

    function onCancel(e) {
        if (e.pointerId !== pointerId) return;
        clearTimeout(longPressTimer);
        if (dragging) cancelCardDrag();
        cleanup();
    }

    function cleanup() {
        window.removeEventListener('pointermove', onMove);
        window.removeEventListener('pointerup', onUp);
        window.removeEventListener('pointercancel', onCancel);
    }

    window.addEventListener('pointermove', onMove, { passive: false });
    window.addEventListener('pointerup', onUp);
    window.addEventListener('pointercancel', onCancel);
}

function beginCardDrag(card, x, y) {
    dragOriginCard = card;
    dragOriginGroup = card.closest('.mini-chart-grid')?.dataset.muscleGroup || null;
    card.classList.add('dragging-source');

    try { navigator.vibrate && navigator.vibrate(15); } catch (e) {}

    const rect = card.getBoundingClientRect();
    const ghost = card.cloneNode(true);
    ghost.removeAttribute('id');
    ghost.querySelectorAll('[id]').forEach(el => el.removeAttribute('id'));
    // El <canvas> clonado no copia lo dibujado — mostramos solo título y último valor.
    const wrap = ghost.querySelector('.mini-chart-canvas-wrap');
    if (wrap) wrap.style.visibility = 'hidden';
    ghost.classList.add('mini-chart-drag-ghost');
    ghost.style.width = rect.width + 'px';
    ghost.style.left = (x - rect.width / 2) + 'px';
    ghost.style.top = (y - rect.height / 2) + 'px';
    document.body.appendChild(ghost);
    dragGhostEl = ghost;

    dragLastClientX = x;
    dragLastClientY = y;
    dragAutoScrollRAF = requestAnimationFrame(dragAutoScrollTick);
}

function updateCardDrag(x, y) {
    dragLastClientX = x;
    dragLastClientY = y;

    if (dragGhostEl) {
        const rect = dragGhostEl.getBoundingClientRect();
        dragGhostEl.style.left = (x - rect.width / 2) + 'px';
        dragGhostEl.style.top = (y - rect.height / 2) + 'px';
    }
    const targetGrid = document.elementFromPoint(x, y)?.closest('.mini-chart-grid') || null;
    if (dragActiveDropTarget && dragActiveDropTarget !== targetGrid) {
        dragActiveDropTarget.classList.remove('drop-target-active');
        dragActiveDropTarget = null;
    }
    if (targetGrid && targetGrid !== dragActiveDropTarget) {
        targetGrid.classList.add('drop-target-active');
        dragActiveDropTarget = targetGrid;
    }
}

// Autoscroll de la página mientras se arrastra cerca del borde superior/inferior
// de la pantalla — sin esto, no se puede soltar en un grupo que no está visible
// en ese momento (el drag no tiene por qué mover el dedo para "seguir" pidiendo scroll).
function dragAutoScrollTick() {
    if (!dragGhostEl) { dragAutoScrollRAF = null; return; }

    const y = dragLastClientY;
    const vh = window.innerHeight;
    let delta = 0;
    if (y < DRAG_EDGE_SCROLL_ZONE_PX) {
        delta = -Math.ceil((DRAG_EDGE_SCROLL_ZONE_PX - y) / DRAG_EDGE_SCROLL_ZONE_PX * DRAG_EDGE_SCROLL_MAX_SPEED);
    } else if (y > vh - DRAG_EDGE_SCROLL_ZONE_PX) {
        delta = Math.ceil((y - (vh - DRAG_EDGE_SCROLL_ZONE_PX)) / DRAG_EDGE_SCROLL_ZONE_PX * DRAG_EDGE_SCROLL_MAX_SPEED);
    }

    if (delta !== 0) {
        const before = window.scrollY;
        window.scrollBy(0, delta);
        // El dedo/mouse no se movió, pero el contenido sí — recalcular qué hay debajo.
        if (window.scrollY !== before) updateCardDrag(dragLastClientX, dragLastClientY);
    }

    dragAutoScrollRAF = requestAnimationFrame(dragAutoScrollTick);
}

function endCardDrag(x, y, exerciseName) {
    const targetGrid = document.elementFromPoint(x, y)?.closest('.mini-chart-grid') || null;
    const targetGroup = targetGrid?.dataset.muscleGroup || null;
    const validTarget = targetGroup === 'Otro' || !!MUSCLE_GROUPS[targetGroup];

    cleanupCardDrag();

    if (validTarget && targetGroup !== dragOriginGroup) {
        saveGroupOverride(exerciseName, targetGroup);
        const icon = (MUSCLE_GROUPS[targetGroup] || {}).icon || '📌';
        showToast(`✅ "${exerciseName}" movido a ${icon} ${targetGroup}`);
        renderProgressGrid();
    }
}

function cancelCardDrag() {
    cleanupCardDrag();
}

function cleanupCardDrag() {
    if (dragAutoScrollRAF) { cancelAnimationFrame(dragAutoScrollRAF); dragAutoScrollRAF = null; }
    if (dragGhostEl) { dragGhostEl.remove(); dragGhostEl = null; }
    if (dragOriginCard) { dragOriginCard.classList.remove('dragging-source'); dragOriginCard = null; }
    if (dragActiveDropTarget) { dragActiveDropTarget.classList.remove('drop-target-active'); dragActiveDropTarget = null; }
    dragOriginGroup = null;
}

function populateProgresoRoutineFilter() {
    const select = document.getElementById('progresoRoutineFilter');
    if (!select) return;
    loadCustomRoutines();
    const keys = Array.from(new Set([...Object.keys(routines), ...Object.keys(customRoutines)]))
        .filter(isRoutineVisible)
        .sort();
    const current = select.value;
    select.innerHTML = '<option value="">Todas las rutinas</option>' + keys.map(key => {
        const label = customRoutineLabels[key] || ROUTINE_LABELS[key] || `Rutina ${key}`;
        return `<option value="${key}">${label}</option>`;
    }).join('');
    if (keys.includes(current)) select.value = current;
}

let exerciseDetailChart = null;

let currentExerciseDetailData = null;

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

    const data = getExerciseHistoryData(exName).slice(-30);
    if (data.length === 0) {
        showToast(`Todavía no hay historial de "${exName}" para graficar`, 'error');
        return;
    }

    titleEl.textContent = exName;
    currentExerciseDetailData = data;
    renderExerciseDetailChart();
    modal.classList.add('open');
}

// Cada métrica vive en su propia escala (peso/1RM en kg, reps en unidades, volumen
// en kg pero con números mucho más grandes) — mezclarlas en un solo eje Y aplastaría
// las líneas más chicas. Cada una se prende/apaga con su checkbox y arma su propio
// eje sólo si está tildada, así el gráfico no queda con ejes vacíos de más.
const EXERCISE_CHART_METRICS = [
    { checkboxId: 'exmetric_weight', field: 'weight', label: 'Peso promedio (kg)', color: () => cssVar('--brand'), axis: 'kg' },
    { checkboxId: 'exmetric_1rm', field: 'oneRM', label: '1RM estimado (kg)', color: () => cssVar('--danger'), axis: 'kg', dash: [5, 5] },
    { checkboxId: 'exmetric_reps', field: 'totalReps', label: 'Reps totales', color: () => '#3498db', axis: 'reps' },
    { checkboxId: 'exmetric_volume', field: 'volume', label: 'Volumen total (kg)', color: () => '#8b5cf6', axis: 'volume' }
];

const EXERCISE_CHART_AXIS_META = {
    kg: { position: 'left', title: 'kg' },
    reps: { position: 'right', title: 'reps' },
    volume: { position: 'right', title: 'volumen (kg)' }
};

function renderExerciseDetailChart() {
    const canvas = document.getElementById('exerciseDetailChart');
    if (!canvas || !currentExerciseDetailData || typeof Chart === 'undefined') return;
    const data = currentExerciseDetailData;

    const datasets = [];
    const axesUsed = new Set();
    EXERCISE_CHART_METRICS.forEach(def => {
        const checkbox = document.getElementById(def.checkboxId);
        if (!checkbox || !checkbox.checked) return;
        const color = def.color();
        axesUsed.add(def.axis);
        datasets.push({
            label: def.label,
            data: data.map(d => d[def.field] ?? null),
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

    if (exerciseDetailChart) { exerciseDetailChart.destroy(); exerciseDetailChart = null; }
    if (datasets.length === 0) return; // ningún checkbox tildado: no hay nada para graficar

    const scales = { x: { grid: { color: cssVar('--border') }, ticks: { color: cssVar('--text-muted') } } };
    axesUsed.forEach(axis => {
        const meta = EXERCISE_CHART_AXIS_META[axis];
        scales[axis] = {
            position: meta.position,
            grid: { drawOnChartArea: axis === 'kg', color: cssVar('--border') },
            ticks: { color: cssVar('--text-muted') },
            title: { display: true, text: meta.title, color: cssVar('--text-muted') }
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

// Umbral para considerar el volumen "igual" entre dos sesiones (evita que un
// redondeo mínimo se lea como mejora o retroceso).
const VOLUME_FLAT_THRESHOLD_PCT = 2;

function generateProgressionAnalysis() {
    let workouts = JSON.parse(localStorage.getItem('workouts') || '[]');
    if (!Array.isArray(workouts)) workouts = [];

    // Agrupar por ejercicio: volumen total, reps totales y peso máximo de cada sesión
    // donde apareció ese ejercicio (no solo el peso de una serie suelta).
    const exerciseHistory = {};
    workouts.forEach(w => {
        if (!w || !w.date || !w.exercises || !Array.isArray(w.exercises)) return;

        w.exercises.forEach(ex => {
            if (!ex || !ex.name) return;

            const weights = parseWeightList(ex.weight, ex.reps);
            const volume = calculateExerciseVolume(ex);
            const totalReps = calculateExerciseTotalReps(ex);
            if (weights.length === 0 && totalReps === 0) return;

            if (!exerciseHistory[ex.name]) exerciseHistory[ex.name] = [];
            exerciseHistory[ex.name].push({
                date: w.date,
                volume: volume,
                totalReps: totalReps,
                maxWeight: weights.length > 0 ? Math.max(...weights) : 0
            });
        });
    });

    const timeframe = document.getElementById('progressionTimeframe')?.value || 'last';

    let html = '';
    Object.entries(exerciseHistory).forEach(([exName, historyRaw]) => {
        // Ordenar por fecha por las dudas (editar la fecha de una sesión ya guardada
        // podría desordenar el array respecto al orden en que se guardaron).
        const history = [...historyRaw].sort((a, b) => a.date.localeCompare(b.date));
        if (history.length < 2) return;

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

        // Señal principal: volumen total (peso × reps de todas las series).
        // Es lo que realmente indica progreso cuando sube el peso pero bajan
        // las reps (o viceversa), a diferencia de mirar solo el peso máximo.
        const volumePct = baseline.volume > 0 ? ((last.volume - baseline.volume) / baseline.volume) * 100 : (last.volume > 0 ? 100 : 0);
        const arrow = volumePct > VOLUME_FLAT_THRESHOLD_PCT ? '📈' : volumePct < -VOLUME_FLAT_THRESHOLD_PCT ? '📉' : '➡️';
        const volumeSign = volumePct > 0 ? '+' : '';

        const repsDiff = last.totalReps - baseline.totalReps;
        const weightDiff = Math.round((last.maxWeight - baseline.maxWeight) * 10) / 10;

        // Con temporalidades largas, la sesión disponible más cercana puede no caer
        // justo en la fecha pedida — mostramos su fecha real para que quede claro.
        const baselineDateNote = timeframe === 'last' ? '' : ` <small style="color:var(--text-faint);">(vs. ${baseline.date})</small>`;

        html += `<div style="margin-bottom: 6px; padding: 8px; background: var(--bg-elevated); border-radius: 6px;">
                <strong>${exName}</strong> ${arrow}${baselineDateNote}<br>
                <small style="color: var(--text-muted);">Volumen: ${Math.round(baseline.volume).toLocaleString('es-AR')}kg → ${Math.round(last.volume).toLocaleString('es-AR')}kg (${volumeSign}${Math.round(volumePct)}%) · Reps: ${baseline.totalReps}→${last.totalReps} (${repsDiff > 0 ? '+' : ''}${repsDiff}) · Peso máx: ${baseline.maxWeight}kg→${last.maxWeight}kg (${weightDiff > 0 ? '+' : ''}${weightDiff}kg)</small>
            </div>`;
    });

    document.getElementById('progressionData').innerHTML = html || '<small>Insuficientes datos</small>';
}

