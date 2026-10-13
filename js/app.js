// Arranque de la app. Los demás archivos solo declaran (clases, funciones, datos y estado);
// acá se ejecuta todo, en este orden:
//   1. Datos: migraciones del esquema, persistencia y carga de lo guardado.
//   2. Eventos de la página.
//   3. Primer dibujado de cada pantalla.
//   4. Cambios hechos desde otra pestaña (aislamiento): se recargan y se redibuja.
// Cada paso corre protegido (ErrorReporter): si uno falla, los demás siguen y la app se puede usar.
import { appErrors } from './core/errors.js';
import { getLocalDateString } from './core/utils.js';
import { appLocale, initI18n } from './core/i18n.js';
import { LocalStorageAdapter } from './data/store.js';
import { STORAGE_SCHEMA } from './data/schema.js';
import { runMigrations } from './data/migrations.js';
import { db } from './data/repositories.js';
import { exercisePrefs } from './data/exercise-prefs.js';
import { initializeData, loadArchivedExercises, loadCustomRoutineLabels, loadCustomRoutines, reloadArchivedRoutines } from './data/routines-store.js';
import { calculateStats } from './domain/stats.js';
import { showToast } from './ui/toast.js';
import { disableWakeLock, initWakeLock, noSleepVideoEl, requestWakeLock, updateWakeLockBtn, wakeLock, wakeLockEnabled, wakeLockMode } from './ui/wake-lock.js';
import { initSoundSettingsUI, unlockAudio } from './audio/sound.js';
import { initVoiceSettingsUI } from './audio/voice.js';
import { loadRecordings, renderRecordingsUI } from './audio/recordings.js';
import { initNativeFeatures } from './features/native.js';
import { restoreTabataSessionBlocks } from './features/tabata.js';
import { initMusicSettingsUI } from './features/music.js';
import { restoreSessionTimer } from './features/training/session-clock.js';
import { restoreWorkoutDraft, saveWorkoutDraft } from './features/training/draft.js';
import { populateRoutineOptions, setSelectedMood } from './features/training/routines-ui.js';
import { initSetStepperAutoHide } from './features/training/set-stepper.js';
import { bindArchivedRoutinesList, workoutScreen } from './features/training/workout-screen.js';
import { bindFinishPrompt } from './features/training/finish-prompt.js';
import { bindSessionSummary } from './features/training/session-summary.js';
import { bindTrainMode } from './features/training/train-mode.js';
import { bindSupersetModal } from './features/training/supersets.js';
import { populateUnifySelectors, renderVariantsCatalog } from './features/exercises.js';
import { bindHistoryList, displayWorkoutHistory } from './features/history.js';
import { bindProgression } from './features/progress.js';
import { loadBodyChartScale, updateBodyChart } from './features/body-metrics.js';
import { updateSidebar } from './features/home.js';
import { bindPlanSection, maybeRemindTodayPlan } from './features/plan-screen.js';
import { bindGarden } from './features/garden.js';
import { initMascot } from './features/mascot.js';
import { bindMuscleMap } from './features/muscle-map.js';
import { bindPlateCalculator } from './features/plate-calculator.js';
import { bindGeneralSettings, bindLanguageSelect } from './features/general-settings.js';
import { initFeatures } from './features/feature-settings.js';
import { initDisciplines } from './features/disciplines.js';
import { initReformerSettings } from './features/reformer.js';
import { initPilatesLibrary } from './features/pilates-library.js';
import { initGymLibrary } from './features/gym-library.js';
import { bindPrograms } from './features/programs.js';
import { bindLibrary } from './features/library.js';
import { bindShareSheet } from './features/share-cards.js';
import { bindProfile } from './features/profile.js';
import { uploadData } from './features/backup.js';
import { bindImportHistory } from './features/import-history.js';
import { bindOnboarding, maybeStartOnboarding } from './features/onboarding.js';
import { bindHelp } from './features/help.js';
import { bindFeedback } from './features/feedback.js';
import { initCollapsibleSections } from './ui/collapsible.js';
import { bindAccessibilitySettings } from './ui/accessibility.js';
import { initBottomNavKeyboardHide, initScreens, initTheme } from './ui/navigation.js';

export class App {
    constructor(errors) {
        this.errors = errors;
    }

    start() {
        this.step('datos', () => this.initData());
        this.bindEvents();
        this.render();
        this.step('otras pestañas', () => this.watchExternalChanges());
    }

    /** Un paso del arranque, protegido. */
    step(name, fn) {
        return this.errors.run(fn, `arranque: ${name}`);
    }

    /** Varios pasos, cada uno protegido por separado. */
    steps(list) {
        list.forEach(fn => this.step(fn.name || 'paso', fn));
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
        reloadArchivedRoutines();
        loadArchivedExercises();
        loadCustomRoutines();
        loadCustomRoutineLabels();
        exercisePrefs.reload();
    }

    bindEvents() {
        document.getElementById('workoutDate').value = getLocalDateString();
        document.getElementById('bodyDate').valueAsDate = new Date();
        document.getElementById('todayDate').textContent = new Date().toLocaleDateString(appLocale());

        document.querySelectorAll('.emoji-btn').forEach(btn => {
            btn.addEventListener('click', function () {
                document.querySelectorAll('.emoji-btn').forEach(b => b.classList.remove('selected'));
                this.classList.add('selected');
                setSelectedMood(parseInt(this.dataset.mood, 10));
                saveWorkoutDraft();
            });
        });

        // Pantallas: eventos delegados (cada uno protegido).
        this.steps([
            function bindWorkoutScreen() { workoutScreen.bind(); },
            bindArchivedRoutinesList,
            bindHistoryList,
            bindHelp,
            bindFeedback,
            bindGarden,
            bindFinishPrompt,
            bindSessionSummary,
            bindOnboarding,
            bindImportHistory,
            bindShareSheet,
            bindPlanSection,
            bindSupersetModal,
            bindPlateCalculator,
            bindMuscleMap,
            initSetStepperAutoHide,
            bindGeneralSettings,
            bindLanguageSelect,
            bindPrograms,
            bindAccessibilitySettings,
            bindTrainMode,
            bindProgression,
            bindLibrary,
            bindProfile,
            function collapsibles_perfil() { initCollapsibleSections(document.querySelector('[data-screen="perfil"]')); },
            function collapsibles_biblioteca_ru() { initCollapsibleSections(document.querySelector('[data-screen="biblioteca"] .lib-tab[data-tab="rutinas"]')); },
            function collapsibles_biblioteca_ej() { initCollapsibleSections(document.querySelector('[data-screen="biblioteca"] .lib-tab[data-tab="ejercicios"]')); },
            function collapsibles_progreso() { initCollapsibleSections(document.querySelector('[data-screen="progreso"]')); },
            function collapsibles_inicio() { initCollapsibleSections(document.querySelector('[data-screen="inicio"]')); },
            function collapsibles_medidas() { initCollapsibleSections(document.querySelector('[data-screen="medidas"]')); },
            function collapsibles_ajustes() { initCollapsibleSections(document.querySelector('[data-screen="ajustes"]')); },
            initBottomNavKeyboardHide,
        ]);

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
            if (!ok) disableWakeLock();
            updateWakeLockBtn();
        });

        // Backup: al elegir un archivo en "Cargar backup".
        document.getElementById('fileInput')?.addEventListener('change', function () {
            if (this.files && this.files[0]) uploadData(this.files[0]);
        });
    }

    render() {
        // initI18n traduce todo lo dibujado y queda atento a los cambios; el primer uso va al final.
        this.steps([
            initTheme,
            initFeatures,
            initDisciplines,
            initReformerSettings,
            initPilatesLibrary,
            initGymLibrary,
            initMascot,
            initWakeLock,
            initNativeFeatures,
            initSoundSettingsUI,
            initVoiceSettingsUI,
            initMusicSettingsUI,
            renderRecordingsUI,
            loadRecordings,
            populateRoutineOptions,
            populateUnifySelectors,
            displayWorkoutHistory,
            loadBodyChartScale,
            updateBodyChart,
            calculateStats,
            updateSidebar,
            restoreSessionTimer,
            restoreWorkoutDraft,
            restoreTabataSessionBlocks,
            renderVariantsCatalog,
            initScreens,
            maybeRemindTodayPlan,
            initI18n,
            maybeStartOnboarding,
        ]);
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

new App(appErrors).start();
