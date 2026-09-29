// Backup: descargar y restaurar todos los datos en un archivo JSON.
// Qué entra en el archivo y cómo se valida/restaura: js/data/backup-service.js.

async function downloadData() {
    let backup;
    try {
        backup = await backupService.build();
    } catch (err) {
        showToast(`❌ No se pudo armar el backup. ${err.message}`, 'error', 6000);
        return;
    }

    let text = JSON.stringify(backup, null, 2);
    const encrypt = document.getElementById('backupEncrypt')?.checked;
    if (encrypt) {
        const password = await askPassword({ title: 'Proteger el backup', text: 'Elegí una contraseña. La vas a necesitar para cargar este backup; si te la olvidás, no se puede abrir.', confirm: true });
        if (!password) return;
        try {
            text = await encryptBackupText(text, password);
        } catch (err) {
            showToast(`❌ ${err.message}`, 'error', 5000);
            return;
        }
    }
    const blob = new Blob([text], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `esoagon_backup_${new Date().toISOString().split('T')[0]}${encrypt ? '_protegido' : ''}.json`;
    a.click();
    window.URL.revokeObjectURL(url);

    const recordings = Object.keys(backup.recordings || {}).length;
    const photos = Object.keys(backup.photos || {}).length;
    showToast(`✅ Backup ${encrypt ? 'protegido ' : ''}descargado — ${backup.workouts.length} sesiones, ${backup.bodyMetrics.length} mediciones${recordings ? `, ${recordings} grabaciones` : ''}${photos ? `, ${photos} fotos` : ''}`);
}

// Abre el selector de archivos; al elegir uno, el listener de js/app.js llama a uploadData.
function triggerFileInput() {
    const fileInput = document.getElementById('fileInput');
    if (!fileInput) {
        showToast('❌ Error: no se encontró el selector de archivo', 'error');
        return;
    }
    fileInput.value = ''; // permite volver a elegir el mismo archivo
    fileInput.click();
}

// Lee, valida y (si el usuario confirma) restaura. Si el archivo tiene algún problema no
// se escribe nada; si está bien, todos los datos se reemplazan juntos en una transacción.
function uploadData(file) {
    if (!file) {
        showToast('❌ No se seleccionó archivo', 'error');
        return;
    }

    const reader = new FileReader();
    reader.onerror = () => showToast('❌ No se pudo leer el archivo', 'error');
    reader.onload = async e => {
        let parsed;
        try {
            let text = String(e.target?.result || '');
            // Backup protegido: se pide la contraseña y se descifra antes de validar.
            let outer = null;
            try { outer = JSON.parse(text); } catch (err) { /* lo informa parse() */ }
            if (isEncryptedBackup(outer)) {
                const password = await askPassword({ title: 'Backup protegido', text: 'Este backup tiene contraseña. Escribila para abrirlo.' });
                if (!password) return;
                text = await decryptBackupText(outer, password);
            }
            parsed = backupService.parse(text);
        } catch (err) {
            console.error('Backup inválido:', err);
            showToast(`❌ ${err.message}`, 'error', 6000);
            return;
        }

        const { sessions, measurements, recordings, photos } = parsed.summary;
        const detail = `- ${sessions} sesiones\n- ${measurements} mediciones${recordings ? `\n- ${recordings} grabaciones` : ''}${photos ? `\n- ${photos} fotos` : ''}`;
        if (!confirm(`¿Restaurar este backup?\n\n${detail}\n\nReemplaza los datos de este celular por los del archivo.`)) return;

        let result;
        try {
            result = await backupService.restore(parsed);
        } catch (err) {
            console.error('No se pudo restaurar:', err);
            showToast(`❌ No se restauró nada: ${err.message}`, 'error', 7000);
            return;
        }

        const warning = (result.recordingsError ? '\n\n⚠️ Los datos se restauraron, pero las grabaciones de voz no.' : '') + (result.photosError ? '\n\n⚠️ Las fotos no se pudieron restaurar.' : '');
        alert(`✅ BACKUP RESTAURADO\n\n📊 Datos cargados:\n${detail}${warning}\n\n🔄 Recargando página...`);
        window.location.reload();
    };
    reader.readAsText(file);
}

// Borra TODOS los datos de este celular (también las grabaciones). Pide confirmar dos
// veces y ofrece antes descargar un backup, porque no se puede deshacer.
async function resetAllData() {
    if (!confirm('⚠️ ¿Borrar TODOS tus datos de este celular?\n\nSesiones, medidas, rutinas, ajustes, grabaciones y fotos. No se puede deshacer.')) return;
    if (confirm('¿Querés descargar un backup antes de borrar? (Aceptar = descargar primero)')) {
        await downloadData();
        if (!confirm('Backup descargado. ¿Borrar todo ahora?')) return;
    }
    try {
        db.transaction(tx => Object.keys(db.schema).forEach(key => tx.remove(key)));
        await recordingRepo.clear().catch(() => {});
        await photoRepo.clear().catch(() => {});
    } catch (err) {
        showToast(`❌ No se pudo borrar. ${err.message}`, 'error', 6000);
        return;
    }
    window.location.reload();
}

// Pide una contraseña en un modal (campo oculto, no en un prompt que la muestra en pantalla).
// Resuelve con la contraseña, o null si se cancela.
function askPassword({ title, text, confirm: needConfirm = false }) {
    return new Promise(resolve => {
        const modal = document.getElementById('passwordModal');
        const input = document.getElementById('passwordInput');
        const again = document.getElementById('passwordConfirm');
        document.getElementById('passwordTitle').textContent = title;
        document.getElementById('passwordText').textContent = text;
        input.value = ''; again.value = '';
        again.hidden = !needConfirm;
        input.autocomplete = needConfirm ? 'new-password' : 'current-password';
        modal.classList.add('open');
        setTimeout(() => input.focus(), 50);
        const done = value => {
            modal.classList.remove('open');
            modal.removeEventListener('click', onClick);
            input.value = ''; again.value = '';
            resolve(value);
        };
        const onClick = e => {
            if (e.target === modal || e.target.closest('[data-password-action="cancel"]')) { done(null); return; }
            if (!e.target.closest('[data-password-action="ok"]')) return;
            if (input.value.length < 8) { showToast('Mínimo 8 caracteres', 'error'); return; }
            if (needConfirm && input.value !== again.value) { showToast('Las contraseñas no coinciden', 'error'); return; }
            done(input.value);
        };
        modal.addEventListener('click', onClick);
    });
}
