// Tutorial de la app: se abre desde Ajustes → Ayuda. Secciones desplegables con buscador.
// Mantener este contenido al día cuando cambie cómo funciona algo (ver docs/ARQUITECTURA.md).

const HELP_SECTIONS = [
    {
        id: 'inicio-rapido', icon: '🚀', title: 'Primeros pasos',
        html: `
            <p>La app registra tus entrenamientos de gimnasio, cardio y Tabata, calcula tus récords y te muestra cómo venís progresando.</p>
            <ul>
                <li><b>Sin cuenta:</b> todo se guarda en este celular (o navegador). Nada se sube a internet.</li>
                <li><b>Funciona sin internet</b> una vez que la abriste al menos una vez.</li>
                <li><b>Instalala como app:</b> en Android, menú ⋮ del navegador → <i>Instalar app</i> o <i>Agregar a pantalla de inicio</i>. En iPhone (Safari), botón Compartir → <i>Agregar a inicio</i>.</li>
                <li><b>Menú ☰</b> (arriba a la izquierda): Inicio, Entrenar, Tabata, Historial, Progreso, Medidas, Variantes y Ajustes.</li>
                <li><b>☀️ / 🌙</b> cambia entre tema claro y oscuro. <b>🔅</b> mantiene la pantalla encendida mientras entrenás.</li>
            </ul>
            <p class="help-tip">💾 Como los datos viven en el celular, descargá un <b>backup</b> de vez en cuando (Ajustes → Datos). Es lo que te permite recuperar todo si cambiás de teléfono o borrás el navegador.</p>`
    },
    {
        id: 'entrenar', icon: '🏋️', title: 'Entrenar: una sesión paso a paso',
        html: `
            <ol>
                <li>En <b>Entrenar</b>, elegí la rutina del día en el selector.</li>
                <li>Tocá <b>▶ Iniciar Rutina</b> para medir la duración. Si te olvidás, arranca sola cuando cargás el primer dato.</li>
                <li>En cada ejercicio, cargá las series y tocá <b>✓</b> al terminar cada una: arranca el descanso.</li>
                <li>Al final, en <b>Finalizar Sesión</b>, elegí cómo te sentiste, revisá la fecha, sumá una nota si querés y tocá <b>✅ GUARDAR SESIÓN</b>.</li>
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
                <li><b>Calentamiento:</b> tocá el número de la serie y pasa a <b>C</b>. Se guarda, pero no cuenta para volumen ni récords.</li>
                <li><b>Nota del ejercicio:</b> abajo de las series. La nota de la última vez aparece con 💡.</li>
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
            <p>Si el campo está vacío, parte del valor de la última vez. La barra queda visible aunque cierres el teclado, y se va al marcar la serie con ✓.</p>`
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
                <li><b>Tiempo + km:</b> cardio con distancia (bici, correr). La velocidad en km/h se calcula sola.</li>
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
        id: 'rutinas', icon: '📚', title: 'Rutinas',
        html: `
            <ul>
                <li><b>Crear:</b> en Entrenar, escribí el nombre en "Nombre de rutina nueva" y tocá <b>➕ Crear</b>. Después agregale ejercicios.</li>
                <li><b>✏️ Renombrar</b> y <b>📥 Archivar</b> aparecen al elegir una rutina. Archivar no borra nada: la rutina deja de aparecer en el selector.</li>
                <li><b>Reservorio de Rutinas</b> (Ajustes): ahí están las archivadas, para restaurarlas. Las que creaste vos también se pueden borrar definitivamente; las sesiones ya guardadas con esa rutina siguen en el historial.</li>
                <li><b>Rutina sugerida</b> (Inicio): la que hace más tiempo que no hacés. Tocala para empezarla.</li>
            </ul>`
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
                <li>La voz te acompaña: la mitad, quedan cinco, quedan dos, ¡última!</li>
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
                <li><b>Mis grabaciones:</b> grabá tu voz (o la de un entrenador) para cada aviso, hasta 5 segundos. El silencio del principio y del final se recorta solo. Lo que no grabes lo dice la voz del celular; los números siempre los dice la voz del celular. Las grabaciones se incluyen en el backup.</li>
            </ul>`
    },
    {
        id: 'tabata', icon: '🔥', title: 'Tabata e intervalos',
        html: `
            <ol>
                <li>En <b>Tabata</b>, poné un nombre al bloque (ej. Burpees), los segundos de trabajo, de descanso y las rondas.</li>
                <li><b>▶ Iniciar Bloque:</b> el timer alterna trabajo (verde) y descanso (naranja), con voz y cuenta 3-2-1.</li>
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
                <li><b>Análisis de Progresión:</b> cada ejercicio comparado con la sesión anterior o con hace 1, 3, 6 o 12 meses (volumen, reps y peso máximo).</li>
                <li><b>Progreso por Ejercicio:</b> un mini gráfico por ejercicio, agrupados por músculo y filtrables por rutina. Tocá uno para ver el gráfico completo: peso promedio, 1RM estimado, reps y volumen.</li>
                <li><b>Cambiar de grupo muscular:</b> mantené apretada una tarjeta y arrastrala a otro grupo.</li>
            </ul>
            <p><b>Qué cuenta como récord</b> al guardar una sesión: más peso, más reps, más volumen, o el mismo esfuerzo con menos descanso. En cardio: más distancia, más velocidad o más duración. El calentamiento no cuenta.</p>`
    },
    {
        id: 'inicio', icon: '🏠', title: 'Inicio',
        html: `
            <ul>
                <li><b>Hoy:</b> fecha, último entreno, duración de la sesión en curso y la rutina sugerida.</li>
                <li><b>Estadísticas:</b> total de entrenamientos, desde cuándo y promedio semanal.</li>
                <li><b>Calendario:</b> los días entrenados de cada mes, con ◀ ▶ para moverte.</li>
                <li><b>Últimas Rutinas:</b> peso y reps promedio de tus últimas sesiones de fuerza.</li>
            </ul>`
    },
    {
        id: 'medidas', icon: '📏', title: 'Medidas corporales y variantes',
        html: `
            <ul>
                <li><b>Medidas:</b> cargá fecha y peso (obligatorios) y, si querés, grasa, músculo, agua y cintura. El gráfico de <i>Evolución</i> muestra cómo cambian, y podés fijar la escala.</li>
                <li><b>Variantes:</b> alternativas para cada ejercicio, agrupadas por músculo, con un link a videos de la técnica.</li>
            </ul>`
    },
    {
        id: 'datos', icon: '💾', title: 'Tus datos y el backup',
        html: `
            <ul>
                <li><b>📥 Descargar backup</b> (Ajustes → Datos) baja un archivo con <b>todo</b>: sesiones, medidas, rutinas y sus nombres, archivados, ajustes y grabaciones de voz.</li>
                <li><b>📤 Cargar backup</b> lo restaura. Antes te muestra qué contiene y te pide confirmación. Si el archivo tiene algún problema, no cambia nada.</li>
                <li><b>Cambiar de celular:</b> descargá el backup en el viejo, pasalo (mail, Drive, WhatsApp) y cargalo en el nuevo.</li>
                <li><b>Unificar Ejercicios Duplicados:</b> si el mismo ejercicio quedó con dos nombres, juntalos y se unen sus estadísticas.</li>
                <li><b>🗑️ Resetear todo</b> borra todos los datos de este celular. No se puede deshacer: hacé un backup antes.</li>
            </ul>`
    }
];

const HELP_FAQ = [
    ['¿Por qué algunos valores se ven en gris?', 'Son los de la última vez que hiciste ese ejercicio, como sugerencia. No se guardan hasta que tocás ✓ o escribís algo en esa serie.'],
    ['Se me escondieron las series de los ejercicios.', 'Pasaba en versiones anteriores al reordenar ejercicios. Ya está corregido; si alguna vez ves los bloques achicados, volvé a elegir la rutina en el selector y se ven normales.'],
    ['Toco los puntos ⠿ pero no se mueve el ejercicio.', 'Hay que mantenerlos apretados un momento, hasta que se llenen de color y el celular vibre. Recién ahí arrastrá. Así se evita mover algo sin querer.'],
    ['La voz o los sonidos no se escuchan.', 'Revisá el volumen del celular y de la app (Ajustes → Sonido). En iPhone, el interruptor de silencio los apaga. El navegador solo deja sonar audio después de tocar la pantalla al menos una vez.'],
    ['El timer no suena con la pantalla bloqueada.', 'Una app web no puede sonar de forma confiable con la pantalla bloqueada. Tocá 🔅 (arriba) para que la pantalla quede encendida mientras entrenás.'],
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
