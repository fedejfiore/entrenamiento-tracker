// Tutorial de la app: se abre desde Ajustes → Ayuda. Secciones desplegables con buscador.
// Mantener este contenido al día cuando cambie cómo funciona algo (ver docs/ARQUITECTURA.md).

const HELP_SECTIONS = [
    {
        id: 'ventajas', icon: '✨', title: 'Lo que tiene esta app',
        html: `
            <ul>
                <li><b>Contador de reps con cadencia y voz:</b> te marca el ritmo de cada repetición, te da tiempo para prepararte y te alienta ("¡la mitad!", "¡última!") sin dejar de decirte en qué rep vas. Elegí el estilo de la voz (neutro, tierno, militar, motivador o calma) o grabá / subí tus propios audios.</li>
                <li><b>Programas con progresión automática:</b> te dice cuántas reps y qué peso hacer cada día (primero subís reps, después peso).</li>
                <li><b>Unilaterales de verdad:</b> cada serie se marca de un lado y del otro, con unos segundos para cambiar de lado en vez de un descanso.</li>
                <li><b>Descanso y Tabata guiados por voz,</b> con aviso a los 10 segundos y ±15 s en el momento.</li>
                <li><b>Rutinas y gráficos sin límite:</b> otras apps cobran por tener más de 3 o 4 rutinas o por ver tu progreso.</li>
                <li><b>Mapa de músculos</b> con cuántas series por semana hace cada uno, comparado con el rango ideal, y la semana en curso.</li>
                <li><b>Superseries y circuitos</b> que manejan solos el descanso, y <b>calculadora de discos y de placas</b> (poleas y máquinas).</li>
                <li><b>Cualquier tipo de ejercicio:</b> kg, solo reps, tiempo en la unidad que prefieras, duración o distancia con km/h calculado.</li>
                <li><b>Récords más justos:</b> también cuenta como récord hacer lo mismo con menos descanso.</li>
                <li><b>Plan semanal con recordatorios</b> en tu calendario.</li>
                <li><b>Compartir rutinas por link</b> (ideal para entrenadores y alumnos), <b>medallas</b> que se ganan con tu historial y <b>fotos de progreso</b>.</li>
                <li><b>Pensada para todos:</b> colores que se leen bien en cualquier tema (norma WCAG AA), opción para daltonismo y botones grandes.</li>
                <li><b>Sin cuenta y sin internet:</b> tus datos quedan en tu teléfono, y el backup se lleva todo (con contraseña si querés).</li>
            </ul>`
    },
    {
        id: 'inicio-rapido', icon: '🚀', title: 'Primeros pasos',
        html: `
            <p><b>Esō Agōn</b> (en griego, <i>la lucha interior</i>: el agón era la competencia de los Juegos Olímpicos antiguos) registra tus entrenamientos de gimnasio, cardio y Tabata, calcula tus récords y te muestra cómo venís progresando. Es un producto de Inquieto.</p>
            <ul>
                <li><b>Sin cuenta:</b> todo se guarda en este celular (o navegador). Nada se sube a internet.</li>
                <li><b>Funciona sin internet</b> una vez que la abriste al menos una vez.</li>
                <li><b>Instalala como app:</b> en Android, menú ⋮ del navegador → <i>Instalar app</i> o <i>Agregar a pantalla de inicio</i>. En iPhone (Safari), botón Compartir → <i>Agregar a inicio</i>.</li>
                <li><b>Barra de abajo</b> (en el celular): Inicio, Entrenar, Historial y Progreso, al alcance del pulgar. <b>Más</b> abre el resto (Medidas, Biblioteca, Perfil y Ajustes) en un menú que sale por la izquierda con las opciones abajo, al alcance del pulgar. Mientras escribís, la barra se esconde para no tapar el teclado. En la compu, el menú está en el ☰ de arriba.</li>
                <li><b>Si recargás la página</b> (o se cierra la app), volvés a la misma pantalla, con las mismas secciones abiertas y a la misma altura.</li>
                <li><b>🔅</b> (arriba) mantiene la pantalla encendida mientras entrenás. El <b>tema</b> (automático como el celular, oscuro o claro) está en Ajustes → General.</li>
                <li><b>Secciones plegadas:</b> en todas las pantallas cada sección muestra en una línea qué tiene; tocá la que necesites. En Inicio quedan abiertas <b>Hoy</b> y el <b>Calendario</b>.</li>
                <li><b>Ajustes:</b> cada sección está cerrada y muestra en una línea qué tiene; tocá la que necesites para abrirla. En <b>General</b>: el tema, el color de la app, las <b>unidades</b> (peso en kg o libras, distancia en km o millas), el día en que empieza tu semana y los segundos para cambiar de lado en los unilaterales. Los 6 colores tienen una versión para tema claro y otra para oscuro, y todos se leen bien (contraste de la norma WCAG AA).</li>
                <li><b>Ajustes → Accesibilidad:</b> botones y campos <b>grandes</b> o <b>muy grandes</b> (para usar con una mano o con dedos grandes) , <b>alto contraste</b> (fondo negro o blanco puro, texto pleno y bordes marcados, para leer al sol) y <b>colores para daltonismo</b> (azul y naranja en vez de verde y rojo). Abajo hay una vista previa que cambia al tocar cada opción.</li>
            </ul>
            <p class="help-tip">💾 Como los datos viven en el celular, descargá un <b>backup</b> de vez en cuando (Ajustes → Datos). Es lo que te permite recuperar todo si cambiás de teléfono o borrás el navegador.</p>`
    },
    {
        id: 'entrenar', icon: '🏋️', title: 'Entrenar: una sesión paso a paso',
        html: `
            <ol>
                <li>En <b>Entrenar</b>, pestaña <b>🏋️ Rutina</b>, elegí la rutina del día en el selector (o tocá ▶ Entrenar en la Biblioteca). Para intervalos, pestaña <b>⏱️ Tabata / Intervalos</b>.</li>
                <li>Tocá <b>▶ Iniciar Rutina</b> para medir la duración. Si te olvidás, arranca sola cuando cargás el primer dato.</li>
                <li>En cada ejercicio, cargá las series y tocá <b>✓</b> al terminar cada una: arranca el descanso.</li>
                <li>Al tildar la <b>última serie</b> de la sesión, la app te pregunta si guardar: elegí cómo te sentiste y tocá <b>✅ Guardar sesión</b> (o <b>Seguir entrenando</b>). Si dejaste algún ejercicio sin hacer, guardá desde <b>Finalizar Sesión</b>, al final de Entrenar (ahí también podés sumar una nota).</li>
            </ol>
            <p><b>No perdés nada:</b> lo que vas cargando se guarda solo. Si cerrás la app sin guardar, al volver te recupera la sesión del día.</p>
            <p>Solo se guardan las series que marcaste con ✓ o en las que escribiste algo. Lo que se ve en gris no se guarda por sí solo.</p>`
    },
    {
        id: 'series', icon: '📋', title: 'Series: cómo cargarlas',
        html: `
            <p>Cada ejercicio es un bloque con <b>una fila por serie</b>. Las columnas dependen de cómo se mide el ejercicio (ver <i>Tipos de medición</i>).</p>
            <ul>
                <li><b>Valores en gris:</b> son los de la última vez. Si hiciste lo mismo, tocá <b>✓</b> y se completan solos.</li>
                <li><b>Desc s:</b> descanso en segundos después de esa serie. Al tocar ✓ arranca el timer con ese tiempo (90 s si está vacío).</li>
                <li><b>RIR:</b> repeticiones que te quedaban en reserva. <b>F</b> = llegaste al fallo; 1, 2, 3, 4+ = cuántas más podrías haber hecho.</li>
                <li><b>📝</b> agrega una nota a esa serie (ej. "se me fue la técnica").</li>
                <li><b>+ Agregar serie</b> suma una abajo; <b>−</b> quita la última. Si estaba completada o tenía datos, te pregunta antes.</li>
                <li><b>Calentamiento (la C):</b> tocá el número de la serie y pasa a <b>C</b>: es una serie de calentamiento o aproximación. Se guarda, pero no cuenta para volumen, récords ni el mapa de músculos. Tocá la C para volver a serie normal.</li>
                <li><b>Nota del ejercicio:</b> abajo de las series. La nota de la última vez aparece con 💡.</li>
                <li><b>Ejercicio terminado:</b> cuando todas sus series tienen ✓, el bloque se contrae y muestra un resumen. Tocá <b>▸</b> al lado del nombre para volver a abrirlo (y <b>▾</b> para contraerlo cuando quieras).</li>
                <li>Punto o coma da igual: <b>22.5</b> y <b>22,5</b> se guardan igual.</li>
            </ul>`
    },
    {
        id: 'ajuste-rapido', icon: '➕', title: 'Botones rápidos (+/−)',
        html: `
            <p>Al tocar un campo de una serie aparece debajo una barra para subir o bajar sin escribir:</p>
            <ul>
                <li><b>Kg:</b> −5, −2,5, +2,5, +5</li>
                <li><b>Reps:</b> −1, +1 · <b>Km:</b> ±0,5 y ±1</li>
                <li><b>Tiempo y descanso:</b> según la unidad (segundos o minutos)</li>
            </ul>
            <p>Si el campo está vacío, parte del valor de la última vez. La barra se va sola cuando terminás de editar: al tocar <i>Listo</i> o cerrar el teclado, al tocar fuera de la serie o al marcarla con ✓.</p>
            <p>En las máquinas de placas, junto al peso se ve en qué placa va la clavija (ej. <b>placa 7</b>).</p>`
    },
    {
        id: 'tipos', icon: '⚖️', title: 'Tipos de medición (kg, reps, tiempo, km)',
        html: `
            <p>Cada ejercicio se mide de una forma. Se cambia con el selector debajo del nombre del ejercicio:</p>
            <ul>
                <li><b>Kg + reps:</b> fuerza con peso.</li>
                <li><b>Solo reps:</b> peso corporal (flexiones, dominadas).</li>
                <li><b>Tiempo:</b> esfuerzos por tiempo con descanso (plancha, isométricos).</li>
                <li><b>Duración:</b> actividades largas sin descanso entre series (fútbol, clases).</li>
                <li><b>Tiempo + km:</b> cardio con distancia (bici, correr). La velocidad se calcula sola.</li>
                <li><b>Unidades:</b> peso en <b>kg o libras</b> y distancia en <b>km o millas</b> (Ajustes → General → Unidades). Tu historial no cambia: se guarda en kg y km y se convierte al mostrarlo. En libras, la barra rápida suma de a 5 y 10 lb y la calculadora usa barra de 45 lb y discos en libras.</li>
            </ul>
            <p>Al agregar un ejercicio nuevo, la app sugiere el tipo por el nombre ("Plancha" → Tiempo, "Bici" → Tiempo + km). El tipo vale para ese ejercicio en todas las rutinas. Cambiarlo no toca el historial ni borra lo que cargaste hoy.</p>
            <p>En cardio, en vez de RIR aparece <b>Esfuerzo</b> (Suave, Media, Alta, Máx).</p>`
    },
    {
        id: 'tiempo', icon: '⏱️', title: 'Tiempo: segundos, minutos u horas',
        html: `
            <p>Tocá el encabezado de la columna de tiempo (ej. <b>Min ⇄</b>) para elegir cómo cargarlo en ese ejercicio: <b>Seg → m:ss → Min → h:mm</b>. Lo que ya cargaste se convierte, y la elección queda guardada.</p>
            <ul>
                <li><b>Seg:</b> tipeás segundos (45).</li>
                <li><b>m:ss y h:mm:</b> tipeás solo números y se acomodan solos, como en un microondas: 145 → 1:45.</li>
                <li><b>Min:</b> minutos, con coma o punto (60, 32,5).</li>
            </ul>
            <p>Para leer, la app siempre usa unidades: <b>45 s</b>, <b>1 min 30 s</b>, <b>1 h</b>, <b>1 h 05 min</b>.</p>`
    },
    {
        id: 'organizar', icon: '🗂️', title: 'Organizar los ejercicios de una rutina',
        html: `
            <ul>
                <li><b>Reordenar:</b> mantené apretados los puntos <b>⠿</b> a la izquierda del ejercicio hasta que se llenen de color (y vibre), y arrastrá. Los bloques se achican para moverlos fácil, y si llegás al borde la pantalla se desplaza sola. El orden queda guardado. Con teclado: foco en los puntos y flechas ↑ ↓.</li>
                <li><b>Agregar:</b> abajo de todo, escribí el nombre (o elegí uno existente), revisá el tipo y tocá <b>+ Agregar</b>. Si se parece a uno que ya existe, te pregunta si es el mismo.</li>
                <li><b>Ver su progreso:</b> tocá el nombre del ejercicio.</li>
                <li><b>Renombrar:</b> tocá dos veces el nombre.</li>
                <li><b>✕</b> lo quita solo de la sesión de hoy. <b>📥</b> lo archiva en esa rutina: deja de aparecer, pero su historial queda. Los archivados están en el <i>Reservorio de ejercicios</i>, al final de la rutina, para restaurarlos.</li>
            </ul>`
    },
    {
        id: 'superseries', icon: '🔗', title: 'Superseries y circuitos',
        html: `
            <ol>
                <li>Tocá <b>🔗</b> debajo del nombre de un ejercicio.</li>
                <li>Elegí con cuáles se hace seguido (con 3 o más es una triserie o un circuito) y tocá <b>Guardar superserie</b>.</li>
            </ol>
            <ul>
                <li>Cada superserie tiene una letra (A, B…) y un color en el borde del bloque.</li>
                <li>Al tildar una serie, la app te lleva a la misma serie del ejercicio siguiente, <b>sin descanso</b>. El descanso arranca recién al terminar el último ejercicio de la vuelta.</li>
                <li>Queda guardada en la rutina y se marca en el historial. Para deshacerla: 🔗 → <b>Quitar de la superserie</b>.</li>
            </ul>`
    },
    {
        id: 'unilaterales', icon: '↔️', title: 'Ejercicios unilaterales (de a un lado)',
        html: `
            <p>En ejercicios como remo a un brazo, búlgara o curl femoral unilateral, cada serie se hace de un lado y después del otro.</p>
            <ul>
                <li>Tocá <b>↔</b> debajo del nombre para marcarlo como unilateral (queda <b>↔ Por lado</b>). Los que tienen "a un brazo", "unilateral" o "búlgara" en el nombre ya vienen marcados.</li>
                <li>El primer ✓ marca un lado: la serie queda en <b>½</b> y solo tenés unos segundos para cambiar de lado (5 por defecto, se cambia en Ajustes → General), no un descanso. El segundo ✓ la completa y recién ahí arranca el descanso.</li>
                <li>Con <b>▶ Contar reps</b> cuenta un lado, te avisa "Cambiá de lado", cuenta el otro y después descansás.</li>
                <li>Las reps y el peso que cargás son <b>por lado</b>.</li>
            </ul>`
    },
    {
        id: 'discos', icon: '🧮', title: 'Calculadora de discos y de placas',
        html: `
            <p>Al tocar el peso de una serie, en la barra de botones rápidos aparece <b>🧮</b>. Te dice qué discos poner de cada lado de la barra para ese peso.</p>
            <ul>
                <li>Elegí la barra (olímpica de 20 kg, de 15, técnica, Z o sin barra) y tocá los discos que tenés en tu gimnasio. La app los recuerda.</li>
                <li>Busca la combinación con menos discos, aunque falten algunos. Si el peso no se puede armar exacto, te muestra el más cercano por debajo y por encima.</li>
                <li><b>Usar este peso</b> lo pasa a la serie.</li>
            </ul>
            <p><b>Máquinas de placas y poleas:</b> en <i>Equipo</i> elegí <b>Máquina de placas / polea</b> y te dice en qué placa va la clavija. Por defecto: unos 5 kg sin placas (el carro y el cable), 10 kg con la clavija en la primera placa y 5 kg más por placa. Cambialo según tu máquina: queda guardado para ese ejercicio. Los ejercicios de polea, jalón o máquina ya arrancan en este modo. Son valores aproximados: cada máquina (y cada sistema de roldanas) es distinta.</p>`
    },
    {
        id: 'rutinas', icon: '📚', title: 'Rutinas',
        html: `
            <ul>
                <li><b>Crear:</b> en Entrenar, escribí el nombre en "Nombre de rutina nueva" y tocá <b>➕ Crear</b>. Después agregale ejercicios.</li>
                <li><b>✏️ Renombrar</b> y <b>📥 Archivar</b> aparecen al elegir una rutina. Archivar no borra nada: la rutina deja de aparecer en el selector.</li>
                <li><b>Biblioteca → Rutinas:</b> todas tus rutinas (las tuyas, las de programas, las básicas y las <b>archivadas</b>, para restaurarlas o borrarlas definitivamente). Desde ahí: <b>▶ Entrenar</b>, <b>🔗 Compartir</b> y <b>📥 Archivar</b>.</li>
                <li><b>Compartir una rutina:</b> 🔗 arma un link (se manda por WhatsApp o donde quieras). Quien lo abre la agrega a su Biblioteca con un toque, con sus objetivos. No hace falta cuenta: la rutina viaja dentro del link. También se puede pegar el link en <b>Biblioteca → Importar una rutina</b>.</li>
                <li><b>Rutina sugerida</b> (Inicio): la que hace más tiempo que no hacés. Tocala para empezarla.</li>
            </ul>`
    },
    {
        id: 'programas', icon: '🎯', title: 'Programas con progresión',
        html: `
            <p>En <b>Inicio → Programa</b> (o <b>Biblioteca → Programas</b>), <b>📚 Ver programas</b> muestra programas armados (cuerpo completo, en casa, fuerza 5×5, torso/pierna, empuje/tirón/pierna, glúteos y piernas) con sus días y ejercicios.</p>
            <ol>
                <li><b>Empezar este programa</b> crea sus rutinas (ej. "Completo · Día A") y, si querés, pone sus días en tu plan semanal.</li>
                <li>En Inicio ves qué día te toca y lo empezás con <b>▶ Entrenar</b>.</li>
                <li>Cada ejercicio muestra su objetivo (🎯 3 × 8–12) y qué hacer hoy. Los valores sugeridos aparecen en gris: si los hiciste, tocá ✓.</li>
            </ol>
            <p><b>Progresión doble: primero reps, después peso.</b> Con el mismo peso vas sumando una rep por serie. Cuando llegás al tope del rango en todas las series, la app te sugiere subir el peso (de a 2,5 o 5 kg, o una placa en las máquinas) y volver al mínimo del rango. Si no llegaste al mínimo, repetís el peso. En los de peso corporal, al llegar arriba te sugiere una variante más difícil.</p>
            <p><b>Terminar</b> deja las rutinas y todo tu historial; solo se dejan de mostrar los objetivos.</p>`
    },
    {
        id: 'descanso', icon: '⏳', title: 'Timer de descanso',
        html: `
            <ul>
                <li>Arranca solo al marcar una serie con ✓, con el descanso de esa serie.</li>
                <li><b>−15s / +15s</b> para ajustarlo en el momento; <b>Saltar</b> lo termina.</li>
                <li>Avisa por voz cuando quedan 10 segundos y suena al terminar (se configura en Ajustes).</li>
                <li>En los ejercicios de Duración y de Tiempo + km no hay descanso ni timer.</li>
            </ul>`
    },
    {
        id: 'contador', icon: '🔢', title: 'Contador de reps con cadencia',
        html: `
            <p>En los ejercicios con reps, <b>▶ Contar reps</b> cuenta la próxima serie sin marcar:</p>
            <ol>
                <li>Primero te da unos segundos para prepararte (5 por defecto): "Preparate… 3, 2, 1, ¡Ya!".</li>
                <li>Un tic por rep marca el ritmo, y uno más grave a mitad de cada rep marca la <b>ida y vuelta</b>.</li>
                <li>La voz dice el número al empezar cada rep y los ánimos (la mitad, quedan cinco, quedan dos, ¡última!) a mitad de la rep, así nunca perdés la cuenta.</li>
                <li>En los unilaterales cuenta un lado, te da unos segundos para cambiar y cuenta el otro.</li>
                <li>Al terminar, marca la serie como hecha y arranca el descanso.</li>
            </ol>
            <p>Mientras cuenta: <b>🐢 Más lento / 🐇 Más rápido</b> (la cadencia queda guardada para ese ejercicio), <b>⏸ Pausa</b>, <b>±1 rep</b> y <b>✕</b> para detenerlo. La cantidad de reps sale de lo cargado en la serie o, si está vacía, de la última vez.</p>`
    },
    {
        id: 'voz', icon: '🗣️', title: 'Voz, sonidos y tus grabaciones',
        html: `
            <ul>
                <li><b>Sonido</b> (Ajustes): el aviso de fin de descanso y su volumen.</li>
                <li><b>Voz y avisos:</b> la app habla con la voz del celular, sin internet. Cada aviso (descanso, contador, Tabata, récords) se activa por separado. También podés elegir la voz y su velocidad.</li>
                <li><b>Estilo:</b> <b>Neutro</b>, <b>Tierno</b>, <b>Militar</b>, <b>Motivador</b> o <b>Calma</b>. Cambia las frases ("¡Cinco más, sin excusas!") y el tono de la voz.</li>
                <li><b>Voz y tono:</b> elegí entre las voces del celular y ajustá el tono (más grave o más agudo). Para tener voces de hombre y de mujer, instalalas en el celular (Android: Ajustes → Sistema → Idioma → Salida de texto a voz; iPhone: Accesibilidad → Contenido leído → Voces).</li>
                <li><b>Sonido propio:</b> en Mis grabaciones, 📁 en cualquier aviso sube un sonido o una voz. En la app instalable desde Google Play vas a poder elegir los sonidos del sistema.</li>
                <li><b>Mis grabaciones:</b> para cada aviso podés <b>● grabar</b> tu voz (o la de tu entrenador, hasta 5 segundos) o <b>📁 subir un audio</b> (un sonido o una voz, hasta 1 MB). El silencio del principio y del final se recorta solo. Lo que no grabes lo dice la voz del celular con el estilo elegido; los números siempre los dice la voz del celular. Todo se incluye en el backup.</li>
            </ul>`
    },
    {
        id: 'tabata', icon: '🔥', title: 'Tabata e intervalos',
        html: `
            <ol>
                <li>En <b>Entrenar → pestaña ⏱️ Tabata / Intervalos</b>, poné un nombre al bloque (ej. Burpees), los segundos de trabajo, de descanso y las rondas.</li>
                <li><b>▶ Iniciar Bloque:</b> el timer alterna trabajo y descanso (con colores distintos y el texto de la fase), con voz y cuenta 3-2-1.</li>
                <li>Podés encadenar varios bloques. Tocar el timer corta el bloque y guarda lo hecho.</li>
                <li><b>⏹ Finalizar Sesión Tabata</b> guarda todos los bloques juntos como un entrenamiento.</li>
            </ol>`
    },
    {
        id: 'musica', icon: '🎵', title: 'Música',
        html: `
            <p>En Entrenar, los botones <b>Spotify</b> y <b>YouTube Music</b> abren esas apps. Si guardás el link de tu playlist en Ajustes → Música (en la app de música: Compartir → Copiar link), se abre directo en ella.</p>
            <p>Pausar o pasar de tema se hace desde la app de música o los controles del celular: una web no puede manejar otra app.</p>`
    },
    {
        id: 'historial', icon: '🗓️', title: 'Historial',
        html: `
            <ul>
                <li>Mirá las <b>últimas sesiones</b>, o filtrá <b>por mes</b> o <b>por año</b>. Arriba hay un resumen del período.</li>
                <li>Tocá una sesión para ver cada ejercicio y serie, los récords y las notas.</li>
                <li><b>✏️</b> cambia la fecha de una sesión. <b>🗑</b> borra una sesión cargada por error.</li>
                <li>🏆 marca las sesiones con récord.</li>
            </ul>`
    },
    {
        id: 'progreso', icon: '📈', title: 'Progreso y récords',
        html: `
            <ul>
                <li>Las secciones están cerradas: tocá la que quieras ver.</li>
                <li><b>Cómo se cuentan las series:</b> cada serie de un ejercicio cuenta 1 para su músculo principal y <b>media serie</b> para los que ayudan (el tríceps y el hombro en un press de pecho, el bíceps en un remo o un jalón, los glúteos en una sentadilla). Es el método que mejor predice el crecimiento según la evidencia más completa (Pelland y colegas, 2025, 67 estudios). El rango de 10 a 20 series por semana sale de esos mismos estudios (Schoenfeld y colegas, 2017).</li>
                <li><b>Piernas por partes:</b> los <b>cuádriceps</b> (frente del muslo: sentadillas, prensa, extensiones) se ven en la figura de frente, y los <b>isquios</b> (atrás: curl femoral, peso muerto rumano) en la de espalda. Si un ejercicio quedó en el grupo equivocado, cambialo desde su detalle (tocá el nombre) o en Biblioteca → Ejercicios.</li>
                <li><b>Músculos trabajados:</b> una figura de frente y de espalda con las series de cada músculo (sin calentamiento), en 5 niveles bien distintos: <b>sin trabajo</b> (gris), <b>bajo</b>, <b>moderado</b>, <b>ideal</b> (color pleno con borde: 10 a 20 series por semana, el rango habitual para ganar músculo) y <b>alto</b> (con rayas: más de 20). Tocá un músculo para ver qué ejercicios lo trabajaron.</li>
                <li><b>Período del mapa:</b> <b>últimos 7 días</b> (los 7 días corridos hasta hoy, no depende de la semana; es el que viene por defecto), <b>esta semana</b> (en curso, con lo que falta para el rango y los días que quedan), la semana pasada, o el promedio de las últimas 4 o 12 semanas. El día en que empieza la semana se elige en Ajustes → General.</li>
                <li><b>Análisis de Progresión:</b> cada ejercicio comparado con la sesión anterior o con hace 1, 3, 6 o 12 meses (volumen, reps y peso máximo). En <b>Ver</b> elegís: todos los ejercicios, los de la <b>última sesión</b>, agrupados <b>por rutina</b> o <b>por grupo muscular</b> (pecho, espalda, cuádriceps, isquios…).</li>
                <li><b>Tocá un ejercicio</b> para abrir sus gráficos: peso promedio, 1RM estimado, reps y volumen. Ahí mismo podés <b>cambiarle el grupo muscular</b>.</li>
            </ul>
            <p><b>Qué cuenta como récord</b> al guardar una sesión: más peso, más reps, más volumen, o el mismo esfuerzo con menos descanso. En cardio: más distancia, más velocidad o más duración. El calentamiento no cuenta.</p>`
    },
    {
        id: 'inicio', icon: '🏠', title: 'Inicio',
        html: `
            <ul>
                <li><b>Hoy:</b> fecha, último entreno, duración de la sesión en curso y la rutina sugerida.</li>
                <li><b>Programa:</b> el programa en curso y qué día te toca (ver <i>Programas con progresión</i>).</li>
                <li><b>Estadísticas:</b> total de entrenamientos, desde cuándo y promedio semanal.</li>
                <li><b>Calendario:</b> los días entrenados de cada mes, con ◀ ▶ para moverte.</li>
                <li><b>Últimas Rutinas:</b> peso y reps promedio de tus últimas sesiones de fuerza.</li>
            </ul>`
    },
    {
        id: 'plan', icon: '🗓️', title: 'Plan semanal y recordatorios',
        html: `
            <ol>
                <li>En <b>Inicio → Mi plan semanal</b>, tildá los días que entrenás y elegí la hora y los minutos de cada uno (puede ser distinto cada día).</li>
                <li>Elegí con cuánta anticipación querés el aviso y tocá <b>💾 Guardar plan</b>.</li>
                <li>Agregalo a tu calendario: <b>📅 Google Calendar</b> (un botón por cada horario) o <b>📥 Agregar al calendario del celular</b> (iPhone y otros calendarios).</li>
            </ol>
            <ul>
                <li>Los avisos los da el <b>calendario del celular</b>, así llegan aunque la app esté cerrada.</li>
                <li>Al abrir la app, arriba de Inicio ves si hoy toca entrenar (con la rutina sugerida para empezar de un toque), si ya entrenaste o si es día de descanso.</li>
                <li>El estado de la semana te dice si vas al día con tu plan.</li>
                <li><b>🌱 Tu flor</b> (Inicio → Hoy): crece con cada semana en que entrenás tantos días como dice tu plan. Semilla → brote (1 semana) → capullo (3) → flor (6) → flor con frutos (10), y un fruto más cada 4 semanas. Cada entrenamiento es una gota 💧. Si una semana no llegás, se usa sola una <b>semana libre</b> (empezás con 2 y se suma 1 por mes, hasta 3); sin semanas libres se marchita un poco, pero nunca vuelve atrás y se recupera con la próxima semana cumplida.</li>
                <li>Cambiar el plan rige desde esta semana: las semanas anteriores se siguen evaluando con el plan que tenían. Si cambiás días u horarios, borrá los eventos viejos del calendario y volvé a agregarlos.</li>
            </ul>`
    },
    {
        id: 'medidas', icon: '📏', title: 'Medidas corporales y fotos',
        html: `
            <ul>
                <li><b>Medidas:</b> cargá fecha y peso (obligatorios) y, si querés, grasa, músculo, agua, cintura y una <b>📷 foto de progreso</b>. El gráfico de <i>Evolución</i> muestra cómo cambian, y podés fijar la escala. Las fotos se ven en <b>Perfil → Fotos de progreso</b>.</li>
                <li><b>Variantes:</b> ahora están en <b>Biblioteca → Ejercicios</b>: alternativas para cada ejercicio, agrupadas por músculo, con un link a videos de la técnica.</li>
            </ul>`
    },
    {
        id: 'biblioteca', icon: '📚', title: 'Biblioteca: rutinas y ejercicios',
        html: `
            <p>En <b>Biblioteca</b> (menú Más) están todas tus rutinas y todos los ejercicios, en dos pestañas:</p>
            <ul>
                <li><b>🗂️ Rutinas:</b> las tuyas, las de programas, las básicas y las archivadas. Cada una muestra sus ejercicios y cuándo la hiciste por última vez, con <b>▶ Entrenar</b>, <b>🔗 Compartir</b> y <b>📥 Archivar</b>. Abajo, <b>Importar una rutina</b> pegando el link que te pasaron.</li>
                <li><b>💪 Ejercicios:</b> todo lo que entrenaste, agrupado por músculo, con tu última marca. Tocá uno para ver sus gráficos y cambiarle el grupo muscular. Debajo, <b>Variantes y videos</b> de cada ejercicio.</li>
            </ul>`
    },
    {
        id: 'perfil', icon: '👤', title: 'Perfil, medallas y fotos',
        html: `
            <ul>
                <li><b>Tu nombre, tu foto y tu fecha de nacimiento</b> (la edad se calcula sola). Tocá el círculo para elegir la foto.</li>
                <li><b>Tu actividad:</b> sesiones, días entrenados, horas, semanas seguidas, récords y kilos levantados, además de tu mejor racha y tu ejercicio más hecho.</li>
                <li><b>Medallas:</b> 6 familias (constancia, semanas seguidas, kilos, récords, horas y cardio) con 6 niveles: bronce, plata, oro, platino, diamante y leyenda. Se ganan con tu historial real y muestran cuánto falta para el próximo nivel. <b>📤</b> arma una imagen de la medalla para compartir en tus redes.</li>
                <li><b>Fotos de progreso:</b> <b>📷 Agregar foto de hoy</b>, o sumala al cargar tus medidas. Se guardan comprimidas en tu celular. Tocá una para verla grande o borrarla. Consejo: misma luz y misma pose cada 2 a 4 semanas.</li>
                <li><b>Contacto:</b> tu email y teléfono. Por ahora quedan solo en tu celular; cuando llegue la cuenta, desde acá vas a poder cambiarlos.</li>
            </ul>`
    },
    {
        id: 'privacidad', icon: '🔒', title: 'Privacidad y seguridad',
        html: `
            <ul>
                <li><b>Tus datos quedan en tu celular.</b> La app no manda nada a ningún servidor ni usa servicios de terceros: hasta las fuentes y los gráficos vienen dentro de la app.</li>
                <li><b>Backups:</b> si lo vas a mandar por mail o WhatsApp, <b>protegelo con contraseña</b> (Ajustes → Datos).</li>
                <li><b>Fotos:</b> no salen de tu celular (solo van dentro del backup).</li>
                <li><b>Rutinas por link:</b> importá solo las de personas de confianza. Igual, la app revisa el link, descarta lo que no corresponde y te pide confirmar antes de guardar.</li>
                <li>La app se revisó en busca de fallas de seguridad y las que aparecieron se corrigieron.</li>
            </ul>`
    },
    {
        id: 'datos', icon: '💾', title: 'Tus datos y el backup',
        html: `
            <ul>
                <li><b>📥 Descargar backup</b> (Ajustes → Datos) baja un archivo con <b>todo</b>: sesiones, medidas, rutinas y sus nombres, archivados, ajustes, grabaciones de voz, perfil y fotos.</li>
                <li><b>Proteger con contraseña:</b> tildá la opción antes de descargar. El archivo queda cifrado (AES-256): sin la contraseña no se puede abrir, y si alguien lo modifica, tampoco. <b>Si olvidás la contraseña no hay forma de recuperarlo</b>: guardala bien. Recomendado si lo mandás por mail o WhatsApp.</li>
                <li><b>📤 Cargar backup</b> lo restaura. Si está protegido, te pide la contraseña. Antes te muestra qué contiene y te pide confirmación. Si el archivo tiene algún problema, no cambia nada.</li>
                <li><b>Cambiar de celular:</b> descargá el backup en el viejo, pasalo (mail, Drive, WhatsApp) y cargalo en el nuevo.</li>
                <li><b>Unificar Ejercicios Duplicados:</b> si el mismo ejercicio quedó con dos nombres, juntalos y se unen sus estadísticas.</li>
                <li><b>🗑️ Resetear todo</b> borra todos los datos de este celular. No se puede deshacer: hacé un backup antes.</li>
            </ul>`
    }
];

const HELP_FAQ = [
    ['¿Cómo le paso una rutina a un alumno (o a un amigo)?', 'En Biblioteca → Rutinas, tocá 🔗 en la rutina y mandá el link por WhatsApp. Quien lo abre la agrega a su Biblioteca con un toque, con los objetivos de cada ejercicio. No hace falta cuenta.'],
    ['Olvidé la contraseña de un backup protegido.', 'No se puede recuperar: la contraseña no se guarda en ningún lado (así nadie más puede abrirlo). Si todavía tenés los datos en el celular, descargá un backup nuevo.'],
    ['¿Puedo traer mi historial de Hevy, Strong o Fitbod?', 'Sí. En la otra app buscá "Exportar datos" y guardá el CSV. Después, en Ajustes → 📥 Traer historial de otra app, elegí el archivo: te muestra cuántas sesiones, series y fechas trae antes de guardar. Si lo importás dos veces, no se duplica. Los ejercicios quedan con su nombre original; el grupo muscular se reconoce solo en la mayoría (también en inglés). Para llevar tu historial a una planilla, usá Ajustes → Datos → 📄 Exportar historial (CSV).'],
    ['¿Cómo aviso de un error o mando una idea?', 'En Ajustes → Ayuda → 💬 Enviar un error o una sugerencia (también desde esta ayuda, arriba). Elegí el tipo (de error grave a sugerencia), la parte de la app, contá qué pasó y dejá tu nombre y un mail o WhatsApp para responderte. Se abre tu app de mail con todo cargado. Los datos técnicos (versión, navegador, pantalla) ayudan a encontrar el problema; nunca se mandan tus entrenamientos.'],
    ['¿Dónde está el cambio de tema claro / oscuro?', 'En Ajustes → General → Tema: automático (sigue al celular), oscuro o claro. En el celular no hay barra de arriba: el botón para mantener la pantalla encendida está en Entrenar y en Ajustes.'],
    ['¿Dónde quedó Tabata? ¿Y Variantes?', 'Tabata ahora es una pestaña dentro de Entrenar (⏱️ Tabata / Intervalos). Variantes está en Biblioteca → Ejercicios.'],
    ['Los botones me quedan chicos o me cuesta distinguir los colores.', 'En Ajustes → Accesibilidad podés agrandar botones y campos (Grandes o Muy grandes) y activar los colores para daltonismo, que cambian el verde y el rojo por azul y naranja.'],
    ['¿Qué significa el aviso 📈 "Llevás X semanas en…"?', 'Ese ejercicio lleva 3 semanas o más (y al menos 3 sesiones) sin mejorar: ni más peso ni más reps con ese peso. Si ya llegás al tope de reps (el de tu objetivo, o 12), te sugiere subir el peso; si no, sumar una rep. Con 6 semanas o más, también probar una variante o una semana más liviana (descarga). Si bajaste el peso a propósito, cuenta desde ahí.'],
    ['¿Qué es la C que aparece al tocar el número de una serie?', 'Marca esa serie como de calentamiento. Se guarda, pero no cuenta para récords, volumen ni el mapa de músculos. Tocá la C de nuevo para que vuelva a ser una serie normal.'],
    ['¿Por qué algunos valores se ven en gris?', 'Son los de la última vez que hiciste ese ejercicio, como sugerencia. No se guardan hasta que tocás ✓ o escribís algo en esa serie.'],
    ['Se me escondieron las series de los ejercicios.', 'Pasaba en versiones anteriores al reordenar ejercicios. Ya está corregido; si alguna vez ves los bloques achicados, volvé a elegir la rutina en el selector y se ven normales.'],
    ['Toco los puntos ⠿ pero no se mueve el ejercicio.', 'Hay que mantenerlos apretados un momento, hasta que se llenen de color y el celular vibre. Recién ahí arrastrá. Así se evita mover algo sin querer.'],
    ['La voz o los sonidos no se escuchan.', 'Revisá el volumen del celular y de la app (Ajustes → Sonido). En iPhone, el interruptor de silencio los apaga. El navegador solo deja sonar audio después de tocar la pantalla al menos una vez.'],
    ['El timer no suena con la pantalla bloqueada.', 'Una app web no puede sonar de forma confiable con la pantalla bloqueada. Tocá 🔅 (arriba) para que la pantalla quede encendida mientras entrenás.'],
    ['¿Por qué los avisos del plan llegan por el calendario y no como notificación de la app?', 'Una app web no puede programar notificaciones confiables sin un servidor. El calendario del celular sí avisa a la hora exacta, aunque la app esté cerrada. En la futura versión instalable desde Google Play, los avisos van a ser notificaciones de la propia app.'],
    ['Cargué mal una sesión, ¿cómo la corrijo?', 'En Historial, ✏️ cambia la fecha y 🗑 borra la sesión. Para cargarla bien, volvé a Entrenar y guardala de nuevo.'],
    ['¿Qué es el 1RM estimado?', 'El peso máximo que podrías levantar una sola vez, calculado a partir de tus series (fórmula de Epley). Sirve para comparar tu fuerza aunque cambies peso y reps.'],
    ['¿Qué es el volumen?', 'La suma de peso × reps de todas tus series efectivas. Es una buena medida del trabajo total: si subís el peso pero bajan las reps, el volumen dice si en total hiciste más.'],
    ['¿Qué pasa si borro los datos del navegador?', 'Se pierde todo lo guardado en este celular. Por eso conviene descargar un backup de vez en cuando.'],
    ['¿Necesito internet?', 'No. Después de abrir la app una vez, funciona sin conexión. Solo los links de música y de videos necesitan internet.'],
    ['¿Por qué no puedo pausar Spotify desde la app?', 'Una web no puede controlar otra app. La app abre Spotify o YouTube Music (o tu playlist); la reproducción se maneja desde ahí.'],
    ['¿Cómo instalo la app en la pantalla de inicio?', 'Android: menú ⋮ del navegador → Instalar app. iPhone (Safari): Compartir → Agregar a inicio.']
];

function buildHelpHtml() {
    const sections = HELP_SECTIONS.map(s => `
        <details class="help-section" data-help-id="${s.id}">
            <summary><span class="help-icon">${s.icon}</span>${s.title}</summary>
            <div class="help-body">${s.html}</div>
        </details>`).join('');
    const faq = HELP_FAQ.map(([q, a]) => `
        <details class="help-section help-faq">
            <summary>${escapeHtml(q)}</summary>
            <div class="help-body"><p>${escapeHtml(a)}</p></div>
        </details>`).join('');
    return `${sections}<h4 class="help-subtitle">❓ Preguntas frecuentes</h4>${faq}
        <p class="help-empty" hidden>No encontré nada con esa palabra. Probá con otra (ej. "backup", "timer", "reordenar").</p>`;
}

// Abre el tutorial. En el celular, el botón "atrás" lo cierra (en vez de salir de la app).
function openHelp(sectionId) {
    const modal = document.getElementById('helpModal');
    if (!modal) return;
    const body = document.getElementById('helpContent');
    if (!body.dataset.rendered) {
        body.innerHTML = buildHelpHtml();
        body.dataset.rendered = '1';
    }
    modal.classList.add('open');
    document.body.classList.add('modal-open');
    helpLastFocus = document.activeElement;
    if (sectionId) {
        const section = body.querySelector(`[data-help-id="${sectionId}"]`);
        if (section) { section.open = true; section.scrollIntoView({ block: 'start' }); }
    }
    document.getElementById('helpClose')?.focus();
    try { history.pushState({ helpOpen: true }, ''); } catch (e) {}
}

let helpLastFocus = null;

function closeHelp(fromHistory) {
    const modal = document.getElementById('helpModal');
    if (!modal || !modal.classList.contains('open')) return;
    modal.classList.remove('open');
    document.body.classList.remove('modal-open');
    if (!fromHistory && history.state && history.state.helpOpen) {
        try { history.back(); } catch (e) {}
    }
    helpLastFocus?.focus?.();
}

// Buscador: muestra solo las secciones que contienen el texto y las abre.
function filterHelp(query) {
    const q = normalizeForCompare(query || '');
    const body = document.getElementById('helpContent');
    let visible = 0;
    body.querySelectorAll('.help-section').forEach(section => {
        const match = !q || normalizeForCompare(section.textContent).includes(q);
        section.hidden = !match;
        if (match) visible++;
        section.open = !!q && match;
    });
    body.querySelector('.help-subtitle').hidden = !!q && !body.querySelector('.help-faq:not([hidden])');
    body.querySelector('.help-empty').hidden = visible > 0;
}

function bindHelp() {
    const modal = document.getElementById('helpModal');
    if (!modal) return;
    modal.addEventListener('click', e => { if (e.target === modal) closeHelp(); });
    document.getElementById('helpClose')?.addEventListener('click', () => closeHelp());
    document.getElementById('helpSearch')?.addEventListener('input', e => filterHelp(e.target.value));
    document.getElementById('openHelpBtn')?.addEventListener('click', () => openHelp());
    document.addEventListener('keydown', e => { if (e.key === 'Escape') closeHelp(); });
    window.addEventListener('popstate', () => closeHelp(true));
}
