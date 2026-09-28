// Perfil: nombre, foto, contacto, tu actividad, medallas (con imagen para compartir) y
// fotos de progreso. Las fotos quedan en el celular (IndexedDB) y entran en el backup.
// Script clásico (no módulo): comparte el ámbito global con el resto de la app.

const PHOTO_MAX_SIDE = 1280;
const PHOTO_QUALITY = 0.82;
let profilePhotoUrls = [];

function loadProfile() {
    const p = db.get('userProfile') || {};
    const clean = (v, max) => (typeof v === 'string' ? v.trim().slice(0, max) : '');
    return { name: clean(p.name, 60), email: clean(p.email, 120), phone: clean(p.phone, 30) };
}

function saveProfile(patch) {
    try { db.set('userProfile', { ...loadProfile(), ...patch }); } catch (e) { showToast('No se pudo guardar el perfil', 'error'); }
}

// Achica la foto antes de guardarla (lado mayor 1280 px, JPEG): una foto de celular pasa de
// varios MB a unos 150-300 KB, así entran muchas en el celular y en el backup.
function compressImage(file) {
    return new Promise((resolve, reject) => {
        if (!file || !/^image\//.test(file.type)) { reject(new ValidationError('Elegí una imagen.')); return; }
        const img = new Image();
        const url = URL.createObjectURL(file);
        img.onload = () => {
            const scale = Math.min(1, PHOTO_MAX_SIDE / Math.max(img.width, img.height));
            const canvas = document.createElement('canvas');
            canvas.width = Math.round(img.width * scale);
            canvas.height = Math.round(img.height * scale);
            canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
            URL.revokeObjectURL(url);
            canvas.toBlob(b => b ? b.arrayBuffer().then(resolve, reject) : reject(new Error('No se pudo procesar la imagen')), 'image/jpeg', PHOTO_QUALITY);
        };
        img.onerror = () => { URL.revokeObjectURL(url); reject(new ValidationError('No se pudo abrir la imagen.')); };
        img.src = url;
    });
}

async function savePhoto(file, kind, date) {
    const data = await compressImage(file);
    const id = kind === 'avatar' ? 'avatar' : `progress-${date}-${Date.now().toString(36)}`;
    await photoRepo.put({ id, kind, date: date || getLocalDateString(), mime: 'image/jpeg', updatedAt: Date.now(), data });
    return id;
}

// ---------- Pantalla ----------

async function renderProfile() {
    const profile = loadProfile();
    const nameEl = document.getElementById('profileName');
    if (nameEl && document.activeElement !== nameEl) nameEl.value = profile.name;
    const emailEl = document.getElementById('profileEmail');
    if (emailEl && document.activeElement !== emailEl) emailEl.value = profile.email;
    const phoneEl = document.getElementById('profilePhone');
    if (phoneEl && document.activeElement !== phoneEl) phoneEl.value = profile.phone;

    const stats = computeUsageStats(repo.workouts.all(), loadAppSettings().weekStart);
    const since = document.getElementById('profileSince');
    if (since) since.textContent = stats.firstDate ? `Entrenando desde el ${new Date(stats.firstDate + 'T00:00:00').toLocaleDateString('es-AR')}` : 'Todavía no guardaste sesiones';
    renderProfileStats(stats);
    renderMedals(stats);
    await renderPhotos();
}

function renderProfileStats(s) {
    const box = document.getElementById('profileStats');
    if (!box) return;
    const items = [
        ['🏋️', s.sessions, 'sesiones'],
        ['📅', s.activeDays, 'días entrenados'],
        ['⏱️', formatNumber(s.hours), 'horas'],
        ['🔥', s.currentWeekStreak, s.currentWeekStreak === 1 ? 'semana seguida' : 'semanas seguidas'],
        ['🏆', s.records, 'récords'],
        ['🏗️', s.totalVolume >= 1000 ? `${formatNumber(Math.round(s.totalVolume / 100) / 10)} t` : `${s.totalVolume} kg`, 'levantados']
    ];
    box.innerHTML = `<div class="profile-stats">${items.map(([i, v, l]) => `<div class="profile-stat"><span aria-hidden="true">${i}</span><b>${escapeHtml(String(v))}</b><small>${l}</small></div>`).join('')}</div>
        <p class="lib-note">${s.bestWeekStreak ? `Mejor racha: ${s.bestWeekStreak} ${s.bestWeekStreak === 1 ? 'semana seguida' : 'semanas seguidas'}. ` : ''}${s.avgMinutes ? `Sesión promedio: ${formatDurationHuman(s.avgMinutes * 60)}. ` : ''}${s.favoriteExercise ? `Tu ejercicio más hecho: ${escapeHtml(s.favoriteExercise)}.` : ''}</p>`;
}

function renderMedals(stats) {
    const box = document.getElementById('profileMedals');
    if (!box) return;
    box.innerHTML = evaluateAchievements(stats).map(a => {
        const color = a.tier ? a.tier.color : 'var(--bg-elevated)';
        const fmt = n => formatNumber(n >= 10000 ? Math.round(n) : n);
        const nextText = a.next ? `${fmt(a.value)} de ${fmt(a.next)} ${a.unit} para ${MEDAL_TIERS[a.level].name}` : '¡Nivel máximo!';
        return `<div class="medal${a.tier ? '' : ' locked'}">
                <div class="medal-disc" style="--medal:${color}" aria-hidden="true">${a.icon}</div>
                <div class="medal-text">
                    <strong>${a.title}${a.tier ? ` · ${a.tier.name}` : ''}</strong>
                    <small>${nextText}</small>
                    <div class="medal-bar"><i style="width:${Math.round(a.progress * 100)}%"></i></div>
                </div>
                ${a.tier ? `<button type="button" class="small lib-secondary" data-share-medal="${a.id}" aria-label="Compartir medalla ${a.title}">📤</button>` : ''}
            </div>`;
    }).join('');
}

async function renderPhotos() {
    profilePhotoUrls.forEach(u => URL.revokeObjectURL(u));
    profilePhotoUrls = [];
    let photos = [];
    try { photos = await photoRepo.all(); } catch (e) { photos = []; }
    const urlOf = rec => { const u = URL.createObjectURL(new Blob([rec.data], { type: rec.mime || 'image/jpeg' })); profilePhotoUrls.push(u); return u; };

    const avatar = photos.find(p => p.id === 'avatar');
    const img = document.getElementById('profilePhoto');
    const initials = document.getElementById('profileInitials');
    if (img && initials) {
        img.hidden = !avatar;
        initials.hidden = !!avatar;
        if (avatar) img.src = urlOf(avatar);
        const name = loadProfile().name;
        initials.textContent = name ? name.split(/\s+/).map(w => w[0]).slice(0, 2).join('').toUpperCase() : '🙂';
    }
    const grid = document.getElementById('progressPhotos');
    if (!grid) return;
    const progress = photos.filter(p => p.kind === 'progress').sort((a, b) => (b.date || '').localeCompare(a.date || ''));
    grid.innerHTML = progress.length
        ? progress.map(p => `<button type="button" class="photo-thumb" data-photo="${escapeHtml(p.id)}" aria-label="Foto del ${escapeHtml(p.date || '')}"><img src="${urlOf(p)}" alt=""><span>${new Date((p.date || getLocalDateString()) + 'T00:00:00').toLocaleDateString('es-AR')}</span></button>`).join('')
        : '<p class="lib-empty">Sacate una foto cada 2 a 4 semanas (misma luz y misma pose) para ver tu cambio. También podés sumar una foto al cargar tus medidas.</p>';
}

async function openPhoto(id) {
    const rec = (await photoRepo.all()).find(p => p.id === id);
    if (!rec) return;
    const modal = document.getElementById('photoModal');
    const url = URL.createObjectURL(new Blob([rec.data], { type: rec.mime }));
    profilePhotoUrls.push(url);
    document.getElementById('photoModalImg').src = url;
    document.getElementById('photoModalDate').textContent = new Date((rec.date || getLocalDateString()) + 'T00:00:00').toLocaleDateString('es-AR');
    modal.dataset.photo = id;
    modal.classList.add('open');
}

// ---------- Imagen para compartir una medalla ----------

function drawMedalImage(a, profileName) {
    const W = 1080, H = 1350;
    const c = document.createElement('canvas');
    c.width = W; c.height = H;
    const g = c.getContext('2d');
    const bg = g.createLinearGradient(0, 0, 0, H);
    bg.addColorStop(0, '#12141a'); bg.addColorStop(1, '#262a36');
    g.fillStyle = bg; g.fillRect(0, 0, W, H);
    // Medalla: cinta, disco con degradé metálico, borde y brillo
    g.fillStyle = '#c0392b'; g.beginPath(); g.moveTo(420, 180); g.lineTo(540, 470); g.lineTo(660, 180); g.lineTo(600, 180); g.lineTo(540, 330); g.lineTo(480, 180); g.closePath(); g.fill();
    const metal = g.createRadialGradient(480, 540, 40, 540, 620, 260);
    metal.addColorStop(0, '#ffffff'); metal.addColorStop(0.25, a.tier.color); metal.addColorStop(1, '#2b2b2b');
    g.fillStyle = metal; g.beginPath(); g.arc(540, 640, 240, 0, Math.PI * 2); g.fill();
    g.lineWidth = 18; g.strokeStyle = 'rgba(255,255,255,0.55)'; g.stroke();
    g.font = '200px serif'; g.textAlign = 'center'; g.textBaseline = 'middle';
    g.fillText(a.icon, 540, 650);
    g.fillStyle = '#ffffff'; g.textBaseline = 'alphabetic';
    g.font = 'bold 78px system-ui, sans-serif'; g.fillText(`${a.title}`, 540, 1000);
    g.fillStyle = a.tier.color; g.font = 'bold 64px system-ui, sans-serif'; g.fillText(`Medalla de ${a.tier.name}`, 540, 1085);
    g.fillStyle = '#c3c6cc'; g.font = '44px system-ui, sans-serif';
    g.fillText(`${formatNumber(a.value)} ${a.unit}${profileName ? ` · ${profileName}` : ''}`, 540, 1160);
    g.fillStyle = '#8e929b'; g.font = '36px system-ui, sans-serif'; g.fillText(appBrandLine(), 540, 1290);
    return c;
}

async function shareMedal(id) {
    const a = evaluateAchievements(computeUsageStats(repo.workouts.all(), loadAppSettings().weekStart)).find(x => x.id === id);
    if (!a || !a.tier) return;
    const canvas = drawMedalImage(a, loadProfile().name);
    const blob = await new Promise(r => canvas.toBlob(r, 'image/png'));
    const file = new File([blob], `medalla-${a.id}-${a.tier.name.toLowerCase()}.png`, { type: 'image/png' });
    const text = `¡Gané la medalla de ${a.tier.name} en ${a.title}! (${formatNumber(a.value)} ${a.unit})`;
    try {
        if (navigator.canShare && navigator.canShare({ files: [file] })) { await navigator.share({ files: [file], text }); return; }
    } catch (e) {
        if (e && e.name === 'AbortError') return;
    }
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url; link.download = file.name; link.click();
    setTimeout(() => URL.revokeObjectURL(url), 2000);
    showToast('🖼️ Imagen descargada: compartila en tus redes', 'success', 3000);
}

// ---------- Eventos ----------

function bindProfile() {
    const screen = document.querySelector('[data-screen="perfil"]');
    if (!screen) return;
    const bindText = (id, field) => document.getElementById(id)?.addEventListener('change', e => { saveProfile({ [field]: e.target.value }); renderProfile(); });
    bindText('profileName', 'name');
    bindText('profileEmail', 'email');
    bindText('profilePhone', 'phone');
    const pick = (inputId, handler) => document.getElementById(inputId)?.addEventListener('change', async e => {
        const file = e.target.files && e.target.files[0];
        e.target.value = '';
        if (!file) return;
        try { await handler(file); await renderPhotos(); } catch (err) { showToast(err.message || 'No se pudo guardar la foto', 'error'); }
    });
    pick('profilePhotoInput', file => savePhoto(file, 'avatar'));
    pick('progressPhotoInput', async file => { await savePhoto(file, 'progress', getLocalDateString()); showToast('📸 Foto guardada', 'success', 1800); });
    screen.addEventListener('click', e => {
        if (e.target.closest('#profilePhotoBtn')) document.getElementById('profilePhotoInput').click();
        if (e.target.closest('#addProgressPhoto')) document.getElementById('progressPhotoInput').click();
        const thumb = e.target.closest('[data-photo]');
        if (thumb) openPhoto(thumb.dataset.photo);
        const medal = e.target.closest('[data-share-medal]');
        if (medal) shareMedal(medal.dataset.shareMedal);
    });
    const modal = document.getElementById('photoModal');
    modal?.addEventListener('click', async e => {
        if (e.target === modal || e.target.closest('[data-photo-action="close"]')) { modal.classList.remove('open'); return; }
        if (e.target.closest('[data-photo-action="delete"]')) {
            if (!confirm('¿Borrar esta foto? No se puede deshacer.')) return;
            await photoRepo.delete(modal.dataset.photo);
            modal.classList.remove('open');
            renderPhotos();
        }
    });
}

// Foto opcional al cargar una medición (Medidas corporales): queda como foto de progreso de esa fecha.
async function saveMeasurementPhoto(date) {
    const input = document.getElementById('bodyPhoto');
    const file = input && input.files && input.files[0];
    if (!file) return;
    try { await savePhoto(file, 'progress', date); } catch (e) { showToast('La medición se guardó, pero la foto no: ' + e.message, 'error'); }
    input.value = '';
}
