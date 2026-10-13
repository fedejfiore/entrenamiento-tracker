// Perfil → Tu compañero: la mascota 3D (vista previa de Pro). Crece con las semanas cumplidas,
// se pone musculosa con lo que entrenás y festeja cuando cumplís la semana. La lógica está en
// js/domain/mascot.js; acá se dibuja con three.js, que se carga recién la primera vez que se
// abre (vendor/three-mascot.min.js), junto con el modelo .glb. Si el celular no tiene WebGL, se
// muestra el estado en texto. Con "reducir movimiento" no hay animación.
import { appErrors } from '../core/errors.js';
import { formatDateLocal, html } from '../core/utils.js';
import { MUSCLE_GROUPS } from '../domain/catalog.js';
import { computeGarden } from '../domain/garden.js';
import { muscleSetsByGroup } from '../domain/training-tools.js';
import { MASCOT_SPECIES, mascotSnapshot } from '../domain/mascot.js';
import { db, repo } from '../data/repositories.js';
import { getMuscleGroup } from '../data/exercise-prefs.js';
import { loadTrainingDaysPlanHistory } from '../data/routines-store.js';
import { showToast } from '../ui/toast.js';
import { features } from './feature-settings.js';

export class MascotView {
    /**
     * @param {object} deps
     *   data()   → { garden, byGroup } (historial ya calculado)
     *   storage  → { load(): {species, celebrated}, save(state) }
     *   isOn()   → ¿la función está activa?
     *   notify(text)
     */
    constructor(deps) {
        this.deps = deps;
        this.three = null;        // promesa de window.GymThree
        this.scene = null;        // { renderer, scene, camera, mixer, model, actions, bones, root }
        this.loadedSpecies = null;
        this.frame = null;
        this.snapshot = null;
    }

    static reducedMotion() {
        try { return window.matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) { return false; }
    }

    static webglAvailable() {
        try { const c = document.createElement('canvas'); return !!(c.getContext('webgl2') || c.getContext('webgl')); } catch (e) { return false; }
    }

    /** Carga three.js una sola vez (script del propio sitio: lo permite la CSP). */
    loadThree() {
        if (window.GymThree) return Promise.resolve(window.GymThree);
        if (!this.three) {
            this.three = new Promise((resolve, reject) => {
                const s = document.createElement('script');
                s.src = 'vendor/three-mascot.min.js';
                s.onload = () => (window.GymThree ? resolve(window.GymThree) : reject(new Error('three.js no cargó')));
                s.onerror = () => { this.three = null; reject(new Error('No se pudo cargar el visor 3D')); };
                document.head.appendChild(s);
            });
        }
        return this.three;
    }

    state() {
        const saved = this.deps.storage.load() || {};
        return { species: MASCOT_SPECIES[saved.species] ? saved.species : 'fox', celebrated: saved.celebrated || '' };
    }

    /** Dibuja la sección (texto) y, si se puede, la escena 3D. */
    render() {
        const box = document.getElementById('mascotSection');
        if (!box) return;
        if (!this.deps.isOn()) { this.stop(); return; }
        const st = this.state();
        const { garden, byGroup } = this.deps.data();
        const snap = mascotSnapshot({ speciesId: st.species, garden, byGroup });
        this.snapshot = snap;
        const moodText = { happy: '😄 Contento: cumpliste tu semana', normal: '🙂 Tranquilo', sleepy: '😴 Con sueño: te extraña. Con la próxima semana cumplida se despierta' }[snap.mood];
        const next = snap.stage.next ? `${snap.stage.weeksToNext === 1 ? 'Falta 1 semana cumplida' : `Faltan ${snap.stage.weeksToNext} semanas cumplidas`} para ${snap.stage.next.label.toLowerCase()}` : 'Ya es adulto';
        const top = Object.entries(snap.levels).filter(([, l]) => l > 0).sort((a, b) => b[1] - a[1]);
        box.innerHTML = html`<p class="mascot-pro">✨ Vista previa de Pro</p>
            <div class="mascot-stage" id="mascotCanvas" aria-label="${snap.species.label} en 3D"></div>
            <p class="mascot-line"><b>${snap.species.icon} ${snap.species.label} · ${snap.stage.label}</b> <span>${next}</span></p>
            <p class="mascot-line">${moodText}</p>
            <div class="mascot-muscles">${top.length
                ? top.map(([m, l]) => html`<span class="mascot-chip lvl-${l}">${MUSCLE_GROUPS[m]?.icon || ''} ${m} ${'●'.repeat(l)}${'○'.repeat(4 - l)}</span>`)
                : html`<span class="mascot-empty">Entrená y se le van a marcar los músculos que trabajes (promedio de 4 semanas).</span>`}</div>
            <div class="mascot-actions">
                <button type="button" class="small" data-mascot="celebrate">🎉 Festejar</button>
                <select data-mascot="species" aria-label="Elegir mascota">${Object.entries(MASCOT_SPECIES).map(([id, sp]) => html`<option value="${id}"${id === st.species ? html` selected` : ''}>${sp.icon} ${sp.label}</option>`)}<option disabled>🐶 Perro (próximamente)</option><option disabled>🐱 Gato (próximamente)</option></select>
            </div>`;
        this.mount(snap).catch(err => {
            const canvas = document.getElementById('mascotCanvas');
            if (canvas) canvas.innerHTML = html`<p class="mascot-empty">${snap.species.icon} ${err.message || 'No se pudo mostrar en 3D'}</p>`;
        });
        // Festejo de la semana cumplida, una vez por semana.
        if (garden?.current?.done && st.celebrated !== garden.current.start) {
            this.deps.storage.save({ ...st, celebrated: garden.current.start });
            this.pendingCelebration = true;
        }
    }

    async mount(snap) {
        const host = document.getElementById('mascotCanvas');
        if (!host) return;
        if (!MascotView.webglAvailable()) throw new Error('Tu celular no puede mostrar 3D: se ve el estado en texto.');
        const T = await this.loadThree();
        if (!this.scene || this.loadedSpecies !== snap.species.model) await this.build(T, snap.species);
        host.appendChild(this.scene.renderer.domElement);
        this.resize();
        this.apply(snap);
        this.play(snap.mood === 'sleepy' ? 'sleepy' : 'idle');
        if (this.pendingCelebration) { this.pendingCelebration = false; this.celebrate(); this.deps.notify('🎉 ¡Semana cumplida! Tu compañero lo festeja'); }
        this.start();
    }

    async build(T, species) {
        this.dispose();
        const renderer = new T.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: true });
        renderer.outputColorSpace = T.SRGBColorSpace;
        renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
        const scene = new T.Scene();
        const camera = new T.PerspectiveCamera(35, 1, 0.1, 5000);
        scene.add(new T.HemisphereLight(0xffffff, 0x8899aa, 2.2));
        const sun = new T.DirectionalLight(0xffffff, 2);
        sun.position.set(2, 4, 3);
        scene.add(sun);
        const gltf = await new T.GLTFLoader().loadAsync(species.model);
        const model = gltf.scene;
        // Encuadre: se normaliza el tamaño del modelo y la cámara lo mira de tres cuartos.
        const box = new T.Box3().setFromObject(model);
        const size = box.getSize(new T.Vector3());
        const unit = 1 / Math.max(size.x, size.y, size.z);
        model.scale.setScalar(unit);
        const center = new T.Box3().setFromObject(model).getCenter(new T.Vector3());
        model.position.sub(center);
        const root = new T.Scene(); // contenedor que escala por etapa
        root.add(model);
        scene.add(root);
        camera.position.set(0.7, 0.28, 0.98);
        camera.lookAt(0, 0, 0);
        const mixer = new T.AnimationMixer(model);
        const actions = {};
        gltf.animations.forEach(clip => { actions[clip.name] = mixer.clipAction(clip); });
        const bones = {};
        model.traverse(o => { if (o.isBone) bones[o.name] = o; });
        this.scene = { T, renderer, scene, camera, mixer, model, root, actions, bones, clock: new T.Clock(), local: {} };
        this.loadedSpecies = species.model;
        this.species = species;
    }

    /** Etapa (tamaño) y músculos (grosor de los huesos, compensando a los hijos). */
    apply(snap) {
        const sc = this.scene;
        if (!sc) return;
        sc.root.scale.setScalar(snap.stage.scale);
        const S = name => snap.boneScales[name] || 1;
        sc.local = {};
        Object.values(sc.bones).forEach(b => {
            const parent = b.parent && b.parent.isBone ? b.parent.name : null;
            const s = S(b.name) / (parent ? S(parent) : 1);
            if (s !== 1) sc.local[b.name] = s;
        });
    }

    play(kind) {
        const sc = this.scene;
        if (!sc) return;
        const name = this.species.clips[kind] || this.species.clips.idle;
        const action = sc.actions[name];
        if (!action) return;
        Object.values(sc.actions).forEach(a => { if (a !== action) a.fadeOut(0.3); });
        action.reset().fadeIn(0.3).play();
        action.setEffectiveTimeScale(kind === 'sleepy' ? 0.45 : 1);
        sc.current = kind;
    }

    celebrate() {
        if (!this.scene) return;
        this.play('happy');
        clearTimeout(this.celebrateTimer);
        this.celebrateTimer = setTimeout(() => this.play(this.snapshot?.mood === 'sleepy' ? 'sleepy' : 'idle'), 2600);
        if (MascotView.reducedMotion()) this.renderOnce();
    }

    resize() {
        const sc = this.scene;
        const host = document.getElementById('mascotCanvas');
        if (!sc || !host) return;
        const w = host.clientWidth || 300;
        const h = host.clientHeight || 240;
        sc.renderer.setSize(w, h, false);
        sc.camera.aspect = w / h;
        sc.camera.updateProjectionMatrix();
    }

    tick(dt) {
        const sc = this.scene;
        sc.mixer.update(dt);
        // Después de la animación: el grosor de cada hueso (perpendicular al hueso).
        Object.entries(sc.local).forEach(([name, s]) => { sc.bones[name].scale.set(s, 1, s); });
        sc.renderer.render(sc.scene, sc.camera);
    }

    renderOnce() {
        if (this.scene) this.tick(0);
    }

    start() {
        this.stop();
        if (MascotView.reducedMotion()) { this.tick(0.5); return; }
        const loop = () => {
            if (!document.getElementById('mascotCanvas')?.isConnected) { this.frame = null; return; }
            this.tick(Math.min(this.scene.clock.getDelta(), 0.1));
            this.frame = requestAnimationFrame(loop);
        };
        this.scene.clock.getDelta();
        this.frame = requestAnimationFrame(loop);
    }

    stop() {
        if (this.frame) cancelAnimationFrame(this.frame);
        this.frame = null;
    }

    dispose() {
        this.stop();
        if (this.scene) { this.scene.renderer.dispose(); this.scene = null; }
    }

    bind() {
        document.addEventListener('click', e => {
            if (e.target.closest('[data-mascot="celebrate"]')) this.celebrate();
        });
        document.addEventListener('change', e => {
            if (e.target.closest('[data-mascot="species"]')) {
                this.deps.storage.save({ ...this.state(), species: e.target.value });
                this.render();
            }
        });
        window.addEventListener('resize', () => this.resize());
    }
}

/** Series por músculo de las últimas 4 semanas (28 días hasta hoy) y el estado de la flor. */
export function mascotData() {
    const today = new Date();
    const from = new Date(today);
    from.setDate(from.getDate() - 27);
    const workouts = repo.workouts.all();
    return {
        garden: computeGarden({ workouts, planHistory: loadTrainingDaysPlanHistory(), today }),
        byGroup: muscleSetsByGroup(workouts, formatDateLocal(from), formatDateLocal(today), getMuscleGroup)
    };
}

export const mascotView = new MascotView({
    data: mascotData,
    storage: { load: () => db.get('mascot'), save: state => db.set('mascot', state) },
    isOn: () => features.isOn('mascot'),
    notify: text => showToast(text, 'success', 3500)
});

export function initMascot() {
    mascotView.bind();
}

export function renderMascot() {
    appErrors.run(() => mascotView.render(), 'mascota');
}
