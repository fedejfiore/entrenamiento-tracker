// Corre en <head>, antes de pintar: tema guardado (sin "flash") y service worker.

// Aplica el tema guardado ANTES de pintar, para que no haya flash del tema por defecto (oscuro)
(function() {
    try {
        var saved = localStorage.getItem('theme');
        if (saved === 'light') document.documentElement.setAttribute('data-theme', 'light');
        var accent = localStorage.getItem('accentColor');
        if (accent && accent !== 'naranja') document.documentElement.setAttribute('data-accent', accent);
    } catch (e) {}
})();
// Registra el service worker sólo si el navegador lo soporta (requiere
// contexto seguro: https o localhost — no funciona con content://,
// ahí simplemente no se registra y la app sigue andando igual).
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('service-worker.js').catch(() => {});
    });
}
