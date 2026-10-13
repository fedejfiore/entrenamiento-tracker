// Enviar un error o una sugerencia: formulario con tipo (de más grave a menos), sección de
// la app, descripción y contacto. Sin servidor todavía: arma un mail con todo cargado hacia
// APP_BRAND.feedbackEmail, o se copia el texto. Suma datos técnicos (versión, navegador,
// pantalla, último error) para poder reproducir el problema; nunca datos de entrenamiento.
import { appErrors } from '../core/errors.js';
import { escapeHtml } from '../core/utils.js';
import { APP_BRAND } from '../core/brand.js';
import { FEEDBACK_AREAS, FEEDBACK_TYPES, feedbackMessage, validateFeedback } from '../domain/feedback.js';
import { db } from '../data/repositories.js';
import { showToast } from '../ui/toast.js';

export async function appVersionLabel() {
    try {
        const names = await caches.keys();
        const v = names.map(n => (n.match(/-(v\d+)$/) || [])[1]).filter(Boolean).sort((a, b) => parseInt(b.slice(1)) - parseInt(a.slice(1)))[0];
        return v || 'sin caché';
    } catch (e) {
        return 'desconocida';
    }
}

export async function feedbackTechnicalInfo() {
    const standalone = window.matchMedia?.('(display-mode: standalone)').matches;
    const lines = [
        `Versión: ${await appVersionLabel()}`,
        `Pantalla de la app: ${document.querySelector('.screen-active')?.dataset.screen || '?'}`,
        `Instalada como app: ${standalone ? 'sí' : 'no'}`,
        `Pantalla: ${window.screen?.width}×${window.screen?.height} · ventana ${window.innerWidth}×${window.innerHeight}`,
        `Tema: ${db.get('theme') || 'auto'} · Idioma: ${navigator.language}`,
        `Navegador: ${navigator.userAgent}`
    ];
    const lastError = appErrors.lastMessage();
    if (lastError) lines.push(`Último error: ${lastError}`);
    return lines.join('\n');
}

export function readFeedbackForm() {
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

export async function composeFeedback(form) {
    return feedbackMessage(form, APP_BRAND.name, form.includeTech ? await feedbackTechnicalInfo() : '');
}

// Aparte, para poder reemplazarla en las pruebas.
export function openMailto(url) {
    window.location.href = url;
}

export function showFeedbackErrors(errors) {
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

export async function submitFeedback(via) {
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

export function renderFeedbackTypes() {
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

export async function updateFeedbackTechPreview() {
    const pre = document.getElementById('feedbackTechPreview');
    if (pre && !pre.hidden) pre.textContent = await feedbackTechnicalInfo();
}

export function openFeedback(type) {
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

export function closeFeedback() {
    document.getElementById('feedbackModal')?.classList.remove('open');
}

export function bindFeedback() {
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
