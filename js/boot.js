// Corre en <head>, antes de pintar: tema, color, tamaño y colores de accesibilidad guardados
// (sin "flash"), y service worker.

// Aplica el tema guardado ANTES de pintar, para que no haya flash del tema por defecto (oscuro)
(function() {
    try {
        var saved = localStorage.getItem('theme') || 'auto';
        var light = saved === 'light' || (saved === 'auto' && window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches);
        if (light) document.documentElement.setAttribute('data-theme', 'light');
        var accent = localStorage.getItem('accentColor');
        if (accent && accent !== 'naranja') document.documentElement.setAttribute('data-accent', accent);
        var size = localStorage.getItem('uiSize');
        if (size === 'large' || size === 'xlarge') document.documentElement.setAttribute('data-size', size);
        if (localStorage.getItem('colorVision') === 'cvd') document.documentElement.setAttribute('data-vision', 'cvd');
        if (localStorage.getItem('contrast') === 'high') document.documentElement.setAttribute('data-contrast', 'high');
        // Otro idioma: se oculta hasta traducir (js/core/i18n.js la vuelve a mostrar).
        var lang = localStorage.getItem('language') || 'auto';
        var nav = (navigator.language || '').toLowerCase();
        if (lang === 'en' || lang === 'pt' || (lang === 'auto' && nav && nav.indexOf('es') !== 0)) document.documentElement.classList.add('i18n-pending');
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
