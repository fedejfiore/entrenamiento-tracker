// Arranque de la app: todo lo que corre al cargar, en el mismo orden que antes.
// Los demás archivos solo declaran funciones, datos y estado.

loadArchivedExercises();

document.getElementById('workoutDate').value = getLocalDateString();

document.getElementById('bodyDate').valueAsDate = new Date();

document.querySelectorAll('.emoji-btn').forEach(btn => {
    btn.addEventListener('click', function() {
        document.querySelectorAll('.emoji-btn').forEach(b => b.classList.remove('selected'));
        this.classList.add('selected');
        selectedMood = parseInt(this.dataset.mood);
        saveWorkoutDraft();
    });
});

const exercisesContainerEl = document.getElementById('exercisesContainer');

exercisesContainerEl.addEventListener('input', (e) => {
    if (e.target.dataset?.f && e.target.closest?.('.set-row')) {
        if (e.isTrusted) sanitizeSetInput(e.target);
        updateSetCalc(e.target.closest('.set-row'));
    }
    if (e.target.classList?.contains('set-note')) {
        e.target.closest('.set-row')?.querySelector('.set-note-btn')?.classList.toggle('has-note', !!e.target.value.trim());
    }
    if (isSessionDataEvent(e)) maybeAutoStartSessionTimer();
    saveWorkoutDraft();
});

exercisesContainerEl.addEventListener('change', (e) => {
    if (e.target.dataset?.f === 'time' && e.target.value.trim()) {
        const unit = e.target.dataset.unit;
        e.target.value = formatTimeForUnit(parseTimeInput(e.target.value, unit), unit);
    }
    if (isSessionDataEvent(e)) maybeAutoStartSessionTimer();
    saveWorkoutDraft();
});

// Nota de serie vacía: al salir del campo se vuelve a esconder.
exercisesContainerEl.addEventListener('focusout', (e) => {
    if (e.target.classList?.contains('set-note') && !e.target.value.trim()) e.target.hidden = true;
});

exercisesContainerEl.addEventListener('focusin', (e) => {
    if (e.target.closest?.('.set-row') && e.target.dataset?.f) showSetStepper(e.target);
});

exercisesContainerEl.addEventListener('pointerdown', (e) => onReorderHandlePointerDown(e));

exercisesContainerEl.addEventListener('keydown', (e) => onReorderHandleKeyDown(e));

// Llamar al cargar
generateProgressionAnalysis();

initializeData();

// Actualizar fecha y estadísticas
document.getElementById('todayDate').textContent = new Date().toLocaleDateString('es-AR');

document.addEventListener('pointerdown', unlockAudio, { once: true, capture: true });

document.addEventListener('visibilitychange', async () => {
    if (!wakeLockEnabled || document.visibilityState !== 'visible') return;
    const needsRestart = (wakeLockMode === 'api' && wakeLock === null) ||
        (wakeLockMode === 'video' && noSleepVideoEl && noSleepVideoEl.paused) ||
        wakeLockMode === null;
    if (!needsRestart) return;
    const ok = await requestWakeLock();
    if (!ok) {
        wakeLockEnabled = false;
        try { localStorage.setItem('wakeLockEnabled', '0'); } catch (e) {}
    }
    updateWakeLockBtn();
});

// Inicializar
initTheme();

initWakeLock();

loadCustomRoutines();

loadCustomRoutineLabels();

initSoundSettingsUI();

initVoiceSettingsUI();

initMusicSettingsUI();

renderRecordingsUI();

loadRecordings();

populateRoutineOptions();

populateUnifySelectors();

displayWorkoutHistory();

loadBodyChartScale();

updateBodyChart();

calculateStats();

updateSidebar();

restoreSessionTimer();

restoreWorkoutDraft();

restoreTabataSessionBlocks();

renderVariantsCatalog();

initScreens();

console.log('🔧 Agregando event listener para input file...');

const fileInputElement = document.getElementById('fileInput');

console.log('📂 fileInputElement:', fileInputElement);

if (fileInputElement) {
    fileInputElement.addEventListener('change', function(e) {
        console.log('✅ Change event disparado en fileInput');
        console.log('📂 Archivos:', this.files);
        if (this.files && this.files[0]) {
            console.log('📁 Archivo seleccionado:', this.files[0].name);
            uploadData(this.files[0]);
        }
    });
    console.log('✅ Event listener agregado exitosamente');
} else {
    console.error('❌ No se encontró element con id="fileInput"');
}
