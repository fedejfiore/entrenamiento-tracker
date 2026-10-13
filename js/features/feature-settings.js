// Ajustes → Funciones: activar o desactivar partes de la app (ver js/core/feature-registry.js).
// También aplica lo oculto en pantalla y sugiere, una sola vez y en el momento justo, alguna
// función que puede servir ("Ya registraste 5 sesiones: ¿querés ver qué músculos trabajaste?").
// Script clásico (no módulo): comparte el ámbito global con el resto de la app.

const features = new FeatureRegistry(FEATURE_DEFINITIONS, {
    load: () => db.get('features'),
    save: state => db.set('features', state)
});

/** Pantallas y elementos que dependen de varias funciones: se ven si alguna está activa. */
function anyFeatureOn(list) {
    return String(list || '').split(/\s+/).filter(Boolean).some(id => features.isOn(id));
}

class FeatureView {
    constructor(registry) {
        this.registry = registry;
        this.styleReady = false;
    }

    /** Oculta lo de las funciones apagadas (CSS) y lo que depende de varias (data-feature-any). */
    apply() {
        const root = document.documentElement;
        if (!this.styleReady) {
            const style = document.createElement('style');
            style.id = 'featureStyles';
            style.textContent = FeatureRegistry.css([...this.registry.definitions.keys()]);
            document.head.appendChild(style);
            this.styleReady = true;
        }
        root.dataset.featuresOff = this.registry.inactiveIds().join(' ');
        document.querySelectorAll('[data-feature-any]').forEach(el => {
            el.hidden = !anyFeatureOn(el.dataset.featureAny);
        });
    }

    render() {
        const box = document.getElementById('featureSettings');
        if (!box) return;
        const r = this.registry;
        const total = r.definitions.size;
        box.innerHTML = `<p class="feature-intro">La app arranca simple. Activá solo lo que vas a usar: lo demás no ocupa lugar en pantalla. Apagar algo no borra nada.</p>
            <div class="feature-modes">
                <button type="button" class="small${r.state.mode === 'simple' ? ' on' : ''}" data-features-mode="simple" aria-pressed="${r.state.mode === 'simple'}">🌿 Simple</button>
                <button type="button" class="small" data-features-mode="all">✨ Activar todo</button>
                <span class="feature-count">${r.countOn()} de ${total} activas</span>
            </div>
            ${FEATURE_GROUPS.map(([g, icon, label]) => `<div class="feature-group">
                <h3>${icon} ${escapeHtml(label)}</h3>
                ${r.byGroup(g).map(d => `<label class="feature-row">
                    <span class="feature-text"><strong>${escapeHtml(d.label)}</strong><small>${escapeHtml(d.description)}</small></span>
                    <input type="checkbox" class="feature-switch" data-feature-toggle="${d.id}"${r.isOn(d.id) ? ' checked' : ''}>
                </label>`).join('')}
            </div>`).join('')}`;
    }

    bind() {
        const box = document.getElementById('featureSettings');
        box?.addEventListener('change', e => {
            const id = e.target.dataset.featureToggle;
            if (id) this.registry.set(id, e.target.checked);
        });
        box?.addEventListener('click', e => {
            const mode = e.target.closest('[data-features-mode]')?.dataset.featuresMode;
            if (mode === 'simple') this.registry.useSimple();
            if (mode === 'all') this.registry.useAll();
        });
        // Sugerencias en contexto: "Activar" desde un aviso.
        document.addEventListener('click', e => {
            const btn = e.target.closest('[data-feature-enable]');
            if (!btn) return;
            markFeatureHintShown(btn.dataset.featureEnable);
            this.registry.set(btn.dataset.featureEnable, true);
            btn.closest('.feature-hint')?.remove();
            showToast('✅ Activado. Lo podés apagar en Ajustes → Funciones.', 'success', 3000);
        });
    }
}

const featureView = new FeatureView(features);

/** Lo que hay que redibujar cuando cambia alguna función. */
function onFeaturesChanged() {
    featureView.apply();
    featureView.render();
    if (typeof renderDrawerNav === 'function') renderDrawerNav();
    // Las series se redibujan con las columnas nuevas, sin perder lo que estaba cargado.
    document.querySelectorAll('#exercisesContainer .exercise-row').forEach(block => {
        appErrors.run(() => renderBlockSets(block, block.dataset.type, readBlockSets(block)), 'funciones: series');
    });
    // Entrenar: con "un ejercicio a la vez" se enfoca; sin él, se abre lo pendiente.
    appErrors.run(() => {
        if (typeof refreshSupersetBadges === 'function') refreshSupersetBadges();
        if (features.isOn('focus')) focusCurrentExercise();
        else document.querySelectorAll('#exercisesContainer .exercise-row').forEach(b => { if (b.querySelector('.set-row:not(.done)')) setBlockCollapsed(b, false); });
        const legend = document.querySelector('#exercisesContainer .sets-legend');
        if (legend) legend.innerHTML = setsLegendHtml();
    }, 'funciones: entrenar');
    if (!features.isOn('tabata') && typeof setTrainMode === 'function') appErrors.run(() => setTrainMode('rutina'), 'funciones: tabata');
    if (typeof renderHelpContent === 'function') appErrors.run(renderHelpContent, 'funciones: ayuda');
    if (typeof renderMascot === 'function') renderMascot();
}

// ---- Sugerencias en contexto (una sola vez cada una) ----
const FEATURE_HINTS = [
    { feature: 'supersets', when: () => Object.keys(db.get('routineSupersets') || {}).length > 0, text: 'Tenés superseries armadas en tus rutinas. ¿Las activás para que la app te lleve de un ejercicio al otro?' },
    { feature: 'muscleMap', when: n => n >= 5, text: 'Ya registraste 5 sesiones. ¿Querés ver qué músculos trabajaste y si estás en el rango ideal?' },
    { feature: 'mascot', when: n => n >= 8, text: 'Tu entrenamiento ya se nota: ¿querés conocer a tu compañero 3D, que crece y se pone musculoso con lo que entrenás? (vista previa de Pro)' },
    { feature: 'progression', when: n => n >= 10, text: 'Con 10 sesiones ya se puede ver cómo progresa cada ejercicio. ¿Lo activás?' },
    { feature: 'medals', when: n => n >= 3, text: 'Vas por buen camino: ¿querés ganar medallas por tu constancia?' }
];

/** El primer aviso que corresponde (y que no se mostró antes), o null. */
function nextFeatureHint(sessions, shown) {
    return FEATURE_HINTS.find(h => !features.isOn(h.feature) && !shown.includes(h.feature) && h.when(sessions)) || null;
}

function renderFeatureHint() {
    const box = document.getElementById('featureHint');
    if (!box) return;
    const shown = db.get('featureHintsShown') || [];
    const hint = nextFeatureHint(repo.workouts.all().length, shown);
    if (!hint) { box.innerHTML = ''; return; }
    box.innerHTML = `<div class="feature-hint">
            <span>💡 ${escapeHtml(hint.text)}</span>
            <div class="feature-hint-actions">
                <button type="button" class="small success" data-feature-enable="${hint.feature}">Activar</button>
                <button type="button" class="small feature-hint-no" data-feature-hint-dismiss="${hint.feature}">Ahora no</button>
            </div>
        </div>`;
}

/** Una sugerencia respondida (activar o "ahora no") no vuelve a aparecer. */
function markFeatureHintShown(id) {
    try {
        const shown = db.get('featureHintsShown') || [];
        if (!shown.includes(id)) db.set('featureHintsShown', [...shown, id]);
    } catch (e) { /* no crítico */ }
}

function initFeatures() {
    featureView.apply();
    featureView.render();
    featureView.bind();
    features.onChange(onFeaturesChanged);
    document.addEventListener('click', e => {
        const no = e.target.closest('[data-feature-hint-dismiss]');
        if (!no) return;
        markFeatureHintShown(no.dataset.featureHintDismiss);
        renderFeatureHint();
    });
}
