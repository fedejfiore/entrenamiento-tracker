// Botón fijo "Terminar" en Entrenar: aparece cuando ya hay algo cargado y abre una
// confirmación con el resumen, el ánimo y la nota. Nada se guarda de un toque sin querer:
// hay que confirmar con "Guardar sesión" (o seguir entrenando).
// Script clásico (no módulo): comparte el ámbito global con el resto de la app.

function sessionSummary() {
    let exercises = 0, sets = 0;
    document.querySelectorAll('#exercisesContainer .exercise-row').forEach(block => {
        const type = EXERCISE_TYPES[block.dataset.type] ? block.dataset.type : 'kg';
        const n = readBlockSets(block).filter(s => s.done || setHasMetric(s, type)).length;
        if (n) { exercises++; sets += n; }
    });
    const minutes = currentSessionStartTime ? Math.round(((currentSessionEndTime || Date.now()) - currentSessionStartTime) / 60000) : null;
    return { exercises, sets, minutes };
}

// Se muestra solo con una rutina elegida y al menos una serie cargada.
function updateFinishFab() {
    const fab = document.getElementById('finishFab');
    if (!fab) return;
    const onTraining = document.querySelector('[data-screen="entrenar"]')?.classList.contains('screen-active')
        && (typeof currentTrainMode !== 'function' || currentTrainMode() === 'rutina');
    const hasRoutine = !!document.getElementById('routine')?.value;
    const { sets } = hasRoutine ? sessionSummary() : { sets: 0 };
    fab.hidden = !(onTraining && hasRoutine && sets > 0);
}

function openFinishModal() {
    const { exercises, sets, minutes } = sessionSummary();
    if (!sets) { showToast('Marcá (✓) o cargá al menos una serie', 'error'); return; }
    const parts = [`${exercises} ${exercises === 1 ? 'ejercicio' : 'ejercicios'}`, `${sets} ${sets === 1 ? 'serie' : 'series'}`];
    if (minutes) parts.push(formatDurationHuman(minutes * 60));
    document.getElementById('finishSummary').textContent = parts.join(' · ');
    document.getElementById('finishNote').value = document.getElementById('sessionNotes')?.value || '';
    document.querySelectorAll('#finishMood [data-mood]').forEach(b => b.classList.toggle('selected', +b.dataset.mood === selectedMood));
    document.getElementById('finishModal').classList.add('open');
}

function closeFinishModal() {
    document.getElementById('finishModal')?.classList.remove('open');
}

function confirmFinishSession() {
    // El ánimo y la nota se copian a la sección "Finalizar Sesión" y se guarda con el
    // mismo flujo de siempre (validaciones, récords, borrador).
    const note = document.getElementById('finishNote').value;
    const notes = document.getElementById('sessionNotes');
    if (notes) notes.value = note;
    document.querySelectorAll('.emoji-btn[data-mood]').forEach(b => b.classList.toggle('selected', +b.dataset.mood === selectedMood));
    closeFinishModal();
    saveWorkoutSession();
    updateFinishFab();
}

function bindFinishSession() {
    const modal = document.getElementById('finishModal');
    if (!modal) return;
    document.getElementById('finishFab')?.addEventListener('click', openFinishModal);
    modal.addEventListener('click', e => {
        if (e.target === modal || e.target.closest('[data-finish-action="cancel"]')) { closeFinishModal(); return; }
        if (e.target.closest('[data-finish-action="save"]')) { confirmFinishSession(); return; }
        const mood = e.target.closest('[data-mood]');
        if (mood) {
            selectedMood = +mood.dataset.mood;
            modal.querySelectorAll('[data-mood]').forEach(b => b.classList.toggle('selected', b === mood));
        }
    });
    // Se actualiza al cargar series, cambiar de rutina o de pantalla.
    const container = document.getElementById('exercisesContainer');
    container?.addEventListener('click', () => setTimeout(updateFinishFab, 0));
    container?.addEventListener('input', updateFinishFab);
    document.getElementById('routine')?.addEventListener('change', () => setTimeout(updateFinishFab, 0));
    new MutationObserver(updateFinishFab).observe(document.querySelector('[data-screen="entrenar"]'), { attributes: true, attributeFilter: ['class'] });
    updateFinishFab();
}
