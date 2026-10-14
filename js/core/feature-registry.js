// Funciones activables: la app arranca simple y cada persona activa lo que necesita.
// Nada se borra al apagar una función: solo se oculta (los datos se siguen guardando y, si
// se vuelve a activar, está todo). Las pantallas preguntan features.isOn('rir') al dibujar,
// y lo que está en el HTML lleva data-feature="rir": se oculta con una regla de CSS que se
// arma sola a partir de esta lista.
import { appErrors } from './errors.js';

/**
 * Definición de cada función.
 *   group      grupo en Ajustes → Funciones
 *   simple     ¿viene activada en el modo simple? (el núcleo no está acá: siempre se ve)
 *   requires   otras funciones que tienen que estar activas para que esta tenga sentido
 */
export const FEATURE_GROUPS = [
    ['log', '📝', 'Registro'],
    ['tools', '🧰', 'Herramientas'],
    ['plan', '🗓️', 'Plan y programas'],
    ['progress', '📈', 'Progreso'],
    ['motivation', '🌱', 'Motivación'],
    ['voice', '🗣️', 'Voz y sonido'],
    ['data', '💾', 'Datos']
];

export const FEATURE_DEFINITIONS = [
    { id: 'focus', group: 'log', simple: true, label: 'Un ejercicio a la vez', description: 'En Entrenar se ve abierto solo el ejercicio que toca (o toda su superserie); los demás quedan plegados en una línea.' },
    { id: 'nextStep', group: 'log', simple: true, label: 'Sugerencias para progresar', description: 'Debajo de cada ejercicio: subir el peso, sumar una rep o bajar el descanso. Vos elegís; nada cambia solo.' },
    { id: 'restColumn', group: 'log', simple: true, label: 'Descanso por serie', description: 'Una columna para elegir el descanso de cada serie. Sin ella, el descanso usa el de la última vez (o 90 s).' },
    { id: 'effort', group: 'log', simple: false, label: 'RIR / esfuerzo', description: 'Cuántas reps te quedaban (RIR) o qué tan exigente fue cada serie.' },
    { id: 'warmup', group: 'log', simple: false, label: 'Series de calentamiento', description: 'Tocá el número de la serie para marcarla como calentamiento (C): no cuenta para récords ni volumen.' },
    { id: 'notes', group: 'log', simple: false, label: 'Notas por serie y ejercicio', description: 'Anotá cómo salió cada serie o el ejercicio.' },
    { id: 'unilateral', group: 'log', simple: false, label: 'Ejercicios de a un lado', description: 'Para registrar por lado los ejercicios con un brazo o una pierna.' },
    { id: 'supersets', group: 'log', simple: false, label: 'Superseries y circuitos', description: 'Ejercicios seguidos, con el descanso al final de la vuelta.' },
    { id: 'repCounter', group: 'tools', simple: false, label: 'Contador de reps', description: 'Marca el ritmo de cada repetición y cuenta por vos.' },
    { id: 'plates', group: 'tools', simple: false, label: 'Calculadora de discos', description: 'Qué discos poner en cada lado de la barra, o en qué placa va la clavija.' },
    { id: 'tabata', group: 'tools', simple: false, label: 'Tabata e intervalos', description: 'Bloques de trabajo y descanso con cuenta regresiva.' },
    { id: 'music', group: 'tools', simple: false, label: 'Música', description: 'Abrí tu playlist de Spotify o YouTube Music desde Entrenar.' },
    { id: 'programs', group: 'plan', simple: false, label: 'Programas con progresión', description: 'Programas armados que te dicen qué peso y cuántas reps hacer.' },
    { id: 'calendar', group: 'plan', simple: true, label: 'Calendario', description: 'Los días que entrenaste, mes a mes, con el detalle de cada día.' },
    { id: 'homeStats', group: 'plan', simple: false, label: 'Estadísticas en Inicio', description: 'Totales, promedio semanal y tus últimas rutinas.' },
    { id: 'muscleMap', group: 'progress', simple: false, label: 'Músculos trabajados', description: 'Series por músculo en la semana y si estás en el rango ideal.' },
    { id: 'progression', group: 'progress', simple: false, label: 'Análisis de progresión', description: 'Cada ejercicio contra sesiones anteriores, con gráficos.' },
    { id: 'stall', group: 'progress', simple: false, label: 'Avisos de estancamiento', description: 'Te avisa si un ejercicio no mejora hace semanas y qué cambiar.' },
    { id: 'body', group: 'progress', simple: false, label: 'Medidas y fotos', description: 'Peso, grasa, músculo, cintura y fotos de progreso.' },
    { id: 'garden', group: 'motivation', simple: true, label: 'La flor del plan', description: 'Crece con cada semana que cumplís tu plan.' },
    { id: 'mascot', group: 'motivation', simple: false, label: 'Mascota 3D (vista previa Pro)', description: 'Un compañero que crece con tus semanas cumplidas y se pone musculoso con lo que entrenás.' },
    { id: 'medals', group: 'motivation', simple: false, label: 'Medallas y trofeos', description: 'Logros por constancia, récords, kilos y horas.' },
    { id: 'share', group: 'motivation', simple: false, label: 'Compartir imágenes', description: 'Tus récords y medallas como imagen para las redes.' },
    { id: 'voice', group: 'voice', simple: false, label: 'Avisos por voz', description: 'La app te habla: fin del descanso, últimos segundos, conteo.' },
    { id: 'recordings', group: 'voice', simple: false, label: 'Mis grabaciones', description: 'Tu voz (o la de tu entrenador) para cada aviso.', requires: ['voice'] },
    { id: 'importExport', group: 'data', simple: false, label: 'Importar y exportar', description: 'Traé tu historial de Hevy, Strong o Fitbod, o exportalo a CSV.' },
    { id: 'shareRoutines', group: 'data', simple: false, label: 'Compartir rutinas por link', description: 'Mandá una rutina por WhatsApp o importá la que te pasaron.' },
    { id: 'unify', group: 'data', simple: false, label: 'Unificar ejercicios', description: 'Juntá un ejercicio que quedó con dos nombres.' }
];

export class FeatureRegistry {
    /**
     * @param {object[]} definitions  lista de funciones (FEATURE_DEFINITIONS)
     * @param {{ load: () => object|null, save: (state: object) => void }} storage
     */
    constructor(definitions, storage) {
        this.definitions = new Map(definitions.map(d => [d.id, d]));
        this.storage = storage;
        this.listeners = [];
        this.state = this.normalize(storage.load());
    }

    /** Estado guardado → { mode, on: { id: bool } } completo y válido. */
    normalize(saved) {
        const mode = saved && saved.mode === 'custom' ? 'custom' : 'simple';
        const on = {};
        this.definitions.forEach((d, id) => {
            // En el modo simple vale siempre lo que trae el modo (si cambia, se actualiza solo);
            // lo elegido a mano es del modo personalizado.
            const v = mode === 'custom' && saved.on ? saved.on[id] : undefined;
            on[id] = typeof v === 'boolean' ? v : !!d.simple;
        });
        return { mode, on };
    }

    has(id) { return this.definitions.has(id); }

    /** ¿Está activa? Una función que depende de otra apagada también cuenta como apagada. */
    isOn(id) {
        const d = this.definitions.get(id);
        if (!d) return true; // lo que no es activable siempre se ve
        if (!this.state.on[id]) return false;
        return (d.requires || []).every(r => this.isOn(r));
    }

    /** Activar o desactivar una. Activar una que depende de otra activa también la otra. */
    set(id, value) {
        const d = this.definitions.get(id);
        if (!d) return false;
        const on = { ...this.state.on, [id]: !!value };
        if (value) (d.requires || []).forEach(r => { on[r] = true; });
        // Al apagar una, se apagan las que dependen de ella.
        if (!value) this.definitions.forEach((x, xid) => { if ((x.requires || []).includes(id)) on[xid] = false; });
        return this.commit({ mode: 'custom', on });
    }

    /** Todas en el modo simple (lo que trae marcado "simple"). */
    useSimple() {
        const on = {};
        this.definitions.forEach((d, id) => { on[id] = !!d.simple; });
        return this.commit({ mode: 'simple', on });
    }

    /** Todas activadas. */
    useAll() {
        const on = {};
        this.definitions.forEach((d, id) => { on[id] = true; });
        return this.commit({ mode: 'custom', on });
    }

    /** Activar un grupo entero (o desactivarlo). */
    setGroup(group, value) {
        const on = { ...this.state.on };
        this.definitions.forEach((d, id) => { if (d.group === group) on[id] = !!value; });
        return this.commit({ mode: 'custom', on });
    }

    activeIds() { return [...this.definitions.keys()].filter(id => this.isOn(id)); }
    inactiveIds() { return [...this.definitions.keys()].filter(id => !this.isOn(id)); }
    byGroup(group) { return [...this.definitions.values()].filter(d => d.group === group); }
    countOn() { return this.activeIds().length; }

    onChange(fn) { this.listeners.push(fn); }

    commit(state) {
        this.state = this.normalize(state);
        try { this.storage.save(this.state); } catch (e) { /* si no se puede guardar, igual rige en esta sesión */ }
        this.listeners.forEach(fn => { try { fn(this); } catch (e) { if (typeof appErrors !== 'undefined') appErrors.capture(e, 'funciones'); } });
        return true;
    }

    /** CSS que oculta lo marcado con data-feature cuando su función está apagada. */
    static css(ids) {
        return ids.map(id => `html[data-features-off~="${id}"] [data-feature~="${id}"]`).join(',\n') + ' { display: none !important; }';
    }
}
