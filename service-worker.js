// Service worker del Tracker de Entrenamiento.
// Sólo corre bajo un contexto seguro real (https/localhost) — abrir el HTML
// directo desde el celular (content://) nunca va a registrar esto, y está bien:
// para ese caso queda el fallback de video del wake lock en el HTML.
//
// Subí SW_VERSION cada vez que edites el HTML/CSS/JS de forma significativa,
// para que los clientes descarten el caché viejo en vez de seguir sirviéndolo.
const SW_VERSION = 'v1';
const CACHE_NAME = 'entrenamiento-tracker-' + SW_VERSION;

const PRECACHE_URLS = [
    './entrenamiento_trackerv2.html',
    './manifest.json',
    './icon-192.png',
    './icon-512.png',
    './icon-512-maskable.png',
    './apple-touch-icon.png',
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
