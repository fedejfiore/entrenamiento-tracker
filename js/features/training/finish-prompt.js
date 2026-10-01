// Al tildar la última serie de la sesión (todas las de todos los ejercicios), la app
// pregunta si guardar: resumen, cómo te sentiste y "Guardar sesión" o "Seguir entrenando".
// Así no hace falta bajar hasta el final de Entrenar. Si quedó algún ejercicio sin hacer, no
// pregunta: se guarda como siempre desde "Finalizar Sesión".
// Script clásico (no módulo): comparte el ámbito global con el resto de la app.

function isSessionComplete() {
    const blocks = [...document.querySelectorAll('#exercisesContainer .exercise-row')];
    return blocks.length > 0 && blocks.every(isBlockComplete);
}

function finishPromptSummary() {
    const blocks = [...document.querySelectorAll('#exercisesContainer .exercise-row')];
    const sets = blocks.reduce((n, b) => n + b.querySelectorAll('.set-row.done').length, 0);
    const minutes = currentSessionStartTime ? Math.max(1, Math.round((Date.now() - currentSessionStartTime) / 60000)) : null;
    const parts = [`${blocks.length} ${blocks.length === 1 ? 'ejercicio' : 'ejercicios'}`, `${sets} ${sets === 1 ? 'serie' : 'series'}`];
    if (minutes) parts.push(`${minutes} min`);
    return parts.join(' · ');
}

function openFinishPrompt() {
    const modal = document.getElementById('finishPrompt');
    if (!modal) return;
    document.getElementById('finishPromptSummary').textContent = finishPromptSummary();
    modal.querySelectorAll('[data-mood]').forEach(b => b.classList.toggle('selected', +b.dataset.mood === selectedMood));
    modal.classList.add('open');
    speakCue(['tabataDone'], '¡Misión cumplida!');
    modal.querySelector('[data-finish="save"]')?.focus();
}

function closeFinishPrompt() {
    document.getElementById('finishPrompt')?.classList.remove('open');
}

function bindFinishPrompt() {
    const modal = document.getElementById('finishPrompt');
    if (!modal) return;
    modal.addEventListener('click', e => {
        const mood = e.target.closest('[data-mood]');
        if (mood) {
            // El ánimo es el mismo de "Finalizar Sesión": se marca en los dos lugares.
            selectedMood = +mood.dataset.mood;
            document.querySelectorAll('.emoji-btn[data-mood]').forEach(b => b.classList.toggle('selected', +b.dataset.mood === selectedMood));
            saveWorkoutDraft();
            return;
        }
        if (e.target === modal || e.target.closest('[data-finish="keep"]')) { closeFinishPrompt(); return; }
        if (e.target.closest('[data-finish="save"]')) { closeFinishPrompt(); saveWorkoutSession(); }
    });
}
