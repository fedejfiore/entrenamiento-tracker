// Programas de pilates (mat y reformer). Se suman a PROGRAMS y solo se ofrecen en el módulo
// Pilates a quien entrena esa disciplina (discipline: 'mat' | 'reformer').
// La progresión es la doble de siempre, como en peso corporal: primero reps y, al llegar al
// tope en todas las series, pasar a la versión más difícil (ver la ficha) o ajustar el
// resorte según el sentido de dificultad del ejercicio.
// Script clásico (no módulo): comparte el ámbito global con el resto de la app.

const pilatesProgramEx = (name, sets, repsMin, repsMax, type = 'pilates') => programExercise(name, sets, repsMin, repsMax, 0, { type });

PROGRAMS.push(
    {
        id: 'pmat1', discipline: 'mat',
        name: 'Pilates mat: primeros pasos', short: 'Mat inicial', level: 'Principiante', tier: 'free', weeks: 6, weekdays: [1, 3, 5],
        description: 'Fundamentos y los clásicos más simples, en dos clases que se alternan (25 minutos). Respiración, centro y control antes que cantidad.',
        days: [
            { key: 'A', name: 'Clase A', exercises: [
                pilatesProgramEx('Báscula pélvica (impronta)', 1, 6, 10),
                pilatesProgramEx('Puente articulado', 1, 6, 10),
                pilatesProgramEx('Los cien (Hundred)', 1, 6, 10),
                pilatesProgramEx('Círculos con una pierna', 1, 5, 8),
                pilatesProgramEx('Estiramiento de una pierna', 1, 6, 10),
                pilatesProgramEx('Estiramiento de columna adelante', 1, 4, 6),
                pilatesProgramEx('Cuadrupedia con brazo y pierna', 1, 6, 10),
                pilatesProgramEx('Preparación del cisne', 1, 4, 6)
            ] },
            { key: 'B', name: 'Clase B', exercises: [
                pilatesProgramEx('Marcha en mesa', 1, 8, 12),
                pilatesProgramEx('Elevación de pecho', 1, 8, 12),
                pilatesProgramEx('Rodar como una pelota', 1, 6, 10),
                pilatesProgramEx('Sierra', 1, 3, 5),
                pilatesProgramEx('Rotación de columna', 1, 3, 5),
                pilatesProgramEx('Patadas laterales adelante y atrás', 1, 6, 10),
                pilatesProgramEx('Almeja', 1, 10, 15),
                pilatesProgramEx('Natación', 1, 10, 20)
            ] }
        ]
    },
    {
        id: 'pmat2', discipline: 'mat',
        name: 'Pilates mat: los clásicos', short: 'Mat clásico', level: 'Intermedio', tier: 'free', weeks: 8, weekdays: [1, 3, 5],
        description: 'El orden clásico del método en dos clases (35 minutos). Pide un buen control del centro: hacelo después de "primeros pasos".',
        days: [
            { key: 'A', name: 'Clase A', exercises: [
                pilatesProgramEx('Los cien (Hundred)', 1, 8, 10),
                pilatesProgramEx('Enrollarse (Roll up)', 1, 4, 6),
                pilatesProgramEx('Círculos con una pierna', 1, 5, 8),
                pilatesProgramEx('Rodar como una pelota', 1, 6, 10),
                pilatesProgramEx('Estiramiento de una pierna', 1, 8, 10),
                pilatesProgramEx('Estiramiento de dos piernas', 1, 6, 10),
                pilatesProgramEx('Tijera con pierna recta', 1, 6, 10),
                pilatesProgramEx('Entrecruzado (Criss cross)', 1, 4, 6),
                pilatesProgramEx('Estiramiento de columna adelante', 1, 4, 6),
                pilatesProgramEx('Sierra', 1, 3, 5)
            ] },
            { key: 'B', name: 'Clase B', exercises: [
                pilatesProgramEx('Los cien (Hundred)', 1, 8, 10),
                pilatesProgramEx('Balancín con piernas abiertas', 1, 4, 6),
                pilatesProgramEx('Patada con una pierna', 1, 5, 8),
                pilatesProgramEx('Patada con dos piernas', 1, 3, 5),
                pilatesProgramEx('Puente de hombros', 1, 3, 5),
                pilatesProgramEx('Rotación de columna', 1, 3, 5),
                pilatesProgramEx('Patadas laterales arriba y abajo', 1, 6, 10),
                pilatesProgramEx('Preparación de la uve (Teaser)', 1, 3, 5),
                pilatesProgramEx('Natación', 1, 10, 20),
                pilatesProgramEx('Foca', 1, 6, 8)
            ] }
        ]
    },
    {
        id: 'pmatprops', discipline: 'mat',
        name: 'Pilates mat con elementos', short: 'Mat elementos', level: 'Principiante', tier: 'free', weeks: 6, weekdays: [2, 4],
        description: 'Pelota, banda y aro para sumar resistencia y feedback (30 minutos). Elegí el nivel de cada elemento una vez y subilo al llegar al tope.',
        days: [
            { key: 'A', name: 'Clase', exercises: [
                pilatesProgramEx('Puente apretando la pelota', 1, 8, 12),
                pilatesProgramEx('Elevación de pecho con pelota', 1, 8, 12),
                pilatesProgramEx('Los cien con aro', 1, 6, 10),
                pilatesProgramEx('Aductores con aro', 1, 10, 15),
                pilatesProgramEx('Remo sentado con banda', 1, 10, 15),
                pilatesProgramEx('Expansión de pecho con banda', 1, 8, 12),
                pilatesProgramEx('Almeja con banda', 1, 10, 15),
                pilatesProgramEx('Rotación sentado con pelota', 1, 6, 10)
            ] }
        ]
    },
    {
        id: 'pref1', discipline: 'reformer',
        name: 'Reformer: primeros pasos', short: 'Reformer inicial', level: 'Principiante', tier: 'free', weeks: 6, weekdays: [2, 4],
        description: 'Footwork, abdominales, correas y brazos (40 minutos). La app te sugiere los resortes de cada ejercicio según tu reformer.',
        days: [
            { key: 'A', name: 'Clase', exercises: [
                pilatesProgramEx('Footwork: dedos', 1, 8, 10, 'springs'),
                pilatesProgramEx('Footwork: talones', 1, 8, 10, 'springs'),
                pilatesProgramEx('Footwork: posición en V', 1, 8, 10, 'springs'),
                pilatesProgramEx('Elevación de talones en reformer', 1, 8, 10, 'springs'),
                pilatesProgramEx('Puente en reformer', 1, 6, 8, 'springs'),
                pilatesProgramEx('Ranas', 1, 8, 10, 'springs'),
                pilatesProgramEx('Círculos de piernas en correas', 1, 5, 6, 'springs'),
                pilatesProgramEx('Brazos acostado: bajar', 1, 8, 10, 'springs'),
                pilatesProgramEx('Expansión de pecho de rodillas', 1, 6, 8, 'springs'),
                pilatesProgramEx('Estiramiento de rodillas: espalda redonda', 1, 8, 10, 'springs'),
                pilatesProgramEx('Sirena en reformer', 1, 3, 4, 'springs')
            ] }
        ]
    },
    {
        id: 'pref2', discipline: 'reformer',
        name: 'Reformer intermedio', short: 'Reformer inter.', level: 'Intermedio', tier: 'free', weeks: 8, weekdays: [1, 3, 5],
        description: 'Dos clases que se alternan, con caja larga y corta, planchas y trabajo de pie (45 minutos).',
        days: [
            { key: 'A', name: 'Clase A', exercises: [
                pilatesProgramEx('Footwork: dedos', 1, 8, 10, 'springs'),
                pilatesProgramEx('Footwork a una pierna', 1, 6, 8, 'springs'),
                pilatesProgramEx('Los cien en reformer', 1, 8, 10, 'springs'),
                pilatesProgramEx('Coordinación', 1, 4, 6, 'springs'),
                pilatesProgramEx('Tirón de correas', 1, 6, 8, 'springs'),
                pilatesProgramEx('Tirón en T', 1, 6, 8, 'springs'),
                pilatesProgramEx('Caja corta: espalda redonda', 1, 4, 6, 'springs'),
                pilatesProgramEx('Caja corta: rotación', 1, 3, 4, 'springs'),
                pilatesProgramEx('Estiramiento largo (Long stretch)', 1, 4, 5, 'springs'),
                pilatesProgramEx('Elefante', 1, 6, 8, 'springs')
            ] },
            { key: 'B', name: 'Clase B', exercises: [
                pilatesProgramEx('Footwork: talones', 1, 8, 10, 'springs'),
                pilatesProgramEx('Puente a una pierna en reformer', 1, 6, 8, 'springs'),
                pilatesProgramEx('Aperturas de piernas', 1, 6, 8, 'springs'),
                pilatesProgramEx('Remo hacia atrás', 1, 4, 6, 'springs'),
                pilatesProgramEx('Remo adelante: abrazo', 1, 6, 8, 'springs'),
                pilatesProgramEx('Estiramiento hacia abajo (Down stretch)', 1, 4, 5, 'springs'),
                pilatesProgramEx('Estiramiento de rodillas: espalda arqueada', 1, 8, 10, 'springs'),
                pilatesProgramEx('Patinador (Scooter)', 1, 8, 10, 'springs'),
                pilatesProgramEx('Divisiones laterales', 1, 6, 8, 'springs'),
                pilatesProgramEx('Sirena en reformer', 1, 3, 4, 'springs')
            ] }
        ]
    }
);
