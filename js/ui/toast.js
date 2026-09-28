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
}

