// Catálogo fijo: rutinas base, grupos musculares, variantes y tipos de medición.
// Script clásico (no módulo): comparte el ámbito global con el resto de la app.

const routines = {
    A: [
        'Press de pecho', 'Jalón al pecho', 'Press de hombros', 'Remo sentado',
        'Aperturas en mariposa', 'Curl de bíceps', 'Extensión de tríceps'
    ],
    B: [
        'Sentadilla goblet', 'Extensión de piernas', 'Curl de piernas',
        'Peso muerto rumano', 'Gemelos de pie', 'Crunch en polea'
    ],
    C: [
        'Jalón al pecho', 'Press de pecho', 'Remo sentado', 'Elevaciones laterales',
        'Mariposa', 'Curl de bíceps', 'Tríceps en polea'
    ],
    D: [
        'Sentadilla goblet', 'Zancadas', 'Curl de piernas', 'Extensión de piernas',
        'Peso muerto rumano', 'Gemelos', 'Abdominales'
    ],
    A1: ['Press de pecho', 'Jalón al pecho', 'Elevación de barra al mentón'],
    A2: ['Press de hombros', 'Remo sentado', 'Curl con barra desde polea baja'],
    B1: ['Sentadilla búlgara', 'Extensión de cuádriceps', 'Curl femoral unilateral'],
    C1: ['Vuelos laterales unilaterales con polea baja', 'Face pull', 'Jalones de tríceps con polea alta'],
    C2: ['Aperturas en mariposa', 'Curl martillo', 'Extensión de tríceps tras nuca'],
    D1: ['Puente de glúteos / hip thrust', 'Gemelos', 'Crunch en polea + plancha']
};

const ROUTINE_LABELS = {
    A: 'Rutina A - Superior',
    B: 'Rutina B - Inferior',
    C: 'Rutina C - Superior',
    D: 'Rutina D - Inferior',
    A1: 'Rutina A1 - Micro Upper 1 (pecho + espalda + hombro)',
    A2: 'Rutina A2 - Micro Upper 2 (hombro + espalda + bíceps)',
    B1: 'Rutina B1 - Micro Lower 1 (cuádriceps + isquios)',
    C1: 'Rutina C1 - Micro hombro ancho + tríceps',
    C2: 'Rutina C2 - Micro pecho accesorio + brazos',
    D1: 'Rutina D1 - Micro Lower 2 (glúteos + gemelos + core)',
    // Ya no es una rutina básica (migración 3: pasa a las rutinas del usuario); el nombre
    // queda para mostrar bien las sesiones viejas en el historial.
    FUT: '⚽ Fútbol (día de partido)'
};

// Cómo se mide cada ejercicio. Es global por nombre (no por rutina): "Plancha" se
// mide en tiempo en cualquier rutina donde aparezca. Cambiar el tipo no toca el
// historial ya guardado, solo qué columnas se cargan de acá en adelante.
// rest: si la serie tiene columna de descanso (y dispara el timer al tildarla).
// calc: columna calculada (km/h a partir del tiempo y los km).
// La unidad del tiempo (seg, m:ss, min, h:mm) se elige por ejercicio: ver TIME_UNITS.
const EXERCISE_TYPES = {
    kg:   { label: 'Kg + reps', cols: ['reps', 'kg'], effort: 'rir', defaultSets: 3, rest: true },
    bw:   { label: 'Solo reps', cols: ['reps'], effort: 'rir', defaultSets: 3, rest: true },
    time: { label: 'Tiempo', cols: ['time'], effort: 'rpe', defaultSets: 1, rest: true },
    min:  { label: 'Duración', cols: ['time'], effort: 'rpe', defaultSets: 1, rest: false },
    km:   { label: 'Tiempo + km', cols: ['time', 'km'], effort: 'rpe', defaultSets: 1, rest: false, calc: 'speed' }
};

function isCardioType(type) {
    return type === 'time' || type === 'min' || type === 'km';
}

// Todos los campos abren teclado numérico en el celular: "numeric" (solo dígitos)
// o "decimal" (dígitos + separador). Punto o coma da igual: la app los normaliza.
// El tiempo m:ss se tipea como dígitos y se formatea solo ("145" → "1:45"), así
// no hace falta buscar los dos puntos en el teclado.
const SET_FIELDS = {
    reps: { head: 'Reps', inputmode: 'numeric', hint: '–' },
    kg:   { head: 'Kg', inputmode: 'decimal', hint: '–' },
    km:   { head: 'Km', inputmode: 'decimal', hint: '–' },
    time: { head: 'm:ss', inputmode: 'numeric', hint: 'm:ss' }
};

// RIR = reps que quedaban en reserva (0 = al fallo). Para cardio/tiempo no tiene
// sentido contar reps en reserva, así que se usa una escala de esfuerzo simple.
const EFFORT_SCALES = {
    rir: { head: 'RIR', title: 'Reps en reserva (F = al fallo)', options: [['', '–'], ['0', 'F'], ['1', '1'], ['2', '2'], ['3', '3'], ['4', '4+']] },
    rpe: { head: 'Esfuerzo', title: 'Qué tan exigente fue', options: [['', '–'], ['suave', 'Suave'], ['media', 'Media'], ['alta', 'Alta'], ['max', 'Máx']] }
};

// Botones de ajuste rápido que aparecen bajo la serie al tocar un campo, para
// subir/bajar sin escribir un número. Tiempo y descanso van en segundos.
const SET_STEPS = {
    kg:   [-5, -2.5, 2.5, 5],
    reps: [-1, 1],
    km:   [-1, -0.5, 0.5, 1],
    rest: [-15, 15]
};

// El fútbol viejo guardaba la intensidad como texto en "reps".
const LEGACY_INTENSITY_TO_EFFORT = { baja: 'suave', media: 'media', alta: 'alta' };

const DEFAULT_REST_SECONDS = 90;

const WARMUP_LABEL = 'C';

const DEFAULT_MATCH_MINUTES = 60;

const EXERCISE_VARIANTS = {
    'Press de pecho': ['Press de banca con mancuernas', 'Press inclinado con barra', 'Flexiones de brazos (push-ups)'],
    'Jalón al pecho': ['Remo en polea sentado', 'Dominadas asistidas', 'Jalón con agarre supino'],
    'Press de hombros': ['Press militar con mancuernas', 'Press Arnold', 'Elevaciones laterales'],
    'Remo sentado': ['Remo con mancuerna a un brazo', 'Remo en máquina', 'Remo invertido en barra'],
    'Aperturas en mariposa': ['Cruces en polea (cable crossover)', 'Aperturas con mancuernas en banco', 'Press cerrado en máquina'],
    'Mariposa': ['Cruces en polea (cable crossover)', 'Aperturas con mancuernas en banco'],
    'Curl de bíceps': ['Curl martillo', 'Curl en polea baja', 'Curl concentrado'],
    'Extensión de tríceps': ['Press francés', 'Fondos en banco', 'Extensión en polea con cuerda'],
    'Tríceps en polea': ['Press francés', 'Fondos en banco', 'Patada de tríceps con mancuerna'],
    'Sentadilla goblet': ['Sentadilla con barra', 'Prensa de piernas', 'Sentadilla búlgara'],
    'Extensión de piernas': ['Sentadilla', 'Zancadas', 'Step ups (subida al cajón)'],
    'Curl de piernas': ['Peso muerto rumano', 'Curl femoral de pie', 'Puente de glúteos'],
    'Peso muerto rumano': ['Peso muerto convencional', 'Hip thrust', 'Buenos días (good morning)'],
    'Gemelos de pie': ['Gemelos sentado', 'Elevación de talones en prensa'],
    'Gemelos': ['Gemelos sentado', 'Elevación de talones en prensa'],
    'Crunch en polea': ['Abdominales en banco declinado', 'Plancha (plank)', 'Elevación de piernas colgado'],
    'Abdominales': ['Crunch en polea', 'Plancha (plank)', 'Elevación de piernas colgado'],
    'Elevaciones laterales': ['Press de hombros', 'Elevaciones frontales', 'Face pull en polea'],
    'Zancadas': ['Sentadilla búlgara', 'Step ups (subida al cajón)', 'Prensa de piernas'],
    'Elevación de barra al mentón': ['Elevaciones laterales', 'Press de hombros', 'Remo al mentón con mancuernas'],
    'Curl con barra desde polea baja': ['Curl de bíceps', 'Curl martillo', 'Curl en banco Scott'],
    'Sentadilla búlgara': ['Zancadas', 'Sentadilla goblet', 'Prensa de piernas'],
    'Extensión de cuádriceps': ['Sentadilla', 'Zancadas', 'Step ups (subida al cajón)'],
    'Curl femoral unilateral': ['Curl femoral de pie', 'Peso muerto rumano', 'Puente de glúteos'],
    'Vuelos laterales unilaterales con polea baja': ['Elevaciones laterales', 'Press de hombros', 'Elevaciones laterales en polea'],
    'Face pull': ['Elevaciones laterales', 'Remo sentado', 'Jalón con agarre ancho'],
    'Jalones de tríceps con polea alta': ['Press francés', 'Fondos en banco', 'Patada de tríceps con mancuerna'],
    'Curl martillo': ['Curl de bíceps', 'Curl en polea baja', 'Curl concentrado'],
    'Extensión de tríceps tras nuca': ['Press francés', 'Extensión en polea con cuerda', 'Fondos en banco'],
    'Puente de glúteos / hip thrust': ['Peso muerto rumano', 'Sentadilla goblet', 'Buenos días (good morning)'],
    'Crunch en polea + plancha': ['Abdominales en banco declinado', 'Plancha (plank)', 'Elevación de piernas colgado']
};

// Taxonomía por grupo muscular, para el catálogo de Variantes y para agrupar el
// progreso por músculo. Cubre los ejercicios base + variantes que ya conoce la app;
// uno que no aparezca acá cae en "Otro" (ej. ejercicios personalizados nuevos).
const MUSCLE_GROUPS = {
    'Pecho': { icon: '🫀', exercises: ['Press de pecho', 'Press de banca con mancuernas', 'Press inclinado con barra', 'Flexiones de brazos (push-ups)', 'flexiones declinadas', 'Aperturas en mariposa', 'Mariposa', 'Cruces en polea (cable crossover)', 'Aperturas con mancuernas en banco', 'Press cerrado en máquina'] },
    'Espalda': { icon: '🔙', exercises: ['Jalón al pecho', 'Remo sentado', 'Remo con mancuerna a un brazo', 'Remo en máquina', 'Remo invertido en barra', 'Remo en polea sentado', 'Dominadas asistidas', 'Jalón con agarre supino', 'Jalón con agarre ancho', 'Face pull', 'Face pull en polea', 'Pullover en polea alta', 'Pullover unilateral en polea alta'] },
    'Hombros': { icon: '🔺', exercises: ['Press de hombros', 'Press militar con mancuernas', 'Press Arnold', 'Elevaciones laterales', 'Elevaciones laterales en polea', 'Elevaciones frontales', 'Vuelos laterales unilaterales con polea baja', 'Elevación de barra al mentón', 'Remo al mentón con mancuernas'] },
    'Bíceps': { icon: '💪', exercises: ['Curl de bíceps', 'Curl martillo', 'Curl en polea baja', 'Curl concentrado', 'Curl con barra desde polea baja', 'Curl en banco Scott', 'Curl con barra scott bicep'] },
    'Tríceps': { icon: '🦾', exercises: ['Extensión de tríceps', 'Tríceps en polea', 'Press francés', 'Fondos en banco', 'Extensión en polea con cuerda', 'Patada de tríceps con mancuerna', 'Jalones de tríceps con polea alta', 'Extensión de tríceps tras nuca'] },
    'Piernas': { icon: '🦵', exercises: ['Sentadilla goblet', 'Sentadilla con barra', 'Sentadilla', 'Sentadilla búlgara', 'Sentadilla búlgarra', 'Prensa de piernas', 'Extensión de piernas', 'Extensión de cuádriceps', 'Zancadas', 'Step ups (subida al cajón)', 'Curl de piernas', 'Curl femoral unilateral', 'Curl femoral de pie', 'Peso muerto rumano', 'Peso muerto convencional', 'Buenos días (good morning)'] },
    'Glúteos': { icon: '🍑', exercises: ['Puente de glúteos', 'Puente de glúteos / hip thrust', 'Hip thrust'] },
    'Gemelos': { icon: '🦶', exercises: ['Gemelos de pie', 'Gemelos', 'Gemelos sentado', 'Elevación de talones en prensa'] },
    'Core': { icon: '🧱', exercises: ['Crunch en polea', 'Crunch en polea + plancha', 'Abdominales', 'Abdominales en banco declinado', 'Plancha (plank)', 'Elevación de piernas colgado', 'abdo elevacion de piernas', 'abdominal crunch 90grados', 'crunch cruzados'] },
    'Cardio / Otro': { icon: '🏃', exercises: ['Partido de fútbol', 'Bici 9km+9km'] }
};

// Mapa inverso normalizado (nombre -> grupo), armado una sola vez.
const EXERCISE_TO_MUSCLE_GROUP = {};

Object.entries(MUSCLE_GROUPS).forEach(([group, def]) => {
    def.exercises.forEach(name => { EXERCISE_TO_MUSCLE_GROUP[normalizeForCompare(name)] = group; });
});

