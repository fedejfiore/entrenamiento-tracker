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

    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `tracker_backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    window.URL.revokeObjectURL(url);

    const recordings = Object.keys(backup.recordings || {}).length;
    showToast(`✅ Backup descargado — ${backup.workouts.length} sesiones, ${backup.bodyMetrics.length} mediciones${recordings ? `, ${recordings} grabaciones` : ''}`);
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
            parsed = backupService.parse(String(e.target?.result || ''));
        } catch (err) {
            console.error('Backup inválido:', err);
            showToast(`❌ ${err.message}`, 'error', 6000);
            return;
        }

        const { sessions, measurements, recordings } = parsed.summary;
        const detail = `- ${sessions} sesiones\n- ${measurements} mediciones${recordings ? `\n- ${recordings} grabaciones` : ''}`;
        if (!confirm(`¿Restaurar este backup?\n\n${detail}\n\nReemplaza los datos de este celular por los del archivo.`)) return;

        let result;
        try {
            result = await backupService.restore(parsed);
        } catch (err) {
            console.error('No se pudo restaurar:', err);
            showToast(`❌ No se restauró nada: ${err.message}`, 'error', 7000);
            return;
        }

        const warning = result.recordingsError ? '\n\n⚠️ Los datos se restauraron, pero las grabaciones de voz no.' : '';
        alert(`✅ BACKUP RESTAURADO\n\n📊 Datos cargados:\n${detail}${warning}\n\n🔄 Recargando página...`);
        window.location.reload();
    };
    reader.readAsText(file);
}

// Borra TODOS los datos de este celular (también las grabaciones). Pide confirmar dos
// veces y ofrece antes descargar un backup, porque no se puede deshacer.
async function resetAllData() {
    if (!confirm('⚠️ ¿Borrar TODOS tus datos de este celular?\n\nSesiones, medidas, rutinas, ajustes y grabaciones. No se puede deshacer.')) return;
    if (confirm('¿Querés descargar un backup antes de borrar? (Aceptar = descargar primero)')) {
        await downloadData();
        if (!confirm('Backup descargado. ¿Borrar todo ahora?')) return;
    }
    try {
        db.transaction(tx => Object.keys(db.schema).forEach(key => tx.remove(key)));
        await recordingRepo.clear().catch(() => {});
    } catch (err) {
        showToast(`❌ No se pudo borrar. ${err.message}`, 'error', 6000);
        return;
    }
    window.location.reload();
}
