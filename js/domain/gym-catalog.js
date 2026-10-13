// Catálogo de gimnasio: ejercicios con su ficha (músculo principal y secundarios, equipo,
// nivel, cómo se hace, errores comunes con su corrección, precauciones y alternativas). Los
// errores y las precauciones que se repiten están una sola vez y cada ejercicio dice cuáles le
// tocan. Inspirado en la forma de buscar de MuscleWiki (por músculo y por equipo), con
// contenido propio. Orientativo: no reemplaza a un profesional.
// Script clásico (no módulo): comparte el ámbito global con el resto de la app.

const GYM_LEVELS = { 1: 'Principiante', 2: 'Intermedio', 3: 'Avanzado' };

const GYM_EQUIPMENT = {
    barbell: ['🏋️', 'Barra'],
    dumbbell: ['💪', 'Mancuernas'],
    machine: ['⚙️', 'Máquina'],
    cable: ['🪢', 'Polea'],
    bodyweight: ['🤸', 'Peso corporal'],
    kettlebell: ['🔔', 'Kettlebell'],
    band: ['🎗️', 'Banda elástica']
};

// [error, cómo corregirlo]
const GYM_ERRORS = {
    back: ['La espalda se redondea', 'Pecho alto y columna neutra; si no podés mantenerla, bajá el peso.'],
    arch: ['La zona lumbar se arquea de más', 'Apretá abdomen y glúteos y llevá las costillas hacia abajo.'],
    knees: ['Las rodillas se van hacia adentro', 'Empujá las rodillas en la dirección de la punta de los pies.'],
    heels: ['Los talones se despegan', 'Repartí el peso en todo el pie y empujá con el medio del pie.'],
    swing: ['Se usa impulso o se balancea el cuerpo', 'Bajá el peso: subí en 1 o 2 segundos y bajá en 2 o 3.'],
    shoulders: ['Los hombros suben hacia las orejas', 'Hombros abajo y atrás antes de empezar cada repetición.'],
    range: ['Se hace medio recorrido', 'Usá todo el rango que puedas controlar, aunque sea con menos peso.'],
    elbows: ['Los codos se abren en cruz', 'Codos a unos 45 grados del cuerpo.'],
    elbowsmove: ['Los codos se van hacia adelante y atrás', 'Codos fijos al costado del cuerpo: solo se mueve el antebrazo.'],
    lockout: ['Se trancan las rodillas o los codos de golpe', 'Extendé del todo pero sin bloquear de golpe.'],
    drop: ['La bajada es de golpe', 'Controlá la bajada: es la mitad del ejercicio.'],
    neck: ['El cuello se adelanta o se tira hacia atrás', 'Mirada neutra y mentón levemente adentro.'],
    hips: ['La cadera se hunde o queda muy alta', 'Formá una línea de la cabeza a los talones con abdomen y glúteos activos.'],
    wrists: ['Las muñecas se doblan hacia atrás', 'Muñecas firmes y en línea con el antebrazo.'],
    torso: ['El torso gira o se inclina para ayudar', 'Torso quieto: si tenés que moverlo, el peso es demasiado.'],
    breath: ['Se contiene el aire toda la serie', 'Exhalá en el esfuerzo e inhalá en la bajada.'],
    pull: ['Se tira con los brazos y no con la espalda', 'Empezá llevando los omóplatos atrás y abajo; después doblá los codos.']
};

const GYM_CAUTIONS = {
    lowback: 'Con dolor lumbar, empezá liviano y priorizá la técnica; si duele, cambiá por una variante con apoyo.',
    shoulder: 'Con molestias de hombro, achicá el rango y evitá llevar los brazos por detrás de la línea del cuerpo.',
    knee: 'Con dolor de rodilla, limitá la profundidad a un rango sin dolor.',
    spotter: 'Con mucho peso, usá los topes de seguridad o pedí que alguien te asista.',
    pressure: 'Con presión alta, no contengas el aire y evitá las posiciones con la cabeza abajo.',
    wrist: 'Con dolor de muñecas, usá un agarre neutro o apoyá los puños.'
};

const GYM_EXERCISES = [];

/**
 * Agrega un ejercicio al catálogo.
 * lvl 1-3; muscle: grupo de MUSCLE_GROUPS; equip: clave de GYM_EQUIPMENT; type: tipo de medición.
 * opts: also (otros músculos), steps, err (claves de GYM_ERRORS o [error, corrección]),
 * caution (claves de GYM_CAUTIONS), alt (alternativas: nombres de otros ejercicios),
 * aliases (otros nombres con los que aparece en las rutinas).
 */
function gymEx(name, en, lvl, muscle, equip, type, opts) {
    GYM_EXERCISES.push({ name, en, lvl, muscle, equip, type, also: [], steps: [], err: [], caution: [], alt: [], aliases: [], ...opts });
}

// ===================== PECHO =====================
gymEx('Press de pecho', 'machine chest press', 1, 'Pecho', 'machine', 'kg', {
    also: ['Tríceps', 'Hombros'], aliases: ['Press cerrado en máquina'],
    steps: ['Regulá el asiento para que las manijas queden a la altura del medio del pecho.', 'Exhalá y empujá hasta casi extender los codos, con la espalda apoyada.', 'Inhalá y volvé despacio hasta sentir el estiramiento del pecho.'],
    err: ['shoulders', 'elbows', 'drop'], alt: ['Press de banca con barra', 'Press de banca con mancuernas', 'Flexiones de brazos (push-ups)']
});
gymEx('Press de banca con barra', 'barbell bench press', 2, 'Pecho', 'barbell', 'kg', {
    also: ['Tríceps', 'Hombros'], caution: ['spotter', 'shoulder'],
    steps: ['Acostate con los ojos debajo de la barra, omóplatos juntos y pies firmes en el piso.', 'Bajá la barra controlada hasta rozar la parte baja del pecho, codos a 45 grados.', 'Empujá hacia arriba y un poco hacia atrás hasta extender los brazos.'],
    err: ['elbows', 'arch', ['La barra rebota en el pecho', 'Hacé una pausa corta abajo y empujá sin rebote.']], alt: ['Press de pecho', 'Press de banca con mancuernas']
});
gymEx('Press de banca con mancuernas', 'dumbbell bench press', 1, 'Pecho', 'dumbbell', 'kg', {
    also: ['Tríceps', 'Hombros'],
    steps: ['Acostate en el banco con una mancuerna en cada mano a la altura del pecho.', 'Exhalá y empujá hacia arriba juntando apenas las mancuernas.', 'Inhalá y bajá controlado hasta que los codos queden un poco por debajo del banco.'],
    err: ['elbows', 'shoulders', 'drop'], alt: ['Press de banca con barra', 'Press de pecho']
});
gymEx('Press inclinado con barra', 'incline barbell bench press', 2, 'Pecho', 'barbell', 'kg', {
    also: ['Hombros', 'Tríceps'], caution: ['spotter', 'shoulder'],
    steps: ['Banco a 30 grados, omóplatos juntos y pies firmes.', 'Bajá la barra hasta la parte alta del pecho, debajo de las clavículas.', 'Empujá hasta extender los brazos sin despegar la espalda.'],
    err: ['elbows', 'arch', 'drop'], alt: ['Press inclinado con mancuernas', 'Press de pecho']
});
gymEx('Press inclinado con mancuernas', 'incline dumbbell press', 1, 'Pecho', 'dumbbell', 'kg', {
    also: ['Hombros', 'Tríceps'],
    steps: ['Banco a 30 grados con las mancuernas a la altura de los hombros.', 'Empujá hacia arriba y hacia adentro sin chocarlas.', 'Bajá despacio hasta sentir el estiramiento en la parte alta del pecho.'],
    err: ['elbows', 'shoulders', 'drop'], alt: ['Press inclinado con barra', 'Press de banca con mancuernas']
});
gymEx('Flexiones de brazos (push-ups)', 'push up', 1, 'Pecho', 'bodyweight', 'bw', {
    also: ['Tríceps', 'Hombros', 'Core'], caution: ['wrist'],
    steps: ['Manos un poco más anchas que los hombros y el cuerpo en línea de la cabeza a los talones.', 'Bajá el pecho hasta casi tocar el piso con los codos a 45 grados.', 'Empujá el piso hasta extender los brazos sin perder la línea.'],
    err: ['hips', 'elbows', 'range'], alt: ['Flexiones con rodillas apoyadas', 'Press de banca con mancuernas']
});
gymEx('Flexiones con rodillas apoyadas', 'knee push up', 1, 'Pecho', 'bodyweight', 'bw', {
    also: ['Tríceps', 'Hombros'], caution: ['wrist'],
    steps: ['Apoyá las rodillas y las manos, con la cadera alineada entre rodillas y hombros.', 'Bajá el pecho hacia el piso con los codos a 45 grados.', 'Empujá hasta extender los brazos.'],
    err: ['hips', 'elbows'], alt: ['Flexiones de brazos (push-ups)']
});
gymEx('Fondos en paralelas', 'chest dips', 3, 'Pecho', 'bodyweight', 'bw', {
    also: ['Tríceps', 'Hombros'], caution: ['shoulder'],
    steps: ['Sostenete en las paralelas con los brazos extendidos y el torso un poco inclinado hacia adelante.', 'Bajá doblando los codos hasta que los hombros queden a la altura de los codos.', 'Empujá hasta extender los brazos.'],
    err: ['shoulders', 'swing', ['Se baja demasiado y duele el hombro', 'Bajá solo hasta que el brazo quede paralelo al piso.']], alt: ['Fondos asistidos en máquina', 'Press de pecho']
});
gymEx('Fondos asistidos en máquina', 'assisted dip machine', 1, 'Pecho', 'machine', 'kg', {
    also: ['Tríceps'],
    steps: ['Elegí el contrapeso (más peso = más ayuda) y apoyá las rodillas en la plataforma.', 'Bajá doblando los codos con el torso apenas inclinado.', 'Empujá hasta extender los brazos.'],
    err: ['shoulders', 'drop'], alt: ['Fondos en paralelas']
});
gymEx('Aperturas en mariposa', 'pec deck fly', 1, 'Pecho', 'machine', 'kg', {
    aliases: ['Mariposa'],
    steps: ['Sentate con la espalda apoyada y los brazos abiertos a la altura del pecho, codos apenas flexionados.', 'Cerrá los brazos al frente apretando el pecho.', 'Volvé despacio hasta sentir el estiramiento, sin pasar la línea de los hombros.'],
    err: ['shoulders', 'drop', ['Se dobla y estira el codo para empujar', 'El ángulo del codo queda fijo: el movimiento es solo del hombro.']], alt: ['Cruces en polea (cable crossover)', 'Aperturas con mancuernas en banco']
});
gymEx('Cruces en polea (cable crossover)', 'cable crossover', 2, 'Pecho', 'cable', 'kg', {
    steps: ['Poleas altas, un paso adelante y el torso apenas inclinado.', 'Llevá las manos hacia abajo y al centro, con los codos levemente flexionados.', 'Volvé despacio abriendo los brazos hasta la línea de los hombros.'],
    err: ['torso', 'shoulders', 'drop'], alt: ['Aperturas en mariposa', 'Aperturas con mancuernas en banco']
});
gymEx('Aperturas con mancuernas en banco', 'dumbbell fly', 2, 'Pecho', 'dumbbell', 'kg', {
    caution: ['shoulder'],
    steps: ['Acostate con las mancuernas arriba del pecho y los codos levemente flexionados.', 'Abrí los brazos en arco hasta sentir el estiramiento, sin pasar la línea del cuerpo.', 'Cerrá en el mismo arco apretando el pecho.'],
    err: ['range', ['Se doblan los codos y se vuelve un press', 'Mantené el mismo ángulo de codo todo el recorrido.']], alt: ['Aperturas en mariposa', 'Cruces en polea (cable crossover)']
});
gymEx('Pullover con mancuerna', 'dumbbell pullover', 2, 'Pecho', 'dumbbell', 'kg', {
    also: ['Espalda'], caution: ['shoulder'],
    steps: ['Acostate en el banco sosteniendo una mancuerna con las dos manos arriba del pecho.', 'Llevá la mancuerna por detrás de la cabeza con los codos levemente flexionados.', 'Volvé arriba del pecho en el mismo arco.'],
    err: ['arch', 'range'], alt: ['Pullover en polea alta']
});

// ===================== ESPALDA =====================
gymEx('Jalón al pecho', 'lat pulldown', 1, 'Espalda', 'cable', 'kg', {
    also: ['Bíceps'], aliases: ['Jalón con agarre ancho'],
    steps: ['Agarrá la barra un poco más ancho que los hombros y trabá las piernas debajo del apoyo.', 'Bajá la barra hasta la parte alta del pecho llevando los codos hacia abajo y atrás.', 'Subí despacio hasta estirar los brazos, sin soltar los hombros de golpe.'],
    err: ['pull', 'swing', ['La barra baja por detrás de la nuca', 'Siempre adelante, hacia el pecho.']], alt: ['Dominadas', 'Dominadas asistidas', 'Jalón con agarre supino']
});
gymEx('Jalón con agarre supino', 'underhand lat pulldown', 1, 'Espalda', 'cable', 'kg', {
    also: ['Bíceps'],
    steps: ['Agarrá la barra con las palmas hacia vos, al ancho de los hombros.', 'Bajá la barra hasta el pecho llevando los codos pegados al cuerpo.', 'Subí controlado hasta estirar los brazos.'],
    err: ['pull', 'swing'], alt: ['Jalón al pecho', 'Dominadas asistidas']
});
gymEx('Dominadas', 'pull up', 3, 'Espalda', 'bodyweight', 'bw', {
    also: ['Bíceps', 'Core'], caution: ['shoulder'],
    steps: ['Colgate de la barra con las palmas hacia adelante, un poco más ancho que los hombros.', 'Subí llevando el pecho hacia la barra hasta pasar el mentón.', 'Bajá controlado hasta estirar los brazos.'],
    err: ['swing', 'range', 'pull'], alt: ['Dominadas asistidas', 'Jalón al pecho']
});
gymEx('Dominadas asistidas', 'assisted pull up machine', 1, 'Espalda', 'machine', 'kg', {
    also: ['Bíceps'],
    steps: ['Elegí el contrapeso (más peso = más ayuda) y apoyá las rodillas.', 'Subí llevando el pecho hacia la barra.', 'Bajá despacio hasta estirar los brazos.'],
    err: ['pull', 'range'], alt: ['Dominadas', 'Jalón al pecho']
});
gymEx('Remo sentado', 'seated cable row', 1, 'Espalda', 'cable', 'kg', {
    also: ['Bíceps'], aliases: ['Remo en polea sentado'],
    steps: ['Sentate con las rodillas apenas flexionadas y la espalda recta.', 'Llevá el agarre hacia el abdomen juntando los omóplatos.', 'Volvé despacio estirando los brazos sin redondear la espalda.'],
    err: ['back', 'swing', 'shoulders'], alt: ['Remo en máquina', 'Remo con mancuerna a un brazo']
});
gymEx('Remo en máquina', 'machine row', 1, 'Espalda', 'machine', 'kg', {
    also: ['Bíceps'],
    steps: ['Pecho apoyado y manijas al alcance con los brazos estirados.', 'Tirá llevando los codos hacia atrás y juntando los omóplatos.', 'Volvé controlado.'],
    err: ['pull', 'shoulders', 'drop'], alt: ['Remo sentado', 'Remo con mancuerna a un brazo']
});
gymEx('Remo con mancuerna a un brazo', 'one arm dumbbell row', 1, 'Espalda', 'dumbbell', 'kg', {
    also: ['Bíceps'],
    steps: ['Apoyá una mano y una rodilla en el banco, espalda recta y paralela al piso.', 'Llevá la mancuerna hacia la cadera con el codo pegado al cuerpo.', 'Bajá despacio hasta estirar el brazo.'],
    err: ['back', 'torso', 'swing'], alt: ['Remo sentado', 'Remo con barra']
});
gymEx('Remo con barra', 'barbell bent over row', 2, 'Espalda', 'barbell', 'kg', {
    also: ['Bíceps', 'Isquios'], caution: ['lowback'],
    steps: ['Inclinate desde la cadera con la espalda recta, rodillas suaves y la barra colgando.', 'Llevá la barra hacia el ombligo juntando los omóplatos.', 'Bajá controlado sin perder la inclinación.'],
    err: ['back', 'swing', ['El torso sube en cada repetición', 'Mantené el mismo ángulo de la espalda toda la serie.']], alt: ['Remo en máquina', 'Remo con mancuerna a un brazo']
});
gymEx('Remo invertido en barra', 'inverted row', 1, 'Espalda', 'bodyweight', 'bw', {
    also: ['Bíceps', 'Core'],
    steps: ['Colgate debajo de una barra baja con el cuerpo recto y los talones apoyados.', 'Llevá el pecho hacia la barra juntando los omóplatos.', 'Bajá controlado hasta estirar los brazos.'],
    err: ['hips', 'pull'], alt: ['Remo sentado', 'Dominadas asistidas']
});
gymEx('Face pull', 'face pull', 1, 'Hombros', 'cable', 'kg', {
    also: ['Espalda'], aliases: ['Face pull en polea'],
    steps: ['Polea a la altura de la cara con una cuerda; agarrá con las palmas hacia abajo.', 'Tirá hacia la cara separando las manos y llevando los codos altos y atrás.', 'Volvé despacio.'],
    err: ['swing', 'shoulders'], alt: ['Pájaros con mancuernas', 'Aperturas invertidas en máquina']
});
gymEx('Pullover en polea alta', 'straight arm cable pulldown', 1, 'Espalda', 'cable', 'kg', {
    aliases: ['Pullover unilateral en polea alta'],
    steps: ['Polea alta con barra o cuerda, un paso atrás y el torso apenas inclinado.', 'Con los brazos casi estirados, llevá el agarre hasta los muslos.', 'Volvé despacio hasta la altura de la cabeza.'],
    err: ['swing', ['Se doblan los codos', 'Brazos casi rectos: el movimiento es del hombro.']], alt: ['Pullover con mancuerna', 'Jalón al pecho']
});
gymEx('Hiperextensiones', 'back extension', 1, 'Espalda', 'bodyweight', 'bw', {
    also: ['Glúteos', 'Isquios'], caution: ['lowback'],
    steps: ['Apoyá la cadera en el banco de hiperextensiones con los pies trabados.', 'Bajá el torso flexionando la cadera con la espalda recta.', 'Subí hasta que el cuerpo quede en línea, sin arquear de más.'],
    err: ['arch', 'swing'], alt: ['Buenos días (good morning)', 'Peso muerto rumano']
});
gymEx('Encogimientos de hombros', 'dumbbell shrug', 1, 'Espalda', 'dumbbell', 'kg', {
    steps: ['De pie con una mancuerna en cada mano y los brazos estirados.', 'Subí los hombros hacia las orejas.', 'Sostené un segundo y bajá despacio.'],
    err: ['swing', ['Se rotan los hombros en círculo', 'Solo arriba y abajo.']], alt: []
});

// ===================== HOMBROS =====================
gymEx('Press de hombros', 'machine shoulder press', 1, 'Hombros', 'machine', 'kg', {
    also: ['Tríceps'], caution: ['shoulder'],
    steps: ['Regulá el asiento para que las manijas queden a la altura de los hombros.', 'Empujá hacia arriba hasta casi extender los codos.', 'Bajá despacio hasta la altura de las orejas.'],
    err: ['arch', 'drop'], alt: ['Press militar con mancuernas', 'Press Arnold']
});
gymEx('Press militar con mancuernas', 'seated dumbbell shoulder press', 2, 'Hombros', 'dumbbell', 'kg', {
    also: ['Tríceps'], caution: ['shoulder'],
    steps: ['Sentate con la espalda apoyada y las mancuernas a la altura de los hombros.', 'Empujá hacia arriba hasta casi juntarlas.', 'Bajá controlado hasta la altura de las orejas.'],
    err: ['arch', 'elbows', 'drop'], alt: ['Press de hombros', 'Press militar con barra']
});
gymEx('Press militar con barra', 'overhead press', 3, 'Hombros', 'barbell', 'kg', {
    also: ['Tríceps', 'Core'], caution: ['shoulder', 'lowback'],
    steps: ['De pie, la barra apoyada adelante de los hombros y los glúteos apretados.', 'Empujá la barra hacia arriba pasando la cara y meté la cabeza debajo al final.', 'Bajá controlado hasta los hombros.'],
    err: ['arch', 'neck', 'drop'], alt: ['Press militar con mancuernas', 'Press de hombros']
});
gymEx('Press Arnold', 'arnold press', 2, 'Hombros', 'dumbbell', 'kg', {
    also: ['Tríceps'], caution: ['shoulder'],
    steps: ['Sentado, las mancuernas frente a la cara con las palmas hacia vos.', 'Empujá hacia arriba girando las palmas hacia adelante.', 'Bajá deshaciendo el giro.'],
    err: ['arch', 'swing'], alt: ['Press militar con mancuernas']
});
gymEx('Elevaciones laterales', 'dumbbell lateral raise', 1, 'Hombros', 'dumbbell', 'kg', {
    steps: ['De pie con una mancuerna en cada mano y los codos apenas flexionados.', 'Subí los brazos hacia los costados hasta la altura de los hombros.', 'Bajá despacio.'],
    err: ['swing', 'shoulders', ['Las mancuernas suben más que los codos', 'Guiá con los codos, como si vaciaras una jarra apenas.']], alt: ['Elevaciones laterales en polea', 'Vuelos laterales unilaterales con polea baja']
});
gymEx('Elevaciones laterales en polea', 'cable lateral raise', 2, 'Hombros', 'cable', 'kg', {
    steps: ['Polea baja al costado; agarrá con la mano del lado opuesto.', 'Subí el brazo al costado hasta la altura del hombro.', 'Bajá controlado sin que el peso toque abajo.'],
    err: ['torso', 'shoulders'], alt: ['Elevaciones laterales']
});
gymEx('Vuelos laterales unilaterales con polea baja', 'single arm cable lateral raise', 2, 'Hombros', 'cable', 'kg', {
    steps: ['De costado a la polea baja, agarrá el cable con la mano más lejana.', 'Subí el brazo al costado hasta la altura del hombro con el codo apenas flexionado.', 'Bajá despacio, manteniendo la tensión.'],
    err: ['torso', 'shoulders', 'swing'], alt: ['Elevaciones laterales en polea', 'Elevaciones laterales']
});
gymEx('Elevaciones frontales', 'dumbbell front raise', 1, 'Hombros', 'dumbbell', 'kg', {
    steps: ['De pie con las mancuernas adelante de los muslos.', 'Subí los brazos al frente hasta la altura de los hombros.', 'Bajá despacio.'],
    err: ['swing', 'arch'], alt: ['Elevaciones laterales', 'Press de hombros']
});
gymEx('Pájaros con mancuernas', 'dumbbell rear delt fly', 2, 'Hombros', 'dumbbell', 'kg', {
    also: ['Espalda'],
    steps: ['Inclinate desde la cadera con la espalda recta y las mancuernas colgando.', 'Abrí los brazos hacia los costados con los codos apenas flexionados.', 'Bajá despacio.'],
    err: ['back', 'swing'], alt: ['Aperturas invertidas en máquina', 'Face pull']
});
gymEx('Aperturas invertidas en máquina', 'reverse pec deck', 1, 'Hombros', 'machine', 'kg', {
    also: ['Espalda'],
    steps: ['Sentate mirando la máquina con el pecho apoyado.', 'Abrí los brazos hacia atrás hasta la línea del cuerpo.', 'Volvé controlado.'],
    err: ['shoulders', 'swing'], alt: ['Pájaros con mancuernas', 'Face pull']
});
gymEx('Elevación de barra al mentón', 'barbell upright row', 2, 'Hombros', 'barbell', 'kg', {
    also: ['Espalda'], caution: ['shoulder'],
    steps: ['De pie con la barra adelante y las manos un poco más anchas que los hombros.', 'Subí la barra pegada al cuerpo llevando los codos hacia los costados, hasta el pecho.', 'Bajá despacio.'],
    err: ['swing', ['Se sube demasiado y molesta el hombro', 'Subí solo hasta que los codos lleguen a la altura de los hombros.']], alt: ['Remo al mentón con mancuernas', 'Elevaciones laterales']
});
gymEx('Remo al mentón con mancuernas', 'dumbbell upright row', 2, 'Hombros', 'dumbbell', 'kg', {
    caution: ['shoulder'],
    steps: ['De pie con las mancuernas adelante de los muslos.', 'Subí las mancuernas pegadas al cuerpo llevando los codos hacia los costados.', 'Bajá controlado.'],
    err: ['swing', 'shoulders'], alt: ['Elevación de barra al mentón', 'Elevaciones laterales']
});

// ===================== BÍCEPS =====================
gymEx('Curl de bíceps', 'dumbbell bicep curl', 1, 'Bíceps', 'dumbbell', 'kg', {
    steps: ['De pie, una mancuerna en cada mano con las palmas hacia adelante.', 'Doblá los codos subiendo las mancuernas sin mover los codos.', 'Bajá despacio hasta estirar los brazos.'],
    err: ['swing', 'elbowsmove', 'drop'], alt: ['Curl con barra', 'Curl martillo', 'Curl en polea baja']
});
gymEx('Curl con barra', 'barbell curl', 1, 'Bíceps', 'barbell', 'kg', {
    steps: ['De pie, la barra con las palmas hacia adelante al ancho de los hombros.', 'Subí la barra doblando los codos, pegados al cuerpo.', 'Bajá controlado hasta estirar.'],
    err: ['swing', 'elbowsmove', 'arch'], alt: ['Curl de bíceps', 'Curl en banco Scott']
});
gymEx('Curl martillo', 'hammer curl', 1, 'Bíceps', 'dumbbell', 'kg', {
    steps: ['De pie con las mancuernas a los costados y las palmas mirándose.', 'Subí las mancuernas sin girar las muñecas.', 'Bajá despacio.'],
    err: ['swing', 'elbowsmove'], alt: ['Curl de bíceps', 'Curl en polea baja']
});
gymEx('Curl en polea baja', 'cable curl', 1, 'Bíceps', 'cable', 'kg', {
    aliases: ['Curl con barra desde polea baja'],
    steps: ['De frente a la polea baja con la barra o el agarre, brazos estirados.', 'Doblá los codos llevando el agarre hacia los hombros.', 'Bajá controlado manteniendo la tensión.'],
    err: ['swing', 'elbowsmove'], alt: ['Curl de bíceps', 'Curl con barra']
});
gymEx('Curl concentrado', 'concentration curl', 1, 'Bíceps', 'dumbbell', 'kg', {
    steps: ['Sentado, apoyá el codo en la cara interna del muslo.', 'Subí la mancuerna hacia el hombro.', 'Bajá despacio hasta estirar el brazo.'],
    err: ['torso', 'range'], alt: ['Curl en banco Scott', 'Curl de bíceps']
});
gymEx('Curl en banco Scott', 'preacher curl', 2, 'Bíceps', 'barbell', 'kg', {
    aliases: ['Curl con barra scott bicep'],
    steps: ['Apoyá la parte de atrás de los brazos en el banco Scott.', 'Subí la barra hasta que los antebrazos queden casi verticales.', 'Bajá despacio sin trabar los codos abajo.'],
    err: ['lockout', 'drop'], alt: ['Curl concentrado', 'Curl con barra']
});
gymEx('Curl inclinado con mancuernas', 'incline dumbbell curl', 2, 'Bíceps', 'dumbbell', 'kg', {
    steps: ['Acostate en un banco a 45 grados con los brazos colgando.', 'Subí las mancuernas sin adelantar los codos.', 'Bajá despacio hasta estirar del todo.'],
    err: ['elbowsmove', 'swing'], alt: ['Curl de bíceps']
});

// ===================== TRÍCEPS =====================
gymEx('Tríceps en polea', 'cable tricep pushdown', 1, 'Tríceps', 'cable', 'kg', {
    aliases: ['Jalones de tríceps con polea alta', 'Extensión de tríceps'],
    steps: ['De frente a la polea alta con barra o cuerda, codos pegados al cuerpo.', 'Empujá hacia abajo hasta extender los codos.', 'Subí despacio hasta que los antebrazos queden paralelos al piso.'],
    err: ['elbowsmove', 'swing', 'torso'], alt: ['Extensión en polea con cuerda', 'Press francés']
});
gymEx('Extensión en polea con cuerda', 'rope tricep pushdown', 1, 'Tríceps', 'cable', 'kg', {
    steps: ['Polea alta con cuerda, codos pegados al cuerpo.', 'Empujá hacia abajo separando las puntas de la cuerda al final.', 'Volvé controlado.'],
    err: ['elbowsmove', 'swing'], alt: ['Tríceps en polea']
});
gymEx('Extensión de tríceps tras nuca', 'overhead tricep extension', 2, 'Tríceps', 'dumbbell', 'kg', {
    caution: ['shoulder'],
    steps: ['Sentado o de pie, sostené una mancuerna con las dos manos arriba de la cabeza.', 'Bajala por detrás de la cabeza doblando solo los codos.', 'Extendé los brazos hasta arriba.'],
    err: ['arch', ['Los codos se abren', 'Codos apuntando al frente, cerca de la cabeza.']], alt: ['Extensión de tríceps en polea sobre la cabeza', 'Press francés']
});
gymEx('Extensión de tríceps en polea sobre la cabeza', 'overhead cable tricep extension', 2, 'Tríceps', 'cable', 'kg', {
    steps: ['De espaldas a la polea, con la cuerda por detrás de la cabeza y un pie adelante.', 'Extendé los codos llevando las manos hacia adelante y arriba.', 'Volvé despacio sin mover los codos.'],
    err: ['elbowsmove', 'arch'], alt: ['Extensión de tríceps tras nuca']
});
gymEx('Press francés', 'skull crusher', 2, 'Tríceps', 'barbell', 'kg', {
    caution: ['shoulder'],
    steps: ['Acostado, la barra arriba de la cara con los brazos estirados.', 'Bajá la barra hacia la frente doblando solo los codos.', 'Extendé hasta arriba.'],
    err: ['elbowsmove', 'drop'], alt: ['Tríceps en polea', 'Extensión de tríceps tras nuca']
});
gymEx('Fondos en banco', 'bench dips', 1, 'Tríceps', 'bodyweight', 'bw', {
    also: ['Pecho'], caution: ['shoulder', 'wrist'],
    steps: ['Manos en el borde del banco detrás tuyo y las piernas adelante.', 'Bajá doblando los codos hasta unos 90 grados.', 'Empujá hasta extender los brazos.'],
    err: ['shoulders', ['La cadera se aleja del banco', 'Bajá con la espalda cerca del banco.']], alt: ['Fondos asistidos en máquina', 'Tríceps en polea']
});
gymEx('Patada de tríceps con mancuerna', 'dumbbell tricep kickback', 1, 'Tríceps', 'dumbbell', 'kg', {
    steps: ['Inclinado con una mano en el banco y el codo pegado al cuerpo a la altura del torso.', 'Extendé el codo llevando la mancuerna hacia atrás.', 'Volvé despacio.'],
    err: ['elbowsmove', 'swing'], alt: ['Tríceps en polea']
});
gymEx('Press de banca agarre cerrado', 'close grip bench press', 2, 'Tríceps', 'barbell', 'kg', {
    also: ['Pecho'], caution: ['spotter', 'wrist'],
    steps: ['Acostado, la barra con las manos al ancho de los hombros.', 'Bajá la barra al pecho con los codos pegados al cuerpo.', 'Empujá hasta extender.'],
    err: ['elbows', 'wrists'], alt: ['Fondos en paralelas', 'Tríceps en polea']
});

// ===================== CUÁDRICEPS =====================
gymEx('Sentadilla goblet', 'goblet squat', 1, 'Cuádriceps', 'kettlebell', 'kg', {
    also: ['Glúteos', 'Core'], caution: ['knee'],
    steps: ['Sostené la kettlebell o mancuerna contra el pecho, pies un poco más anchos que la cadera.', 'Bajá sentándote entre los talones con el pecho alto.', 'Subí empujando el piso con todo el pie.'],
    err: ['knees', 'heels', 'back'], alt: ['Sentadilla con barra', 'Prensa de piernas', 'Sentadilla búlgara']
});
gymEx('Sentadilla con barra', 'barbell back squat', 2, 'Cuádriceps', 'barbell', 'kg', {
    also: ['Glúteos', 'Isquios', 'Core'], aliases: ['Sentadilla'], caution: ['spotter', 'knee', 'lowback'],
    steps: ['La barra sobre la parte alta de la espalda, pies al ancho de los hombros.', 'Bajá con el pecho alto hasta que la cadera quede al menos a la altura de las rodillas.', 'Subí empujando el piso, con las rodillas siguiendo a los pies.'],
    err: ['knees', 'heels', 'back'], alt: ['Sentadilla goblet', 'Prensa de piernas', 'Sentadilla en máquina Smith']
});
gymEx('Sentadilla en máquina Smith', 'smith machine squat', 1, 'Cuádriceps', 'machine', 'kg', {
    also: ['Glúteos'], caution: ['knee'],
    steps: ['La barra en la espalda alta y los pies un poco adelantados.', 'Bajá con la espalda recta hasta unos 90 grados de rodilla.', 'Subí empujando con todo el pie.'],
    err: ['knees', 'back'], alt: ['Sentadilla con barra', 'Prensa de piernas']
});
gymEx('Sentadilla búlgara', 'bulgarian split squat', 2, 'Cuádriceps', 'dumbbell', 'kg', {
    also: ['Glúteos'], aliases: ['Sentadilla búlgarra'], caution: ['knee'],
    steps: ['Apoyá el empeine de atrás en un banco y adelantá la otra pierna.', 'Bajá en línea recta hasta que la rodilla de atrás casi toque el piso.', 'Subí empujando con el pie de adelante.'],
    err: ['knees', 'torso', ['El pie de adelante está muy cerca', 'Separalo hasta que, abajo, la rodilla quede sobre el tobillo.']], alt: ['Zancadas', 'Sentadilla goblet']
});
gymEx('Prensa de piernas', 'leg press', 1, 'Cuádriceps', 'machine', 'kg', {
    also: ['Glúteos'], caution: ['knee', 'lowback'],
    steps: ['Espalda y cadera bien apoyadas, pies al ancho de la cadera en el medio de la plataforma.', 'Bajá hasta que las rodillas queden cerca de 90 grados sin despegar la cadera.', 'Empujá sin trabar las rodillas arriba.'],
    err: ['lockout', 'knees', ['La cadera se despega abajo', 'Bajá menos: solo hasta donde la cadera queda apoyada.']], alt: ['Sentadilla goblet', 'Sentadilla con barra']
});
gymEx('Extensión de piernas', 'leg extension', 1, 'Cuádriceps', 'machine', 'kg', {
    aliases: ['Extensión de cuádriceps'], caution: ['knee'],
    steps: ['Regulá el respaldo para que la rodilla quede alineada con el eje de la máquina.', 'Extendé las piernas hasta casi estirarlas.', 'Bajá despacio.'],
    err: ['swing', 'drop'], alt: ['Sentadilla goblet', 'Zancadas']
});
gymEx('Zancadas', 'dumbbell lunge', 1, 'Cuádriceps', 'dumbbell', 'kg', {
    also: ['Glúteos'], caution: ['knee'],
    steps: ['De pie con las mancuernas a los costados.', 'Dá un paso largo adelante y bajá hasta que la rodilla de atrás casi toque el piso.', 'Empujá con el pie de adelante para volver.'],
    err: ['knees', 'torso'], alt: ['Sentadilla búlgara', 'Step ups (subida al cajón)']
});
gymEx('Step ups (subida al cajón)', 'step up', 1, 'Cuádriceps', 'dumbbell', 'kg', {
    also: ['Glúteos'],
    steps: ['Apoyá un pie entero sobre un cajón o banco.', 'Subí empujando con esa pierna, sin impulsarte con la de abajo.', 'Bajá despacio.'],
    err: ['knees', ['Se empuja con la pierna de abajo', 'La de abajo solo acompaña: la fuerza la hace la de arriba.']], alt: ['Zancadas', 'Sentadilla búlgara']
});
gymEx('Sentadilla hack', 'hack squat', 2, 'Cuádriceps', 'machine', 'kg', {
    also: ['Glúteos'], caution: ['knee'],
    steps: ['Espalda apoyada en el respaldo y pies al ancho de la cadera.', 'Bajá hasta unos 90 grados de rodilla.', 'Subí sin trabar las rodillas.'],
    err: ['knees', 'lockout'], alt: ['Prensa de piernas', 'Sentadilla con barra']
});

// ===================== ISQUIOS =====================
gymEx('Curl de piernas', 'lying leg curl', 1, 'Isquios', 'machine', 'kg', {
    steps: ['Acostado boca abajo con el rodillo apoyado arriba de los talones.', 'Doblá las rodillas llevando los talones hacia los glúteos.', 'Bajá despacio sin despegar la cadera.'],
    err: ['swing', ['La cadera se levanta', 'Apretá la cadera contra el banco.']], alt: ['Curl femoral sentado', 'Peso muerto rumano']
});
gymEx('Curl femoral sentado', 'seated leg curl', 1, 'Isquios', 'machine', 'kg', {
    steps: ['Sentado con la rodilla alineada con el eje de la máquina y el rodillo arriba de los talones.', 'Llevá los talones hacia abajo y atrás.', 'Volvé despacio.'],
    err: ['drop', 'swing'], alt: ['Curl de piernas', 'Curl femoral unilateral']
});
gymEx('Curl femoral unilateral', 'single leg curl', 1, 'Isquios', 'machine', 'kg', {
    aliases: ['Curl femoral de pie'],
    steps: ['En la máquina o en polea, con el rodillo o la tobillera arriba del talón.', 'Doblá la rodilla llevando el talón hacia el glúteo.', 'Bajá controlado.'],
    err: ['torso', 'swing'], alt: ['Curl de piernas', 'Curl femoral sentado']
});
gymEx('Peso muerto rumano', 'romanian deadlift', 2, 'Isquios', 'barbell', 'kg', {
    also: ['Glúteos', 'Espalda'], caution: ['lowback'],
    steps: ['De pie con la barra o las mancuernas adelante de los muslos y las rodillas suaves.', 'Llevá la cadera hacia atrás bajando el peso pegado a las piernas, con la espalda recta.', 'Subí empujando la cadera hacia adelante cuando sientas el estiramiento.'],
    err: ['back', ['Se doblan las rodillas como en una sentadilla', 'Las rodillas quedan suaves y fijas: el movimiento es de cadera.']], alt: ['Peso muerto rumano con mancuernas', 'Buenos días (good morning)', 'Hiperextensiones']
});
gymEx('Peso muerto rumano con mancuernas', 'dumbbell romanian deadlift', 1, 'Isquios', 'dumbbell', 'kg', {
    also: ['Glúteos'], caution: ['lowback'],
    steps: ['De pie con las mancuernas adelante de los muslos y las rodillas suaves.', 'Llevá la cadera atrás bajando las mancuernas pegadas a las piernas.', 'Subí empujando la cadera adelante.'],
    err: ['back', 'range'], alt: ['Peso muerto rumano', 'Curl de piernas']
});
gymEx('Peso muerto convencional', 'conventional deadlift', 3, 'Isquios', 'barbell', 'kg', {
    also: ['Glúteos', 'Espalda', 'Cuádriceps'], caution: ['lowback'],
    steps: ['Pies al ancho de la cadera con la barra sobre el medio del pie.', 'Agarrá la barra, pecho alto y espalda recta; empujá el piso y subí la barra pegada a las piernas.', 'Bajá controlado llevando primero la cadera atrás.'],
    err: ['back', ['La cadera sube antes que la barra', 'Empujá el piso con las piernas y que cadera y hombros suban juntos.']], alt: ['Peso muerto rumano', 'Peso muerto con kettlebell']
});
gymEx('Peso muerto con kettlebell', 'kettlebell deadlift', 1, 'Isquios', 'kettlebell', 'kg', {
    also: ['Glúteos'], caution: ['lowback'],
    steps: ['La kettlebell entre los pies, pies al ancho de la cadera.', 'Llevá la cadera atrás, agarrala con la espalda recta y subí empujando el piso.', 'Bajala con el mismo movimiento de cadera.'],
    err: ['back'], alt: ['Peso muerto rumano con mancuernas', 'Swing con kettlebell']
});
gymEx('Buenos días (good morning)', 'good morning', 2, 'Isquios', 'barbell', 'kg', {
    also: ['Espalda', 'Glúteos'], caution: ['lowback'],
    steps: ['La barra sobre la espalda alta y las rodillas suaves.', 'Inclinate llevando la cadera atrás con la espalda recta.', 'Volvé arriba empujando la cadera adelante.'],
    err: ['back', 'range'], alt: ['Peso muerto rumano', 'Hiperextensiones']
});

// ===================== GLÚTEOS =====================
gymEx('Hip thrust', 'barbell hip thrust', 2, 'Glúteos', 'barbell', 'kg', {
    also: ['Isquios'], aliases: ['Puente de glúteos / hip thrust'],
    steps: ['Espalda alta apoyada en el banco y la barra sobre la cadera, con una almohadilla.', 'Empujá la cadera hacia arriba hasta que el torso quede paralelo al piso.', 'Bajá controlado.'],
    err: ['arch', ['Se mira al techo arriba', 'Mentón adentro y mirada adelante: así la pelvis no se arquea.']], alt: ['Puente de glúteos', 'Patada de glúteo en polea']
});
gymEx('Puente de glúteos', 'glute bridge', 1, 'Glúteos', 'bodyweight', 'bw', {
    also: ['Isquios'],
    steps: ['Boca arriba con las rodillas flexionadas y los pies apoyados.', 'Empujá con los talones y subí la cadera apretando los glúteos.', 'Bajá despacio.'],
    err: ['arch', 'knees'], alt: ['Hip thrust', 'Puente de glúteos a una pierna']
});
gymEx('Puente de glúteos a una pierna', 'single leg glute bridge', 2, 'Glúteos', 'bodyweight', 'bw', {
    also: ['Isquios'],
    steps: ['Boca arriba, una pierna apoyada y la otra estirada al aire.', 'Subí la cadera empujando con el talón apoyado, sin que se incline.', 'Bajá despacio y cambiá de lado al terminar.'],
    err: ['torso', 'arch'], alt: ['Puente de glúteos']
});
gymEx('Patada de glúteo en polea', 'cable glute kickback', 1, 'Glúteos', 'cable', 'kg', {
    steps: ['Tobillera en la polea baja, de frente a la máquina y apoyado con las manos.', 'Llevá la pierna hacia atrás apretando el glúteo, sin arquear la zona lumbar.', 'Volvé despacio.'],
    err: ['arch', 'swing'], alt: ['Hip thrust', 'Puente de glúteos']
});
gymEx('Abducción de cadera en máquina', 'hip abduction machine', 1, 'Glúteos', 'machine', 'kg', {
    steps: ['Sentado con la espalda apoyada y las almohadillas en la cara externa de las rodillas.', 'Abrí las piernas hacia afuera.', 'Volvé despacio sin que las placas choquen.'],
    err: ['swing', 'drop'], alt: ['Caminata lateral con banda']
});
gymEx('Caminata lateral con banda', 'banded lateral walk', 1, 'Glúteos', 'band', 'bw', {
    steps: ['Banda arriba de las rodillas o en los tobillos y semisentadilla.', 'Dá pasos cortos al costado sin juntar los pies.', 'Hacé los mismos pasos hacia el otro lado.'],
    err: ['knees', 'torso'], alt: ['Abducción de cadera en máquina']
});
gymEx('Swing con kettlebell', 'kettlebell swing', 2, 'Glúteos', 'kettlebell', 'kg', {
    also: ['Isquios', 'Core'], caution: ['lowback'],
    steps: ['Pies un poco más anchos que la cadera y la kettlebell un paso adelante.', 'Llevala hacia atrás entre las piernas con la cadera atrás y la espalda recta.', 'Empujá la cadera adelante con fuerza para que suba hasta la altura del pecho.'],
    err: ['back', ['Se sube con los brazos', 'Los brazos solo guían: la fuerza sale de la cadera.']], alt: ['Peso muerto con kettlebell', 'Hip thrust']
});

// ===================== GEMELOS =====================
gymEx('Gemelos de pie', 'standing calf raise', 1, 'Gemelos', 'machine', 'kg', {
    aliases: ['Gemelos'],
    steps: ['Puntas de los pies en el borde del escalón y los talones afuera.', 'Subí en puntas de pie lo más alto posible.', 'Bajá despacio hasta estirar la pantorrilla.'],
    err: ['range', 'swing'], alt: ['Gemelos sentado', 'Elevación de talones en prensa']
});
gymEx('Gemelos sentado', 'seated calf raise', 1, 'Gemelos', 'machine', 'kg', {
    steps: ['Sentado con el apoyo sobre los muslos y las puntas en la plataforma.', 'Subí los talones lo más alto posible.', 'Bajá despacio hasta estirar.'],
    err: ['range', 'swing'], alt: ['Gemelos de pie']
});
gymEx('Elevación de talones en prensa', 'leg press calf raise', 1, 'Gemelos', 'machine', 'kg', {
    steps: ['En la prensa con las puntas de los pies en el borde de la plataforma y las piernas estiradas.', 'Empujá con las puntas extendiendo los tobillos.', 'Volvé despacio.'],
    err: ['range', 'lockout'], alt: ['Gemelos de pie']
});

// ===================== CORE =====================
gymEx('Crunch en polea', 'cable crunch', 2, 'Core', 'cable', 'kg', {
    aliases: ['Crunch en polea + plancha'],
    steps: ['De rodillas frente a la polea alta, con la cuerda a los costados de la cabeza.', 'Enrollá el torso llevando los codos hacia los muslos.', 'Volvé despacio sin mover la cadera.'],
    err: [['Se tira con los brazos', 'Las manos quedan fijas junto a la cabeza: el que trabaja es el abdomen.'], 'swing'], alt: ['Crunch abdominal', 'Abdominales en banco declinado']
});
gymEx('Crunch abdominal', 'crunch', 1, 'Core', 'bodyweight', 'bw', {
    aliases: ['Abdominales', 'abdominal crunch 90grados'],
    steps: ['Boca arriba con las rodillas flexionadas y las manos detrás de la cabeza.', 'Exhalá y despegá los hombros del piso enrollando el torso.', 'Bajá despacio.'],
    err: ['neck', 'swing'], alt: ['Crunch en polea', 'Plancha (plank)']
});
gymEx('Abdominales en banco declinado', 'decline sit up', 2, 'Core', 'bodyweight', 'bw', {
    caution: ['lowback', 'pressure'],
    steps: ['En el banco declinado con los pies trabados.', 'Subí el torso enrollando la columna.', 'Bajá despacio vértebra por vértebra.'],
    err: ['neck', 'swing'], alt: ['Crunch en polea', 'Crunch abdominal']
});
gymEx('Plancha (plank)', 'plank', 1, 'Core', 'bodyweight', 'time', {
    steps: ['Antebrazos apoyados debajo de los hombros y las piernas estiradas.', 'Formá una línea recta de la cabeza a los talones.', 'Sostené respirando, sin dejar caer la cadera.'],
    err: ['hips', 'breath'], alt: ['Plancha lateral', 'Bicho muerto']
});
gymEx('Plancha lateral', 'side plank', 1, 'Core', 'bodyweight', 'time', {
    steps: ['De costado con el antebrazo apoyado debajo del hombro.', 'Subí la cadera hasta formar una línea de la cabeza a los pies.', 'Sostené respirando y cambiá de lado.'],
    err: ['hips', 'shoulders'], alt: ['Plancha (plank)', 'Pallof press']
});
gymEx('Elevación de piernas colgado', 'hanging leg raise', 3, 'Core', 'bodyweight', 'bw', {
    aliases: ['abdo elevacion de piernas'],
    steps: ['Colgate de la barra con los brazos estirados.', 'Subí las piernas (o las rodillas) sin balancearte.', 'Bajá despacio.'],
    err: ['swing', ['Solo se suben las piernas sin enrollar la pelvis', 'Al final, llevá la pelvis hacia arriba.']], alt: ['Elevación de piernas acostado', 'Crunch abdominal']
});
gymEx('Elevación de piernas acostado', 'lying leg raise', 1, 'Core', 'bodyweight', 'bw', {
    steps: ['Boca arriba con las manos debajo de la cadera y las piernas estiradas.', 'Subí las piernas hasta la vertical.', 'Bajalas despacio sin despegar la zona lumbar.'],
    err: ['arch', 'swing'], alt: ['Elevación de piernas colgado', 'Bicho muerto']
});
gymEx('Bicho muerto', 'dead bug', 1, 'Core', 'bodyweight', 'bw', {
    steps: ['Boca arriba con los brazos al techo y las rodillas a 90 grados.', 'Bajá un brazo y la pierna contraria sin despegar la zona lumbar.', 'Volvé y cambiá de lado.'],
    err: ['arch', 'breath'], alt: ['Plancha (plank)']
});
gymEx('Crunch cruzado', 'bicycle crunch', 1, 'Core', 'bodyweight', 'bw', {
    aliases: ['crunch cruzados'],
    steps: ['Boca arriba con las manos detrás de la cabeza y las piernas en el aire.', 'Llevá un codo hacia la rodilla contraria estirando la otra pierna.', 'Alterná de lado sin apurarte.'],
    err: ['neck', 'swing'], alt: ['Crunch abdominal']
});
gymEx('Pallof press', 'pallof press', 2, 'Core', 'cable', 'kg', {
    steps: ['De costado a la polea a la altura del pecho, con el agarre contra el pecho.', 'Empujá las manos al frente sin dejar que el torso gire.', 'Volvé al pecho y, al terminar, cambiá de lado.'],
    err: ['torso', 'hips'], alt: ['Plancha lateral']
});
gymEx('Rueda abdominal', 'ab wheel rollout', 3, 'Core', 'bodyweight', 'bw', {
    caution: ['lowback'],
    steps: ['De rodillas con las manos en la rueda debajo de los hombros.', 'Rodá hacia adelante estirando el cuerpo sin arquear la zona lumbar.', 'Volvé enrollando el abdomen.'],
    err: ['arch', 'hips'], alt: ['Plancha (plank)', 'Bicho muerto']
});

// ---- Consultas ----

const GYM_BY_NAME = new Map();
GYM_EXERCISES.forEach(e => [e.name, ...e.aliases].forEach(n => GYM_BY_NAME.set(normalizeForCompare(n), e)));

/** Ficha de un ejercicio de gimnasio (por su nombre o por uno de sus alias), o null. */
function gymExerciseInfo(name) {
    return GYM_BY_NAME.get(normalizeForCompare(name || '')) || null;
}

function gymVideoUrl(ex) {
    const lang = typeof appLanguage === 'string' ? appLanguage : 'es';
    return 'https://www.youtube.com/results?search_query=' + encodeURIComponent(`${ex.en} ${lang === 'es' ? 'técnica' : 'proper form'}`);
}

/**
 * Los ejercicios nuevos del catálogo suman su grupo muscular al mapa y a la biblioteca. Los
 * que ya estaban clasificados conservan su grupo (así el historial no cambia de músculo).
 */
function registerGymMuscles() {
    GYM_EXERCISES.forEach(ex => {
        const group = MUSCLE_GROUPS[ex.muscle];
        [ex.name, ...ex.aliases].forEach(n => {
            const key = normalizeForCompare(n);
            if (!group || EXERCISE_TO_MUSCLE_GROUP[key]) return;
            group.exercises.push(n);
            EXERCISE_TO_MUSCLE_GROUP[key] = ex.muscle;
        });
    });
}
registerGymMuscles();
