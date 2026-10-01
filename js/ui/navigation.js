// Pantallas, menú lateral y tema claro / oscuro.
// Script clásico (no módulo): comparte el ámbito global con el resto de la app.

const APP_SCREENS = [
    { id: 'inicio', icon: '🏠', label: 'Inicio' },
    { id: 'entrenar', icon: '🏋️', label: 'Entrenar' },
    { id: 'historial', icon: '📋', label: 'Historial' },
    { id: 'progreso', icon: '📊', label: 'Progreso' },
    { id: 'medidas', icon: '📏', label: 'Medidas corporales' },
    { id: 'biblioteca', icon: '📚', label: 'Biblioteca' },
    { id: 'perfil', icon: '👤', label: 'Perfil' },
    { id: 'ajustes', icon: '⚙️', label: 'Ajustes' }
];

// Qué refrescar al entrar a cada pantalla (los gráficos de Chart.js necesitan
// que su canvas ya esté visible, si no renderizan a tamaño cero).
const SCREEN_ON_SHOW = {
    inicio: () => { renderTodayCard(getCurrentPlan()); renderGarden(); },
    progreso: () => {
        renderMuscleMap();
        generateProgressionAnalysis();
    },
    medidas: () => updateBodyChart(),
    biblioteca: () => renderLibrary(),
    perfil: () => renderProfile()
};

function renderDrawerNav() {
    const container = document.getElementById('drawerNav');
    if (!container) return;
    container.innerHTML = APP_SCREENS.map(s =>
        `<div class="drawer-nav-item" data-nav-target="${s.id}" ${fnAttrs('showScreen', s.id, true)}>
            <span class="nav-icon">${s.icon}</span><span>${s.label}</span>
        </div>`
    ).join('');
}

function showScreen(screenId, fromClick) {
    if (screenId === 'tabata') { screenId = 'entrenar'; setTimeout(() => setTrainMode('tabata'), 0); }
    if (screenId === 'variantes') screenId = 'biblioteca';
    if (!APP_SCREENS.some(s => s.id === screenId)) screenId = 'inicio';

    document.querySelectorAll('[data-screen]').forEach(el => {
        el.classList.toggle('screen-active', el.dataset.screen === screenId);
    });
    document.querySelectorAll('.drawer-nav-item, .bottom-nav-item[data-nav-target]').forEach(item => {
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
        try { db.set('activeScrollY', '0'); } catch (e) {}
    }
}

// Al recargar vuelve a la pantalla (y a la altura) en la que estaba, no siempre a Inicio.
function initScreens() {
    renderDrawerNav();
    let screen = 'inicio', scrollY = 0;
    try {
        screen = db.get('activeScreen') || 'inicio';
        scrollY = parseInt(db.get('activeScrollY'), 10) || 0;
    } catch (e) {}
    showScreen(screen);
    if (scrollY > 0) requestAnimationFrame(() => setTimeout(() => window.scrollTo(0, scrollY), 60));
    // La altura se guarda al salir o recargar (y cada tanto al desplazarse).
    const saveScroll = () => { try { db.set('activeScrollY', String(Math.round(window.scrollY))); } catch (e) {} };
    window.addEventListener('pagehide', saveScroll);
    document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'hidden') saveScroll(); });
    let t = null;
    window.addEventListener('scroll', () => { clearTimeout(t); t = setTimeout(saveScroll, 400); }, { passive: true });
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

// Tema: 'auto' sigue al celular (claro u oscuro según el sistema), o fijo 'dark' / 'light'.
const systemLight = window.matchMedia ? window.matchMedia('(prefers-color-scheme: light)') : null;

function resolveTheme(pref) {
    if (pref === 'light' || pref === 'dark') return pref;
    return systemLight && systemLight.matches ? 'light' : 'dark';
}

function applyTheme(pref) {
    if (resolveTheme(pref) === 'light') document.documentElement.setAttribute('data-theme', 'light');
    else document.documentElement.removeAttribute('data-theme');
    if (typeof renderMuscleMap === 'function') { try { renderMuscleMap(); } catch (e) {} }
}

function currentThemePref() {
    try { return db.get('theme') || 'auto'; } catch (e) { return 'auto'; }
}

function setThemePref(pref) {
    try { db.set('theme', pref); } catch (e) {}
    applyTheme(pref);
}

// Se mantiene para quien lo llame (atajos viejos): alterna entre claro y oscuro fijos.
function toggleTheme() {
    setThemePref(document.documentElement.getAttribute('data-theme') === 'light' ? 'dark' : 'light');
}

function initTheme() {
    applyTheme(currentThemePref());
    systemLight?.addEventListener?.('change', () => { if (currentThemePref() === 'auto') applyTheme('auto'); });
    const sel = document.getElementById('themeSelect');
    if (sel) {
        sel.value = currentThemePref();
        sel.addEventListener('change', () => setThemePref(sel.value));
    }
}


// Con el teclado abierto la barra de abajo estorba (tapa el campo que se edita): se oculta
// mientras la ventana visible es mucho más baja que la pantalla.
function initBottomNavKeyboardHide() {
    const vv = window.visualViewport;
    if (!vv) return;
    const update = () => document.body.classList.toggle('keyboard-open', vv.height < window.innerHeight * 0.75);
    vv.addEventListener('resize', update);
    update();
}
