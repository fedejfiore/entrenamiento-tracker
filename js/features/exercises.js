// Catálogo de variantes y unificación de ejercicios duplicados.
// Script clásico (no módulo): comparte el ámbito global con el resto de la app.

// Catálogo de Variantes, agrupado por músculo (independiente de la rutina elegida).
function renderVariantsCatalog() {
    const container = document.getElementById('variantsContainer');
    if (!container) return;

    const byGroup = {};
    Object.keys(EXERCISE_VARIANTS).forEach(ex => {
        const group = getMuscleGroup(ex);
        if (!byGroup[group]) byGroup[group] = [];
        byGroup[group].push(ex);
    });

    const groupOrder = Object.keys(MUSCLE_GROUPS).filter(g => byGroup[g]);

    let html = '';
    groupOrder.forEach(group => {
        const icon = MUSCLE_GROUPS[group].icon;
        const gid = `mg_${normalizeForCompare(group).replace(/[^a-z0-9]+/g, '_')}`;
        html += `<div class="collapsible" onclick="toggleVariantGroup('${gid}')">▶ ${icon} ${group}</div>
        <div class="collapsible-content" id="${gid}">`;

        byGroup[group].forEach((ex, idx) => {
            const variants = EXERCISE_VARIANTS[ex] || [];
            const uid = `${gid}_ex_${idx}`;
            html += `<div class="collapsible" style="margin-left:12px;" onclick="event.stopPropagation(); toggleVariantGroup('${uid}')">▶ ${ex}</div>
            <div class="collapsible-content" id="${uid}" style="margin-left:12px;">`;
            if (variants.length === 0) {
                html += `<a href="${youtubeSearchUrl(ex + ' alternativas')}" target="_blank" rel="noopener">🔍 Buscar alternativas a "${ex}"</a>`;
            } else {
                html += variants.map(v =>
                    `<div style="margin-bottom: 8px;">▸ ${v} — <a href="${youtubeSearchUrl(v)}" target="_blank" rel="noopener">🎥 Ver video</a></div>`
                ).join('');
            }
            html += `</div>`;
        });
        html += `</div>`;
    });

    container.innerHTML = html || '<p style="color:var(--text-faint);">Sin datos.</p>';
}

function toggleVariantGroup(uid) {
    const el = document.getElementById(uid);
    if (!el) return;
    el.classList.toggle('active');
}

function populateUnifySelectors() {
    const source = document.getElementById('unifySource');
    const target = document.getElementById('unifyTarget');
    if (!source || !target) return;

    const prevSource = source.value;
    const prevTarget = target.value;
    const names = getAllKnownExerciseNames();
    const optionsHtml = names.map(n => `<option value="${n}">${n}</option>`).join('');

    source.innerHTML = '<option value="">Ejercicio a renombrar...</option>' + optionsHtml;
    target.innerHTML = '<option value="">Unificar con...</option>' + optionsHtml;

    if (names.includes(prevSource)) source.value = prevSource;
    if (names.includes(prevTarget)) target.value = prevTarget;
}

function unifyFromSelectors() {
    const source = document.getElementById('unifySource').value;
    const target = document.getElementById('unifyTarget').value;

    if (!source || !target) {
        showToast('Elegí los dos ejercicios que querés unificar', 'error');
        return;
    }
    if (normalizeForCompare(source) === normalizeForCompare(target)) {
        showToast('Elegí dos ejercicios distintos', 'error');
        return;
    }

    if (confirm(`"${source}" y "${target}" van a quedar unificados como un solo ejercicio.\n\nEsto renombra "${source}" a "${target}" en TODAS las rutinas donde aparece y en todo el historial de sesiones ya guardadas, para que las estadísticas se junten.\n\n¿Confirmás?`)) {
        unifyExerciseName(source, target);
    }
}

// Renombra un ejercicio en TODAS las rutinas (base + personalizadas) y en todo
// el historial de sesiones ya guardadas, para fusionar sus estadísticas.
function unifyExerciseName(oldName, newName) {
    loadCustomRoutines();
    const allRoutineKeys = new Set([...Object.keys(routines), ...Object.keys(customRoutines)]);
    allRoutineKeys.forEach(key => {
        const list = customRoutines[key] || routines[key];
        if (!list || !list.some(n => normalizeForCompare(n) === normalizeForCompare(oldName))) return;
        if (!customRoutines[key]) {
            customRoutines[key] = JSON.parse(JSON.stringify(routines[key]));
        }
        customRoutines[key] = customRoutines[key].map(n =>
            normalizeForCompare(n) === normalizeForCompare(oldName) ? newName : n
        );
    });
    saveCustomRoutines();

    let workouts = JSON.parse(localStorage.getItem('workouts') || '[]');
    let changed = 0;
    workouts.forEach(w => {
        if (!w || !Array.isArray(w.exercises)) return;
        w.exercises.forEach(ex => {
            if (ex && ex.name && normalizeForCompare(ex.name) === normalizeForCompare(oldName)) {
                ex.name = newName;
                changed++;
            }
        });
    });
    localStorage.setItem('workouts', JSON.stringify(workouts));

    showToast(`✅ Unificado: ${changed} registro(s) del historial ahora usan "${newName}".`);

    loadRoutineExercises();
    populateExerciseDatalist();
    displayWorkoutHistory();
}

