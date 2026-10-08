// Programas prearmados y progresión doble. Sin pantalla: se prueba en tests/programs.test.js.
// Script clásico (no módulo): comparte el ámbito global con el resto de la app.
//
// Progresión doble: cada ejercicio tiene un rango de reps (ej. 8-12). Con el mismo peso se
// suben reps sesión a sesión; cuando TODAS las series llegan al tope del rango, se sube el
// peso y se vuelve al mínimo del rango. Es la regla más usada para ganar músculo y fuerza
// sin estancarse, y funciona sin internet porque solo mira la última sesión.

// Exercise spec: [nombre, series, repsMin, repsMax, descanso s, opciones]
//   opciones: { inc: kg a sumar, type: 'bw' (peso corporal) }
const programExercise = (name, sets, repsMin, repsMax, rest, opts = {}) => ({ name, sets, repsMin, repsMax, rest, inc: 2.5, ...opts });

const PROGRAMS = [
    {
        id: 'full3',
        name: 'Cuerpo completo 3 días',
        short: 'Completo',
        level: 'Principiante',
        tier: 'free',
        weeks: 8,
        weekdays: [1, 3, 5],
        description: 'Dos rutinas (A y B) que se alternan tres veces por semana. Todo el cuerpo en cada sesión: ideal para empezar o volver.',
        days: [
            { key: 'A', name: 'Día A', exercises: [
                programExercise('Sentadilla goblet', 3, 8, 12, 120, { inc: 2 }),
                programExercise('Press de banca con mancuernas', 3, 8, 12, 120, { inc: 2 }),
                programExercise('Jalón al pecho', 3, 10, 12, 90, { inc: 5 }),
                programExercise('Press militar con mancuernas', 2, 10, 12, 90, { inc: 2 }),
                programExercise('Curl de piernas', 2, 10, 15, 75, { inc: 5 }),
                programExercise('Abdominales', 2, 12, 20, 60, { type: 'bw' })
            ] },
            { key: 'B', name: 'Día B', exercises: [
                programExercise('Peso muerto rumano', 3, 8, 12, 120, { inc: 5 }),
                programExercise('Press inclinado con barra', 3, 8, 12, 120),
                programExercise('Remo sentado', 3, 10, 12, 90, { inc: 5 }),
                programExercise('Elevaciones laterales', 2, 12, 15, 60, { inc: 1 }),
                programExercise('Tríceps en polea', 2, 10, 15, 60, { inc: 5 }),
                programExercise('Curl de bíceps', 2, 10, 15, 60, { inc: 1 })
            ] }
        ]
    },
    {
        id: 'home3',
        name: 'En casa sin equipamiento',
        short: 'Casa',
        level: 'Principiante',
        tier: 'free',
        weeks: 6,
        weekdays: [1, 3, 5],
        description: 'Una rutina con el peso del cuerpo, tres veces por semana. Se progresa sumando reps; al llegar arriba, se pasa a una variante más difícil.',
        days: [
            { key: 'A', name: 'Rutina', exercises: [
                programExercise('Flexiones de brazos (push-ups)', 3, 8, 15, 90, { type: 'bw' }),
                programExercise('Sentadilla', 3, 12, 20, 90, { type: 'bw' }),
                programExercise('Zancadas', 3, 10, 15, 90, { type: 'bw' }),
                programExercise('Puente de glúteos', 3, 12, 20, 60, { type: 'bw' }),
                programExercise('Fondos en banco', 3, 8, 15, 75, { type: 'bw' }),
                programExercise('Abdominales', 3, 12, 20, 60, { type: 'bw' })
            ] }
        ]
    },
    {
        id: 'strength5',
        name: 'Fuerza base 5×5',
        short: 'Fuerza',
        level: 'Principiante',
        tier: 'pro',
        weeks: 12,
        weekdays: [1, 3, 5],
        description: 'Básicos con barra a 5 series de 5. Si completás las 25 reps, la próxima vez sumás peso (piernas de a 5 kg, torso de a 2,5 kg).',
        days: [
            { key: 'A', name: 'Día A', exercises: [
                programExercise('Sentadilla con barra', 5, 5, 5, 180, { inc: 5 }),
                programExercise('Press de pecho', 5, 5, 5, 180),
                programExercise('Remo en máquina', 5, 5, 5, 150, { inc: 5 })
            ] },
            { key: 'B', name: 'Día B', exercises: [
                programExercise('Sentadilla con barra', 5, 5, 5, 180, { inc: 5 }),
                programExercise('Press de hombros', 5, 5, 5, 180),
                programExercise('Peso muerto convencional', 1, 5, 5, 240, { inc: 5 })
            ] }
        ]
    },
    {
        id: 'upperlower4',
        name: 'Torso / Pierna 4 días',
        short: 'Torso-Pierna',
        level: 'Intermedio',
        tier: 'pro',
        weeks: 10,
        weekdays: [1, 2, 4, 5],
        description: 'Cuatro sesiones: dos de torso y dos de pierna. Cada músculo se entrena dos veces por semana, dentro del rango ideal de series.',
        days: [
            { key: 'TA', name: 'Torso A', exercises: [
                programExercise('Press de pecho', 4, 6, 10, 150),
                programExercise('Remo sentado', 4, 8, 12, 120, { inc: 5 }),
                programExercise('Press militar con mancuernas', 3, 8, 12, 90, { inc: 2 }),
                programExercise('Jalón al pecho', 3, 10, 12, 90, { inc: 5 }),
                programExercise('Curl de bíceps', 2, 10, 15, 60, { inc: 1 }),
                programExercise('Tríceps en polea', 2, 10, 15, 60, { inc: 5 })
            ] },
            { key: 'PA', name: 'Pierna A', exercises: [
                programExercise('Sentadilla con barra', 4, 6, 10, 180, { inc: 5 }),
                programExercise('Peso muerto rumano', 3, 8, 12, 150, { inc: 5 }),
                programExercise('Extensión de piernas', 3, 10, 15, 75, { inc: 5 }),
                programExercise('Curl de piernas', 3, 10, 15, 75, { inc: 5 }),
                programExercise('Gemelos de pie', 3, 10, 15, 60, { inc: 5 })
            ] },
            { key: 'TB', name: 'Torso B', exercises: [
                programExercise('Press inclinado con barra', 4, 8, 12, 120),
                programExercise('Remo con mancuerna a un brazo', 3, 8, 12, 90, { inc: 2 }),
                programExercise('Aperturas en mariposa', 3, 10, 15, 75, { inc: 5 }),
                programExercise('Elevaciones laterales', 3, 12, 15, 60, { inc: 1 }),
                programExercise('Face pull', 2, 12, 15, 60, { inc: 5 }),
                programExercise('Curl martillo', 2, 10, 15, 60, { inc: 1 })
            ] },
            { key: 'PB', name: 'Pierna B', exercises: [
                programExercise('Prensa de piernas', 4, 8, 12, 150, { inc: 10 }),
                programExercise('Sentadilla búlgara', 3, 8, 12, 90, { inc: 2 }),
                programExercise('Hip thrust', 3, 8, 12, 120, { inc: 5 }),
                programExercise('Curl de piernas', 3, 10, 15, 75, { inc: 5 }),
                programExercise('Elevación de piernas colgado', 3, 10, 15, 60, { type: 'bw' })
            ] }
        ]
    },
    {
        id: 'ppl3',
        name: 'Empuje / Tirón / Pierna',
        short: 'PPL',
        level: 'Intermedio',
        tier: 'pro',
        weeks: 10,
        weekdays: [1, 3, 5],
        description: 'Tres sesiones por movimiento: empujes (pecho, hombros, tríceps), tirones (espalda, bíceps) y pierna. Se puede hacer dos vueltas por semana (6 días).',
        days: [
            { key: 'PUSH', name: 'Empuje', exercises: [
                programExercise('Press de pecho', 4, 6, 10, 150),
                programExercise('Press inclinado con barra', 3, 8, 12, 120),
                programExercise('Press de hombros', 3, 8, 12, 120),
                programExercise('Elevaciones laterales', 3, 12, 15, 60, { inc: 1 }),
                programExercise('Extensión en polea con cuerda', 3, 10, 15, 60, { inc: 5 })
            ] },
            { key: 'PULL', name: 'Tirón', exercises: [
                programExercise('Jalón al pecho', 4, 8, 12, 120, { inc: 5 }),
                programExercise('Remo sentado', 4, 8, 12, 120, { inc: 5 }),
                programExercise('Remo con mancuerna a un brazo', 3, 8, 12, 90, { inc: 2 }),
                programExercise('Face pull', 3, 12, 15, 60, { inc: 5 }),
                programExercise('Curl de bíceps', 3, 10, 15, 60, { inc: 1 })
            ] },
            { key: 'LEGS', name: 'Pierna', exercises: [
                programExercise('Sentadilla con barra', 4, 6, 10, 180, { inc: 5 }),
                programExercise('Peso muerto rumano', 3, 8, 12, 150, { inc: 5 }),
                programExercise('Prensa de piernas', 3, 10, 15, 120, { inc: 10 }),
                programExercise('Curl de piernas', 3, 10, 15, 75, { inc: 5 }),
                programExercise('Gemelos de pie', 4, 10, 15, 60, { inc: 5 })
            ] }
        ]
    },
    {
        id: 'glutes2',
        name: 'Glúteos y piernas',
        short: 'Glúteos',
        level: 'Todos',
        tier: 'pro',
        weeks: 8,
        weekdays: [2, 5],
        description: 'Dos sesiones por semana centradas en glúteos y piernas. Se combina bien con uno o dos días de torso.',
        days: [
            { key: 'G1', name: 'Día 1', exercises: [
                programExercise('Hip thrust', 4, 8, 12, 120, { inc: 5 }),
                programExercise('Sentadilla goblet', 3, 10, 15, 90, { inc: 2 }),
                programExercise('Peso muerto rumano', 3, 8, 12, 120, { inc: 5 }),
                programExercise('Curl de piernas', 3, 10, 15, 75, { inc: 5 })
            ] },
            { key: 'G2', name: 'Día 2', exercises: [
                programExercise('Sentadilla búlgara', 3, 8, 12, 90, { inc: 2 }),
                programExercise('Puente de glúteos', 3, 12, 20, 75, { inc: 5 }),
                programExercise('Prensa de piernas', 3, 10, 15, 120, { inc: 10 }),
                programExercise('Step ups (subida al cajón)', 3, 10, 12, 75, { inc: 2 })
            ] }
        ]
    }
];

function findProgram(id) {
    return PROGRAMS.find(p => p.id === id) || null;
}

/** Clave de rutina para un día de un programa (no choca con las rutinas del usuario). */
function programRoutineKey(programId, dayKey) {
    return `PRG_${programId}_${dayKey}`.toUpperCase();
}

/**
 * Qué hacer hoy en un ejercicio con progresión doble, según la última sesión.
 * lastSets: series de la última vez ({ reps, kg, warmup }, como se guardan).
 * target: { sets, repsMin, repsMax, inc, type }.
 * Devuelve { action, kg, reps: [reps por serie], text }:
 *   'start'  sin historial: arrancar abajo del rango con un peso cómodo
 *   'reps'   mismo peso, una rep más en las series que no llegaron al tope
 *   'weight' todas llegaron al tope: subir peso y volver al mínimo del rango
 *   'repeat' no se llegó al mínimo: repetir el peso apuntando al mínimo
 *   'level'  (peso corporal) todas al tope: pasar a una variante más difícil o sumar lastre
 */
function suggestDoubleProgression(lastSets, target) {
    const { sets, repsMin, repsMax } = target;
    const inc = target.inc > 0 ? target.inc : 2.5;
    const unit = target.unit || 'kg'; // unidad de los pesos que se reciben y se devuelven
    const pilates = target.type === 'pilates' || target.type === 'springs';
    const bodyweight = target.type === 'bw' || pilates;
    const fill = n => Array.from({ length: sets }, () => n);
    const work = (lastSets || [])
        .filter(s => s && !s.warmup)
        .map(s => ({ reps: parseInt(s.reps, 10) || 0, kg: parseDecimal(s.kg) || 0 }))
        .filter(s => s.reps > 0);

    if (work.length === 0) {
        const text = pilates
            ? `Primera vez: ${repsMin} reps lentas y con control; la técnica está en la ficha.`
            : bodyweight
            ? `Primera vez: hacé ${repsMin} reps por serie con buena técnica.`
            : `Primera vez: elegí un peso con el que llegues a ${repsMin} reps dejando 2 o 3 en reserva.`;
        return { action: 'start', kg: null, reps: fill(repsMin), text };
    }

    const kg = bodyweight ? null : Math.max(...work.map(s => s.kg));
    const atTop = bodyweight ? work : work.filter(s => s.kg === kg);
    const reps = Array.from({ length: sets }, (_, i) => atTop[i] ? atTop[i].reps : 0);
    const allAtMax = atTop.length >= sets && reps.every(r => r >= repsMax);

    if (allAtMax) {
        if (pilates) {
            return { action: 'level', kg: null, reps: fill(repsMax), text: `Llegaste a ${repsMax}: pasá a la versión más difícil (mirá la ficha) o ajustá el resorte.` };
        }
        if (bodyweight) {
            return { action: 'level', kg: null, reps: fill(repsMax), text: `Llegaste a ${repsMax} en todas: pasá a una variante más difícil, sumá lastre o una serie.` };
        }
        const next = Math.round((kg + inc) * 100) / 100;
        return { action: 'weight', kg: next, reps: fill(repsMin), text: `¡Subí el peso! ${formatNumber(next)} ${unit} (+${formatNumber(inc)}) y volvé a ${repsMin} reps.` };
    }
    if (reps.every(r => r < repsMin)) {
        return { action: 'repeat', kg, reps: fill(repsMin), text: `Mismo peso${kg ? ` (${formatNumber(kg)} ${unit})` : ''}: apuntá a ${repsMin} reps en cada serie.` };
    }
    const nextReps = reps.map(r => Math.min(repsMax, Math.max(repsMin, r + 1)));
    return { action: 'reps', kg, reps: nextReps, text: `Mismo peso${kg ? ` (${formatNumber(kg)} ${unit})` : ''}, una rep más: ${nextReps.join('-')}. Al llegar a ${repsMax} en todas, subís.` };
}
