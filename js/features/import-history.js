// Ajustes → "Traer historial de otra app" (Hevy, Strong, Fitbod) y Datos → "Exportar
// historial (CSV)". La lectura y la conversión están en js/domain/import-csv.js; acá solo
// se elige el archivo, se muestra el resumen y se guarda cuando la persona confirma.
// Script clásico (no módulo): comparte el ámbito global con el resto de la app.

let pendingImport = null;

function existingImportKeys() {
    return new Set(repo.workouts.all().map(w => w && w.importKey).filter(Boolean));
}

async function onImportHistoryFile(file) {
    const box = document.getElementById('importHistoryPreview');
    pendingImport = null;
    if (!file || !box) return;
    if (file.size > IMPORT_LIMITS.maxBytes) { showToast('El archivo es demasiado grande (más de 20 MB).', 'error'); return; }
    try {
        const text = await file.text();
        const res = prepareCsvImport(text, {
            weightUnit: document.getElementById('importWeightUnit')?.value || 'kg',
            monthFirst: document.getElementById('importMonthFirst')?.checked,
            existingKeys: existingImportKeys()
        });
        pendingImport = res;
        const d = s => (s ? new Date(s + 'T00:00:00').toLocaleDateString('es-AR') : '');
        const known = res.exercises.filter(n => catalogMuscleGroup(n));
        box.hidden = false;
        box.innerHTML = res.workouts.length
            ? `<p><b>${escapeHtml(res.label)}</b>: ${res.workouts.length} ${res.workouts.length === 1 ? 'sesión' : 'sesiones'} · ${res.sets} series · del ${d(res.from)} al ${d(res.to)}</p>
               <p>${res.exercises.length} ejercicios (${known.length} con su grupo muscular reconocido; el resto lo podés elegir después en Biblioteca → Ejercicios).</p>
               ${res.skipped ? `<p>${res.skipped} ${res.skipped === 1 ? 'sesión ya estaba importada' : 'sesiones ya estaban importadas'}: no se repiten.</p>` : ''}
               ${res.errors.length ? `<p class="import-warn">${res.errors.length} ${res.errors.length === 1 ? 'fila no se pudo leer' : 'filas no se pudieron leer'} (${escapeHtml(res.errors.slice(0, 3).join('; '))}${res.errors.length > 3 ? '…' : ''}).</p>` : ''}
               <div class="import-actions">
                   <button type="button" class="success" data-import="confirm">✅ Importar ${res.workouts.length} ${res.workouts.length === 1 ? 'sesión' : 'sesiones'}</button>
                   <button type="button" data-import="cancel">Cancelar</button>
               </div>`
            : `<p>${res.skipped ? 'Todas las sesiones de este archivo ya estaban importadas.' : 'El archivo no tiene sesiones con series para importar.'}</p>`;
    } catch (err) {
        box.hidden = false;
        box.innerHTML = `<p class="import-warn">❌ ${escapeHtml(err.message)}</p>`;
    }
}

function confirmImportHistory() {
    if (!pendingImport?.workouts.length) return;
    const n = pendingImport.workouts.length;
    try {
        repo.workouts.addMany(pendingImport.workouts);
    } catch (err) {
        showToast(`❌ No se pudo importar: ${err.message}`, 'error', 6000);
        return;
    }
    const label = pendingImport.label;
    cancelImportHistory();
    calculateStats();
    updateSidebar();
    displayWorkoutHistory();
    populateExerciseDatalist();
    showToast(`✅ ${n} ${n === 1 ? 'sesión importada' : 'sesiones importadas'} de ${label}`, 'success', 4500);
}

function cancelImportHistory() {
    pendingImport = null;
    const box = document.getElementById('importHistoryPreview');
    if (box) { box.hidden = true; box.innerHTML = ''; }
    const input = document.getElementById('importHistoryFile');
    if (input) input.value = '';
}

function exportHistoryCsv() {
    const workouts = repo.workouts.all();
    if (!workouts.some(w => w && !w.deletedAt && Array.isArray(w.exercises))) { showToast('Todavía no hay sesiones para exportar', 'error'); return; }
    const csv = '﻿' + workoutsToCsv(workouts, routineLabelOf); // BOM: Excel lo abre con tildes
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = `esoagon_historial_${getLocalDateString()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('📄 Historial exportado en CSV (se abre con Excel o Google Sheets)', 'success', 4000);
}

function bindImportHistory() {
    const unit = document.getElementById('importWeightUnit');
    if (unit) unit.value = loadAppSettings().weightUnit === 'lb' ? 'lb' : 'kg';
    document.getElementById('importHistoryFile')?.addEventListener('change', e => onImportHistoryFile(e.target.files?.[0]));
    document.getElementById('importHistorySection')?.addEventListener('click', e => {
        const el = e.target.closest('[data-import]');
        if (!el) return;
        if (el.dataset.import === 'confirm') confirmImportHistory();
        if (el.dataset.import === 'cancel') cancelImportHistory();
        if (el.dataset.import === 'pick') document.getElementById('importHistoryFile')?.click();
        if (el.dataset.import === 'export') exportHistoryCsv();
    });
    document.getElementById('exportCsvBtn')?.addEventListener('click', exportHistoryCsv);
}
