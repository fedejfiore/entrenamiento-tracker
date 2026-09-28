// Arranque de la app. Los demás archivos solo declaran (clases, funciones, datos y estado);
// acá se ejecuta todo, en este orden:
//   1. Datos: migraciones del esquema, persistencia y carga de lo guardado.
//   2. Eventos de la página.
//   3. Primer dibujado de cada pantalla.
//   4. Cambios hechos desde otra pestaña (aislamiento): se recargan y se redibuja.

class App {
    start() {
        this.initData();
        this.bindEvents();
        this.render();
        this.watchExternalChanges();
    }

    initData() {
        const migration = runMigrations(db);
        if (migration.error) {
            showToast('⚠️ No se pudieron actualizar los datos al formato nuevo. La app sigue funcionando con el formato anterior.', 'error', 6000);
        }
        // Durabilidad: que el navegador no borre los datos si le falta espacio.
        db.requestPersistence();
        if (!(db.adapter instanceof LocalStorageAdapter)) {
            showToast('⚠️ Este navegador no permite guardar datos: lo que cargues se pierde al cerrar.', 'error', 8000);
        }
        initializeData();
        this.loadCaches();
    }

    /** Lo guardado que las pantallas mantienen en memoria. */
    loadCaches() {
        archivedRoutines = loadArchivedRoutines();
        loadArchivedExercises();
        loadCustomRoutines();
        loadCustomRoutineLabels();
        exercisePrefs.reload();
    }

    bindEvents() {
        document.getElementById('workoutDate').value = getLocalDateString();
        document.getElementById('bodyDate').valueAsDate = new Date();
        document.getElementById('todayDate').textContent = new Date().toLocaleDateString('es-AR');

        document.querySelectorAll('.emoji-btn').forEach(btn => {
            btn.addEventListener('click', function () {
                document.querySelectorAll('.emoji-btn').forEach(b => b.classList.remove('selected'));
                this.classList.add('selected');
                selectedMood = parseInt(this.dataset.mood);
                saveWorkoutDraft();
            });
        });

        const exercises = document.getElementById('exercisesContainer');
        exercises.addEventListener('input', (e) => {
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
        exercises.addEventListener('change', (e) => {
            if (e.target.dataset?.f === 'time' && e.target.value.trim()) {
                const unit = e.target.dataset.unit;
                e.target.value = formatTimeForUnit(parseTimeInput(e.target.value, unit), unit);
            }
            if (isSessionDataEvent(e)) maybeAutoStartSessionTimer();
            saveWorkoutDraft();
        });
        // Nota de serie vacía: al salir del campo se vuelve a esconder.
        exercises.addEventListener('focusout', (e) => {
            if (e.target.classList?.contains('set-note') && !e.target.value.trim()) e.target.hidden = true;
        });
        exercises.addEventListener('focusin', (e) => {
            if (e.target.closest?.('.set-row') && e.target.dataset?.f) showSetStepper(e.target);
        });
        exercises.addEventListener('pointerdown', (e) => onReorderHandlePointerDown(e));
        exercises.addEventListener('keydown', (e) => onReorderHandleKeyDown(e));

        // El audio solo puede sonar después de un toque del usuario.
        document.addEventListener('pointerdown', unlockAudio, { once: true, capture: true });

        // Al volver a la app, la pantalla encendida se vuelve a pedir si se había perdido.
        document.addEventListener('visibilitychange', async () => {
            if (!wakeLockEnabled || document.visibilityState !== 'visible') return;
            const needsRestart = (wakeLockMode === 'api' && wakeLock === null) ||
                (wakeLockMode === 'video' && noSleepVideoEl && noSleepVideoEl.paused) ||
                wakeLockMode === null;
            if (!needsRestart) return;
            const ok = await requestWakeLock();
            if (!ok) {
                wakeLockEnabled = false;
                try { db.set('wakeLockEnabled', '0'); } catch (e) {}
            }
            updateWakeLockBtn();
        });

        // Backup: al elegir un archivo en "Cargar backup".
        document.getElementById('fileInput')?.addEventListener('change', function () {
            if (this.files && this.files[0]) uploadData(this.files[0]);
        });
    }

    render() {
        initTheme();
        initWakeLock();
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
    }

    /**
     * Si otra pestaña o ventana de la app guarda datos, esta se entera (evento "storage")
     * y recarga lo que tiene en memoria, así nunca pisa cambios con datos viejos. No se
     * redibuja la pantalla Entrenar para no borrar lo que se está cargando ahí.
     */
    watchExternalChanges() {
        db.onChange((keys, origin) => {
            if (origin !== 'external') return;
            const touchesData = keys.some(k => STORAGE_SCHEMA[k]?.group === 'data');
            if (!touchesData) return;
            this.loadCaches();
            populateRoutineOptions();
            populateUnifySelectors();
            displayWorkoutHistory();
            calculateStats();
            updateSidebar();
            showToast('🔄 Se actualizaron datos que cambiaron en otra ventana', 'success', 2500);
        });
    }
}

new App().start();
