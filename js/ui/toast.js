// Mensajes flotantes (reemplazan a los alert() informativos).
// Script clásico (no módulo): comparte el ámbito global con el resto de la app.

function showToast(message, type = 'success', duration = 3200) {
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


/**
 * Aviso con "Deshacer": la acción ya se hizo (sin pedir confirmación antes) y se puede
 * revertir unos segundos. Más rápido entre series que un diálogo de "¿Seguro?".
 */
function showUndoToast(message, onUndo, duration = 6000) {
    const toast = showToast(message, 'undo', duration);
    if (!toast || !toast.classList) return toast;
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'toast-undo-btn';
    btn.textContent = 'Deshacer';
    btn.addEventListener('click', () => {
        if (btn.disabled) return;
        btn.disabled = true;
        onUndo();
        toast.remove();
    }, { once: true });
    toast.appendChild(btn);
    return toast;
}
