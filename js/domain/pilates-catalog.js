// Catálogo de pilates: ejercicios de mat (con y sin elementos) y de reformer, con su ficha:
// nivel, músculos, respiración, pasos, errores comunes con su corrección, versiones más fácil
// y más difícil, precauciones y, en reformer, resortes sugeridos y sentido de dificultad.
// Los errores, las precauciones y los patrones de respiración que se repiten están una sola
// vez (abajo) y cada ejercicio dice cuáles le tocan. El reformer está en pilates-reformer.js.
// Contenido orientativo: revisarlo con un instructor certificado (ver docs/PILATES.md).
// Script clásico (no módulo): comparte el ámbito global con el resto de la app.

const PILATES_LEVELS = { 1: 'Principiante', 2: 'Intermedio', 3: 'Avanzado' };

const PILATES_EQUIPMENT = {
    mat: ['🧘', 'Colchoneta'],
    ball: ['⚽', 'Pelota'],
    band: ['🎗️', 'Banda elástica'],
    ring: ['⭕', 'Aro mágico'],
    roller: ['🧻', 'Rodillo'],
    weights: ['🏋️', 'Pesitas o tobilleras'],
    wall: ['🧱', 'Pared'],
    reformer: ['🛏️', 'Reformer']
};

// [error, cómo corregirlo]
const PILATES_ERRORS = {
    ribs: ['Las costillas se abren y la espalda se arquea', 'Llevá las costillas hacia la pelvis y exhalá antes de moverte.'],
    neck: ['El cuello hace la fuerza', 'Mirada hacia los muslos y espacio entre el mentón y el pecho; si cansa, apoyá la cabeza.'],
    pelvis: ['La pelvis se mueve o se despega', 'Achicá el rango hasta poder mantenerla quieta.'],
    shoulders: ['Los hombros suben hacia las orejas', 'Alejá los hombros de las orejas y abrí las clavículas.'],
    momentum: ['Se usa impulso', 'Hacelo más lento: subí en tres tiempos y bajá en tres.'],
    lowback: ['La zona lumbar se despega del piso', 'Subí más las piernas o flexioná las rodillas.'],
    knees: ['Las rodillas se trancan o se van hacia adentro', 'Rodillas suaves y alineadas con el segundo dedo del pie.'],
    breath: ['Se contiene la respiración', 'Exhalá en el esfuerzo; si te perdés, respirá libre y seguí.'],
    feet: ['Los pies se aflojan o se tuercen', 'Pies activos y alineados, sin caer hacia afuera.'],
    carriage: ['El carro vuelve de golpe', 'Controlá el regreso: tan lento como la salida.'],
    hips: ['La cadera se hunde o se levanta', 'Formá una línea de la cabeza a los talones con el abdomen activo.'],
    wrists: ['Todo el peso cae en las muñecas', 'Empujá el piso con toda la mano y activá los hombros.'],
    rotation: ['Rota la pelvis en vez del torso', 'Pelvis quieta mirando adelante; rotá desde las costillas.'],
    collapse: ['La columna se desploma al sentarte', 'Crecé desde la coronilla, como si un hilo tirara hacia arriba.']
};

const PILATES_CAUTIONS = {
    flexion: 'Con osteoporosis o hernia de disco, evitá flexionar la columna con carga: hacé la versión con la cabeza apoyada o consultá.',
    extension: 'Si te duele la zona lumbar al arquear, achicá el rango o evitá el ejercicio.',
    inversion: 'Evitalo con problemas de cuello, presión alta, glaucoma o embarazo: se rueda sobre la espalda alta.',
    prone: 'En el embarazo, evitá estar boca abajo.',
    supine: 'Después del primer trimestre del embarazo, evitá estar mucho tiempo boca arriba.',
    wrists: 'Con dolor de muñecas, apoyá los antebrazos o los puños.',
    knees: 'Con dolor de rodilla al apoyarla, poné una toalla doblada o evitá el ejercicio.',
    balance: 'Exige equilibrio: hacelo con supervisión si estás empezando.'
};

const PILATES_BREATH = {
    effort: 'Inhalá para preparar y exhalá en el esfuerzo.',
    lateral: 'Respiración lateral: el aire va a los costados y la espalda de las costillas, sin soltar el abdomen.',
    hundred: 'Inhalá durante cinco bombeos de brazos y exhalá durante cinco (diez ciclos son cien).',
    flow: 'Inhalá en una fase y exhalá en la otra, sin cortar el movimiento.',
    hold: 'Respirá en forma pareja durante toda la posición, sin contener el aire.',
    roll: 'Inhalá para rodar hacia atrás y exhalá para volver.',
    articulate: 'Exhalá para articular la columna vértebra por vértebra e inhalá arriba.'
};

const PILATES_EXERCISES = [];

/**
 * Agrega un ejercicio al catálogo.
 * kind: 'mat' | 'reformer'; lvl 1-3; muscle: grupo de MUSCLE_GROUPS; type: tipo de medición.
 * opts: also (otros músculos), equip, reps (objetivo), load (reformer: 100 = un resorte
 * completo), dir ('up' | 'down' | 'control'), breath (clave de PILATES_BREATH o texto), steps,
 * err (claves de PILATES_ERRORS o [error, corrección]), easier, harder, caution (claves).
 */
function pilatesEx(kind, name, en, lvl, muscle, type, opts) {
    PILATES_EXERCISES.push({ kind, name, en, lvl, muscle, type, equip: kind === 'reformer' ? 'reformer' : 'mat', dir: 'control', breath: 'effort', also: [], err: [], caution: [], ...opts });
}

// ===================== MAT: FUNDAMENTOS =====================
pilatesEx('mat', 'Respiración lateral', 'lateral breathing', 1, 'Core', 'time', {
    reps: '1 min', breath: 'lateral',
    steps: ['Sentate o acostate con las rodillas flexionadas y las manos a los costados de las costillas.', 'Inhalá por la nariz llevando el aire a las manos, sin inflar la panza.', 'Exhalá por la boca sintiendo cómo las costillas se cierran y el abdomen se hunde.'],
    err: ['shoulders', ['La panza se infla y se suelta el abdomen', 'Mantené un abdomen suave pero activo; el aire va a los costados.']],
    easier: 'Hacela sentada con la espalda apoyada.', harder: 'Mantenela durante otro ejercicio, como el puente.'
});
pilatesEx('mat', 'Báscula pélvica (impronta)', 'pelvic tilt imprint', 1, 'Core', 'pilates', {
    reps: '8', breath: 'effort', caution: ['supine'],
    steps: ['Boca arriba con las rodillas flexionadas y los pies apoyados al ancho de la cadera.', 'Exhalá y llevá suavemente la zona lumbar hacia el piso (impronta).', 'Inhalá y volvé a la pelvis neutra, con una pequeña curva lumbar.'],
    err: ['momentum', ['Se aprietan los glúteos para mover la pelvis', 'El movimiento sale del abdomen bajo, no de los glúteos.']],
    easier: 'Achicá el movimiento a la mitad.', harder: 'Sumá una pierna en mesa (rodilla sobre la cadera).'
});
pilatesEx('mat', 'Puente articulado', 'pelvic curl', 1, 'Glúteos', 'pilates', {
    also: ['Isquios', 'Core'], reps: '8', breath: 'articulate', caution: ['supine'],
    steps: ['Boca arriba, rodillas flexionadas y pies paralelos al ancho de la cadera.', 'Exhalá y despegá la columna del piso desde el coxis, vértebra por vértebra, hasta los omóplatos.', 'Inhalá arriba y exhalá para bajar apoyando de arriba hacia abajo.'],
    err: ['ribs', 'knees', ['Se sube con la cadera de un bloque', 'Primero la báscula pélvica y después cada vértebra.']],
    easier: 'Subí solo hasta la mitad de la espalda.', harder: 'Sostené arriba y extendé una pierna.'
});
pilatesEx('mat', 'Elevación de pecho', 'chest lift', 1, 'Core', 'pilates', {
    reps: '10', breath: 'effort', caution: ['flexion', 'supine'],
    steps: ['Boca arriba con las rodillas flexionadas y las manos detrás de la cabeza.', 'Exhalá y elevá la cabeza y los hombros hasta la punta de los omóplatos.', 'Inhalá arriba y bajá con control.'],
    err: ['neck', 'ribs', ['La pelvis se mete al subir', 'Mantené la pelvis neutra y quieta.']],
    easier: 'Hacé solo la mitad del recorrido.', harder: 'Con las piernas en mesa.'
});
pilatesEx('mat', 'Marcha en mesa', 'tabletop toe taps', 1, 'Core', 'pilates', {
    reps: '10 por pierna', breath: 'flow', caution: ['supine'],
    steps: ['Boca arriba, piernas en mesa: rodillas sobre la cadera a 90 grados.', 'Exhalá y bajá un pie a tocar el piso sin mover la pelvis.', 'Inhalá para volver a la mesa y cambiá de pierna.'],
    err: ['pelvis', 'lowback', 'ribs'],
    easier: 'Empezá con un pie apoyado y llevá una sola pierna a la mesa.', harder: 'Bajá las dos piernas juntas.'
});
pilatesEx('mat', 'Bicho muerto', 'dead bug', 1, 'Core', 'pilates', {
    reps: '8 por lado', breath: 'effort', caution: ['supine'],
    steps: ['Boca arriba, piernas en mesa y brazos hacia el techo.', 'Exhalá y extendé una pierna y el brazo contrario hacia el piso.', 'Inhalá para volver y cambiá de lado.'],
    err: ['lowback', 'ribs', 'momentum'],
    easier: 'Mové solo las piernas, o solo los brazos.', harder: 'Más lento y con la pierna más cerca del piso.'
});
pilatesEx('mat', 'Gato-vaca', 'cat cow', 1, 'Espalda', 'pilates', {
    also: ['Core'], reps: '8', breath: 'flow', caution: ['wrists', 'knees'],
    steps: ['En cuatro apoyos: manos bajo los hombros y rodillas bajo la cadera.', 'Exhalá y redondeá la espalda desde el coxis hasta la cabeza.', 'Inhalá y alargá la columna con una extensión suave, sin hundir la zona lumbar.'],
    err: ['wrists', 'shoulders'],
    easier: 'Achicá el rango.', harder: 'Hacelo más lento, una vértebra por vez.'
});
pilatesEx('mat', 'Cuadrupedia con brazo y pierna', 'bird dog', 1, 'Espalda', 'pilates', {
    also: ['Glúteos', 'Core'], reps: '8 por lado', breath: 'effort', caution: ['wrists', 'knees'],
    steps: ['En cuatro apoyos con la columna larga y neutra.', 'Exhalá y estirá un brazo adelante y la pierna contraria atrás.', 'Inhalá para volver sin mover la pelvis y cambiá de lado.'],
    err: ['rotation', 'hips', 'shoulders'],
    easier: 'Mové solo la pierna.', harder: 'Llevá el codo a la rodilla por debajo del cuerpo antes de estirar.'
});
pilatesEx('mat', 'Apertura de libro', 'book openings', 1, 'Espalda', 'pilates', {
    also: ['Pecho'], reps: '6 por lado', breath: 'flow',
    steps: ['De costado, rodillas flexionadas y brazos estirados al frente, uno sobre otro.', 'Inhalá y abrí el brazo de arriba hacia el otro lado siguiéndolo con la mirada.', 'Exhalá para volver a cerrar el libro.'],
    err: ['rotation', ['Las rodillas se separan', 'Mantené las rodillas juntas; podés poner un almohadón entre ellas.']],
    easier: 'Abrí solo hasta donde el brazo llegue sin forzar.', harder: 'Sostené dos respiraciones abierto.'
});
pilatesEx('mat', 'Almeja', 'clamshell', 1, 'Glúteos', 'pilates', {
    reps: '12 por lado', breath: 'effort',
    steps: ['De costado con las rodillas flexionadas y los talones en línea con la cola.', 'Exhalá y abrí la rodilla de arriba sin separar los pies.', 'Inhalá y cerrá con control.'],
    err: ['rotation', ['La cadera se va hacia atrás al abrir', 'Apilá una cadera sobre la otra y abrí menos.']],
    easier: 'Abrí menos.', harder: 'Con una banda elástica en las rodillas.'
});
pilatesEx('mat', 'Elevación lateral de pierna', 'side lying leg lift', 1, 'Glúteos', 'pilates', {
    reps: '10 por lado', breath: 'effort',
    steps: ['De costado, cuerpo en línea y la pierna de abajo flexionada.', 'Exhalá y elevá la pierna de arriba estirada, con el pie paralelo al piso.', 'Inhalá y bajá sin apoyarla.'],
    err: ['rotation', 'hips'],
    easier: 'Elevá menos.', harder: 'Con tobillera liviana.'
});
pilatesEx('mat', 'Preparación del cisne', 'swan prep', 1, 'Espalda', 'pilates', {
    reps: '6', breath: 'effort', caution: ['extension', 'prone'],
    steps: ['Boca abajo con las manos bajo los hombros y los codos pegados al cuerpo.', 'Inhalá y elevá la cabeza y el pecho alargando la columna hacia adelante.', 'Exhalá y bajá con control.'],
    err: ['shoulders', ['Se empuja solo con los brazos y se arquea la zona lumbar', 'La espalda alta hace el trabajo; el abdomen sostiene la zona lumbar.']],
    easier: 'Elevá solo la cabeza y el esternón.', harder: 'Sin las manos (brazos al costado).'
});
pilatesEx('mat', 'Plancha', 'plank', 1, 'Core', 'time', {
    also: ['Hombros'], reps: '30 s', breath: 'hold', caution: ['wrists'],
    steps: ['Manos bajo los hombros y piernas estiradas atrás.', 'Formá una línea de la cabeza a los talones.', 'Sostené respirando sin hundir ni levantar la cadera.'],
    err: ['hips', 'shoulders', 'wrists'],
    easier: 'Con las rodillas apoyadas o sobre los antebrazos.', harder: 'Elevá una pierna por vez.'
});
pilatesEx('mat', 'Plancha lateral con rodillas', 'side plank knees', 1, 'Core', 'time', {
    also: ['Hombros'], reps: '20 s por lado', breath: 'hold', caution: ['wrists'],
    steps: ['De costado sobre el antebrazo, codo bajo el hombro y rodillas flexionadas.', 'Elevá la cadera hasta alinearla con los hombros y las rodillas.', 'Sostené sin hundir la cadera y cambiá de lado.'],
    err: ['hips', 'shoulders'],
    easier: 'Menos tiempo.', harder: 'Con las piernas estiradas.'
});
pilatesEx('mat', 'Rodar hacia abajo de pie', 'standing roll down', 1, 'Espalda', 'pilates', {
    also: ['Isquios'], reps: '5', breath: 'articulate', caution: ['flexion'],
    steps: ['De pie con los pies al ancho de la cadera y las rodillas suaves.', 'Exhalá y bajá la cabeza y la columna vértebra por vértebra hacia el piso.', 'Inhalá abajo y exhalá para subir apilando la columna.'],
    err: ['knees', 'momentum'],
    easier: 'Bajá con las rodillas más flexionadas.', harder: 'Bajá y subí más lento.'
});

// ===================== MAT: LOS CLÁSICOS =====================
pilatesEx('mat', 'Los cien (Hundred)', 'hundred', 1, 'Core', 'pilates', {
    also: ['Hombros'], reps: '10 ciclos', breath: 'hundred', caution: ['flexion', 'supine'],
    steps: ['Boca arriba, piernas en mesa y brazos largos al costado del cuerpo.', 'Elevá la cabeza y los hombros con la mirada en el abdomen.', 'Bombeá los brazos arriba y abajo, cinco veces al inhalar y cinco al exhalar.'],
    err: ['neck', 'lowback', 'shoulders'],
    easier: 'Cabeza apoyada y pies en el piso.', harder: 'Piernas estiradas a 45 grados.'
});
pilatesEx('mat', 'Enrollarse (Roll up)', 'roll up', 2, 'Core', 'pilates', {
    also: ['Espalda'], reps: '6', breath: 'articulate', caution: ['flexion'],
    steps: ['Boca arriba con las piernas estiradas y los brazos por encima de la cabeza.', 'Inhalá para traer los brazos al techo y exhalá para enrollarte vértebra por vértebra hasta sentarte y llegar a los pies.', 'Inhalá y exhalá para volver apoyando la columna de abajo hacia arriba.'],
    err: ['momentum', 'shoulders', ['Las piernas se levantan del piso', 'Doblá un poco las rodillas o hacé la versión asistida.']],
    easier: 'Con las rodillas flexionadas o con una banda en los pies.', harder: 'Con un aro entre las manos, más lento.'
});
pilatesEx('mat', 'Rodar hacia atrás (Roll over)', 'roll over', 3, 'Core', 'pilates', {
    also: ['Isquios'], reps: '5', breath: 'roll', caution: ['inversion', 'flexion'],
    steps: ['Boca arriba con las piernas a 90 grados y los brazos largos al costado.', 'Exhalá y llevá las piernas por encima de la cabeza despegando la columna, hasta tener los pies paralelos al piso.', 'Abrí las piernas al ancho de la cadera e inhalá; exhalá para bajar vértebra por vértebra.'],
    err: ['momentum', 'neck', ['Se rueda sobre el cuello', 'El peso queda en los omóplatos, nunca en el cuello.']],
    easier: 'Llevá las piernas solo hasta que la cadera se despegue un poco.', harder: 'Más lento y sin ayuda de los brazos.'
});
pilatesEx('mat', 'Círculos con una pierna', 'single leg circles', 1, 'Core', 'pilates', {
    also: ['Cuádriceps', 'Glúteos'], reps: '5 por sentido', breath: 'flow', caution: ['supine'],
    steps: ['Boca arriba, una pierna estirada al techo y la otra estirada en el piso (o flexionada).', 'Dibujá un círculo con la pierna de arriba cruzando la línea media y volviendo.', 'Cinco hacia un lado, cinco hacia el otro, y cambiá de pierna.'],
    err: ['pelvis', 'momentum'],
    easier: 'Círculos más chicos y la otra pierna flexionada.', harder: 'Círculos más grandes sin mover la pelvis.'
});
pilatesEx('mat', 'Rodar como una pelota', 'rolling like a ball', 1, 'Core', 'pilates', {
    reps: '8', breath: 'roll', caution: ['inversion', 'flexion'],
    steps: ['Sentate, abrazá las rodillas y hacé una C con la columna, equilibrándote detrás de los isquiones.', 'Inhalá y rodá hacia atrás hasta los omóplatos.', 'Exhalá y volvé a equilibrarte sin apoyar los pies.'],
    err: ['momentum', ['La forma de pelota se abre al rodar', 'Mantené la misma distancia entre la frente y las rodillas.']],
    easier: 'Solo equilibrio en la C, sin rodar.', harder: 'Con las manos en los tobillos y la pelota más chica.'
});
pilatesEx('mat', 'Estiramiento de una pierna', 'single leg stretch', 1, 'Core', 'pilates', {
    reps: '8 por lado', breath: 'flow', caution: ['flexion', 'supine'],
    steps: ['Boca arriba con la cabeza y los hombros elevados.', 'Llevá una rodilla al pecho con las manos y estirá la otra pierna adelante.', 'Cambiá de pierna con ritmo, inhalando en dos cambios y exhalando en dos.'],
    err: ['neck', 'lowback', 'pelvis'],
    easier: 'Cabeza apoyada y la pierna estirada más alta.', harder: 'Pierna estirada más baja.'
});
pilatesEx('mat', 'Estiramiento de dos piernas', 'double leg stretch', 2, 'Core', 'pilates', {
    reps: '8', breath: 'flow', caution: ['flexion', 'supine'],
    steps: ['Boca arriba, rodillas al pecho, cabeza y hombros elevados y manos en los tobillos.', 'Inhalá y estirá brazos por encima de la cabeza y piernas adelante.', 'Exhalá, hacé un círculo con los brazos y volvé a abrazar las rodillas.'],
    err: ['lowback', 'neck', 'ribs'],
    easier: 'Piernas más altas o mové solo los brazos.', harder: 'Piernas más bajas.'
});
pilatesEx('mat', 'Tijera con pierna recta', 'single straight leg stretch', 2, 'Core', 'pilates', {
    also: ['Isquios'], reps: '8 por lado', breath: 'flow', caution: ['flexion', 'supine'],
    steps: ['Boca arriba con cabeza y hombros elevados y las dos piernas estiradas al techo.', 'Bajá una pierna y tomá la otra con las manos cerca del tobillo.', 'Cambiá en tijera con dos tirones por pierna.'],
    err: ['neck', 'lowback', 'momentum'],
    easier: 'Tomá la pierna detrás del muslo.', harder: 'Sin manos, más rápido y controlado.'
});
pilatesEx('mat', 'Bajada de piernas rectas', 'double straight leg stretch', 2, 'Core', 'pilates', {
    reps: '8', breath: 'effort', caution: ['flexion', 'supine'],
    steps: ['Boca arriba con manos detrás de la cabeza, cabeza y hombros elevados y piernas al techo.', 'Inhalá y bajá las piernas juntas solo hasta donde la zona lumbar siga apoyada.', 'Exhalá para subirlas.'],
    err: ['lowback', 'neck', 'ribs'],
    easier: 'Bajá poco o con las rodillas flexionadas.', harder: 'Bajá más y subí en tres tiempos.'
});
pilatesEx('mat', 'Entrecruzado (Criss cross)', 'criss cross', 2, 'Core', 'pilates', {
    reps: '6 por lado', breath: 'effort', caution: ['flexion', 'supine'],
    steps: ['Boca arriba con manos detrás de la cabeza y piernas en mesa.', 'Exhalá y rotá el torso llevando el hombro hacia la rodilla contraria mientras estirás la otra pierna.', 'Inhalá al centro y cambiá de lado.'],
    err: ['neck', ['Se mueve el codo y no el torso', 'Los codos quedan abiertos; rota toda la caja torácica.']],
    easier: 'Pies apoyados en el piso.', harder: 'Sostené dos tiempos en cada lado.'
});
pilatesEx('mat', 'Estiramiento de columna adelante', 'spine stretch forward', 1, 'Espalda', 'pilates', {
    also: ['Isquios'], reps: '5', breath: 'articulate',
    steps: ['Sentado con las piernas abiertas al ancho de la colchoneta y los pies flexionados.', 'Exhalá y redondeá la columna hacia adelante empezando por la cabeza, como sobre una pelota.', 'Inhalá y volvé a apilar la columna hasta sentarte alto.'],
    err: ['collapse', 'shoulders'],
    easier: 'Sentate sobre un almohadón o flexioná las rodillas.', harder: 'Más lejos, sin perder la C.'
});
pilatesEx('mat', 'Balancín con piernas abiertas', 'open leg rocker', 2, 'Core', 'pilates', {
    also: ['Isquios'], reps: '6', breath: 'roll', caution: ['inversion', 'balance'],
    steps: ['Equilibrio detrás de los isquiones con las piernas abiertas en V y las manos en los tobillos.', 'Inhalá y rodá hacia atrás hasta los omóplatos.', 'Exhalá y volvé al equilibrio sin apoyar los pies.'],
    err: ['momentum', 'shoulders'],
    easier: 'Solo el equilibrio, con las rodillas flexionadas.', harder: 'Juntá y abrí las piernas en el equilibrio.'
});
pilatesEx('mat', 'Sacacorchos', 'corkscrew', 3, 'Core', 'pilates', {
    reps: '3 por sentido', breath: 'flow', caution: ['inversion', 'supine'],
    steps: ['Boca arriba con las piernas juntas al techo y los brazos al costado.', 'Llevá las piernas hacia un lado, abajo, al otro lado y volvé arriba dibujando un círculo.', 'Alterná el sentido.'],
    err: ['pelvis', 'lowback'],
    easier: 'Círculos chicos sin despegar la cadera.', harder: 'Despegá la cadera en la parte de arriba (versión completa).'
});
pilatesEx('mat', 'Sierra', 'saw', 1, 'Espalda', 'pilates', {
    also: ['Isquios'], reps: '4 por lado', breath: 'effort',
    steps: ['Sentado con las piernas abiertas y los brazos abiertos a la altura de los hombros.', 'Inhalá y rotá el torso hacia un lado.', 'Exhalá y llevá el meñique hacia el meñique del pie contrario, como si serruchara; volvé creciendo.'],
    err: ['rotation', 'collapse'],
    easier: 'Rodillas flexionadas.', harder: 'Más rotación y exhalación en tres tiempos.'
});
pilatesEx('mat', 'Inmersión del cisne (Swan dive)', 'swan dive', 3, 'Espalda', 'pilates', {
    also: ['Glúteos'], reps: '5', breath: 'flow', caution: ['extension', 'prone'],
    steps: ['Boca abajo con las manos bajo los hombros.', 'Elevá el pecho en extensión y soltá las manos para mecerte hacia adelante.', 'Volvé a subir el pecho mientras bajan las piernas, como un balancín.'],
    err: ['shoulders', ['La zona lumbar se comprime', 'Alargá la columna antes de arquear y sostené con el abdomen.']],
    easier: 'Quedate en la preparación del cisne.', harder: 'Mecete más alto sin usar las manos.'
});
pilatesEx('mat', 'Patada con una pierna', 'single leg kick', 1, 'Isquios', 'pilates', {
    also: ['Glúteos', 'Espalda'], reps: '6 por lado', breath: 'flow', caution: ['prone', 'extension'],
    steps: ['Boca abajo apoyado en los antebrazos, con el pecho elevado.', 'Patea con un talón hacia el glúteo dos veces.', 'Estirá esa pierna y cambiá.'],
    err: ['shoulders', 'pelvis'],
    easier: 'Frente apoyada en las manos.', harder: 'Sumá un pie en flex y otro en punta en cada patada.'
});
pilatesEx('mat', 'Patada con dos piernas', 'double leg kick', 2, 'Espalda', 'pilates', {
    also: ['Isquios', 'Glúteos'], reps: '4 por lado', breath: 'effort', caution: ['prone', 'extension'],
    steps: ['Boca abajo con la cabeza de costado y las manos tomadas en la espalda.', 'Patea los dos talones hacia los glúteos tres veces.', 'Estirá las piernas y los brazos hacia atrás y elevá el pecho; volvé apoyando la otra mejilla.'],
    err: ['shoulders', ['Las piernas se separan al estirar', 'Mantené las piernas juntas y largas en el piso.']],
    easier: 'Sin elevar el pecho.', harder: 'Más alto y con las piernas despegadas.'
});
pilatesEx('mat', 'Tirón de cuello (Neck pull)', 'neck pull', 3, 'Core', 'pilates', {
    also: ['Espalda'], reps: '5', breath: 'articulate', caution: ['flexion'],
    steps: ['Boca arriba con las piernas estiradas al ancho de la cadera y las manos detrás de la cabeza.', 'Exhalá y enrollate hasta sentarte y bajar sobre las piernas.', 'Inhalá y crecé a sentado alto; exhalá para bajar vértebra por vértebra.'],
    err: ['neck', 'momentum', ['Se tira de la cabeza con las manos', 'Las manos solo apoyan; el abdomen hace el trabajo.']],
    easier: 'Hacé el enrollarse con los brazos adelante.', harder: 'Inclinate hacia atrás con la espalda recta antes de bajar.'
});
pilatesEx('mat', 'Tijeras en el aire', 'scissors', 3, 'Core', 'pilates', {
    also: ['Isquios'], reps: '6 por lado', breath: 'flow', caution: ['inversion', 'wrists'],
    steps: ['Desde el rodar hacia atrás, sostené la cadera con las manos y las piernas al techo.', 'Abrí las piernas en tijera: una hacia la cabeza y otra hacia el piso.', 'Cambiá con dos pulsos por pierna.'],
    err: ['neck', 'hips'],
    easier: 'Hacé las tijeras boca arriba sin elevar la cadera.', harder: 'Más amplitud manteniendo la cadera alta.'
});
pilatesEx('mat', 'Bicicleta en el aire', 'bicycle', 3, 'Core', 'pilates', {
    also: ['Glúteos'], reps: '5 por sentido', breath: 'flow', caution: ['inversion', 'wrists'],
    steps: ['Con la cadera elevada y sostenida como en las tijeras.', 'Pedaleá en el aire: una pierna baja doblando la rodilla mientras la otra sube.', 'Cambiá de sentido.'],
    err: ['neck', 'hips'],
    easier: 'Boca arriba con la cadera apoyada.', harder: 'Pedaleo más amplio.'
});
pilatesEx('mat', 'Puente de hombros', 'shoulder bridge', 2, 'Glúteos', 'pilates', {
    also: ['Isquios', 'Core'], reps: '4 por pierna', breath: 'effort', caution: ['supine'],
    steps: ['En puente con la cadera alta.', 'Estirá una pierna al techo con el pie en punta.', 'Bajá la pierna estirada con el pie en flex sin que baje la cadera y volvé a subirla.'],
    err: ['hips', 'pelvis'],
    easier: 'Sostené el puente y marchá con los pies.', harder: 'Con las manos sosteniendo la cadera y más repeticiones.'
});
pilatesEx('mat', 'Rotación de columna', 'spine twist', 1, 'Espalda', 'pilates', {
    also: ['Core'], reps: '4 por lado', breath: 'flow',
    steps: ['Sentado alto con las piernas juntas estiradas y los pies en flex; brazos abiertos.', 'Exhalá y rotá el torso hacia un lado en dos pulsos, creciendo.', 'Inhalá para volver al centro y cambiá de lado.'],
    err: ['rotation', 'collapse'],
    easier: 'Sentate con las piernas cruzadas.', harder: 'Más rotación sin perder altura.'
});
pilatesEx('mat', 'Navaja (Jackknife)', 'jackknife', 3, 'Core', 'pilates', {
    also: ['Glúteos'], reps: '4', breath: 'effort', caution: ['inversion'],
    steps: ['Boca arriba con las piernas al techo y los brazos al costado empujando el piso.', 'Llevá las piernas sobre la cabeza y subilas hacia el techo con la cadera alta.', 'Bajá vértebra por vértebra manteniendo las piernas verticales.'],
    err: ['neck', 'momentum'],
    easier: 'Hacé el rodar hacia atrás.', harder: 'Más lento y alto.'
});
pilatesEx('mat', 'Patadas laterales adelante y atrás', 'side kick front back', 1, 'Glúteos', 'pilates', {
    also: ['Core'], reps: '8 por lado', breath: 'effort',
    steps: ['De costado con las piernas un poco adelante de la cadera y la cabeza en la mano.', 'Llevá la pierna de arriba adelante con dos pulsos.', 'Llevala hacia atrás alargándola, sin mover el torso.'],
    err: ['rotation', 'hips'],
    easier: 'Con la cabeza apoyada en el brazo estirado.', harder: 'Con tobillera liviana.'
});
pilatesEx('mat', 'Patadas laterales arriba y abajo', 'side kick up down', 1, 'Glúteos', 'pilates', {
    reps: '8 por lado', breath: 'effort',
    steps: ['De costado con el cuerpo en línea.', 'Elevá la pierna de arriba con el pie en punta.', 'Bajala con el pie en flex resistiendo, como si empujaras algo.'],
    err: ['rotation', 'hips'],
    easier: 'Rango más chico.', harder: 'Con tobillera liviana.'
});
pilatesEx('mat', 'Patadas laterales en círculos', 'side kick circles', 1, 'Glúteos', 'pilates', {
    reps: '5 por sentido', breath: 'flow',
    steps: ['De costado con la pierna de arriba a la altura de la cadera.', 'Dibujá círculos chicos con toda la pierna desde la cadera.', 'Cambiá de sentido.'],
    err: ['rotation', 'momentum'],
    easier: 'Círculos más chicos.', harder: 'Círculos más grandes y lentos.'
});
pilatesEx('mat', 'Elevación de pierna interna', 'inner thigh lift', 1, 'Cuádriceps', 'pilates', {
    reps: '10 por lado', breath: 'effort',
    steps: ['De costado con la pierna de arriba cruzada adelante y el pie apoyado.', 'Exhalá y elevá la pierna de abajo estirada.', 'Inhalá y bajá sin apoyarla del todo.'],
    err: ['rotation', ['Se gira la pierna hacia el techo', 'La rodilla mira adelante y el talón lidera.']],
    easier: 'Menos repeticiones.', harder: 'Sumá pulsos arriba.'
});
pilatesEx('mat', 'Preparación de la uve (Teaser)', 'teaser prep', 2, 'Core', 'pilates', {
    reps: '5', breath: 'articulate', caution: ['flexion'],
    steps: ['Boca arriba con las rodillas flexionadas y los pies apoyados (o una pierna estirada).', 'Exhalá y enrollate hasta el equilibrio detrás de los isquiones con los brazos paralelos a las piernas.', 'Inhalá arriba y exhalá para bajar con control.'],
    err: ['momentum', 'shoulders', 'collapse'],
    easier: 'Usá una banda en los pies.', harder: 'Con las dos piernas en mesa.'
});
pilatesEx('mat', 'La uve (Teaser)', 'teaser', 3, 'Core', 'pilates', {
    also: ['Cuádriceps'], reps: '4', breath: 'articulate', caution: ['flexion', 'balance'],
    steps: ['Boca arriba con las piernas estiradas a 45 grados y los brazos por encima de la cabeza.', 'Exhalá y enrollate hasta formar una V, con los brazos paralelos a las piernas.', 'Inhalá arriba y exhalá para bajar torso y piernas a la vez.'],
    err: ['momentum', 'shoulders', 'lowback'],
    easier: 'Preparación de la uve.', harder: 'Sostené arriba y hacé círculos con las piernas.'
});
pilatesEx('mat', 'Rotación de cadera', 'hip twist', 3, 'Core', 'pilates', {
    reps: '3 por sentido', breath: 'flow', caution: ['wrists'],
    steps: ['Sentado, apoyado en las manos atrás, con las piernas juntas en V.', 'Dibujá un círculo con las piernas hacia un lado, abajo y al otro lado.', 'Cambiá de sentido sin hundirte en los hombros.'],
    err: ['shoulders', 'lowback'],
    easier: 'Con las rodillas flexionadas y círculos chicos.', harder: 'Círculos más grandes.'
});
pilatesEx('mat', 'Natación', 'swimming', 1, 'Espalda', 'pilates', {
    also: ['Glúteos', 'Hombros'], reps: '20 tiempos', breath: 'flow', caution: ['prone', 'extension'],
    steps: ['Boca abajo con los brazos estirados adelante y las piernas largas.', 'Elevá brazos, piernas y pecho apenas del piso.', 'Alterná brazo y pierna contrarios rápido, como nadando, inhalando cinco tiempos y exhalando cinco.'],
    err: ['shoulders', 'neck'],
    easier: 'En cuatro apoyos (cuadrupedia con brazo y pierna).', harder: 'Más alto y más tiempo.'
});
pilatesEx('mat', 'Plancha con elevación de pierna (Leg pull front)', 'leg pull front', 2, 'Core', 'pilates', {
    also: ['Hombros', 'Glúteos'], reps: '4 por pierna', breath: 'effort', caution: ['wrists'],
    steps: ['En plancha con las manos bajo los hombros.', 'Elevá una pierna estirada sin mover la cadera.', 'Bajala y cambiá.'],
    err: ['hips', 'shoulders', 'wrists'],
    easier: 'Plancha sobre los antebrazos.', harder: 'Movete hacia atrás sobre el talón de apoyo antes de bajar.'
});
pilatesEx('mat', 'Plancha invertida con pierna (Leg pull back)', 'leg pull back', 3, 'Core', 'pilates', {
    also: ['Tríceps', 'Glúteos', 'Isquios'], reps: '3 por pierna', breath: 'effort', caution: ['wrists'],
    steps: ['Sentado con las manos atrás, dedos hacia los pies; elevá la cadera en plancha invertida.', 'Patea una pierna estirada hacia el techo.', 'Bajala sin que se hunda la cadera y cambiá.'],
    err: ['hips', 'shoulders'],
    easier: 'Sostené la plancha invertida sin patear.', harder: 'Patada más alta y lenta.'
});
pilatesEx('mat', 'Patada lateral de rodillas', 'kneeling side kick', 2, 'Glúteos', 'pilates', {
    also: ['Core'], reps: '6 por lado', breath: 'effort', caution: ['knees', 'wrists'],
    steps: ['De rodillas, inclinate de costado con una mano en el piso y la otra detrás de la cabeza.', 'Elevá la pierna de arriba a la altura de la cadera.', 'Patea adelante y atrás sin mover el torso.'],
    err: ['hips', 'rotation'],
    easier: 'Mové la pierna menos.', harder: 'Con tobillera.'
});
pilatesEx('mat', 'Flexión lateral (Side bend)', 'side bend', 2, 'Core', 'pilates', {
    also: ['Hombros'], reps: '4 por lado', breath: 'effort', caution: ['wrists'],
    steps: ['Sentado de costado apoyado en una mano, con las piernas estiradas y los pies cruzados.', 'Elevá la cadera en plancha lateral llevando el brazo libre por encima de la cabeza.', 'Bajá la cadera cerca del piso con control y volvé a subir.'],
    err: ['hips', 'shoulders'],
    easier: 'Plancha lateral con rodillas.', harder: 'Sumá una rotación mirando hacia el piso.'
});
pilatesEx('mat', 'Bumerán', 'boomerang', 3, 'Core', 'pilates', {
    also: ['Isquios'], reps: '4', breath: 'flow', caution: ['inversion', 'flexion'],
    steps: ['Sentado con las piernas estiradas y cruzadas.', 'Rodá hacia atrás llevando las piernas sobre la cabeza, cambiá el cruce y volvé a la uve.', 'Llevá los brazos atrás, bajá las piernas y estirá hacia los pies.'],
    err: ['momentum', 'neck'],
    easier: 'Por partes: rodar hacia atrás y uve por separado.', harder: 'Fluido, sin pausas.'
});
pilatesEx('mat', 'Foca', 'seal', 1, 'Core', 'pilates', {
    reps: '8', breath: 'roll', caution: ['inversion'],
    steps: ['Sentado en equilibrio con las rodillas abiertas y las manos por dentro de las piernas tomando los tobillos.', 'Aplaudí los pies tres veces y rodá hacia atrás.', 'Aplaudí tres veces atrás y volvé al equilibrio.'],
    err: ['momentum', 'neck'],
    easier: 'Sin aplaudir, solo rodar.', harder: 'Equilibrio más largo sin apoyar los pies.'
});
pilatesEx('mat', 'Cangrejo', 'crab', 3, 'Core', 'pilates', {
    reps: '4', breath: 'roll', caution: ['inversion', 'flexion'],
    steps: ['Sentado con las piernas cruzadas y las manos en los pies.', 'Rodá hacia atrás, cambiá el cruce de piernas y volvé adelante.', 'Rodá hacia las rodillas apoyando suave la coronilla.'],
    err: ['neck', 'momentum'],
    easier: 'Rodar como una pelota.', harder: 'Más fluido.'
});
pilatesEx('mat', 'Mecedora', 'rocking', 3, 'Espalda', 'pilates', {
    also: ['Cuádriceps'], reps: '5', breath: 'flow', caution: ['prone', 'extension', 'knees'],
    steps: ['Boca abajo, flexioná las rodillas y tomá los tobillos.', 'Empujá los pies contra las manos para elevar pecho y muslos.', 'Mecete adelante y atrás sobre el abdomen.'],
    err: ['shoulders', 'neck'],
    easier: 'Solo la posición sostenida, sin mecer.', harder: 'Mecida más amplia.'
});
pilatesEx('mat', 'Control del equilibrio', 'control balance', 3, 'Core', 'pilates', {
    also: ['Isquios', 'Glúteos'], reps: '4 por pierna', breath: 'flow', caution: ['inversion', 'balance'],
    steps: ['Desde el rodar hacia atrás, con las piernas sobre la cabeza y los pies en el piso.', 'Tomá un tobillo y elevá la otra pierna al techo.', 'Cambiá de pierna en tijera.'],
    err: ['neck', 'hips'],
    easier: 'Rodar hacia atrás.', harder: 'Cambios más lentos.'
});
pilatesEx('mat', 'Flexión de brazos pilates', 'pilates push up', 2, 'Pecho', 'pilates', {
    also: ['Tríceps', 'Core', 'Hombros'], reps: '3 series de 3', breath: 'effort', caution: ['wrists', 'flexion'],
    steps: ['De pie, rodá hacia abajo hasta apoyar las manos en el piso.', 'Caminá con las manos hasta la plancha y hacé tres flexiones de brazos con los codos pegados.', 'Volvé caminando con las manos y rodá hacia arriba.'],
    err: ['hips', 'shoulders'],
    easier: 'Flexiones con las rodillas apoyadas.', harder: 'Con una pierna elevada.'
});
pilatesEx('mat', 'Sirena', 'mermaid', 1, 'Espalda', 'pilates', {
    also: ['Core'], reps: '4 por lado', breath: 'flow',
    steps: ['Sentado de costado con las piernas flexionadas hacia un lado.', 'Elevá el brazo y estirate hacia el lado contrario formando un arco.', 'Volvé al centro y estirate hacia el otro lado.'],
    err: ['collapse', 'shoulders'],
    easier: 'Sentado con las piernas cruzadas.', harder: 'Sumá una rotación al final.'
});

// ===================== MAT CON ELEMENTOS =====================
pilatesEx('mat', 'Puente apretando la pelota', 'bridge ball squeeze', 1, 'Glúteos', 'pilates', {
    equip: 'ball', also: ['Isquios', 'Cuádriceps'], reps: '10', breath: 'articulate', caution: ['supine'],
    steps: ['Boca arriba con una pelota chica entre las rodillas.', 'Exhalá, apretá la pelota y subí al puente articulado.', 'Inhalá arriba y bajá vértebra por vértebra sin soltar la pelota.'],
    err: ['knees', 'ribs'],
    easier: 'Subí solo hasta la mitad.', harder: 'Sostené arriba y hacé pulsos apretando la pelota.'
});
pilatesEx('mat', 'Elevación de pecho con pelota', 'chest lift small ball', 1, 'Core', 'pilates', {
    equip: 'ball', reps: '10', breath: 'effort', caution: ['flexion', 'supine'],
    steps: ['Boca arriba con una pelota chica bajo la cabeza y la zona alta de la espalda.', 'Exhalá y elevá el pecho rodando sobre la pelota.', 'Inhalá y volvé con control.'],
    err: ['neck', 'ribs'],
    easier: 'Menos recorrido.', harder: 'Con las piernas en mesa.'
});
pilatesEx('mat', 'Uve con pelota', 'teaser with ball', 2, 'Core', 'pilates', {
    equip: 'ball', reps: '6', breath: 'articulate', caution: ['flexion'],
    steps: ['Boca arriba con una pelota en las manos y las rodillas flexionadas.', 'Exhalá y enrollate hasta la uve llevando la pelota hacia las rodillas.', 'Inhalá y bajá con control.'],
    err: ['momentum', 'collapse'],
    easier: 'Con los pies apoyados.', harder: 'Con las piernas estiradas.'
});
pilatesEx('mat', 'Curl de isquios en pelota grande', 'hamstring curl stability ball', 2, 'Isquios', 'pilates', {
    equip: 'ball', also: ['Glúteos', 'Core'], reps: '10', breath: 'effort', caution: ['supine'],
    steps: ['Boca arriba con los talones sobre una pelota grande y la cadera elevada.', 'Exhalá y traé la pelota hacia vos flexionando las rodillas.', 'Inhalá y estirá sin bajar la cadera.'],
    err: ['hips', 'momentum'],
    easier: 'Solo el puente sobre la pelota.', harder: 'Con una sola pierna.'
});
pilatesEx('mat', 'Rotación sentado con pelota', 'seated ball twist', 2, 'Core', 'pilates', {
    equip: 'ball', reps: '8 por lado', breath: 'effort',
    steps: ['Sentado, inclinado un poco hacia atrás con la espalda larga y una pelota en las manos.', 'Exhalá y rotá el torso llevando la pelota hacia un lado.', 'Inhalá al centro y cambiá.'],
    err: ['rotation', 'collapse'],
    easier: 'Más erguido.', harder: 'Con los pies despegados.'
});
pilatesEx('mat', 'Plancha con pies en pelota grande', 'plank on stability ball', 3, 'Core', 'time', {
    equip: 'ball', also: ['Hombros'], reps: '30 s', breath: 'hold', caution: ['wrists', 'balance'],
    steps: ['Manos en el piso y empeines o tibias sobre una pelota grande.', 'Formá una línea de la cabeza a los pies.', 'Sostené sin que la pelota se mueva.'],
    err: ['hips', 'shoulders'],
    easier: 'Con las tibias más cerca de la pelota.', harder: 'Llevá las rodillas al pecho rodando la pelota.'
});
pilatesEx('mat', 'Remo sentado con banda', 'seated band row', 1, 'Espalda', 'pilates', {
    equip: 'band', also: ['Bíceps'], reps: '12', breath: 'effort',
    steps: ['Sentado alto con la banda pasada por los pies y una punta en cada mano.', 'Exhalá y tirá de los codos hacia atrás juntando los omóplatos.', 'Inhalá y volvé con control.'],
    err: ['shoulders', 'collapse'],
    easier: 'Banda más liviana.', harder: 'Banda más fuerte o más corta.'
});
pilatesEx('mat', 'Círculos de pierna con banda', 'leg circles with band', 1, 'Core', 'pilates', {
    equip: 'band', also: ['Isquios'], reps: '5 por sentido', breath: 'flow', caution: ['supine'],
    steps: ['Boca arriba con la banda en un pie y la pierna al techo.', 'Dibujá círculos con la pierna sostenida por la banda.', 'Cambiá el sentido y la pierna.'],
    err: ['pelvis'],
    easier: 'Círculos chicos.', harder: 'Círculos más grandes.'
});
pilatesEx('mat', 'Expansión de pecho con banda', 'band chest expansion', 1, 'Espalda', 'pilates', {
    equip: 'band', also: ['Hombros'], reps: '10', breath: 'effort',
    steps: ['De pie o de rodillas con la banda adelante y los brazos estirados.', 'Exhalá y abrí la banda llevando los brazos hacia atrás.', 'Girá la cabeza a un lado y al otro y volvé.'],
    err: ['shoulders', 'ribs'],
    easier: 'Sin girar la cabeza.', harder: 'Banda más fuerte.'
});
pilatesEx('mat', 'Puente con banda en las rodillas', 'bridge with band', 1, 'Glúteos', 'pilates', {
    equip: 'band', also: ['Isquios'], reps: '10', breath: 'articulate', caution: ['supine'],
    steps: ['Boca arriba con una banda alrededor de los muslos.', 'Subí al puente empujando la banda hacia afuera.', 'Abrí y cerrá las rodillas arriba y bajá articulando.'],
    err: ['knees', 'hips'],
    easier: 'Sin aperturas.', harder: 'Banda más fuerte.'
});
pilatesEx('mat', 'Almeja con banda', 'banded clamshell', 1, 'Glúteos', 'pilates', {
    equip: 'band', reps: '12 por lado', breath: 'effort',
    steps: ['De costado con las rodillas flexionadas y una banda en los muslos.', 'Exhalá y abrí la rodilla de arriba contra la banda.', 'Inhalá y cerrá sin perder la tensión.'],
    err: ['rotation'],
    easier: 'Banda más liviana.', harder: 'Banda más fuerte.'
});
pilatesEx('mat', 'Enrollarse asistido con banda', 'assisted roll up band', 1, 'Core', 'pilates', {
    equip: 'band', reps: '6', breath: 'articulate', caution: ['flexion'],
    steps: ['Sentado con la banda en los pies y las rodillas un poco flexionadas.', 'Exhalá y bajá vértebra por vértebra usando la banda de apoyo.', 'Volvé a subir enrollándote con la ayuda de la banda.'],
    err: ['momentum', 'shoulders'],
    easier: 'Bajá hasta la mitad.', harder: 'Usá menos la banda.'
});
pilatesEx('mat', 'Aductores con aro', 'magic circle inner thigh', 1, 'Cuádriceps', 'pilates', {
    equip: 'ring', also: ['Core'], reps: '12', breath: 'effort', caution: ['supine'],
    steps: ['Boca arriba con el aro entre las rodillas o los tobillos.', 'Exhalá y apretá el aro.', 'Inhalá y soltá sin perderlo.'],
    err: ['ribs', 'pelvis'],
    easier: 'Aro entre las rodillas.', harder: 'Aro entre los tobillos con las piernas en mesa.'
});
pilatesEx('mat', 'Pecho con aro', 'magic circle chest press', 1, 'Pecho', 'pilates', {
    equip: 'ring', also: ['Hombros'], reps: '12', breath: 'effort',
    steps: ['Sentado alto con el aro adelante a la altura del pecho, una mano a cada lado.', 'Exhalá y apretá el aro con las palmas.', 'Inhalá y soltá; probá a distintas alturas.'],
    err: ['shoulders', 'collapse'],
    easier: 'Menos presión.', harder: 'Pulsos arriba de la cabeza.'
});
pilatesEx('mat', 'Abductores con aro de costado', 'magic circle side lying', 1, 'Glúteos', 'pilates', {
    equip: 'ring', reps: '12 por lado', breath: 'effort',
    steps: ['De costado con el aro entre los tobillos.', 'Exhalá y empujá el aro hacia abajo con la pierna de arriba.', 'Inhalá y soltá; después elevá las dos piernas juntas.'],
    err: ['rotation', 'hips'],
    easier: 'Solo empujar.', harder: 'Con las dos piernas elevadas.'
});
pilatesEx('mat', 'Los cien con aro', 'hundred with magic circle', 2, 'Core', 'pilates', {
    equip: 'ring', also: ['Cuádriceps'], reps: '10 ciclos', breath: 'hundred', caution: ['flexion', 'supine'],
    steps: ['Boca arriba con el aro entre los tobillos y las piernas a 45 grados.', 'Elevá cabeza y hombros apretando el aro.', 'Bombeá los brazos con la respiración de los cien.'],
    err: ['neck', 'lowback'],
    easier: 'Piernas en mesa.', harder: 'Piernas más bajas.'
});
pilatesEx('mat', 'Hombros con aro', 'magic circle overhead', 1, 'Hombros', 'pilates', {
    equip: 'ring', also: ['Espalda'], reps: '10', breath: 'effort',
    steps: ['Sentado o de pie con el aro entre las manos sobre la cabeza.', 'Exhalá y apretá sin subir los hombros.', 'Inhalá y soltá.'],
    err: ['shoulders', 'ribs'],
    easier: 'Aro a la altura del pecho.', harder: 'Sumá inclinaciones laterales.'
});
pilatesEx('mat', 'Extensión torácica en rodillo', 'thoracic extension foam roller', 1, 'Espalda', 'pilates', {
    equip: 'roller', reps: '8', breath: 'flow', caution: ['extension'],
    steps: ['Boca arriba con el rodillo atravesado bajo la espalda alta y las manos detrás de la cabeza.', 'Inhalá y extendé la espalda alta sobre el rodillo.', 'Exhalá y volvé; mové el rodillo un poco y repetí.'],
    err: ['ribs', 'neck'],
    easier: 'Menos rango.', harder: 'Brazos estirados sobre la cabeza.'
});
pilatesEx('mat', 'Bicho muerto sobre rodillo', 'dead bug foam roller', 2, 'Core', 'pilates', {
    equip: 'roller', reps: '8 por lado', breath: 'effort', caution: ['balance'],
    steps: ['Acostado a lo largo del rodillo, piernas en mesa y brazos al techo.', 'Exhalá y extendé brazo y pierna contrarios sin caerte del rodillo.', 'Inhalá para volver y cambiá.'],
    err: ['lowback', 'momentum'],
    easier: 'Pies apoyados y solo brazos.', harder: 'Más lento.'
});
pilatesEx('mat', 'Puente con pies en rodillo', 'bridge on foam roller', 2, 'Glúteos', 'pilates', {
    equip: 'roller', also: ['Isquios'], reps: '8', breath: 'articulate', caution: ['supine'],
    steps: ['Boca arriba con los pies sobre el rodillo.', 'Subí al puente sin que el rodillo se mueva.', 'Bajá articulando.'],
    err: ['hips', 'feet'],
    easier: 'Rodillo apoyado contra la pared.', harder: 'Con una pierna.'
});
pilatesEx('mat', 'Serie de brazos con pesitas', 'pilates arm series light weights', 1, 'Hombros', 'pilates', {
    equip: 'weights', also: ['Bíceps', 'Espalda'], reps: '8 por movimiento', breath: 'effort',
    steps: ['De pie en postura pilates con pesitas de 0,5 a 1 kg.', 'Hacé bíceps, aperturas laterales y círculos chicos con los brazos.', 'Mantené el centro activo y los hombros abajo.'],
    err: ['shoulders', 'ribs'],
    easier: 'Sin pesitas.', harder: 'Más repeticiones.'
});
pilatesEx('mat', 'Patadas laterales con tobilleras', 'side kick ankle weights', 2, 'Glúteos', 'pilates', {
    equip: 'weights', reps: '10 por lado', breath: 'effort',
    steps: ['De costado con tobilleras livianas.', 'Hacé patadas adelante y atrás y arriba y abajo.', 'El torso queda quieto.'],
    err: ['rotation', 'hips'],
    easier: 'Sin tobilleras.', harder: 'Tobilleras más pesadas.'
});
pilatesEx('mat', 'Rodar hacia abajo en la pared', 'wall roll down', 1, 'Espalda', 'pilates', {
    equip: 'wall', reps: '5', breath: 'articulate', caution: ['flexion'],
    steps: ['De pie con la espalda apoyada en la pared y los pies un paso adelante.', 'Exhalá y despegá la columna de la pared desde la cabeza.', 'Inhalá abajo y volvé apoyando cada vértebra.'],
    err: ['knees'],
    easier: 'Bajá menos.', harder: 'Bajá con los brazos sobre la cabeza.'
});
pilatesEx('mat', 'Sentadilla en la pared', 'wall squat', 1, 'Cuádriceps', 'time', {
    equip: 'wall', also: ['Glúteos'], reps: '30 s', breath: 'hold', caution: ['knees'],
    steps: ['Espalda en la pared y pies adelante al ancho de la cadera.', 'Bajá hasta que las rodillas queden cerca de 90 grados.', 'Sostené respirando.'],
    err: ['knees'],
    easier: 'Bajá menos.', harder: 'Con un aro o una pelota entre las rodillas.'
});

// ---- Consultas ----
function pilatesExerciseInfo(name) {
    const key = normalizeForCompare(name || '');
    return PILATES_EXERCISES.find(e => normalizeForCompare(e.name) === key) || null;
}

function pilatesVideoUrl(ex) {
    const lang = typeof appLanguage === 'string' ? appLanguage : 'es';
    const query = `pilates ${ex.kind === 'reformer' ? 'reformer ' : ''}${ex.en} ${lang === 'es' ? 'técnica' : 'tutorial'}`;
    return 'https://www.youtube.com/results?search_query=' + encodeURIComponent(query);
}

/** El grupo muscular de los ejercicios de pilates sale del catálogo (para el mapa y la biblioteca). */
function registerPilatesMuscles() {
    PILATES_EXERCISES.forEach(ex => {
        const group = MUSCLE_GROUPS[ex.muscle];
        if (group && !group.exercises.includes(ex.name)) group.exercises.push(ex.name);
        // El mapa nombre → grupo se arma al cargar catalog.js: se completa con los de pilates.
        if (group && typeof EXERCISE_TO_MUSCLE_GROUP === 'object') EXERCISE_TO_MUSCLE_GROUP[normalizeForCompare(ex.name)] = ex.muscle;
    });
}
