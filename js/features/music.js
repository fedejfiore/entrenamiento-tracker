// Accesos a Spotify / YouTube Music y playlists guardadas.
// Script clásico (no módulo): comparte el ámbito global con el resto de la app.

// Una web no puede manejar la reproducción de Spotify o YouTube Music (pausar,
// siguiente tema): eso lo controla cada app. Lo que sí se puede es abrirlas desde
// acá, directo en una playlist guardada, y volver a la app con el botón de atrás.
const MUSIC_APPS = {
    spotify: { label: 'Spotify', home: 'https://open.spotify.com/', hosts: /(^|\.)spotify\.com$|^spotify\.link$/ },
    ytmusic: { label: 'YouTube Music', home: 'https://music.youtube.com/', hosts: /(^|\.)youtube\.com$|^youtu\.be$/ }
};

function loadMusicLinks() {
    try { return db.get('musicLinks') || {}; } catch (e) { return {}; }
}

function initMusicSettingsUI() {
    const links = loadMusicLinks();
    Object.keys(MUSIC_APPS).forEach(key => {
        const el = document.getElementById(`musicLink_${key}`);
        if (el) el.value = links[key] || '';
    });
}

function saveMusicLink(key, input) {
    const raw = (input.value || '').trim();
    const links = loadMusicLinks();
    if (!raw) {
        delete links[key];
    } else {
        let url;
        try { url = new URL(raw); } catch (e) { url = null; }
        if (!url || url.protocol !== 'https:' || !MUSIC_APPS[key].hosts.test(url.hostname)) {
            showToast(`Ese link no parece de ${MUSIC_APPS[key].label}. Copialo desde "Compartir → Copiar link".`, 'error', 4500);
            return;
        }
        links[key] = url.href;
    }
    db.set('musicLinks', links);
    showToast(raw ? `🎵 Playlist de ${MUSIC_APPS[key].label} guardada` : `Se borró la playlist de ${MUSIC_APPS[key].label}`);
}

function openMusic(key) {
    const app = MUSIC_APPS[key];
    if (!app) return;
    const url = loadMusicLinks()[key] || app.home;
    // Con la app instalada, el celular abre estos links directo en Spotify / YT Music.
    window.open(url, '_blank', 'noopener');
}

