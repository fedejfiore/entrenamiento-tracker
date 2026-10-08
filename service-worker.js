// Service worker del Tracker de Entrenamiento: guarda en caché la página y todos sus
// archivos para que la app abra sin conexión. Sólo corre en un contexto seguro
// (https o localhost).
//
// Subí SW_VERSION cada vez que edites el HTML/CSS/JS de forma significativa,
// para que los clientes descarten el caché viejo en vez de seguir sirviéndolo.
const SW_VERSION = 'v50';
const CACHE_NAME = 'entrenamiento-tracker-' + SW_VERSION;

// Todo lo que la app necesita para abrir sin conexión. Tiene que coincidir con los
// <link>/<script> de entrenamiento_trackerv2.html (lo verifica tests/service-worker.test.js).
const PRECACHE_URLS = [
    './entrenamiento_trackerv2.html',
    './manifest.json',
    './icon-192.png',
    './icon-512.png',
    './icon-512-maskable.png',
    './apple-touch-icon.png',
    './vendor/chart.min.js',
    './fonts/inter-latin.woff2',
    './fonts/oswald-latin.woff2',
    './fonts/inter-latin-ext.woff2',
    './fonts/oswald-latin-ext.woff2',
    './js/boot.js',
    './css/tokens.css',
    './css/layout.css',
    './css/training.css',
    './css/components.css',
    './css/timers-audio.css',
    './css/progress.css',
    './css/help.css',
    './css/plan.css',
    './css/tools.css',
    './css/fonts.css',
    './css/accessibility.css',
    './css/responsive.css',
    './js/core/utils.js',
    './js/core/i18n.js',
    './js/i18n/en.js',
    './js/i18n/pt.js',
    './js/i18n/de.js',
    './js/i18n/zh.js',
    './js/core/brand.js',
    './js/core/time.js',
    './js/core/units.js',
    './js/data/store.js',
    './js/data/schema.js',
    './js/domain/catalog.js',
    './js/domain/pilates.js',
    './js/domain/legacy-format.js',
    './js/domain/sets.js',
    './js/domain/models.js',
    './js/domain/plan.js',
    './js/domain/garden.js',
    './js/domain/training-tools.js',
    './js/domain/programs.js',
    './js/domain/routine-share.js',
    './js/domain/achievements.js',
    './js/data/migrations.js',
    './js/data/repositories.js',
    './js/data/recording-repository.js',
    './js/data/backup-crypto.js',
    './js/data/backup-service.js',
    './js/data/exercise-prefs.js',
    './js/data/routines-store.js',
    './js/domain/stats.js',
    './js/domain/import-csv.js',
    './js/ui/actions.js',
    './js/ui/toast.js',
    './js/ui/wake-lock.js',
    './js/audio/sound.js',
    './js/audio/voice.js',
    './js/audio/voice-styles.js',
    './js/audio/recordings.js',
    './js/features/rest-timer.js',
    './js/features/native.js',
    './legal/legal.css',
    './legal/privacidad.html',
    './legal/terminos.html',
    './legal/privacy.html',
    './legal/terms.html',
    './js/features/tabata.js',
    './js/features/rep-counter.js',
    './js/features/music.js',
    './js/features/training/session-clock.js',
    './js/features/training/draft.js',
    './js/features/training/routines-ui.js',
    './js/features/training/exercise-block.js',
    './js/features/training/set-stepper.js',
    './js/features/training/reorder.js',
    './js/features/training/workout.js',
    './js/features/training/workout-screen.js',
    './js/features/training/finish-prompt.js',
    './js/features/training/session-summary.js',
    './js/features/training/set-swipe.js',
    './js/features/training/train-mode.js',
    './js/features/training/supersets.js',
    './js/features/exercises.js',
    './js/features/history.js',
    './js/features/progress.js',
    './js/features/body-metrics.js',
    './js/features/home.js',
    './js/features/plan-screen.js',
    './js/features/garden.js',
    './js/features/muscle-map.js',
    './js/features/plate-calculator.js',
    './js/features/general-settings.js',
    './js/features/disciplines.js',
    './js/features/reformer.js',
    './js/features/programs.js',
    './js/features/library.js',
    './js/features/share-cards.js',
    './js/features/profile.js',
    './js/features/backup.js',
    './js/features/import-history.js',
    './js/features/onboarding.js',
    './js/features/help.js',
    './js/features/feedback.js',
    './js/ui/collapsible.js',
    './js/ui/accessibility.js',
    './js/ui/navigation.js',
    './js/app.js',
];

self.addEventListener('install', (event) => {
    self.skipWaiting();
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE_URLS))
    );
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys()
            .then((keys) => Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))))
            .then(() => self.clients.claim())
    );
});

// Stale-while-revalidate: responde rápido desde caché (funciona sin señal en
// el gimnasio) y actualiza el caché en segundo plano para la próxima vez.
self.addEventListener('fetch', (event) => {
    if (event.request.method !== 'GET') return;
    // Solo archivos de la propia app: nada de otros sitios entra al caché.
    if (new URL(event.request.url).origin !== self.location.origin) return;

    event.respondWith(
        caches.match(event.request).then((cached) => {
            const network = fetch(event.request)
                .then((response) => {
                    if (response && response.status === 200 && response.type === 'basic') {
                        const copy = response.clone();
                        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
                    }
                    return response;
                })
                .catch(() => cached);
            return cached || network;
        })
    );
});
