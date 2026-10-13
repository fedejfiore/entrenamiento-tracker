// Mensajes flotantes (reemplazan a los alert() informativos).
import { appErrors } from '../core/errors.js';
export function showToast(message, type = 'success', duration = 3200) {
    const container = document.getElementById('toastContainer');
    if (!container) { alert(message); return; }

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    container.appendChild(toast);

    setTimeout(() => {
        toast.classList.add('fadeout');
        setTimeout(() => toast.remove(), 300);
    }, duration);
    return toast;
}


/** Aviso con un botón de acción (ej. "Compartir"); el botón funciona una sola vez. */
export function showActionToast(message, type, duration, label, onClick) {
    const toast = showToast(message, type, duration);
    if (!toast || !toast.classList) return toast;
    toast.classList.add('has-action');
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'toast-action-btn';
    btn.textContent = label;
    btn.addEventListener('click', () => {
        if (btn.disabled) return;
        btn.disabled = true;
        onClick();
        toast.remove();
    }, { once: true });
    toast.appendChild(btn);
    return toast;
}

/**
 * Aviso con "Deshacer": la acción ya se hizo (sin pedir confirmación antes) y se puede
 * revertir unos segundos. Más rápido entre series que un diálogo de "¿Seguro?".
 */
export function showUndoToast(message, onUndo, duration = 6000) {
    return showActionToast(message, 'undo', duration, 'Deshacer', onUndo);
}

// Los errores no previstos se avisan con un toast (una vez cada tanto: ver ErrorReporter).
appErrors.setNotify(message => showToast(message, 'error', 5000));
