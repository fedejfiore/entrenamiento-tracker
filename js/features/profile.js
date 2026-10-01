// Perfil: nombre, foto, contacto, tu actividad, medallas (con imagen para compartir) y
// fotos de progreso. Las fotos quedan en el celular (IndexedDB) y entran en el backup.
// Script clásico (no módulo): comparte el ámbito global con el resto de la app.

const PHOTO_MAX_SIDE = 1280;
const PHOTO_QUALITY = 0.82;
let profilePhotoUrls = [];

function loadProfile() {
    const p = db.get('userProfile') || {};
    const clean = (v, max) => (typeof v === 'string' ? v.trim().slice(0, max) : '');
    const birth = typeof p.birthDate === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(p.birthDate) ? p.birthDate : '';
    return { name: clean(p.name, 60), email: clean(p.email, 120), phone: clean(p.phone, 30), birthDate: birth };
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

// Edad a partir de la fecha de nacimiento (se guarda la fecha, así la edad se actualiza sola).
function ageFrom(birthDate, today = new Date()) {
    if (!birthDate) return null;
    const b = new Date(birthDate + 'T00:00:00');
    let age = today.getFullYear() - b.getFullYear();
    if (today.getMonth() < b.getMonth() || (today.getMonth() === b.getMonth() && today.getDate() < b.getDate())) age--;
    return age >= 5 && age <= 110 ? age : null;
}

// ---------- Pantalla ----------

async function renderProfile() {
    const profile = loadProfile();
    const nameEl = document.getElementById('profileName');
    if (nameEl && document.activeElement !== nameEl) nameEl.value = profile.name;
    const emailEl = document.getElementById('profileEmail');
    if (emailEl && document.activeElement !== emailEl) emailEl.value = profile.email;
    const birthEl = document.getElementById('profileBirth');
    if (birthEl && document.activeElement !== birthEl) { birthEl.value = profile.birthDate; birthEl.max = getLocalDateString(); }
    const phoneEl = document.getElementById('profilePhone');
    if (phoneEl && document.activeElement !== phoneEl) phoneEl.value = profile.phone;

    const stats = computeUsageStats(repo.workouts.all(), loadAppSettings().weekStart);
    const since = document.getElementById('profileSince');
    const age = ageFrom(profile.birthDate);
    const sinceText = stats.firstDate ? `Entrenando desde el ${new Date(stats.firstDate + 'T00:00:00').toLocaleDateString('es-AR')}` : 'Todavía no guardaste sesiones';
    if (since) since.textContent = (age != null ? `${age} años · ` : '') + sinceText;
    renderProfileStats(stats);
    renderMedals(stats);
    renderTrophies();
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
        ['🏗️', weightUnit === 'kg' && s.totalVolume >= 1000 ? `${formatNumber(Math.round(s.totalVolume / 100) / 10)} t` : formatWeightTotal(s.totalVolume), 'levantados']
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
        const isWeight = a.id === 'volume';
        const qty = n => isWeight ? formatWeightTotal(n) : `${fmt(n)} ${a.unit}`;
        const nextText = a.next ? `${isWeight ? formatWeightTotal(a.value).replace(/ \S+$/, '') : fmt(a.value)} de ${qty(a.next)} para ${MEDAL_TIERS[a.level].name}` : '¡Nivel máximo!';
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

// ---------- Medallas y trofeos para compartir (ver js/features/share-cards.js) ----------

function shareDateText(dateStr) {
    return new Date((dateStr || getLocalDateString()) + 'T00:00:00').toLocaleDateString('es-AR', { day: 'numeric', month: 'long', year: 'numeric' });
}

function medalShareSpec(a) {
    const qty = n => a.id === 'volume' ? formatWeightTotal(n) : `${formatNumber(n)} ${a.unit}`;
    return {
        kind: 'medal', title: a.title, tierName: a.tier.name, color: a.tier.color, icon: a.icon,
        level: a.level, levels: MEDAL_TIERS.length, valueText: qty(a.value),
        nextText: a.next ? `Próxima: ${MEDAL_TIERS[a.level].name} a ${qty(a.next)}` : '¡Nivel máximo!',
        name: loadProfile().name, date: shareDateText(),
        shareText: `¡Gané la medalla de ${a.tier.name} en ${a.title}! (${qty(a.value)})`
    };
}

function recordValueText(r) {
    return r.kind === 'reps' ? `${r.valueText} reps` : r.valueText;
}

function trophyShareSpec(r) {
    return {
        kind: 'trophy', exercise: r.exercise, title: r.exercise, color: '#ffc83d',
        valueText: recordValueText(r), beforeText: r.kind === 'reps' && r.beforeText ? `${r.beforeText} reps` : r.beforeText,
        deltaText: r.deltaText, name: loadProfile().name, date: shareDateText(r.date),
        shareText: `¡Nuevo récord en ${r.exercise}: ${recordValueText(r)}!`
    };
}

function shareMedal(id) {
    const a = evaluateAchievements(computeUsageStats(repo.workouts.all(), loadAppSettings().weekStart)).find(x => x.id === id);
    if (a && a.tier) openShareSheet(medalShareSpec(a));
}

let profileTrophies = [];

function renderTrophies() {
    const box = document.getElementById('profileTrophies');
    if (!box) return;
    profileTrophies = recentRecords(repo.workouts.all(), 12);
    box.innerHTML = profileTrophies.length
        ? profileTrophies.map((r, i) => `<div class="trophy-row">
                <span class="trophy-cup" aria-hidden="true">🏆</span>
                <div class="trophy-text"><strong>${escapeHtml(r.exercise)}</strong>
                    <small>${escapeHtml(r.label)}: ${escapeHtml(recordValueText(r))}${r.deltaText ? ` (${escapeHtml(r.deltaText)})` : ''} · ${new Date(r.date + 'T00:00:00').toLocaleDateString('es-AR')}</small></div>
                <button type="button" class="small lib-secondary" data-share-trophy="${i}" aria-label="Compartir el récord de ${escapeHtml(r.exercise)}">📤</button>
            </div>`).join('')
        : emptyStateHtml('Cada récord personal (más peso, más reps, más distancia) se convierte en un trofeo para compartir.', ['train']);
}

// ---------- Eventos ----------

function bindProfile() {
    const screen = document.querySelector('[data-screen="perfil"]');
    if (!screen) return;
    const bindText = (id, field) => document.getElementById(id)?.addEventListener('change', e => { saveProfile({ [field]: e.target.value }); renderProfile(); });
    bindText('profileName', 'name');
    bindText('profileEmail', 'email');
    bindText('profilePhone', 'phone');
    bindText('profileBirth', 'birthDate');
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
        const trophy = e.target.closest('[data-share-trophy]');
        if (trophy && profileTrophies[+trophy.dataset.shareTrophy]) openShareSheet(trophyShareSpec(profileTrophies[+trophy.dataset.shareTrophy]));
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
