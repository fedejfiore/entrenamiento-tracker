// Pantalla de resumen al guardar una sesión: series, volumen y duración, los récords del día
// (cada uno se puede compartir como trofeo), lo que conviene tener en cuenta y cómo quedó la
// semana del plan (la flor). Reemplaza el aviso largo de "Sesión guardada".
// El lugar del anuncio (plan gratis) queda reservado y oculto: se activa recién en la app
// nativa con AdMob, nunca en la web (ver docs/PUBLICIDAD.md).
// Script clásico (no módulo): comparte el ámbito global con el resto de la app.

let summaryRecords = [];

function openSessionSummary({ routine, date, exercises, duration, volume, prs, progressNotes }) {
    const modal = document.getElementById('sessionSummary');
    if (!modal) return;
    const sets = exercises.reduce((n, e) => n + (e.sets || []).filter(s => !s.warmup).length, 0);
    const sub = [routineLabelOf(routine), duration ? formatDurationHuman(duration * 60) : null].filter(Boolean).join(' · ');
    document.getElementById('summarySubtitle').textContent = sub;
    document.getElementById('summaryStats').innerHTML = [
        [sets, sets === 1 ? 'serie' : 'series'],
        [exercises.length, exercises.length === 1 ? 'ejercicio' : 'ejercicios'],
        volume > 0 ? [formatWeightTotal(volume), 'volumen'] : (duration ? [formatDurationHuman(duration * 60), 'duración'] : null)
    ].filter(Boolean).map(([v, l]) => `<div class="summary-stat"><b>${escapeHtml(String(v))}</b><span>${escapeHtml(l)}</span></div>`).join('');

    summaryRecords = recentRecords([{ date, prs }], 20);
    const recBox = document.getElementById('summaryRecords');
    recBox.hidden = summaryRecords.length === 0;
    recBox.innerHTML = summaryRecords.length
        ? `<h4>🏆 Récords de hoy</h4>` + summaryRecords.map((r, i) => `<div class="summary-record">
                <span><strong>${escapeHtml(r.exercise)}</strong> <small>${escapeHtml(r.label)}: ${escapeHtml(recordValueText(r))}${r.deltaText ? ` (${escapeHtml(r.deltaText)})` : ''}</small></span>
                <button type="button" class="small" data-summary-share="${i}" aria-label="Compartir el récord de ${escapeHtml(r.exercise)}">📤</button>
            </div>`).join('')
        : '';

    const notesBox = document.getElementById('summaryNotes');
    notesBox.hidden = !progressNotes.length;
    notesBox.innerHTML = progressNotes.length ? `<h4>📝 Para tener en cuenta</h4><ul>${progressNotes.map(n => `<li>${escapeHtml(n)}</li>`).join('')}</ul>` : '';

    const g = computeGarden({ workouts: repo.workouts.all(), planHistory: loadTrainingDaysPlanHistory(), today: new Date() });
    const week = document.getElementById('summaryWeek');
    week.hidden = !g.hasPlan || !g.current.planned;
    if (!week.hidden) {
        const left = g.current.planned - g.current.trained;
        week.textContent = g.current.done
            ? '🌸 ¡Semana cumplida! Tu flor creció.'
            : `💧 ${g.current.trained} de ${g.current.planned} entrenamientos esta semana: ${left === 1 ? 'falta 1' : `faltan ${left}`} para cumplirla.`;
    }
    modal.classList.add('open');
    modal.querySelector('[data-summary="close"]')?.focus();
}

function closeSessionSummary() {
    document.getElementById('sessionSummary')?.classList.remove('open');
}

function bindSessionSummary() {
    const modal = document.getElementById('sessionSummary');
    if (!modal) return;
    modal.addEventListener('click', e => {
        if (e.target === modal || e.target.closest('[data-summary="close"]')) { closeSessionSummary(); return; }
        const share = e.target.closest('[data-summary-share]');
        if (share && summaryRecords[+share.dataset.summaryShare]) openShareSheet(trophyShareSpec(summaryRecords[+share.dataset.summaryShare]));
    });
}
