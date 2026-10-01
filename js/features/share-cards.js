// Imágenes para compartir (medallas y trofeos de récords) en alta calidad: formato historia
// (1080×1920, Instagram y estados de WhatsApp) o publicación (1080×1350), con vista previa.
// Se dibujan en un canvas con las tipografías de la app; no salen del celular hasta que la
// persona elige compartirlas.
// Script clásico (no módulo): comparte el ámbito global con el resto de la app.

const SHARE_FORMATS = {
    story: { w: 1080, h: 1920, label: 'Historia (9:16)' },
    post: { w: 1080, h: 1350, label: 'Publicación (4:5)' }
};
const SHARE_FONT_HEAD = '"Oswald", "Arial Narrow", sans-serif';
const SHARE_FONT_BODY = '"Inter", system-ui, sans-serif';

let shareSheetSpec = null;
let shareSheetFormat = 'story';

async function loadShareFonts() {
    try {
        await Promise.all(['700 80px Oswald', '500 80px Oswald', '400 40px Inter', '700 40px Inter'].map(f => document.fonts.load(f)));
    } catch (e) { /* sin las fuentes se usan las del sistema */ }
}

// ---------- Colores ----------

function shadeHex(hex, amount) {
    const n = parseInt(hex.replace('#', ''), 16);
    const f = c => Math.max(0, Math.min(255, Math.round(c + (amount > 0 ? (255 - c) * amount : c * amount))));
    return `rgb(${f(n >> 16)}, ${f((n >> 8) & 255)}, ${f(n & 255)})`;
}

function hexAlpha(hex, a) {
    const n = parseInt(hex.replace('#', ''), 16);
    return `rgba(${n >> 16}, ${(n >> 8) & 255}, ${n & 255}, ${a})`;
}

// Números "al azar" pero siempre iguales para la misma imagen (brillos de fondo).
function seededRandom(seed) {
    let s = seed % 2147483647 || 1;
    return () => (s = s * 16807 % 2147483647) / 2147483647;
}

// ---------- Piezas ----------

function drawShareBackground(g, W, H, color, seed) {
    const bg = g.createLinearGradient(0, 0, W * 0.3, H);
    bg.addColorStop(0, '#0b0d12');
    bg.addColorStop(0.55, '#151925');
    bg.addColorStop(1, '#0b0d12');
    g.fillStyle = bg;
    g.fillRect(0, 0, W, H);
    // Rayos de luz desde el centro de la pieza
    const cx = W / 2, cy = H * 0.4;
    g.save();
    g.translate(cx, cy);
    for (let i = 0; i < 18; i++) {
        g.rotate(Math.PI * 2 / 18);
        g.beginPath();
        g.moveTo(0, 0);
        g.lineTo(-40, -H);
        g.lineTo(40, -H);
        g.closePath();
        g.fillStyle = hexAlpha(color, i % 2 ? 0.035 : 0.06);
        g.fill();
    }
    g.restore();
    const glow = g.createRadialGradient(cx, cy, 0, cx, cy, W * 0.62);
    glow.addColorStop(0, hexAlpha(color, 0.42));
    glow.addColorStop(0.45, hexAlpha(color, 0.12));
    glow.addColorStop(1, 'rgba(0,0,0,0)');
    g.fillStyle = glow;
    g.fillRect(0, 0, W, H);
    // Destellos
    const rnd = seededRandom(seed);
    for (let i = 0; i < 46; i++) {
        const x = rnd() * W, y = rnd() * H * 0.85, r = 2 + rnd() * 7;
        g.fillStyle = `rgba(255,255,255,${0.12 + rnd() * 0.45})`;
        g.beginPath();
        g.moveTo(x, y - r * 2.4); g.quadraticCurveTo(x, y, x + r * 2.4, y);
        g.quadraticCurveTo(x, y, x, y + r * 2.4); g.quadraticCurveTo(x, y, x - r * 2.4, y);
        g.quadraticCurveTo(x, y, x, y - r * 2.4);
        g.fill();
    }
}

function drawMedalDisc(g, cx, cy, r, color, icon) {
    // Cinta: dos tiras cruzadas con franja central del color del nivel
    const ribbon = (dir) => {
        g.save();
        g.translate(cx, cy - r * 0.85);
        g.rotate(dir * 0.32);
        g.fillStyle = '#1f3a8a';
        g.fillRect(-r * 0.32, -r * 1.05, r * 0.64, r * 1.05);
        g.fillStyle = color;
        g.fillRect(-r * 0.09, -r * 1.05, r * 0.18, r * 1.05);
        g.restore();
    };
    ribbon(-1); ribbon(1);
    // Sombra
    g.save();
    g.shadowColor = 'rgba(0,0,0,0.6)';
    g.shadowBlur = 50;
    g.shadowOffsetY = 24;
    g.beginPath(); g.arc(cx, cy, r, 0, Math.PI * 2);
    g.fillStyle = shadeHex(color, -0.45);
    g.fill();
    g.restore();
    // Aro exterior con relieve
    const ring = g.createLinearGradient(cx - r, cy - r, cx + r, cy + r);
    ring.addColorStop(0, shadeHex(color, 0.55));
    ring.addColorStop(0.5, color);
    ring.addColorStop(1, shadeHex(color, -0.5));
    g.beginPath(); g.arc(cx, cy, r, 0, Math.PI * 2); g.fillStyle = ring; g.fill();
    // Dientes del borde
    g.save();
    g.translate(cx, cy);
    for (let i = 0; i < 64; i++) {
        g.rotate(Math.PI * 2 / 64);
        g.fillStyle = i % 2 ? hexAlphaFromRgb(shadeHex(color, 0.35), 0.5) : 'rgba(0,0,0,0.12)';
        g.fillRect(-3, -r, 6, r * 0.06);
    }
    g.restore();
    // Cara interior hundida
    const face = g.createRadialGradient(cx - r * 0.3, cy - r * 0.35, r * 0.05, cx, cy, r * 0.82);
    face.addColorStop(0, shadeHex(color, 0.7));
    face.addColorStop(0.35, shadeHex(color, 0.15));
    face.addColorStop(1, shadeHex(color, -0.35));
    g.beginPath(); g.arc(cx, cy, r * 0.8, 0, Math.PI * 2); g.fillStyle = face; g.fill();
    g.lineWidth = r * 0.03; g.strokeStyle = shadeHex(color, -0.4); g.stroke();
    // Brillo en arco
    g.save();
    g.beginPath(); g.arc(cx, cy, r * 0.92, Math.PI * 1.08, Math.PI * 1.62);
    g.lineWidth = r * 0.05; g.lineCap = 'round'; g.strokeStyle = 'rgba(255,255,255,0.75)'; g.stroke();
    g.restore();
    // Ícono
    g.font = `${Math.round(r * 0.9)}px "Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", sans-serif`;
    g.textAlign = 'center'; g.textBaseline = 'middle';
    g.shadowColor = 'rgba(0,0,0,0.35)'; g.shadowBlur = 12; g.shadowOffsetY = 6;
    g.fillText(icon, cx, cy + r * 0.04);
    g.shadowColor = 'transparent'; g.shadowBlur = 0; g.shadowOffsetY = 0;
}

function hexAlphaFromRgb(rgb, a) {
    return rgb.replace('rgb(', 'rgba(').replace(')', `, ${a})`);
}

function drawTrophyCup(g, cx, cy, s, color) {
    const gold = g.createLinearGradient(cx - s, 0, cx + s, 0);
    gold.addColorStop(0, shadeHex(color, -0.45));
    gold.addColorStop(0.3, shadeHex(color, 0.55));
    gold.addColorStop(0.55, color);
    gold.addColorStop(1, shadeHex(color, -0.5));
    g.save();
    g.shadowColor = 'rgba(0,0,0,0.55)'; g.shadowBlur = 50; g.shadowOffsetY = 24;
    // Asas
    g.lineWidth = s * 0.11; g.strokeStyle = gold;
    g.beginPath(); g.arc(cx - s * 0.78, cy - s * 0.45, s * 0.3, Math.PI * 0.5, Math.PI * 1.5); g.stroke();
    g.beginPath(); g.arc(cx + s * 0.78, cy - s * 0.45, s * 0.3, -Math.PI * 0.5, Math.PI * 0.5); g.stroke();
    // Copa
    g.fillStyle = gold;
    g.beginPath();
    g.moveTo(cx - s * 0.85, cy - s * 0.9);
    g.lineTo(cx + s * 0.85, cy - s * 0.9);
    g.bezierCurveTo(cx + s * 0.85, cy + s * 0.05, cx + s * 0.35, cy + s * 0.35, cx + s * 0.14, cy + s * 0.42);
    g.lineTo(cx + s * 0.14, cy + s * 0.7);
    g.lineTo(cx - s * 0.14, cy + s * 0.7);
    g.lineTo(cx - s * 0.14, cy + s * 0.42);
    g.bezierCurveTo(cx - s * 0.35, cy + s * 0.35, cx - s * 0.85, cy + s * 0.05, cx - s * 0.85, cy - s * 0.9);
    g.fill();
    // Base en dos escalones
    g.fillRect(cx - s * 0.45, cy + s * 0.68, s * 0.9, s * 0.14);
    g.fillStyle = '#2a2016';
    g.fillRect(cx - s * 0.62, cy + s * 0.82, s * 1.24, s * 0.3);
    g.restore();
    // Borde de la boca y brillo vertical
    g.fillStyle = shadeHex(color, 0.6);
    g.beginPath(); g.ellipse(cx, cy - s * 0.9, s * 0.85, s * 0.09, 0, 0, Math.PI * 2); g.fill();
    g.fillStyle = 'rgba(255,255,255,0.35)';
    g.beginPath(); g.ellipse(cx - s * 0.42, cy - s * 0.35, s * 0.08, s * 0.38, 0.18, 0, Math.PI * 2); g.fill();
    // Placa dorada en la base
    g.fillStyle = shadeHex(color, 0.2);
    g.fillRect(cx - s * 0.36, cy + s * 0.88, s * 0.72, s * 0.18);
    g.fillStyle = '#2a2016';
    g.font = `700 ${Math.round(s * 0.11)}px ${SHARE_FONT_HEAD}`;
    g.textAlign = 'center'; g.textBaseline = 'middle';
    g.fillText(tr('RÉCORD'), cx, cy + s * 0.975);
}

function drawStars(g, cx, y, filled, total, size, color) {
    const gap = size * 1.25;
    const x0 = cx - (total - 1) * gap / 2;
    for (let i = 0; i < total; i++) {
        const x = x0 + i * gap;
        g.beginPath();
        for (let k = 0; k < 10; k++) {
            const r = k % 2 ? size * 0.42 : size;
            const a = -Math.PI / 2 + k * Math.PI / 5;
            g[k ? 'lineTo' : 'moveTo'](x + Math.cos(a) * r * 0.5, y + Math.sin(a) * r * 0.5);
        }
        g.closePath();
        g.fillStyle = i < filled ? color : 'rgba(255,255,255,0.14)';
        g.fill();
    }
}

/** Texto centrado que se achica hasta entrar en el ancho; devuelve el alto usado. */
function fitText(g, text, x, y, maxWidth, size, weight, family, color, minSize = 28) {
    let s = size;
    g.font = `${weight} ${s}px ${family}`;
    while (g.measureText(text).width > maxWidth && s > minSize) { s -= 2; g.font = `${weight} ${s}px ${family}`; }
    g.fillStyle = color;
    g.textAlign = 'center';
    g.textBaseline = 'alphabetic';
    g.fillText(text, x, y);
    return s;
}

/** Hasta dos líneas (la primera en y): corta por palabras; si sobra, achica. Devuelve el alto extra de la 2.ª línea. */
function fitTwoLines(g, text, x, y, maxWidth, size, weight, family, color) {
    g.font = `${weight} ${size}px ${family}`;
    if (g.measureText(text).width <= maxWidth) { fitText(g, text, x, y, maxWidth, size, weight, family, color); return 0; }
    const words = text.split(' ');
    let best = 1, bestDiff = Infinity;
    for (let i = 1; i < words.length; i++) {
        const d = Math.abs(g.measureText(words.slice(0, i).join(' ')).width - g.measureText(words.slice(i).join(' ')).width);
        if (d < bestDiff) { bestDiff = d; best = i; }
    }
    const s = Math.min(fitText(g, words.slice(0, best).join(' '), x, y, maxWidth, size, weight, family, 'rgba(0,0,0,0)'),
        fitText(g, words.slice(best).join(' '), x, y, maxWidth, size, weight, family, 'rgba(0,0,0,0)'));
    fitText(g, words.slice(0, best).join(' '), x, y, maxWidth, s, weight, family, color, s);
    fitText(g, words.slice(best).join(' '), x, y + s * 1.05, maxWidth, s, weight, family, color, s);
    return s * 1.05;
}

function drawShareFooter(g, W, H, name, date) {
    const y = H - 110;
    g.strokeStyle = 'rgba(255,255,255,0.12)'; g.lineWidth = 2;
    g.beginPath(); g.moveTo(W * 0.2, y - 70); g.lineTo(W * 0.8, y - 70); g.stroke();
    const who = [name, date].filter(Boolean).join(' · ');
    if (who) fitText(g, who, W / 2, y - 18, W * 0.8, 38, 400, SHARE_FONT_BODY, '#c3c6cc');
    g.font = `500 44px ${SHARE_FONT_HEAD}`;
    g.fillStyle = '#ffffff';
    g.textAlign = 'center';
    g.fillText(APP_BRAND.name.toUpperCase(), W / 2, y + 46);
    g.font = `400 26px ${SHARE_FONT_BODY}`;
    g.fillStyle = '#8e929b';
    g.fillText(`${APP_BRAND.by} · ${tr(APP_BRAND.meaning)}`, W / 2, y + 86);
}

// ---------- Tarjetas ----------

/**
 * spec: { kind: 'medal', title, tierName, color, icon, level, levels, valueText, nextText, name, date }
 *     | { kind: 'trophy', exercise, valueText, beforeText, deltaText, color, name, date }
 */
function drawShareCard(spec, formatId = 'story') {
    const { w: W, h: H } = SHARE_FORMATS[formatId] || SHARE_FORMATS.story;
    const c = document.createElement('canvas');
    c.width = W; c.height = H;
    const g = c.getContext('2d');
    const story = H > 1500;
    const color = spec.color || '#ffc83d';
    const seed = [...(spec.title || spec.exercise || 'x')].reduce((a, ch) => a + ch.charCodeAt(0), 7) * 31;
    drawShareBackground(g, W, H, color, seed);
    const heroY = story ? H * 0.36 : H * 0.355;
    const r = story ? 260 : 200;

    if (spec.kind === 'medal') {
        fitText(g, tr('MEDALLA'), W / 2, story ? 200 : 120, W * 0.8, 40, 500, SHARE_FONT_HEAD, hexAlpha(color, 0.9));
        drawMedalDisc(g, W / 2, heroY + (story ? 40 : 30), r, color, spec.icon);
        let y = heroY + r + (story ? 200 : 150);
        fitText(g, tr(spec.title).toUpperCase(), W / 2, y, W * 0.86, story ? 110 : 92, 700, SHARE_FONT_HEAD, '#ffffff');
        y += story ? 95 : 78;
        fitText(g, tr(spec.tierName).toUpperCase(), W / 2, y, W * 0.8, story ? 76 : 62, 700, SHARE_FONT_HEAD, color);
        y += story ? 70 : 56;
        drawStars(g, W / 2, y, spec.level, spec.levels, story ? 46 : 38, color);
        y += story ? 120 : 90;
        fitText(g, tr(spec.valueText), W / 2, y, W * 0.86, story ? 84 : 66, 700, SHARE_FONT_BODY, '#ffffff');
        if (spec.nextText && story) fitText(g, tr(spec.nextText), W / 2, y + 70, W * 0.86, 36, 400, SHARE_FONT_BODY, '#9aa0aa');
    } else {
        fitText(g, tr('RÉCORD PERSONAL'), W / 2, story ? 200 : 120, W * 0.8, 40, 500, SHARE_FONT_HEAD, hexAlpha(color, 0.9));
        drawTrophyCup(g, W / 2, heroY, r * 0.95, color);
        let y = heroY + r + (story ? 200 : 150);
        y += fitTwoLines(g, spec.exercise.toUpperCase(), W / 2, y, W * 0.86, story ? 92 : 74, 700, SHARE_FONT_HEAD, '#ffffff');
        y += story ? 165 : 125;
        fitText(g, spec.valueText, W / 2, y, W * 0.86, story ? 150 : 116, 700, SHARE_FONT_HEAD, color);
        y += story ? 85 : 66;
        const sub = [spec.beforeText && tr(`antes ${spec.beforeText}`), spec.deltaText].filter(Boolean).join(' · ');
        if (sub) fitText(g, sub, W / 2, y, W * 0.86, story ? 46 : 38, 400, SHARE_FONT_BODY, '#c3c6cc');
    }
    drawShareFooter(g, W, H, spec.name, spec.date);
    return c;
}

// ---------- Ventana para elegir el formato y compartir ----------

async function openShareSheet(spec) {
    shareSheetSpec = spec;
    await loadShareFonts();
    renderShareSheet();
    document.getElementById('shareSheet')?.classList.add('open');
}

function renderShareSheet() {
    const modal = document.getElementById('shareSheet');
    if (!modal || !shareSheetSpec) return;
    const canvas = drawShareCard(shareSheetSpec, shareSheetFormat);
    const img = document.getElementById('shareSheetPreview');
    img.src = canvas.toDataURL('image/jpeg', 0.85);
    img.dataset.format = shareSheetFormat;
    modal.querySelectorAll('[data-share-format]').forEach(b => b.classList.toggle('active', b.dataset.shareFormat === shareSheetFormat));
}

function closeShareSheet() {
    document.getElementById('shareSheet')?.classList.remove('open');
}

async function shareSheetSend(download) {
    if (!shareSheetSpec) return;
    const canvas = drawShareCard(shareSheetSpec, shareSheetFormat);
    const blob = await new Promise(r => canvas.toBlob(r, 'image/png'));
    const slug = normalizeForCompare(shareSheetSpec.title || shareSheetSpec.exercise || 'logro').replace(/[^a-z0-9]+/g, '-');
    const file = new File([blob], `esoagon-${shareSheetSpec.kind}-${slug}-${shareSheetFormat}.png`, { type: 'image/png' });
    if (!download) {
        try {
            if (navigator.canShare && navigator.canShare({ files: [file] })) {
                await navigator.share({ files: [file], text: tr(shareSheetSpec.shareText || '') });
                return;
            }
        } catch (e) {
            if (e && e.name === 'AbortError') return;
        }
    }
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url; link.download = file.name; link.click();
    setTimeout(() => URL.revokeObjectURL(url), 2000);
    showToast('🖼️ Imagen guardada: compartila en tus redes', 'success', 3000);
}

function bindShareSheet() {
    const modal = document.getElementById('shareSheet');
    if (!modal) return;
    modal.addEventListener('click', e => {
        if (e.target === modal || e.target.closest('[data-share="close"]')) { closeShareSheet(); return; }
        const f = e.target.closest('[data-share-format]');
        if (f) { shareSheetFormat = f.dataset.shareFormat; renderShareSheet(); return; }
        if (e.target.closest('[data-share="send"]')) shareSheetSend(false);
        if (e.target.closest('[data-share="download"]')) shareSheetSend(true);
    });
}
