// Pantallas, menú lateral y tema claro / oscuro.
// Script clásico (no módulo): comparte el ámbito global con el resto de la app.

const APP_SCREENS = [
    { id: 'inicio', icon: '🏠', label: 'Inicio' },
    { id: 'entrenar', icon: '🏋️', label: 'Entrenar' },
    { id: 'tabata', icon: '⏱️', label: 'Tabata' },
    { id: 'historial', icon: '📋', label: 'Historial' },
    { id: 'progreso', icon: '📊', label: 'Progreso' },
    { id: 'medidas', icon: '📏', label: 'Medidas corporales' },
    { id: 'variantes', icon: '🎯', label: 'Variantes' },
    { id: 'ajustes', icon: '⚙️', label: 'Ajustes' }
];

// Qué refrescar al entrar a cada pantalla (los gráficos de Chart.js necesitan
// que su canvas ya esté visible, si no renderizan a tamaño cero).
const SCREEN_ON_SHOW = {
    progreso: () => {
        renderMuscleMap();
        populateProgresoRoutineFilter();
        renderProgressGrid();
    },
    medidas: () => updateBodyChart(),
    ajustes: () => renderArchivedRoutinesList()
};

function renderDrawerNav() {
    const container = document.getElementById('drawerNav');
    if (!container) return;
    container.innerHTML = APP_SCREENS.map(s =>
        `<div class="drawer-nav-item" data-nav-target="${s.id}" onclick="showScreen('${s.id}', true)">
            <span class="nav-icon">${s.icon}</span><span>${s.label}</span>
        </div>`
    ).join('');
}

function showScreen(screenId, fromClick) {
    if (!APP_SCREENS.some(s => s.id === screenId)) screenId = 'inicio';

    document.querySelectorAll('[data-screen]').forEach(el => {
        el.classList.toggle('screen-active', el.dataset.screen === screenId);
    });
    document.querySelectorAll('.drawer-nav-item').forEach(item => {
        item.classList.toggle('active', item.dataset.navTarget === screenId);
    });

    const meta = APP_SCREENS.find(s => s.id === screenId);
    const titleEl = document.getElementById('topbarTitle');
    if (titleEl && meta) titleEl.textContent = meta.label;

    try { db.set('activeScreen', screenId); } catch (e) {}

    if (SCREEN_ON_SHOW[screenId]) SCREEN_ON_SHOW[screenId]();

    if (fromClick) {
        closeDrawer();
        window.scrollTo(0, 0);
    }
}

function initScreens() {
    renderDrawerNav();
    showScreen('inicio');
}

function openDrawer() {
    document.getElementById('drawer').classList.add('open');
    document.getElementById('drawerOverlay').classList.add('visible');
}

function closeDrawer() {
    document.getElementById('drawer').classList.remove('open');
    document.getElementById('drawerOverlay').classList.remove('visible');
}

function toggleDrawer() {
    const drawer = document.getElementById('drawer');
    if (drawer.classList.contains('open')) closeDrawer();
    else openDrawer();
}

function applyTheme(theme) {
    if (theme === 'light') {
        document.documentElement.setAttribute('data-theme', 'light');
    } else {
        document.documentElement.removeAttribute('data-theme');
    }
    const btn = document.getElementById('themeToggleBtn');
    if (btn) btn.textContent = theme === 'light' ? '🌙' : '☀️';
}

function toggleTheme() {
    const isLight = document.documentElement.getAttribute('data-theme') === 'light';
    const next = isLight ? 'dark' : 'light';
    applyTheme(next);
    try { db.set('theme', next); } catch (e) {}
}

function initTheme() {
    let saved = 'dark';
    try { saved = db.get('theme') || 'dark'; } catch (e) {}
    applyTheme(saved);
}

