// Backup: descargar y restaurar todos los datos en un archivo JSON.
// Script clásico (no módulo): comparte el ámbito global con el resto de la app.

async function downloadData() {
    // Guardar TODO: entrenamientos, métricas, rutinas personalizadas
    const backup = {
        version: '2.0',
        timestamp: new Date().toISOString(),
        workouts: JSON.parse(localStorage.getItem('workouts') || '[]'),
        bodyMetrics: JSON.parse(localStorage.getItem('bodyMetrics') || '[]'),
        customRoutines: JSON.parse(localStorage.getItem('customRoutines') || '{}'),
        exerciseTypes: JSON.parse(localStorage.getItem('exerciseTypes') || '{}'),
        exerciseTimeUnits: JSON.parse(localStorage.getItem('exerciseTimeUnits') || '{}'),
        recordings: await exportRecordings()
    };

    const json = JSON.stringify(backup, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `tracker_backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    window.URL.revokeObjectURL(url);
    
    showToast(`✅ Backup descargado — ${backup.workouts.length} sesiones, ${backup.bodyMetrics.length} mediciones`);
}

function triggerFileInput() {
    console.log('🔍 triggerFileInput: abriendo selector de archivo...');
    const fileInput = document.getElementById('fileInput');
    if (!fileInput) {
        showToast('❌ Error: no se encontró el input file', 'error');
        return;
    }
    
    // Limpiar input anterior
    fileInput.value = '';
    
    // Agregar listener para el cambio
    fileInput.onchange = function(event) {
        console.log('📂 onchange dispuesto, procesando archivo...');
        processBackupFile(event);
    };
    
    // Click en el input
    fileInput.click();
}

function processBackupFile(event) {
    console.log('🔄 processBackupFile: iniciado');
    const file = event.target.files ? event.target.files[0] : null;
    
    if (!file) {
        console.error('❌ No se seleccionó archivo');
        showToast('❌ No se seleccionó archivo', 'error');
        return;
    }
    
    console.log('📂 Archivo:', file.name, 'Tamaño:', file.size);
    uploadData(file);
}

function uploadData(fileObj = null) { 
    console.log('📤 uploadData iniciado');
    
    let file = fileObj;
    if (!file) {
        const fileInput = document.getElementById('fileInput');
        if (!fileInput || !fileInput.files || fileInput.files.length === 0) {
            showToast('❌ No se seleccionó archivo', 'error');
            return;
        }
        file = fileInput.files[0];
    }
    
    console.log('📖 Leyendo archivo:', file.name);
    
    const reader = new FileReader();
    reader.onerror = function(e) {
        console.error('❌ Error en FileReader:', e);
        showToast('❌ Error al leer archivo: ' + e, 'error');
    };
    reader.onload = function(e) {
        try {
            console.log('✅ FileReader.onload disparado');
            
            if (!e.target || !e.target.result) {
                console.error('❌ No hay resultado de lectura');
                showToast('❌ Error: no se pudo leer el contenido del archivo', 'error');
                return;
            }
            
            const content = e.target.result;
            console.log('📄 Contenido leído:', content.substring(0, 100) + '...');
            
            // Validar JSON
            if (!content.trim().startsWith('{')) {
                console.error('❌ No comienza con {');
                showToast('❌ Formato no reconocido. Debe ser un archivo .json', 'error');
                return;
            }
            
            const backup = JSON.parse(content);
            console.log('✅ JSON parseado:', Object.keys(backup));
            
            // Validar estructura
            if (!backup.workouts || !Array.isArray(backup.workouts)) {
                console.error('❌ Falta workouts:', backup);
                showToast('❌ Archivo no válido: falta "workouts"', 'error');
                return;
            }
            
            console.log(`✅ Estructura válida: ${backup.workouts.length} workouts`);
            
            // Guardar en localStorage
            console.log('💾 Guardando en localStorage...');
            localStorage.setItem('workouts', JSON.stringify(backup.workouts));
            localStorage.setItem('bodyMetrics', JSON.stringify(backup.bodyMetrics || []));
            localStorage.setItem('customRoutines', JSON.stringify(backup.customRoutines || {}));
            if (backup.exerciseTypes) localStorage.setItem('exerciseTypes', JSON.stringify(backup.exerciseTypes));
            if (backup.exerciseTimeUnits) localStorage.setItem('exerciseTimeUnits', JSON.stringify(backup.exerciseTimeUnits));
            localStorage.setItem('workoutSessions', JSON.stringify(backup.workoutSessions || []));
            localStorage.setItem('version', backup.version || '2.0');
            
            console.log('✅ Datos guardados en localStorage');
            
            const total = backup.workouts.length + (backup.bodyMetrics?.length || 0);
            const mensaje = `✅ BACKUP RESTAURADO\n\n📊 Datos cargados:\n- ${backup.workouts.length} sesiones\n- ${backup.bodyMetrics?.length || 0} mediciones\n\nTotal: ${total} registros\n\n🔄 Recargando página...`;
            
            console.log('🎉 Éxito:', mensaje);
            // Grabaciones de voz: se escriben antes de recargar para no perderlas.
            const recordingsRestored = importRecordings(backup.recordings)
                .catch(err => console.error('No se pudieron restaurar las grabaciones:', err));

            alert(mensaje);
            
            // Limpiar input
            const fileInput = document.getElementById('fileInput');
            if (fileInput) fileInput.value = '';
            
            // Recargar
            recordingsRestored.finally(() => setTimeout(() => window.location.href = window.location.href, 300));
            
        } catch (err) {
            console.error('❌ Error al procesar backup:', err);
            showToast('❌ Error al cargar archivo: ' + err.message, 'error');
        }
    };
    reader.readAsText(file);
}

