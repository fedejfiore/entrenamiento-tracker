// Catálogo de pilates: ejercicios de reformer (ver pilates-catalog.js para el formato).
// load: carga sugerida (100 = un resorte completo); la app la traduce a los resortes de
// Mi reformer. dir: hacia dónde va la dificultad (up: más resorte es más difícil; down:
// menos resorte es más difícil; control: el resorte no es la meta).
// Script clásico (no módulo): comparte el ámbito global con el resto de la app.

const pilatesRf = (name, en, lvl, muscle, opts) => pilatesEx('reformer', name, en, lvl, muscle, 'springs', opts);

// ===================== FOOTWORK =====================
pilatesRf('Footwork: dedos', 'footwork toes', 1, 'Cuádriceps', {
    also: ['Gemelos', 'Glúteos'], reps: '10', load: 300, dir: 'up', breath: 'flow', caution: ['supine'],
    steps: ['Boca arriba con la cabeza en el apoyacabezas y la punta de los pies en la barra, talones juntos.', 'Exhalá y empujá el carro estirando las piernas sin trabar las rodillas.', 'Inhalá y volvé con control, sin que el carro choque.'],
    err: ['knees', 'carriage', 'pelvis'], easier: 'Menos resortes.', harder: 'Más lento al volver.'
});
pilatesRf('Footwork: arcos', 'footwork arches', 1, 'Cuádriceps', {
    also: ['Gemelos'], reps: '10', load: 300, dir: 'up', breath: 'flow', caution: ['supine'],
    steps: ['Igual que con los dedos, pero con el arco del pie en la barra.', 'Exhalá y estirá las piernas.', 'Inhalá y volvé con control.'],
    err: ['knees', 'carriage', 'feet'], easier: 'Menos resortes.', harder: 'Pausa con las piernas estiradas.'
});
pilatesRf('Footwork: talones', 'footwork heels', 1, 'Glúteos', {
    also: ['Isquios', 'Cuádriceps'], reps: '10', load: 300, dir: 'up', breath: 'flow', caution: ['supine'],
    steps: ['Talones en la barra al ancho de la cadera y pies en flex.', 'Exhalá y empujá el carro sintiendo la parte de atrás de las piernas.', 'Inhalá y volvé.'],
    err: ['knees', 'carriage', 'pelvis'], easier: 'Menos resortes.', harder: 'Con una sola pierna.'
});
pilatesRf('Footwork: posición en V', 'footwork v position', 1, 'Cuádriceps', {
    also: ['Glúteos'], reps: '10', load: 300, dir: 'up', breath: 'flow', caution: ['supine'],
    steps: ['Talones juntos y puntas abiertas en V, con las piernas rotadas desde la cadera.', 'Exhalá y estirá apretando los muslos entre sí.', 'Inhalá y volvé sin abrir las rodillas de más.'],
    err: ['knees', 'carriage'], easier: 'Menos resortes.', harder: 'Más lento.'
});
pilatesRf('Elevación de talones en reformer', 'tendon stretch calf raises', 1, 'Gemelos', {
    reps: '10', load: 300, dir: 'up', breath: 'flow', caution: ['supine'],
    steps: ['Piernas estiradas con el carro afuera y la punta de los pies en la barra.', 'Bajá los talones por debajo de la barra.', 'Subilos lo más alto posible sin mover las piernas.'],
    err: ['knees', 'feet'], easier: 'Menos resortes.', harder: 'Con una pierna.'
});
pilatesRf('Corriendo en el lugar', 'running prances', 1, 'Gemelos', {
    also: ['Cuádriceps'], reps: '20', load: 300, dir: 'up', breath: 'flow', caution: ['supine'],
    steps: ['Piernas estiradas con la punta de los pies en la barra.', 'Bajá un talón mientras flexionás la otra rodilla.', 'Alterná como si corrieras, sin que el carro se mueva.'],
    err: ['pelvis', 'feet'], easier: 'Más lento.', harder: 'Más rápido sin mover el carro.'
});
pilatesRf('Footwork a una pierna', 'single leg footwork', 2, 'Cuádriceps', {
    also: ['Glúteos', 'Core'], reps: '8 por pierna', load: 200, dir: 'up', breath: 'flow', caution: ['supine'],
    steps: ['Un pie en la barra y la otra pierna en mesa o al techo.', 'Exhalá y empujá con una sola pierna.', 'Inhalá y volvé sin que la pelvis se incline.'],
    err: ['pelvis', 'knees', 'carriage'], easier: 'Más resortes.', harder: 'Menos resortes (más control).'
});

// ===================== ABDOMINALES Y PUENTE =====================
pilatesRf('Los cien en reformer', 'hundred on reformer', 2, 'Core', {
    also: ['Hombros'], reps: '10 ciclos', load: 100, dir: 'control', breath: 'hundred', caution: ['flexion', 'supine'],
    steps: ['Boca arriba con las correas en las manos y las piernas en mesa.', 'Bajá los brazos al costado y elevá cabeza y hombros.', 'Bombeá los brazos con la respiración de los cien.'],
    err: ['neck', 'lowback', 'shoulders'], easier: 'Piernas en mesa y cabeza apoyada.', harder: 'Piernas estiradas a 45 grados.'
});
pilatesRf('Coordinación', 'coordination', 2, 'Core', {
    also: ['Tríceps'], reps: '6', load: 100, dir: 'control', breath: 'flow', caution: ['flexion', 'supine'],
    steps: ['Con las correas, cabeza y hombros elevados y piernas en mesa.', 'Estirá piernas y brazos a la vez, abrí y cerrá las piernas.', 'Flexioná las rodillas y después volvé con los brazos.'],
    err: ['neck', 'lowback'], easier: 'Sin abrir las piernas.', harder: 'Piernas más bajas.'
});
pilatesRf('Puente en reformer', 'bridging on reformer', 1, 'Glúteos', {
    also: ['Isquios', 'Core'], reps: '8', load: 200, dir: 'up', breath: 'articulate', caution: ['supine'],
    steps: ['Boca arriba con los pies en la barra al ancho de la cadera.', 'Exhalá y subí al puente articulado.', 'Arriba, empujá y traé el carro con las piernas sin bajar la cadera; bajá articulando.'],
    err: ['hips', 'carriage', 'ribs'], easier: 'Solo el puente, sin mover el carro.', harder: 'Con una pierna.'
});
pilatesRf('Masaje abdominal', 'stomach massage', 2, 'Core', {
    also: ['Cuádriceps'], reps: '8', load: 300, dir: 'control', breath: 'flow', caution: ['flexion'],
    steps: ['Sentado en el carro con los pies en la barra y las manos atrás o adelante.', 'Con la espalda redonda, empujá el carro estirando las piernas.', 'Subí en punta y volvé con control.'],
    err: ['collapse', 'carriage'], easier: 'Espalda redonda y manos atrás.', harder: 'Espalda recta con los brazos al frente.'
});

// ===================== PIES EN LAS CORREAS =====================
pilatesRf('Ranas', 'frogs feet in straps', 1, 'Cuádriceps', {
    also: ['Glúteos', 'Core'], reps: '10', load: 150, dir: 'control', breath: 'flow', caution: ['supine'],
    steps: ['Boca arriba con las correas en los pies, talones juntos y rodillas abiertas.', 'Exhalá y estirá las piernas en diagonal.', 'Inhalá y volvé sin que se despegue la pelvis.'],
    err: ['pelvis', 'lowback'], easier: 'Estirá más alto.', harder: 'Estirá más bajo.'
});
pilatesRf('Círculos de piernas en correas', 'leg circles in straps', 1, 'Core', {
    also: ['Cuádriceps'], reps: '5 por sentido', load: 150, dir: 'control', breath: 'flow', caution: ['supine'],
    steps: ['Piernas estiradas al techo con las correas en los pies.', 'Bajá, abrí, subí y juntá dibujando un círculo.', 'Cambiá de sentido.'],
    err: ['pelvis', 'lowback'], easier: 'Círculos chicos.', harder: 'Más amplios y lentos.'
});
pilatesRf('Aperturas de piernas', 'openings in straps', 1, 'Cuádriceps', {
    also: ['Core'], reps: '8', load: 150, dir: 'control', breath: 'flow', caution: ['supine'],
    steps: ['Piernas al techo con las correas en los pies.', 'Abrí las piernas hacia los costados.', 'Cerralas resistiendo las correas.'],
    err: ['pelvis'], easier: 'Abrí menos.', harder: 'Más lento al cerrar.'
});
pilatesRf('Bajadas de piernas en correas', 'leg lowers in straps', 1, 'Isquios', {
    also: ['Core'], reps: '8', load: 150, dir: 'control', breath: 'effort', caution: ['supine'],
    steps: ['Piernas juntas al techo con las correas.', 'Bajalas hasta donde la zona lumbar siga quieta.', 'Subilas con los isquios.'],
    err: ['lowback', 'pelvis'], easier: 'Bajá menos.', harder: 'Bajá más.'
});
pilatesRf('Columna corta (Short spine)', 'short spine', 3, 'Espalda', {
    also: ['Core', 'Isquios'], reps: '5', load: 150, dir: 'control', breath: 'articulate', caution: ['inversion', 'flexion'],
    steps: ['Con las correas en los pies y las piernas estiradas.', 'Llevá las piernas sobre la cabeza despegando la columna.', 'Flexioná las rodillas y bajá vértebra por vértebra; estirá al final.'],
    err: ['neck', 'momentum'], easier: 'Rango más chico.', harder: 'Más lento.'
});

// ===================== BRAZOS =====================
pilatesRf('Brazos acostado: bajar', 'arms supine pull down', 1, 'Espalda', {
    also: ['Tríceps'], reps: '10', load: 50, dir: 'up', breath: 'effort', caution: ['supine'],
    steps: ['Boca arriba con las correas en las manos y los brazos al techo.', 'Exhalá y bajá los brazos al costado del cuerpo.', 'Inhalá y subilos con control.'],
    err: ['ribs', 'shoulders'], easier: 'Resorte más liviano.', harder: 'Piernas en mesa.'
});
pilatesRf('Brazos acostado: tríceps', 'arms supine triceps', 1, 'Tríceps', {
    reps: '10', load: 50, dir: 'up', breath: 'effort', caution: ['supine'],
    steps: ['Codos al costado y antebrazos al techo.', 'Exhalá y estirá los codos.', 'Inhalá y volvé sin mover los brazos.'],
    err: ['shoulders'], easier: 'Resorte más liviano.', harder: 'Resorte más pesado.'
});
pilatesRf('Círculos de brazos acostado', 'arm circles supine', 1, 'Hombros', {
    also: ['Espalda'], reps: '5 por sentido', load: 50, dir: 'up', breath: 'flow', caution: ['supine'],
    steps: ['Brazos al techo con las correas.', 'Llevalos sobre la cabeza, abrilos y bajalos dibujando un círculo.', 'Cambiá de sentido.'],
    err: ['ribs', 'shoulders'], easier: 'Círculos chicos.', harder: 'Piernas en mesa.'
});
pilatesRf('Expansión de pecho de rodillas', 'chest expansion kneeling', 1, 'Espalda', {
    also: ['Hombros', 'Tríceps'], reps: '8', load: 50, dir: 'up', breath: 'effort', caution: ['knees'],
    steps: ['De rodillas mirando a las correas, una en cada mano.', 'Exhalá y llevá los brazos estirados hacia atrás.', 'Girá la cabeza a un lado y al otro y volvé.'],
    err: ['ribs', 'shoulders'], easier: 'Sentado en el carro.', harder: 'Resorte más pesado.'
});
pilatesRf('Bíceps de rodillas', 'kneeling biceps', 1, 'Bíceps', {
    reps: '10', load: 50, dir: 'up', breath: 'effort', caution: ['knees'],
    steps: ['De rodillas de espaldas a las correas, brazos abiertos a la altura de los hombros.', 'Exhalá y flexioná los codos hacia la cabeza.', 'Inhalá y estirá.'],
    err: ['shoulders', 'ribs'], easier: 'Sentado.', harder: 'Resorte más pesado.'
});
pilatesRf('Remo hacia atrás', 'rowing back', 2, 'Espalda', {
    also: ['Core'], reps: '6', load: 50, dir: 'up', breath: 'articulate', caution: ['flexion'],
    steps: ['Sentado mirando a las correas con las manos en el pecho.', 'Exhalá y redondeá la espalda hacia atrás.', 'Estirá los brazos, subilos y llevalos adelante creciendo.'],
    err: ['collapse', 'shoulders'], easier: 'Resorte más liviano.', harder: 'Más lento.'
});
pilatesRf('Remo adelante: abrazo', 'rowing front hug a tree', 1, 'Pecho', {
    also: ['Hombros'], reps: '8', load: 50, dir: 'up', breath: 'effort',
    steps: ['Sentado de espaldas a las correas con los brazos abiertos y redondeados.', 'Exhalá y cerrá los brazos como abrazando un árbol.', 'Inhalá y abrí con control.'],
    err: ['shoulders', 'collapse'], easier: 'Resorte más liviano.', harder: 'Resorte más pesado.'
});
pilatesRf('Saludo', 'rowing salute', 2, 'Hombros', {
    also: ['Tríceps'], reps: '8', load: 50, dir: 'up', breath: 'effort',
    steps: ['Sentado de espaldas a las correas con las manos en la frente.', 'Exhalá y estirá los brazos hacia arriba y adelante.', 'Inhalá y volvé.'],
    err: ['shoulders', 'collapse'], easier: 'Resorte más liviano.', harder: 'Resorte más pesado.'
});
pilatesRf('Pecho de rodillas', 'kneeling chest press', 1, 'Pecho', {
    also: ['Tríceps'], reps: '10', load: 50, dir: 'up', breath: 'effort', caution: ['knees'],
    steps: ['De rodillas de espaldas a las correas, brazos abiertos.', 'Exhalá y empujá hacia adelante juntando las manos.', 'Inhalá y volvé.'],
    err: ['shoulders', 'ribs'], easier: 'Sentado.', harder: 'Resorte más pesado.'
});
pilatesRf('Tríceps de rodillas', 'kneeling triceps', 1, 'Tríceps', {
    reps: '10', load: 50, dir: 'up', breath: 'effort', caution: ['knees'],
    steps: ['De rodillas mirando a las correas, inclinado un poco hacia adelante con los codos atrás.', 'Exhalá y estirá los codos hacia atrás.', 'Inhalá y volvé.'],
    err: ['shoulders'], easier: 'Resorte más liviano.', harder: 'Resorte más pesado.'
});
pilatesRf('Aperturas laterales de rodillas', 'kneeling lateral raise', 1, 'Hombros', {
    reps: '10', load: 25, dir: 'up', breath: 'effort', caution: ['knees'],
    steps: ['De rodillas de costado a las correas, con la correa en la mano de afuera.', 'Exhalá y elevá el brazo al costado hasta el hombro.', 'Inhalá y bajá.'],
    err: ['shoulders', 'ribs'], easier: 'Resorte más liviano.', harder: 'Más lento.'
});

// ===================== CAJA LARGA =====================
pilatesRf('Tirón de correas', 'pulling straps', 1, 'Espalda', {
    also: ['Hombros'], reps: '8', load: 100, dir: 'up', breath: 'effort', caution: ['prone', 'extension'],
    steps: ['Boca abajo sobre la caja larga mirando a las correas, brazos estirados.', 'Exhalá y tirá de los brazos hacia la cadera elevando un poco el pecho.', 'Inhalá y volvé.'],
    err: ['shoulders', 'neck'], easier: 'Sin elevar el pecho.', harder: 'Más extensión.'
});
pilatesRf('Tirón en T', 't pull', 1, 'Espalda', {
    also: ['Hombros'], reps: '8', load: 50, dir: 'up', breath: 'effort', caution: ['prone', 'extension'],
    steps: ['Boca abajo sobre la caja con los brazos abiertos en T.', 'Exhalá y llevá los brazos hacia la cadera abriendo el pecho.', 'Inhalá y volvé.'],
    err: ['shoulders', 'neck'], easier: 'Resorte más liviano.', harder: 'Más lento.'
});
pilatesRf('Brazada de espalda', 'backstroke', 2, 'Core', {
    also: ['Hombros'], reps: '6', load: 100, dir: 'control', breath: 'flow', caution: ['flexion'],
    steps: ['Boca arriba sobre la caja, rodillas al pecho y manos en la frente.', 'Estirá brazos y piernas al techo.', 'Abrilos y hacé un círculo para volver.'],
    err: ['neck', 'lowback'], easier: 'Sin abrir.', harder: 'Piernas más bajas.'
});
pilatesRf('Uve en reformer', 'teaser on reformer', 3, 'Core', {
    reps: '4', load: 50, dir: 'down', breath: 'articulate', caution: ['flexion', 'balance'],
    steps: ['Sentado en la caja con las correas en las manos.', 'Bajá y subí a la uve sosteniendo las correas.', 'Sumá brazos arriba y abajo en la uve.'],
    err: ['momentum', 'shoulders'], easier: 'Uve de mat.', harder: 'Resorte más liviano.'
});
pilatesRf('Cisne en la caja larga', 'swan on long box', 2, 'Espalda', {
    also: ['Glúteos'], reps: '6', load: 100, dir: 'control', breath: 'flow', caution: ['prone', 'extension'],
    steps: ['Boca abajo sobre la caja con las manos en la barra.', 'Empujá el carro y elevá el pecho en extensión.', 'Volvé alargando la columna.'],
    err: ['shoulders', 'neck'], easier: 'Menos extensión.', harder: 'Más lento.'
});
pilatesRf('Natación en la caja larga', 'swimming on long box', 3, 'Espalda', {
    also: ['Glúteos'], reps: '20 tiempos', load: 0, dir: 'control', breath: 'flow', caution: ['prone', 'extension', 'balance'],
    steps: ['Boca abajo sobre la caja con los brazos y piernas largos.', 'Elevá brazos y piernas.', 'Alterná como en la natación de mat.'],
    err: ['shoulders', 'neck'], easier: 'Natación de mat.', harder: 'Más tiempo.'
});

// ===================== CAJA CORTA =====================
pilatesRf('Caja corta: espalda redonda', 'short box round back', 1, 'Core', {
    reps: '6', load: 300, dir: 'control', breath: 'articulate', caution: ['flexion'],
    steps: ['Sentado en la caja corta con los pies bajo la correa.', 'Exhalá y redondeá la espalda hacia atrás.', 'Inhalá y volvé apilando la columna.'],
    err: ['neck', 'momentum'], easier: 'Bajá menos.', harder: 'Con las manos detrás de la cabeza.'
});
pilatesRf('Caja corta: espalda plana', 'short box flat back', 2, 'Core', {
    reps: '5', load: 300, dir: 'control', breath: 'effort',
    steps: ['Sentado alto con los brazos arriba.', 'Inclinate hacia atrás con la espalda recta.', 'Volvé sin perder la línea.'],
    err: ['ribs', 'momentum'], easier: 'Brazos cruzados en el pecho.', harder: 'Brazos arriba con un bastón.'
});
pilatesRf('Caja corta: flexión lateral', 'short box side stretch', 2, 'Core', {
    reps: '4 por lado', load: 300, dir: 'control', breath: 'flow',
    steps: ['Sentado alto con los brazos arriba.', 'Inclinate de costado formando un arco.', 'Volvé al centro y cambiá.'],
    err: ['rotation', 'collapse'], easier: 'Rango chico.', harder: 'Con un bastón.'
});
pilatesRf('Caja corta: rotación', 'short box twist', 2, 'Core', {
    also: ['Espalda'], reps: '4 por lado', load: 300, dir: 'control', breath: 'flow',
    steps: ['Sentado alto con los brazos abiertos.', 'Rotá el torso hacia un lado y reclinate.', 'Volvé y cambiá.'],
    err: ['rotation', 'collapse'], easier: 'Solo rotar.', harder: 'Con un bastón.'
});
pilatesRf('Caja corta: trepar al árbol', 'short box tree', 3, 'Isquios', {
    also: ['Core'], reps: '3 por pierna', load: 300, dir: 'control', breath: 'articulate', caution: ['flexion'],
    steps: ['Sentado con una pierna al techo y las manos en el muslo.', 'Caminá con las manos por la pierna mientras te reclinás.', 'Volvé a subir por la pierna.'],
    err: ['momentum', 'collapse'], easier: 'Con la rodilla flexionada.', harder: 'Más bajo.'
});

// ===================== DE RODILLAS Y EN PLANCHA =====================
pilatesRf('Estiramiento largo (Long stretch)', 'long stretch', 2, 'Core', {
    also: ['Hombros'], reps: '5', load: 150, dir: 'down', breath: 'flow', caution: ['wrists'],
    steps: ['En plancha con las manos en la barra y los talones contra el apoyo.', 'Inhalá y empujá el carro hacia atrás manteniendo la plancha.', 'Exhalá y volvé.'],
    err: ['hips', 'shoulders'], easier: 'Más resortes.', harder: 'Menos resortes.'
});
pilatesRf('Estiramiento hacia abajo (Down stretch)', 'down stretch', 2, 'Espalda', {
    also: ['Hombros'], reps: '5', load: 150, dir: 'down', breath: 'flow', caution: ['knees', 'extension'],
    steps: ['De rodillas contra el apoyo con las manos en la barra y el pecho abierto.', 'Empujá el carro hacia atrás con la cadera.', 'Volvé con la espalda en extensión.'],
    err: ['shoulders', 'lowback'], easier: 'Más resortes.', harder: 'Menos resortes.'
});
pilatesRf('Estiramiento hacia arriba (Up stretch)', 'up stretch', 3, 'Core', {
    also: ['Hombros'], reps: '5', load: 150, dir: 'down', breath: 'flow', caution: ['wrists'],
    steps: ['Manos en la barra con la cadera alta en V invertida.', 'Pasá a plancha empujando el carro.', 'Volvé a subir la cadera.'],
    err: ['shoulders', 'hips'], easier: 'Más resortes.', harder: 'Menos resortes.'
});
pilatesRf('Elefante', 'elephant', 2, 'Core', {
    also: ['Isquios'], reps: '8', load: 150, dir: 'down', breath: 'flow', caution: ['wrists'],
    steps: ['De pie en el carro con las manos en la barra y la espalda redonda.', 'Empujá el carro con las piernas sin mover el torso.', 'Volvé con el abdomen.'],
    err: ['shoulders', 'knees'], easier: 'Más resortes.', harder: 'Espalda plana.'
});
pilatesRf('Estiramiento de rodillas: espalda redonda', 'knee stretches round', 1, 'Core', {
    also: ['Cuádriceps'], reps: '10', load: 150, dir: 'down', breath: 'flow', caution: ['knees', 'wrists'],
    steps: ['De rodillas en el carro con las manos en la barra y la espalda redonda.', 'Empujá el carro hacia atrás con las piernas.', 'Volvé sin mover el torso.'],
    err: ['shoulders', 'hips'], easier: 'Más resortes.', harder: 'Menos resortes y más rápido.'
});
pilatesRf('Estiramiento de rodillas: espalda arqueada', 'knee stretches arched', 2, 'Core', {
    also: ['Glúteos'], reps: '10', load: 150, dir: 'down', breath: 'flow', caution: ['knees', 'wrists', 'extension'],
    steps: ['Igual pero con la espalda en extensión y el pecho abierto.', 'Empujá el carro hacia atrás.', 'Volvé.'],
    err: ['lowback', 'shoulders'], easier: 'Más resortes.', harder: 'Menos resortes.'
});
pilatesRf('Rodillas despegadas', 'knees off', 3, 'Core', {
    also: ['Cuádriceps', 'Hombros'], reps: '8', load: 150, dir: 'down', breath: 'flow', caution: ['wrists'],
    steps: ['En cuatro apoyos con las rodillas despegadas del carro.', 'Empujá el carro con pequeños movimientos.', 'Mantené la espalda quieta.'],
    err: ['hips', 'shoulders'], easier: 'Rodillas apoyadas.', harder: 'Menos resortes.'
});
pilatesRf('Escalador en reformer', 'reformer mountain climber', 2, 'Core', {
    also: ['Hombros'], reps: '10 por pierna', load: 100, dir: 'down', breath: 'flow', caution: ['wrists'],
    steps: ['En plancha con las manos en la plataforma y un pie en el carro.', 'Llevá el carro hacia adelante con una rodilla.', 'Alterná las piernas.'],
    err: ['hips', 'shoulders'], easier: 'Más resortes.', harder: 'Menos resortes.'
});
pilatesRf('Semicírculo', 'semi circle', 3, 'Espalda', {
    also: ['Glúteos'], reps: '4 por sentido', load: 200, dir: 'control', breath: 'articulate', caution: ['extension'],
    steps: ['Boca arriba con la cadera elevada y las manos en los hombros apoyados.', 'Empujá el carro, bajá la columna y volvé subiendo en puente.', 'Cambiá de sentido.'],
    err: ['neck', 'lowback'], easier: 'Rango chico.', harder: 'Más lento.'
});

// ===================== PIERNAS DE PIE Y DE COSTADO =====================
pilatesRf('Patinador (Scooter)', 'scooter', 2, 'Glúteos', {
    also: ['Cuádriceps'], reps: '10 por pierna', load: 100, dir: 'up', breath: 'flow', caution: ['balance'],
    steps: ['De pie al costado del reformer con un pie en el piso y la rodilla del otro en el carro, apoyado en la barra.', 'Empujá el carro hacia atrás con la pierna del carro.', 'Volvé con control.'],
    err: ['hips', 'knees'], easier: 'Menos resortes.', harder: 'Más resortes.'
});
pilatesRf('Estocada en reformer', 'reformer lunge', 2, 'Cuádriceps', {
    also: ['Glúteos', 'Isquios'], reps: '6 por pierna', load: 100, dir: 'control', breath: 'flow', caution: ['balance', 'knees'],
    steps: ['Un pie en la plataforma y la rodilla del otro en el carro.', 'Deslizá el carro hacia atrás estirando la pierna de atrás.', 'Volvé.'],
    err: ['knees', 'hips'], easier: 'Rango chico.', harder: 'Sin manos.'
});
pilatesRf('Sirena en reformer', 'mermaid on reformer', 1, 'Espalda', {
    also: ['Core'], reps: '4 por lado', load: 50, dir: 'control', breath: 'flow',
    steps: ['Sentado de costado en el carro con una mano en la barra.', 'Empujá el carro y estirate formando un arco.', 'Volvé y estirate hacia el otro lado.'],
    err: ['collapse', 'shoulders'], easier: 'Rango chico.', harder: 'Sumá rotación.'
});
pilatesRf('Divisiones laterales', 'side splits', 2, 'Cuádriceps', {
    also: ['Glúteos'], reps: '8', load: 100, dir: 'down', breath: 'flow', caution: ['balance'],
    steps: ['De pie, un pie en la plataforma y otro en el carro, mirando al costado.', 'Abrí las piernas deslizando el carro.', 'Cerralas con los aductores.'],
    err: ['knees', 'hips'], easier: 'Más resortes.', harder: 'Menos resortes.'
});
pilatesRf('Divisiones de frente', 'front splits', 3, 'Isquios', {
    also: ['Cuádriceps'], reps: '5 por lado', load: 100, dir: 'down', breath: 'flow', caution: ['balance'],
    steps: ['Un pie en la plataforma y el otro atrás contra el apoyo del carro.', 'Deslizá el carro hacia atrás bajando con la espalda recta.', 'Volvé.'],
    err: ['hips', 'knees'], easier: 'Rango chico.', harder: 'Menos resortes.'
});
pilatesRf('Sentadilla de pie', 'standing squats on reformer', 2, 'Cuádriceps', {
    also: ['Glúteos'], reps: '10', load: 100, dir: 'up', breath: 'effort', caution: ['balance', 'knees'],
    steps: ['De pie con un pie en la plataforma y otro en el carro.', 'Bajá en sentadilla.', 'Subí empujando por igual.'],
    err: ['knees'], easier: 'Rango chico.', harder: 'Más lento.'
});
pilatesRf('Patada de glúteo de rodillas', 'kneeling glute kickback', 1, 'Glúteos', {
    also: ['Isquios'], reps: '10 por pierna', load: 50, dir: 'up', breath: 'effort', caution: ['knees', 'wrists'],
    steps: ['En cuatro apoyos con un pie contra el apoyo del carro.', 'Empujá el carro estirando la pierna hacia atrás.', 'Volvé.'],
    err: ['hips', 'lowback'], easier: 'Resorte más liviano.', harder: 'Resorte más pesado.'
});
pilatesRf('Abducción de pie', 'standing side leg press', 2, 'Glúteos', {
    reps: '10 por pierna', load: 50, dir: 'down', breath: 'effort', caution: ['balance'],
    steps: ['De pie al costado con un pie en el carro.', 'Empujá el carro hacia afuera con la pierna.', 'Volvé.'],
    err: ['hips', 'knees'], easier: 'Más resortes.', harder: 'Menos resortes.'
});
pilatesRf('Plancha lateral en reformer', 'side plank on reformer', 3, 'Core', {
    also: ['Hombros'], reps: '6 por lado', load: 100, dir: 'down', breath: 'flow', caution: ['wrists', 'balance'],
    steps: ['Mano en la plataforma y pies en el carro de costado.', 'Abrí y cerrá el carro manteniendo la plancha lateral.', 'Cambiá de lado.'],
    err: ['hips', 'shoulders'], easier: 'Rodilla apoyada.', harder: 'Menos resortes.'
});
pilatesRf('Estiramiento de tendón (Tendon stretch)', 'tendon stretch', 3, 'Core', {
    also: ['Hombros'], reps: '5', load: 100, dir: 'down', breath: 'flow', caution: ['wrists', 'balance'],
    steps: ['Sentado en la barra con las manos y los pies en la barra.', 'Empujá el carro con los pies elevando la cadera.', 'Volvé.'],
    err: ['shoulders', 'hips'], easier: 'Más resortes.', harder: 'Menos resortes.'
});
pilatesRf('Puente a una pierna en reformer', 'single leg bridge reformer', 2, 'Glúteos', {
    also: ['Isquios'], reps: '8 por pierna', load: 150, dir: 'up', breath: 'effort', caution: ['supine'],
    steps: ['Puente con un pie en la barra y la otra pierna al techo.', 'Empujá el carro con la pierna de apoyo.', 'Volvé sin bajar la cadera.'],
    err: ['hips', 'pelvis'], easier: 'Con los dos pies.', harder: 'Más resortes.'
});
pilatesRf('Caballito (Horseback)', 'horseback', 3, 'Core', {
    also: ['Cuádriceps'], reps: '4', load: 100, dir: 'control', breath: 'effort', caution: ['balance'],
    steps: ['Sentado a caballo sobre la caja larga con las correas en las manos.', 'Elevá la cadera apretando la caja con las piernas.', 'Volvé.'],
    err: ['shoulders', 'momentum'], easier: 'Rango chico.', harder: 'Más tiempo arriba.'
});
registerPilatesMuscles();
