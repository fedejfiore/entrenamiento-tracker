// Enviar un error o una sugerencia: formulario con tipo (de más grave a menos), sección de
// la app, descripción y contacto. Sin servidor todavía: arma un mail con todo cargado hacia
// APP_BRAND.feedbackEmail, o se copia el texto. Suma datos técnicos (versión, navegador,
// pantalla, último error) para poder reproducir el problema; nunca datos de entrenamiento.
// Script clásico (no módulo): comparte el ámbito global con el resto de la app.

const FEEDBACK_TYPES = [
    { id: 'idea', icon: '💡', label: 'Sugerencia', hint: 'Una idea o algo que mejorarías' },
    { id: 'critical', icon: '🔴', label: 'Error grave', hint: 'No puedo usar la app o perdí datos' },
    { id: 'major', icon: '🟠', label: 'Error importante', hint: 'Algo no funciona como debería' },
    { id: 'minor', icon: '🟡', label: 'Error menor', hint: 'Se ve mal, molesta o confunde' },
    { id: 'question', icon: '❓', label: 'Consulta u otro', hint: 'Una duda o cualquier otra cosa' }
];

const FEEDBACK_AREAS = [
    'Entrenar (rutina, series, timer, contador)', 'Inicio y plan semanal', 'Historial', 'Progreso y mapa de músculos',
    'Biblioteca y rutinas', 'Perfil y medallas', 'Ajustes, voz y sonidos', 'Backup y datos', 'Instalación o actualización', 'Otro'
];

// Último error de la app (solo en memoria, se manda únicamente si la persona envía el reporte).
let lastAppError = null;
window.addEventListener('error', e => { lastAppError = `${e.message} (${(e.filename || '').split('/').pop()}:${e.lineno || '?'})`; });
window.addEventListener('unhandledrejection', e => { lastAppError = String(e.reason?.message || e.reason || 'Promesa rechazada'); });

function isValidFeedbackContact(text) {
    const s = String(text || '').trim();
    if (/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(s)) return true;
    const digits = s.replace(/[\s()+.-]/g, '');
    return /^\d{8,15}$/.test(digits);
}

/** Valida el formulario: devuelve { ok, errors: { campo: mensaje } }. */
function validateFeedback({ type, description, name, contact }) {
    const errors = {};
    if (!FEEDBACK_TYPES.some(t => t.id === type)) errors.type = 'Elegí si es un error o una sugerencia';
    if (String(description || '').trim().length < 10) errors.description = 'Contanos un poco más (al menos 10 letras)';
    if (String(name || '').trim().split(/\s+/).filter(w => w.length >= 2).length < 2) errors.name = 'Poné tu nombre y apellido';
    if (!isValidFeedbackContact(contact)) errors.contact = 'Poné un mail o un WhatsApp con código de área';
    return { ok: Object.keys(errors).length === 0, errors };
}

async function appVersionLabel() {
    try {
        const names = await caches.keys();
        const v = names.map(n => (n.match(/-(v\d+)$/) || [])[1]).filter(Boolean).sort((a, b) => parseInt(b.slice(1)) - parseInt(a.slice(1)))[0];
        return v || 'sin caché';
    } catch (e) {
        return 'desconocida';
    }
}

async function feedbackTechnicalInfo() {
    const standalone = window.matchMedia?.('(display-mode: standalone)').matches;
    const lines = [
        `Versión: ${await appVersionLabel()}`,
        `Pantalla de la app: ${document.querySelector('.screen-active')?.dataset.screen || '?'}`,
        `Instalada como app: ${standalone ? 'sí' : 'no'}`,
        `Pantalla: ${window.screen?.width}×${window.screen?.height} · ventana ${window.innerWidth}×${window.innerHeight}`,
        `Tema: ${db.get('theme') || 'auto'} · Idioma: ${navigator.language}`,
        `Navegador: ${navigator.userAgent}`
    ];
    if (lastAppError) lines.push(`Último error: ${lastAppError}`);
    return lines.join('\n');
}

function readFeedbackForm() {
    const modal = document.getElementById('feedbackModal');
    return {
        type: modal.querySelector('input[name="feedbackType"]:checked')?.value || '',
        area: document.getElementById('feedbackArea').value,
        description: document.getElementById('feedbackText').value,
        name: document.getElementById('feedbackName').value,
        contact: document.getElementById('feedbackContact').value,
        includeTech: document.getElementById('feedbackTech').checked
    };
}

async function composeFeedback(form) {
    const t = FEEDBACK_TYPES.find(x => x.id === form.type);
    const subject = `[${APP_BRAND.name}] ${t.icon} ${t.label} · ${form.area}`;
    let body = `${t.icon} ${t.label}\nSección: ${form.area}\n\n${form.description.trim()}\n\n— ${form.name.trim()} · ${form.contact.trim()}`;
    if (form.includeTech) body += `\n\n---- Datos técnicos ----\n${await feedbackTechnicalInfo()}`;
    return { subject, body };
}

// Aparte, para poder reemplazarla en las pruebas.
function openMailto(url) {
    window.location.href = url;
}

function showFeedbackErrors(errors) {
    document.querySelectorAll('#feedbackModal [data-error-for]').forEach(el => {
        const msg = errors[el.dataset.errorFor] || '';
        el.textContent = msg;
        el.hidden = !msg;
    });
    const first = Object.keys(errors)[0];
    if (first) {
        const target = { type: 'input[name="feedbackType"]', description: '#feedbackText', name: '#feedbackName', contact: '#feedbackContact' }[first];
        document.querySelector(`#feedbackModal ${target}`)?.focus();
    }
}

async function submitFeedback(via) {
    const form = readFeedbackForm();
    const { ok, errors } = validateFeedback(form);
    showFeedbackErrors(errors);
    if (!ok) return;
    try { db.set('feedbackContact', { name: form.name.trim(), contact: form.contact.trim() }); } catch (e) {}
    const { subject, body } = await composeFeedback(form);
    if (via === 'copy') {
        try {
            await navigator.clipboard.writeText(`${subject}\n\n${body}`);
            showToast(`📋 Copiado. Pegalo en un mail a ${APP_BRAND.feedbackEmail}`, 'success', 4000);
        } catch (e) {
            prompt('Copiá este texto:', `${subject}\n\n${body}`);
        }
        return;
    }
    openMailto(`mailto:${APP_BRAND.feedbackEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`);
    showToast('📧 Se abrió tu app de mail: revisá y tocá Enviar. ¡Gracias!', 'success', 4000);
    closeFeedback();
}

function renderFeedbackTypes() {
    const box = document.getElementById('feedbackTypes');
    if (!box || box.childElementCount) return;
    box.innerHTML = FEEDBACK_TYPES.map(t => `
        <label class="feedback-type">
            <input type="radio" name="feedbackType" value="${t.id}">
            <span class="feedback-type-icon" aria-hidden="true">${t.icon}</span>
            <span><strong>${escapeHtml(t.label)}</strong><small>${escapeHtml(t.hint)}</small></span>
        </label>`).join('');
    document.getElementById('feedbackArea').innerHTML = FEEDBACK_AREAS.map(a => `<option>${escapeHtml(a)}</option>`).join('');
}

async function updateFeedbackTechPreview() {
    const pre = document.getElementById('feedbackTechPreview');
    if (pre && !pre.hidden) pre.textContent = await feedbackTechnicalInfo();
}

function openFeedback(type) {
    renderFeedbackTypes();
    const modal = document.getElementById('feedbackModal');
    if (type) { const r = modal.querySelector(`input[name="feedbackType"][value="${type}"]`); if (r) r.checked = true; }
    // La sección donde estaba la persona queda elegida de antemano.
    const screen = document.querySelector('.screen-active')?.dataset.screen;
    const areaByScreen = { entrenar: 0, inicio: 1, historial: 2, progreso: 3, biblioteca: 4, perfil: 5, ajustes: 6 };
    if (screen in areaByScreen) document.getElementById('feedbackArea').selectedIndex = areaByScreen[screen];
    const saved = db.get('feedbackContact') || {};
    const nameEl = document.getElementById('feedbackName');
    const contactEl = document.getElementById('feedbackContact');
    if (!nameEl.value && saved.name) nameEl.value = saved.name;
    if (!contactEl.value && saved.contact) contactEl.value = saved.contact;
    showFeedbackErrors({});
    document.getElementById('feedbackTo').textContent = APP_BRAND.feedbackEmail;
    modal.classList.add('open');
}

function closeFeedback() {
    document.getElementById('feedbackModal')?.classList.remove('open');
}

function bindFeedback() {
    const modal = document.getElementById('feedbackModal');
    if (!modal) return;
    modal.addEventListener('click', e => {
        if (e.target === modal || e.target.closest('[data-feedback="close"]')) { closeFeedback(); return; }
        if (e.target.closest('[data-feedback="send"]')) { submitFeedback('mail'); return; }
        if (e.target.closest('[data-feedback="copy"]')) { submitFeedback('copy'); return; }
        if (e.target.closest('[data-feedback="tech"]')) {
            const pre = document.getElementById('feedbackTechPreview');
            pre.hidden = !pre.hidden;
            updateFeedbackTechPreview();
        }
    });
    // Al corregir un campo, su aviso de error se va.
    modal.addEventListener('input', e => {
        const field = { feedbackText: 'description', feedbackName: 'name', feedbackContact: 'contact', feedbackType: 'type' }[e.target.id || e.target.name];
        const err = field && modal.querySelector(`[data-error-for="${field}"]`);
        if (err) { err.hidden = true; err.textContent = ''; }
    });
}
