// Inicio → Hoy: la flor del plan semanal (el cálculo está en js/domain/garden.js).
// Dibujo en SVG por etapas; al crecer se anima una vez y avisa. Con "reducir movimiento"
// del sistema, el cambio se muestra sin animación (ver css).
// Script clásico (no módulo): comparte el ámbito global con el resto de la app.

// Degradés para dar volumen (los colores salen de variables CSS, así se adaptan al tema).
const GARDEN_DEFS = `<defs>
    <linearGradient id="gPot" x1="0" x2="1"><stop offset="0" stop-color="var(--plant-pot-dark)"/><stop offset="0.55" stop-color="var(--plant-pot)"/><stop offset="1" stop-color="var(--plant-pot-dark)"/></linearGradient>
    <linearGradient id="gLeaf" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="var(--plant-leaf-light)"/><stop offset="1" stop-color="var(--plant-leaf)"/></linearGradient>
    <radialGradient id="gPetal" cx="0.5" cy="0.85" r="0.9"><stop offset="0" stop-color="var(--plant-petal-light)"/><stop offset="1" stop-color="var(--plant-petal)"/></radialGradient>
    <radialGradient id="gCenter" cx="0.4" cy="0.35" r="0.7"><stop offset="0" stop-color="#fff3b0"/><stop offset="1" stop-color="var(--plant-center)"/></radialGradient>
    <radialGradient id="gFruit" cx="0.35" cy="0.3" r="0.75"><stop offset="0" stop-color="#ff9a8f"/><stop offset="1" stop-color="var(--plant-fruit)"/></radialGradient>
</defs>`;

// Hoja con forma de gota y nervadura, que sale del tallo en (x, y) hacia un lado (dir ±1).
function gardenLeaf(x, y, dir, size = 1) {
    const w = 18 * size * dir, h = 8 * size;
    return `<path class="g-leaf" d="M${x} ${y} q${w * 0.45} ${-h * 1.4} ${w} ${-h * 0.6} q${-w * 0.35} ${h * 1.3} ${-w} ${h * 0.6} Z"/>`
        + `<path class="g-vein" d="M${x} ${y} q${w * 0.5} ${-h * 0.55} ${w * 0.9} ${-h * 0.55}"/>`;
}

function gardenSvg(g) {
    const s = g.stageIndex;
    const top = [112, 94, 72, 54, 50][s];
    const parts = [];
    if (s >= 1) parts.push(`<path class="g-stem" d="M60 118 Q56 ${(118 + top) / 2} 60 ${top}"/>`, gardenLeaf(59, 108, -1), gardenLeaf(61, 102, 1));
    if (s >= 3) parts.push(gardenLeaf(58, 88, -1, 0.9), gardenLeaf(60, 80, 1, 0.9));
    if (s === 4) {
        parts.push([[43, 96], [79, 88], [44, 78], [77, 70], [50, 64]].slice(0, Math.min(5, g.fruits))
            .map(([x, y]) => `<circle class="g-fruit" cx="${x}" cy="${y}" r="4.5"/><circle class="g-shine" cx="${x - 1.5}" cy="${y - 1.5}" r="1.2"/>`).join(''));
    }
    if (s === 0) parts.push('<ellipse class="g-seed" cx="60" cy="112" rx="6" ry="4.5"/><path class="g-sprout-tip" d="M61 108 q1 -5 6 -5"/>');
    if (s === 2) {
        parts.push(`<g class="g-head"><path class="g-sepal" d="M53 ${top + 3} Q60 ${top + 9} 67 ${top + 3} Q60 ${top + 5} 53 ${top + 3} Z"/>`
            + `<path class="g-petal" d="M60 ${top - 15} Q70 ${top - 4} 60 ${top + 4} Q50 ${top - 4} 60 ${top - 15} Z"/></g>`);
    }
    if (s >= 3) {
        const petals = [0, 60, 120, 180, 240, 300].map((deg, i) =>
            `<ellipse class="g-petal" data-petal="${i}" cx="60" cy="${top - 10}" rx="6.5" ry="10" transform="rotate(${deg} 60 ${top})"/>`).join('');
        parts.push(`<g class="g-head">${petals}<circle class="g-center" cx="60" cy="${top}" r="6"/></g>`);
    }
    return `<svg class="garden-svg" viewBox="0 0 120 150" role="img" aria-label="${escapeHtml(gardenAriaLabel(g))}">${GARDEN_DEFS}
        ${parts.join('')}
        <path class="g-pot" d="M36 118 H84 L78 147 Q60 150 42 147 Z"/>
        <rect class="g-pot-rim" x="33" y="113" width="54" height="9" rx="3"/>
        <ellipse class="g-soil" cx="60" cy="115" rx="23" ry="3"/>
    </svg>`;
}

function gardenAriaLabel(g) {
    return `${g.stage.label}${g.fruits ? ` con ${g.fruits} ${g.fruits === 1 ? 'fruto' : 'frutos'}` : ''}${g.wilted ? ', un poco marchita' : ''}`;
}

function gardenDropsHtml(current) {
    const { planned, trained } = current;
    if (!planned) return '';
    const drops = Array.from({ length: planned }, (_, i) => `<span class="${i < trained ? 'g-drop on' : 'g-drop'}" aria-hidden="true">${i < trained ? '💧' : '○'}</span>`).join('');
    return `<div class="garden-drops" aria-label="${trained} de ${planned} entrenamientos esta semana">${drops}<span class="garden-drops-text">${Math.min(trained, planned)} de ${planned} esta semana${trained >= planned ? ' ✓' : ''}</span></div>`;
}

function renderGarden() {
    const box = document.getElementById('gardenCard');
    if (!box) return;
    const g = computeGarden({ workouts: repo.workouts.all(), planHistory: loadTrainingDaysPlanHistory(), today: new Date() });
    if (!g.hasPlan) {
        box.innerHTML = `<div class="garden-empty">🌱 <span>Elegí tus días en <b>Mi plan semanal</b> y plantá tu flor: crece con cada semana que cumplís.</span>
            <button type="button" class="small" data-garden="plan">Armar mi plan</button></div>`;
        return;
    }
    const nextText = g.next
        ? `${g.weeksToNext === 1 ? 'Falta 1 semana' : `Faltan ${g.weeksToNext} semanas`} para ${g.next.label.toLowerCase()}`
        : `${g.weeksToNext === 1 ? 'Falta 1 semana' : `Faltan ${g.weeksToNext} semanas`} para otro fruto`;
    const mood = g.wilted
        ? 'Se marchitó un poco: cumplí esta semana y se recupera.'
        : g.current.done ? '¡Semana cumplida! Ya la regaste.' : 'Cada entrenamiento la riega.';
    box.innerHTML = `<div class="garden ${g.wilted ? 'garden-wilted' : ''}">
            ${gardenSvg(g)}
            <div class="garden-info">
                <strong>${escapeHtml(g.stage.label)}${g.fruits ? ` · ${g.fruits} ${g.fruits === 1 ? 'fruto' : 'frutos'}` : ''}</strong>
                ${gardenDropsHtml(g.current)}
                <small>${escapeHtml(mood)} ${escapeHtml(nextText)}.</small>
                <small>🎟️ ${g.freeWeeks} ${g.freeWeeks === 1 ? 'semana libre' : 'semanas libres'} · ${g.grown} ${g.grown === 1 ? 'semana cumplida' : 'semanas cumplidas'}</small>
            </div>
        </div>
        <details class="garden-help"><summary>¿Cómo crece?</summary>
            <p>Crece con cada semana en que entrenás tantos días como dice tu plan: semilla → brote (1 semana) → capullo (3) → flor (6) → flor con frutos (10), y suma un fruto cada 4 semanas más.</p>
            <p>Si una semana no llegás, se usa sola una <b>semana libre</b> (para vacaciones, lesión o enfermedad): empezás con 2 y se suma 1 por mes, hasta 3. Sin semanas libres se marchita un poco, pero nunca vuelve atrás.</p>
        </details>`;
    celebrateGardenGrowth(g, box);
}

// Una sola vez por crecimiento: animación y aviso (la última etapa vista se recuerda).
function celebrateGardenGrowth(g, box) {
    let seen = {};
    try { seen = db.get('gardenSeen') || {}; } catch (e) {}
    if (typeof seen.grown === 'number' && g.grown > seen.grown) {
        box.querySelector('.garden-svg')?.classList.add('garden-grow');
        const stageUp = seen.stageIndex !== undefined && g.stageIndex > seen.stageIndex;
        showToast(stageUp ? `🌸 ¡Tu flor creció! Ahora: ${g.stage.label}` : g.fruits > (seen.fruits || 0) ? '🍒 ¡Tu flor dio un fruto nuevo!' : '🌱 ¡Semana cumplida! Tu flor creció', 'success', 3500);
    }
    if (seen.grown !== g.grown || seen.stageIndex !== g.stageIndex || seen.fruits !== g.fruits) {
        try { db.set('gardenSeen', { grown: g.grown, stageIndex: g.stageIndex, fruits: g.fruits }); } catch (e) {}
    }
}

function bindGarden() {
    document.getElementById('gardenCard')?.addEventListener('click', e => {
        if (!e.target.closest('[data-garden="plan"]')) return;
        const plan = document.getElementById('planSection');
        if (plan) setSectionOpen(plan, true, true);
    });
}
