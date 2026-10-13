// Enviar un error o una sugerencia: tipos (de más grave a menos), secciones de la app,
// validación del formulario y armado del mensaje. Sin pantalla ni almacenamiento: la pantalla
// está en js/features/feedback.js.
export const FEEDBACK_TYPES = [
    { id: 'idea', icon: '💡', label: 'Sugerencia', hint: 'Una idea o algo que mejorarías' },
    { id: 'critical', icon: '🔴', label: 'Error grave', hint: 'No puedo usar la app o perdí datos' },
    { id: 'major', icon: '🟠', label: 'Error importante', hint: 'Algo no funciona como debería' },
    { id: 'minor', icon: '🟡', label: 'Error menor', hint: 'Se ve mal, molesta o confunde' },
    { id: 'question', icon: '❓', label: 'Consulta u otro', hint: 'Una duda o cualquier otra cosa' }
];

export const FEEDBACK_AREAS = [
    'Entrenar (rutina, series, timer, contador)', 'Inicio y plan semanal', 'Historial', 'Progreso y mapa de músculos',
    'Biblioteca y rutinas', 'Perfil y medallas', 'Ajustes, voz y sonidos', 'Backup y datos', 'Instalación o actualización', 'Otro'
];

export function isValidFeedbackContact(text) {
    const s = String(text || '').trim();
    if (/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(s)) return true;
    const digits = s.replace(/[\s()+.-]/g, '');
    return /^\d{8,15}$/.test(digits);
}

/** Valida el formulario: devuelve { ok, errors: { campo: mensaje } }. */
export function validateFeedback({ type, description, name, contact }) {
    const errors = {};
    if (!FEEDBACK_TYPES.some(t => t.id === type)) errors.type = 'Elegí si es un error o una sugerencia';
    if (String(description || '').trim().length < 10) errors.description = 'Contanos un poco más (al menos 10 letras)';
    if (String(name || '').trim().split(/\s+/).filter(w => w.length >= 2).length < 2) errors.name = 'Poné tu nombre y apellido';
    if (!isValidFeedbackContact(contact)) errors.contact = 'Poné un mail o un WhatsApp con código de área';
    return { ok: Object.keys(errors).length === 0, errors };
}

/**
 * Asunto y cuerpo del mensaje. techInfo: texto con los datos técnicos (o vacío si la persona
 * no quiere mandarlos).
 */
export function feedbackMessage(form, brandName, techInfo = '') {
    const t = FEEDBACK_TYPES.find(x => x.id === form.type);
    const subject = `[${brandName}] ${t.icon} ${t.label} · ${form.area}`;
    let body = `${t.icon} ${t.label}\nSección: ${form.area}\n\n${form.description.trim()}\n\n— ${form.name.trim()} · ${form.contact.trim()}`;
    if (techInfo) body += `\n\n---- Datos técnicos ----\n${techInfo}`;
    return { subject, body };
}
