// Service worker del Tracker de Entrenamiento.
// Sólo corre bajo un contexto seguro real (https/localhost) — abrir el HTML
// directo desde el celular (content://) nunca va a registrar esto, y está bien:
// para ese caso queda el fallback de video del wake lock en el HTML.
//
// Subí SW_VERSION cada vez que edites el HTML/CSS/JS de forma significativa,
// para que los clientes descarten el caché viejo en vez de seguir sirviéndolo.
const SW_VERSION = 'v7';
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
    './js/boot.js',
    './css/tokens.css',
    './css/layout.css',
    './css/training.css',
    './css/components.css',
    './css/timers-audio.css',
    './css/progress.css',
    './css/responsive.css',
    './js/core/utils.js',
    './js/core/time.js',
    './js/domain/catalog.js',
    './js/domain/legacy-format.js',
    './js/domain/sets.js',
    './js/data/exercise-prefs.js',
    './js/data/routines-store.js',
    './js/domain/stats.js',
    './js/ui/toast.js',
    './js/ui/wake-lock.js',
    './js/audio/sound.js',
    './js/audio/voice.js',
    './js/audio/recordings.js',
    './js/features/rest-timer.js',
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
    './js/features/exercises.js',
    './js/features/history.js',
    './js/features/progress.js',
    './js/features/body-metrics.js',
    './js/features/home.js',
    './js/features/backup.js',
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

    event.respondWith(
        caches.match(event.request).then((cached) => {
            const network = fetch(event.request)
                .then((response) => {
                    if (response && response.status === 200) {
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
