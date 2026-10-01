// English. Keys are the Spanish texts as they appear on screen (see js/core/i18n.js).
// Exercise and routine names are user data and are not translated here.
// Script clásico (no módulo): comparte el ámbito global con el resto de la app.

I18N_DICTIONARIES.en = {
    text: {
        // ---- Navegación y pantallas ----
        'Inicio': 'Home', 'Entrenar': 'Train', 'Historial': 'History', 'Progreso': 'Progress', 'Más': 'More',
        'Medidas': 'Measurements', 'Medidas corporales': 'Body measurements', 'Biblioteca': 'Library', 'Perfil': 'Profile', 'Ajustes': 'Settings',
        'Abrir menú': 'Open menu', 'Más secciones': 'More sections', 'Secciones principales': 'Main sections',
        'Hoy': 'Today', 'Fecha': 'Date', 'Último entreno': 'Last workout', 'Duración sesión actual': 'Current session length',
        'Estadísticas': 'Statistics', 'Programa': 'Program', 'Mi plan semanal': 'My weekly plan', 'Calendario de Entrenamientos': 'Workout calendar',
        'Últimas Rutinas': 'Recent routines', 'Entrenamientos totales': 'Total workouts', 'Entrenando desde': 'Training since', 'Promedio semanal': 'Weekly average',
        'Contraer / expandir': 'Collapse / expand', 'Cerrar': 'Close', 'Cancelar': 'Cancel', 'Aceptar': 'OK', 'Guardar': 'Save', 'Borrar': 'Delete',
        'Archivar': 'Archive', 'Escuchar': 'Listen', 'Subir audio': 'Upload audio', 'Editar fecha': 'Edit date', 'Borrar sesión': 'Delete session',
        'Compartir': 'Share', 'Compartir por link': 'Share by link', 'Ver ejercicios': 'See exercises', 'Ver:': 'View:', 'Ver menos': 'Show less',
        'Saltar': 'Skip', 'Seguir entrenando': 'Keep training', 'Listo': 'Done', 'Auto': 'Auto', 'Otro': 'Other', 'Otros': 'Others',

        // ---- Inicio: Hoy toca, flor, plan ----
        'Hoy toca entrenar': 'Time to train today', 'Hoy ya entrenaste.': 'You already trained today.', '¡Bien!': 'Nice!',
        'Hoy es día de descanso.': 'Today is a rest day.', 'Rutina sugerida': 'Suggested routine', 'Sesión en curso': 'Session in progress',
        'Empezar': 'Start', 'Entrenar igual': 'Train anyway', 'Elegir otra rutina para hoy': 'Pick another routine for today',
        'Nunca la hiciste': 'Never done', 'La hiciste hoy': 'Done today', 'Creá tu primera rutina en Entrenar o elegí un programa.': 'Create your first routine in Train or pick a program.',
        'Semilla': 'Seed', 'Brote': 'Sprout', 'Capullo': 'Bud', 'Flor': 'Flower', 'Flor con frutos': 'Flower with fruit',
        'semilla': 'seed', 'brote': 'sprout', 'capullo': 'bud', 'flor': 'flower', 'flor con frutos': 'flower with fruit', 'otro fruto': 'another fruit',
        '¿Cómo crece?': 'How does it grow?', 'Armar mi plan': 'Make my plan',
        'Tu flor del plan semanal, fecha, último entreno y duración': 'Your weekly-plan flower, date, last workout and length',
        'Días, horarios y recordatorios': 'Days, times and reminders', 'Rutina: automática': 'Routine: automatic',
        'Guardar plan': 'Save plan', 'Recordatorios en el celular': 'Phone reminders', 'Avisarme': 'Remind me',
        'A la hora': 'On time', '15 min antes': '15 min before', '30 min antes': '30 min before', '1 h antes': '1 h before', '2 h antes': '2 h before',
        'Agregar al calendario del celular (iPhone y otros)': 'Add to phone calendar (iPhone and others)',
        'Elegí qué días entrenás y a qué hora.': 'Choose which days you train and at what time.',
        'Vas al día': 'On track', 'Configurá tus días': 'Set your days', 'Cantidad cumplida (no en los días planeados)': 'Count met (not on the planned days)',
        'Semana en curso (todavía a tiempo)': 'Week in progress (still on time)', 'Sin cumplir': 'Not met',
        'Tu programa en curso y qué día te toca': 'Your current program and which day is next',
        'Ver programas': 'See programs', 'Ver todos los programas': 'See all programs', 'Programas': 'Programs',
        'Entrenamientos totales, desde cuándo y promedio semanal': 'Total workouts, since when and weekly average',
        'Los días que entrenaste, mes a mes': 'The days you trained, month by month', 'Peso y reps promedio de tus últimas sesiones': 'Average weight and reps in your last sessions',
        'Peso y reps promedio (de todas las series) en tus últimas sesiones de fuerza.': 'Average weight and reps (all sets) in your last strength sessions.',
        'Peso promedio': 'Average weight', 'Reps totales': 'Total reps', 'Volumen total': 'Total volume', 'Peso total': 'Total weight', 'Peso levantado': 'Weight lifted',
        'Lunes': 'Monday', 'Martes': 'Tuesday', 'Miércoles': 'Wednesday', 'Jueves': 'Thursday', 'Viernes': 'Friday', 'Sábado': 'Saturday', 'Domingo': 'Sunday',
        'lunes': 'Monday', 'martes': 'Tuesday', 'miércoles': 'Wednesday', 'jueves': 'Thursday', 'viernes': 'Friday', 'sábado': 'Saturday', 'domingo': 'Sunday',
        'Lun': 'Mon', 'Mar': 'Tue', 'Mié': 'Wed', 'Jue': 'Thu', 'Vie': 'Fri', 'Sáb': 'Sat', 'Dom': 'Sun',
        'L': 'M', 'M': 'T', 'X': 'W', 'J': 'T', 'V': 'F', 'S': 'S', 'D': 'S',

        // ---- Entrenar ----
        'Rutina': 'Routine', 'Tabata / Intervalos': 'Tabata / Intervals', 'Tipo de entrenamiento': 'Workout type',
        'Selecciona Rutina': 'Choose a routine', 'Elige una rutina...': 'Choose a routine...', 'Crear': 'Create',
        'Nombre de rutina nueva (ej: Fútbol, Yoga, Boxeo)': 'New routine name (e.g. Football, Yoga, Boxing)',
        'Archivar esta rutina': 'Archive this routine', 'Renombrar': 'Rename', 'Fecha de la sesión': 'Session date',
        'Iniciar Rutina': 'Start routine', 'Finalizar Rutina': 'Finish routine', 'Reiniciar marcado de tiempo': 'Reset time tracking',
        'Mantener la pantalla encendida': 'Keep the screen on', 'Pantalla encendida: activada': 'Screen on: enabled', 'Evitar que la pantalla se bloquee': 'Keep the screen from locking',
        'Agregar': 'Add', 'Agregar serie': 'Add set', 'Nuevo ejercicio (o elegí uno existente)': 'New exercise (or pick an existing one)',
        'Cómo se mide el ejercicio nuevo': 'How the new exercise is measured', 'Grupo muscular del ejercicio': 'Exercise muscle group', 'Músculo…': 'Muscle…', 'Músculo': 'Muscle',
        'Kg + reps': 'Kg + reps', 'Solo reps': 'Reps only', 'Tiempo': 'Time', 'Duración': 'Duration', 'Tiempo + km': 'Time + km',
        'Contar reps': 'Count reps', 'Cuenta la próxima serie con cadencia y voz': 'Counts the next set with tempo and voice',
        'Quitar la última serie': 'Remove the last set', 'Quitar de la sesión de hoy': "Remove from today's session",
        'Archivar (guardar para después, sin perder el historial)': 'Archive (keep for later, history stays)',
        'Armar una superserie con otro ejercicio': 'Make a superset with another exercise', 'Marcar como unilateral (de a un lado)': 'Mark as unilateral (one side at a time)',
        'Mantené apretado y arrastrá para reordenar': 'Press and hold, then drag to reorder', 'Tocá para marcar/desmarcar como calentamiento': 'Tap to mark/unmark as warm-up',
        'Tocá para ver el progreso · doble toque para renombrar': 'Tap to see progress · double tap to rename',
        'Reps en reserva (F = al fallo)': 'Reps in reserve (F = to failure)', 'Descanso en segundos': 'Rest in seconds',
        'Nota de la serie': 'Set note', 'Nota de la serie (ej: se me fue la técnica)': 'Set note (e.g. form broke down)', 'Nota del ejercicio (opcional)': 'Exercise note (optional)',
        'Notas de la sesión (opcional)': 'Session notes (optional)', 'Finalizar Sesión': 'Finish session', '¿Cómo te sentiste?': 'How did you feel?',
        'GUARDAR SESIÓN': 'SAVE SESSION', 'Guardar sesión': 'Save session', 'Mal': 'Bad', 'Regular': 'So-so', 'Bien': 'Good', 'Muy bien': 'Very good', 'Excelente': 'Great',
        '¡Terminaste todas las series!': 'You finished every set!', 'Descanso': 'Rest', 'Tocá para cancelar': 'Tap to cancel',
        'Restar 15 segundos': 'Subtract 15 seconds', 'Sumar 15 segundos': 'Add 15 seconds', 'Detener el contador': 'Stop the counter',
        'Pausa': 'Pause', 'Más lento': 'Slower', 'Más rápido': 'Faster', '+1 rep': '+1 rep', '−1 rep': '−1 rep',
        'Mantené apretados los puntos ⠿ y arrastrá para reordenar · Tocá el número de serie para marcarla como calentamiento (C) · ✓ marca la serie y arranca el descanso · RIR: reps que te quedaban (F = al fallo)':
            'Press and hold the ⠿ dots and drag to reorder · Tap the set number to mark it as warm-up (C) · ✓ marks the set and starts the rest · RIR: reps you had left (F = to failure)',
        'Superserie': 'Superset', 'Quitar de la superserie': 'Remove from superset', 'Guardar superserie': 'Save superset',
        'Elegí con qué ejercicios se hace seguido. Se encadenan sin descanso y se descansa al terminar la vuelta. Con 3 o más es una triserie o un circuito.':
            "Choose which exercises are done back to back. They're chained with no rest and you rest at the end of the round. With 3 or more it's a tri-set or circuit.",
        'Usar este peso': 'Use this weight', 'Calculadora de discos': 'Plate calculator', 'Barra con discos': 'Barbell with plates', 'Máquina de placas / polea': 'Plate-stack machine / cable',
        'Barra': 'Bar', 'Sin barra': 'No bar', 'Discos que tenés (tocá para activar o desactivar)': 'Plates you have (tap to turn on or off)',
        'Cantidad de placas': 'Number of plates', 'Cada placa suma': 'Each plate adds', 'Sin placas': 'No plates', '1ª placa': '1st plate',
        'Música': 'Music', 'Spotify': 'Spotify', 'YouTube Music': 'YouTube Music',
        'Tabata': 'Tabata', 'Nombre del bloque (ej: Burpees, Bici, Plancha)': 'Block name (e.g. Burpees, Bike, Plank)', 'Trabajo (seg)': 'Work (sec)', 'Descanso (seg)': 'Rest (sec)',
        'Rondas': 'Rounds', 'Iniciar Bloque': 'Start block', 'Finalizar Sesión Tabata': 'Finish Tabata session',
        'Podés encadenar varios bloques. Tocar el timer corta el bloque y guarda lo hecho.': 'You can chain several blocks. Tapping the timer stops the block and saves what was done.',
        'Trabajo': 'Work', 'Preparate': 'Get ready', 'Ronda': 'Round',

        // ---- Historial y progreso ----
        'Últimas sesiones': 'Recent sessions', 'Por mes': 'By month', 'Por año': 'By year',
        'Tocá una sesión para ver cada ejercicio y serie, los récords y las notas.': 'Tap a session to see every exercise and set, records and notes.',
        'marca las sesiones con récord.': 'marks sessions with a record.', 'PR': 'PR', 'ver detalle': 'see details',
        'Músculos trabajados': 'Muscles worked', 'Análisis de Progresión': 'Progress analysis',
        'Últimos 7 días': 'Last 7 days', 'Esta semana (en curso)': 'This week (in progress)', 'Semana pasada': 'Last week',
        'Últimas 4 semanas (promedio)': 'Last 4 weeks (average)', 'Últimas 12 semanas (promedio)': 'Last 12 weeks (average)',
        'Período del mapa de músculos': 'Muscle map period', 'Frente': 'Front', 'Espalda': 'Back',
        'Músculos trabajados, vista de frente': 'Muscles worked, front view', 'Músculos trabajados, vista de espalda': 'Muscles worked, back view',
        'Sin trabajo': 'No work', 'Bajo (1 a 5)': 'Low (1 to 5)', 'Moderado (6 a 9)': 'Moderate (6 to 9)', 'Ideal (10 a 20)': 'Ideal (10 to 20)', 'Alto (más de 20)': 'High (over 20)',
        'Series efectivas por músculo (sin calentamiento). Las directas cuentan 1 y las indirectas media serie (el tríceps en un press de pecho, el bíceps en un remo), como en la evidencia científica. Entre 10 y 20 por semana es el rango habitual para ganar músculo: cuanto más intenso el color, más trabajado. Tocá un músculo para ver sus ejercicios. El día en que empieza la semana se elige en Ajustes.':
            'Effective sets per muscle (no warm-ups). Direct sets count 1 and indirect ones half a set (triceps in a chest press, biceps in a row), as in the scientific evidence. 10 to 20 per week is the usual range to build muscle: the stronger the color, the more worked. Tap a muscle to see its exercises. The day the week starts is set in Settings.',
        'Series por músculo y si estás en el rango ideal': "Sets per muscle and whether you're in the ideal range",
        'Cada ejercicio contra una sesión anterior; tocalo para ver sus gráficos': 'Each exercise vs a previous session; tap it to see its charts',
        'Comparar contra:': 'Compare with:', 'Sesión anterior': 'Previous session', 'Hace 1 mes': '1 month ago', 'Hace 3 meses': '3 months ago', 'Hace 6 meses': '6 months ago', 'Hace 1 año': '1 year ago',
        'Todos los ejercicios': 'All exercises', 'Última sesión': 'Last session', 'Por rutina': 'By routine', 'Por grupo muscular': 'By muscle group',
        'Sin registros previos': 'No previous records', 'Grupo muscular': 'Muscle group', '1RM estimado': 'Estimated 1RM',
        'Escala Y mín. (vacío = auto)': 'Y scale min. (empty = auto)', 'Escala Y máx. (vacío = auto)': 'Y scale max. (empty = auto)',
        'Todavía no hay sesiones con peso de este ejercicio para graficar.': 'There are no weighted sessions of this exercise to chart yet.',
        'Todavía no hay datos suficientes: cada ejercicio necesita al menos dos sesiones para compararlo.': 'Not enough data yet: each exercise needs at least two sessions to compare.',
        'en rango ✓': 'in range ✓', 'por debajo del rango': 'below range', 'por encima del rango': 'above range', 'todavía sin series': 'no sets yet',
        'Sin series en este período': 'No sets in this period', '(no se muestra en la figura)': '(not shown on the figure)', 'Ver todos los músculos': 'See all muscles',

        // ---- Grupos musculares ----
        'Pecho': 'Chest', 'Hombros': 'Shoulders', 'Bíceps': 'Biceps', 'Tríceps': 'Triceps', 'Cuádriceps': 'Quads', 'Isquios': 'Hamstrings',
        'Glúteos': 'Glutes', 'Gemelos': 'Calves', 'Core': 'Core', 'Cardio / Otro': 'Cardio / Other', 'Piernas': 'Legs',

        // ---- Medidas ----
        'Peso': 'Weight', 'Grasa': 'Fat', 'Músculo %': 'Muscle %', 'Agua': 'Water', 'Cintura': 'Waist', 'Grasa %': 'Fat %', 'Agua %': 'Water %', 'Cintura (cm)': 'Waist (cm)',
        'Peso (kg)': 'Weight (kg)', 'Agregar Medición': 'Add measurement', 'Foto de progreso (opcional)': 'Progress photo (optional)',
        'Gráfico e historial de tus medidas': 'Chart and history of your measurements', 'Peso, grasa, músculo, cintura y foto': 'Weight, fat, muscle, waist and photo',

        // ---- Biblioteca ----
        'Rutinas': 'Routines', 'Ejercicios': 'Exercises', 'Tus rutinas': 'Your routines', 'Rutinas básicas': 'Basic routines', 'Archivadas': 'Archived',
        'Las que creaste o importaste': 'The ones you created or imported', 'Rutinas que trae la app': 'Routines included in the app',
        'No aparecen en el selector; se pueden restaurar': "They don't show in the picker; they can be restored",
        'Importar una rutina': 'Import a routine', 'Importar rutinas': 'Import routines', 'Agregar una rutina que te pasaron por link': 'Add a routine someone sent you by link',
        'Pegá el link (o varios links) de la rutina': 'Paste the routine link (or several links)',
        'Si alguien (por ejemplo, tu entrenador) te pasó el link de una rutina, abrilo desde el celular o pegalo acá. Si son varias, podés pegar todos los links juntos.':
            'If someone (for example, your coach) sent you a routine link, open it on your phone or paste it here. If there are several, you can paste all the links together.',
        'Alternativas para cada ejercicio, con videos': 'Alternatives for each exercise, with videos', 'Todo lo que entrenaste, por músculo': 'Everything you trained, by muscle',
        'Tocá uno para ver sus gráficos y cambiar su grupo muscular.': 'Tap one to see its charts and change its muscle group.',
        'Programas armados con progresión automática': 'Ready-made programs with automatic progression',
        'Programas armados con progresión automática (primero reps, después peso).': 'Ready-made programs with automatic progression (reps first, then weight).',
        'Programas armados con progresión automática: la app te dice cuántas reps y qué peso hacer cada día. Primero se suben reps y, cuando llegás al tope en todas las series, se sube el peso.':
            'Ready-made programs with automatic progression: the app tells you how many reps and what weight to do each day. Reps go up first and, when you reach the top in every set, the weight goes up.',
        'Empezar este programa': 'Start this program', 'Cambiar': 'Change', 'Terminar': 'End', 'Te toca:': 'Up next:', 'Equipo': 'Equipment',
        'nunca la hiciste': 'never done',

        // ---- Perfil ----
        'Tu nombre': 'Your name', 'Fecha de nacimiento': 'Date of birth', 'Cambiar foto de perfil': 'Change profile photo',
        'Sesiones, horas, rachas y récords': 'Sessions, hours, streaks and records', 'Medallas': 'Medals', 'Trofeos': 'Trophies', 'Fotos de progreso': 'Progress photos',
        'Constancia, récords, kilos, horas y cardio': 'Consistency, records, kilos, hours and cardio',
        'Se ganan con tu historial real. Tocá 📤 para compartir la medalla como imagen (historia o publicación).': 'Earned with your real history. Tap 📤 to share the medal as an image (story or post).',
        'Tus récords personales, listos para compartir': 'Your personal records, ready to share',
        'Cada récord personal es un trofeo. Tocá 📤 para compartirlo como imagen (historia o publicación).': 'Every personal record is a trophy. Tap 📤 to share it as an image (story or post).',
        'Tu evolución en fotos (quedan en tu celular)': 'Your progress in photos (they stay on your phone)', 'Agregar foto de hoy': "Add today's photo", 'Foto de progreso': 'Progress photo', 'Borrar foto': 'Delete photo',
        'Sacate una foto cada 2 a 4 semanas (misma luz y misma pose) para ver tu cambio. También podés sumar una foto al cargar tus medidas.':
            'Take a photo every 2 to 4 weeks (same light and pose) to see your change. You can also add a photo when logging your measurements.',
        'Email y teléfono': 'Email and phone', 'Email': 'Email', 'Teléfono (opcional)': 'Phone (optional)',
        'Por ahora quedan solo en tu celular. Cuando llegue la cuenta (email, Google o Microsoft), desde acá vas a poder cambiar tu forma de contacto y elegir si querés recibir novedades.':
            "For now they stay only on your phone. When accounts arrive (email, Google or Microsoft), you'll be able to change your contact here and choose whether to get news.",
        'Gratis hoy; Pro próximamente': 'Free today; Pro coming soon',
        'Pro llega con las cuentas: sincronización entre dispositivos, entrenar sin internet, todos los programas, rutinas con IA, mascota o personaje que crece con vos y medallas especiales.':
            'Pro arrives with accounts: sync across devices, train offline, every program, AI routines, a pet or character that grows with you, and special medals.',
        'Constancia': 'Consistency', 'Semanas seguidas': 'Weeks in a row', 'Récords': 'Records', 'Horas entrenadas': 'Hours trained', 'Distancia de cardio': 'Cardio distance',
        'Bronce': 'Bronze', 'Plata': 'Silver', 'Oro': 'Gold', 'Platino': 'Platinum', 'Diamante': 'Diamond', 'Leyenda': 'Legend', '¡Nivel máximo!': 'Max level!',
        'sesiones': 'sessions', 'semanas': 'weeks', 'récords': 'records', 'horas': 'hours',
        'Peso máximo': 'Max weight', 'Más reps': 'Most reps', 'Distancia': 'Distance', 'Velocidad': 'Speed',
        'Todavía no guardaste sesiones': "You haven't saved any sessions yet",

        // ---- Compartir ----
        'Historia (9:16)': 'Story (9:16)', 'Publicación (4:5)': 'Post (4:5)', 'Guardar imagen': 'Save image', 'Vista previa de la imagen': 'Image preview',
        'MEDALLA': 'MEDAL', 'RÉCORD PERSONAL': 'PERSONAL RECORD', 'RÉCORD': 'RECORD', 'la lucha interior': 'the inner struggle',

        // ---- Ajustes ----
        'Ayuda': 'Help', 'Cómo usar la app': 'How to use the app', 'Cómo funciona cada parte de la app, con buscador y preguntas frecuentes.': 'How each part of the app works, with search and FAQ.',
        'Enviar un error o una sugerencia': 'Send a bug report or a suggestion', '¿Encontraste un error o tenés una idea? Contanos': 'Found a bug or have an idea? Tell us',
        'General': 'General', 'Idioma / Language': 'Idioma / Language', 'Tema': 'Theme', 'Automático (como el celular)': 'Automatic (like the phone)', 'Oscuro': 'Dark', 'Claro': 'Light',
        'Pantalla': 'Screen', 'Color de la app': 'App color', 'Naranja': 'Orange', 'Turquesa': 'Turquoise', 'Azul': 'Blue', 'Rosa fucsia': 'Fuchsia pink', 'Verde': 'Green', 'Violeta': 'Violet',
        'Unidades': 'Units', 'Kilos (kg)': 'Kilograms (kg)', 'Libras (lb)': 'Pounds (lb)', 'Kilómetros (km, km/h)': 'Kilometers (km, km/h)', 'Millas (mi, mph)': 'Miles (mi, mph)',
        'La semana empieza el': 'The week starts on', 'Cambio de lado en ejercicios unilaterales': 'Side switch in unilateral exercises',
        'Tiempo para acomodarse entre un lado y el otro (no es descanso).': 'Time to get set between one side and the other (not rest).',
        'Sin pausa': 'No pause', '3 segundos': '3 seconds', '5 segundos': '5 seconds', '8 segundos': '8 seconds', '10 segundos': '10 seconds', '15 segundos': '15 seconds',
        'Idioma, tema, pantalla encendida, color, unidades (kg / lb, km / mi), inicio de semana, unilaterales': 'Language, theme, screen on, color, units (kg / lb, km / mi), week start, unilateral',
        'Accesibilidad': 'Accessibility', 'Botones más grandes, alto contraste y colores para daltonismo': 'Bigger buttons, high contrast and color-blind colors',
        'Tamaño de botones y campos': 'Size of buttons and fields', 'Normal': 'Normal', 'Grandes': 'Large', 'Muy grandes': 'Extra large',
        'Más grandes y separados, para tocarlos fácil con una mano o con dedos grandes.': 'Bigger and more spaced, easy to tap with one hand or big fingers.',
        'Alto contraste': 'High contrast', 'Fondo negro puro (o blanco en tema claro), texto pleno, bordes marcados y foco bien visible. Para leer al sol o con poca vista.':
            'Pure black background (or white in light theme), solid text, strong borders and a clearly visible focus. For reading in the sun or with low vision.',
        'Colores para daltonismo': 'Color-blind colors',
        'Cambia el verde y el rojo (hecho / borrar, subir / bajar, trabajo / descanso) por azul y naranja, que se distinguen con cualquier tipo de daltonismo.':
            'Swaps green and red (done / delete, up / down, work / rest) for blue and orange, which can be told apart with any type of color blindness.',
        'Vista previa (cambia al tocar las opciones)': 'Preview (changes as you tap the options)',
        'Sonido': 'Sound', 'Tipo de aviso y volumen': 'Alert type and volume', 'Tipo de sonido': 'Sound type', 'Probar sonido': 'Test sound',
        'Clásico (3 beeps)': 'Classic (3 beeps)', 'Campana (2 tonos)': 'Bell (2 tones)', 'Fuerte / agudo': 'Loud / high', 'Silencio': 'Silent',
        'Se usa para avisar cuando termina el descanso entre series y en los bloques de Tabata.': 'Used to signal the end of rest between sets and in Tabata blocks.',
        'Voz': 'Voice', 'Qué avisos se dicen, voz, velocidad y contador de reps': 'Which alerts are spoken, voice, speed and rep counter',
        'Probar voz': 'Test voice', 'Estilo': 'Style', 'Neutro': 'Neutral', 'Tierno': 'Gentle', 'Militar': 'Drill sergeant', 'Motivador': 'Motivating', 'Calma': 'Calm',
        '¿Cómo cambio o agrego voces?': 'How do I change or add voices?', 'Automática (español)': 'Automatic (Spanish)',
        'Descanso entre series': 'Rest between sets', 'Avisar cuando quedan 10 segundos': 'Alert when 10 seconds are left', 'Avisar el final («¡Vamos! A la próxima serie»)': 'Alert the end ("Let\'s go! Next set")',
        'Contador de reps': 'Rep counter', 'Decir el número de cada rep': 'Say each rep number', 'Ánimo:': 'Encouragement:',
        'Tabata: trabajo, descanso, última ronda y 3-2-1': 'Tabata: work, rest, last round and 3-2-1',
        'Mis grabaciones': 'My recordings', 'Tu voz (o la de tu entrenador) para cada aviso': 'Your voice (or your coach\'s) for each alert',
        'Usar mis grabaciones': 'Use my recordings', 'Grabar': 'Record', 'Regrabar': 'Re-record', 'Listo ■': 'Done ■',
        'Tus playlists de Spotify y YouTube Music': 'Your Spotify and YouTube Music playlists', 'Playlist de Spotify': 'Spotify playlist', 'Playlist de YouTube Music': 'YouTube Music playlist',
        'Unificar Ejercicios Duplicados': 'Merge duplicate exercises', 'Juntar un ejercicio que quedó con dos nombres': 'Merge an exercise that ended up with two names',
        'Ejercicio a renombrar...': 'Exercise to rename...', 'Unificar con...': 'Merge with...', 'Unificar': 'Merge',
        'Si dos nombres son el mismo ejercicio (ej. "Mariposa" y "Aperturas en mariposa"), elegilos acá para juntar sus estadísticas e historial. Sin tipear, para no fallar por una tilde o un espacio de más.':
            'If two names are the same exercise (e.g. "Mariposa" and "Aperturas en mariposa"), pick them here to merge their stats and history. No typing, so an accent or extra space can\'t trip you up.',
        'Rutinas archivadas': 'Archived routines',
        'Sus ejercicios, entrenamientos guardados y progreso siguen intactos. Restauralas cuando las vuelvas a necesitar, o usá el archivo para ir preparando rutinas futuras sin que molesten en la lista actual.':
            'Their exercises, saved workouts and progress stay intact. Restore them when you need them again, or use the archive to prepare future routines without cluttering the current list.',
        'Restaurar': 'Restore',
        'Datos': 'Data', 'Backup, restaurar, exportar a CSV y borrar todo': 'Backup, restore, export to CSV and delete everything',
        'Proteger el backup con contraseña': 'Protect the backup with a password',
        'Recomendado si el backup tiene fotos o medidas, o si lo vas a mandar por mail o WhatsApp. Si te olvidás la contraseña, el backup no se puede abrir.':
            "Recommended if the backup has photos or measurements, or if you'll send it by email or WhatsApp. If you forget the password, the backup can't be opened.",
        'Descargar backup': 'Download backup', 'Cargar backup': 'Load backup', 'Exportar historial (CSV, para Excel o Sheets)': 'Export history (CSV, for Excel or Sheets)', 'Resetear todo': 'Reset everything',
        'Traer historial de otra app': 'Bring history from another app', 'Hevy, Strong o Fitbod: tu historial no se pierde al cambiarte': "Hevy, Strong or Fitbod: your history isn't lost when you switch",
        'Si el archivo no dice la unidad (Strong), los pesos están en': "If the file doesn't say the unit (Strong), the weights are in",
        'Las fechas con barras son mes/día (formato de Estados Unidos)': 'Dates with slashes are month/day (US format)', 'Elegir archivo CSV': 'Choose CSV file',
        'Contraseña (mínimo 8 caracteres)': 'Password (at least 8 characters)', 'Repetí la contraseña': 'Repeat the password',

        // ---- Feedback ----
        'Error o sugerencia': 'Bug or suggestion', '¿Qué querés contarnos?': 'What do you want to tell us?', '¿En qué parte de la app?': 'In which part of the app?',
        'Contanos qué pasó o qué te gustaría': 'Tell us what happened or what you would like', 'Nombre y apellido': 'First and last name', 'Mail o WhatsApp (para responderte)': 'Email or WhatsApp (so we can reply)',
        'Incluir datos técnicos (versión, navegador y pantalla; nada de tus entrenamientos)': 'Include technical data (version, browser and screen; none of your workouts)',
        'Ver qué se envía': 'See what is sent', 'Enviar por mail': 'Send by email', 'Copiar el texto': 'Copy the text', 'Llega a': 'Goes to',
        'Ej.: al tildar la última serie se cerró la app. O: me gustaría poder…': 'E.g.: the app closed when I ticked the last set. Or: I would like to be able to…',
        'tu@mail.com o 11 2345 6789': 'you@mail.com or +1 555 123 4567', 'tu@email.com': 'you@email.com',
        'Sugerencia': 'Suggestion', 'Una idea o algo que mejorarías': 'An idea or something you would improve', 'Error grave': 'Critical bug', 'No puedo usar la app o perdí datos': "I can't use the app or I lost data",
        'Error importante': 'Major bug', 'Algo no funciona como debería': "Something doesn't work as it should", 'Error menor': 'Minor bug', 'Se ve mal, molesta o confunde': 'Looks wrong, annoying or confusing',
        'Consulta u otro': 'Question or other', 'Una duda o cualquier otra cosa': 'A question or anything else',
        'Entrenar (rutina, series, timer, contador)': 'Train (routine, sets, timer, counter)', 'Inicio y plan semanal': 'Home and weekly plan', 'Progreso y mapa de músculos': 'Progress and muscle map',
        'Biblioteca y rutinas': 'Library and routines', 'Perfil y medallas': 'Profile and medals', 'Ajustes, voz y sonidos': 'Settings, voice and sounds', 'Backup y datos': 'Backup and data', 'Instalación o actualización': 'Installation or update',
        'Elegí si es un error o una sugerencia': 'Choose whether it is a bug or a suggestion', 'Contanos un poco más (al menos 10 letras)': 'Tell us a bit more (at least 10 letters)',
        'Poné tu nombre y apellido': 'Enter your first and last name', 'Poné un mail o un WhatsApp con código de área': 'Enter an email or a WhatsApp number with area code',

        // ---- Ayuda: buscador y preguntas ----
        'Buscar (ej: backup, timer, reordenar, RIR)': 'Search (e.g. backup, timer, reorder, RIR)', 'Buscar en la ayuda': 'Search the help', 'Cerrar la ayuda': 'Close help',
        'Preguntas frecuentes': 'Frequently asked questions',
        'No encontré nada con esa palabra. Probá con otra (ej. "backup", "timer", "reordenar").': 'Nothing found with that word. Try another (e.g. "backup", "timer", "reorder").',

        // ---- Estados vacíos y avisos ----
        'Empezar a entrenar': 'Start training', 'Crear una rutina': 'Create a routine',
        'Mostrar todo': 'Show all', 'Deshacer': 'Undo',
        'Las secciones están cerradas: tocá la que quieras ver.': 'Sections are collapsed: tap the one you want to see.'
    },

    // Bloques con formato (<b>, <small>…): se completan en la segunda parte.
    // <html>
    html: {
        "<b>+ Agregar serie</b> suma una abajo; <b>−</b> quita la última. Si tenía datos, aparece <b>Deshacer</b> unos segundos por si fue sin querer (lo mismo al quitar un ejercicio, borrar una sesión o archivar una rutina).":
            "<b>+ Add set</b> adds one below; <b>−</b> removes the last one. If it had data, <b>Undo</b> appears for a few seconds in case it was a mistake (same when removing an exercise, deleting a session or archiving a routine).",
        "<b>Agregar:</b> abajo de todo, escribí el nombre (o elegí uno existente), revisá el tipo y tocá <b>+ Agregar</b>. Si se parece a uno que ya existe, te pregunta si es el mismo.":
            "<b>Add:</b> at the very bottom, type the name (or pick an existing one), check the type and tap <b>+ Add</b>. If it looks like one that already exists, it asks whether it is the same.",
        "<b>Ajustes → Accesibilidad:</b> botones y campos <b>grandes</b> o <b>muy grandes</b> (para usar con una mano o con dedos grandes) , <b>alto contraste</b> (fondo negro o blanco puro, texto pleno y bordes marcados, para leer al sol) y <b>colores para daltonismo</b> (azul y naranja en vez de verde y rojo). Abajo hay una vista previa que cambia al tocar cada opción.":
            "<b>Settings → Accessibility:</b> <b>large</b> or <b>extra large</b> buttons and fields (for one-handed use or big fingers), <b>high contrast</b> (pure black or white background, solid text and strong borders, for reading in the sun) and <b>color-blind colors</b> (blue and orange instead of green and red). Below there is a preview that changes as you tap each option.",
        "<b>Ajustes:</b> cada sección está cerrada y muestra en una línea qué tiene; tocá la que necesites para abrirla. En <b>General</b>: el tema, el color de la app, las <b>unidades</b> (peso en kg o libras, distancia en km o millas), el día en que empieza tu semana y los segundos para cambiar de lado en los unilaterales. Los 6 colores tienen una versión para tema claro y otra para oscuro, y todos se leen bien (contraste de la norma WCAG AA).":
            "<b>Settings:</b> each section is collapsed and shows in one line what it has; tap the one you need to open it. In <b>General</b>: the theme, the app color, the <b>units</b> (weight in kg or pounds, distance in km or miles), the day your week starts and the seconds to switch sides in unilateral exercises. The 6 colors have a version for the light theme and one for the dark theme, and all of them are easy to read (WCAG AA contrast).",
        "<b>Análisis de Progresión:</b> cada ejercicio comparado con la sesión anterior o con hace 1, 3, 6 o 12 meses (volumen, reps y peso máximo). En <b>Ver</b> elegís: todos los ejercicios, los de la <b>última sesión</b>, agrupados <b>por rutina</b> o <b>por grupo muscular</b> (pecho, espalda, cuádriceps, isquios…).":
            "<b>Progress analysis:</b> each exercise compared with the previous session or with 1, 3, 6 or 12 months ago (volume, reps and max weight). In <b>View</b> you choose: all exercises, those of the <b>last session</b>, grouped <b>by routine</b> or <b>by muscle group</b> (chest, back, quads, hamstrings…).",
        "<b>Backups:</b> si lo vas a mandar por mail o WhatsApp, <b>protegelo con contraseña</b> (Ajustes → Datos).":
            "<b>Backups:</b> if you are going to send it by email or WhatsApp, <b>protect it with a password</b> (Settings → Data).",
        "<b>Barra de abajo</b> (en el celular): Inicio, Entrenar, Historial y Progreso, al alcance del pulgar. <b>Más</b> abre el resto (Medidas, Biblioteca, Perfil y Ajustes) en un menú que sale por la izquierda con las opciones abajo, al alcance del pulgar. Mientras escribís, la barra se esconde para no tapar el teclado. En la compu, el menú está en el ☰ de arriba.":
            "<b>Bottom bar</b> (on the phone): Home, Train, History and Progress, within thumb reach. <b>More</b> opens the rest (Measurements, Library, Profile and Settings) in a menu that slides from the left with the options at the bottom, within thumb reach. While you type, the bar hides so it does not cover the keyboard. On a computer, the menu is in the ☰ at the top.",
        "<b>Biblioteca → Rutinas:</b> todas tus rutinas (las tuyas, las de programas, las básicas y las <b>archivadas</b>, para restaurarlas o borrarlas definitivamente). Desde ahí: <b>▶ Entrenar</b>, <b>🔗 Compartir</b> y <b>📥 Archivar</b>.":
            "<b>Library → Routines:</b> all your routines (yours, program ones, the basic ones and the <b>archived</b> ones, to restore them or delete them for good). From there: <b>▶ Train</b>, <b>🔗 Share</b> and <b>📥 Archive</b>.",
        "<b>Calendario:</b> los días entrenados de cada mes, con ◀ ▶ para moverte.":
            "<b>Calendar:</b> the days you trained each month, with ◀ ▶ to move around.",
        "<b>Calentamiento (la C):</b> tocá el número de la serie y pasa a <b>C</b>: es una serie de calentamiento o aproximación. Se guarda, pero no cuenta para volumen, récords ni el mapa de músculos. Tocá la C para volver a serie normal.":
            "<b>Warm-up (the C):</b> tap the set number and it turns into <b>C</b>: it is a warm-up or ramp-up set. It is saved, but it does not count for volume, records or the muscle map. Tap the C to turn it back into a normal set.",
        "<b>Cambiar de celular:</b> descargá el backup en el viejo, pasalo (mail, Drive, WhatsApp) y cargalo en el nuevo.":
            "<b>Changing phones:</b> download the backup on the old one, move it (email, Drive, WhatsApp) and load it on the new one.",
        "<b>Compartir rutinas por link</b> (ideal para entrenadores y alumnos), <b>medallas</b> que se ganan con tu historial y <b>fotos de progreso</b>.":
            "<b>Share routines by link</b> (ideal for coaches and clients), <b>medals</b> earned with your history and <b>progress photos</b>.",
        "<b>Compartir una rutina:</b> 🔗 arma un link (se manda por WhatsApp o donde quieras). Quien lo abre la agrega a su Biblioteca con un toque, con sus objetivos. No hace falta cuenta: la rutina viaja dentro del link. También se puede pegar el link en <b>Biblioteca → Importar una rutina</b>.":
            "<b>Share a routine:</b> 🔗 creates a link (send it by WhatsApp or anywhere). Whoever opens it adds it to their Library with one tap, with its targets. No account needed: the routine travels inside the link. You can also paste the link in <b>Library → Import a routine</b>.",
        "<b>Contacto:</b> tu email y teléfono. Por ahora quedan solo en tu celular; cuando llegue la cuenta, desde acá vas a poder cambiarlos.":
            "<b>Contact:</b> your email and phone. For now they stay only on your phone; when accounts arrive, you will be able to change them here.",
        "<b>Contador de reps con cadencia y voz:</b> te marca el ritmo de cada repetición, te da tiempo para prepararte y te alienta (\"¡la mitad!\", \"¡última!\") sin dejar de decirte en qué rep vas. Elegí el estilo de la voz (neutro, tierno, militar, motivador o calma) o grabá / subí tus propios audios.":
            "<b>Rep counter with tempo and voice:</b> it sets the pace of each repetition, gives you time to get ready and cheers you on (\"halfway!\", \"last one!\") while still telling you which rep you are on. Choose the voice style (neutral, gentle, drill sergeant, motivating or calm) or record / upload your own audio.",
        "<b>Crear:</b> en Entrenar, escribí el nombre en \"Nombre de rutina nueva\" y tocá <b>➕ Crear</b>. Después agregale ejercicios.":
            "<b>Create:</b> in Train, type the name in \"New routine name\" and tap <b>➕ Create</b>. Then add exercises to it.",
        "<b>Cualquier tipo de ejercicio:</b> kg, solo reps, tiempo en la unidad que prefieras, duración o distancia con km/h calculado.":
            "<b>Any type of exercise:</b> kg, reps only, time in the unit you prefer, duration or distance with km/h calculated.",
        "<b>Cómo se cuentan las series:</b> cada serie de un ejercicio cuenta 1 para su músculo principal y <b>media serie</b> para los que ayudan (el tríceps y el hombro en un press de pecho, el bíceps en un remo o un jalón, los glúteos en una sentadilla). Es el método que mejor predice el crecimiento según la evidencia más completa (Pelland y colegas, 2025, 67 estudios). El rango de 10 a 20 series por semana sale de esos mismos estudios (Schoenfeld y colegas, 2017).":
            "<b>How sets are counted:</b> each set of an exercise counts 1 for its main muscle and <b>half a set</b> for the ones that help (triceps and shoulders in a chest press, biceps in a row or pulldown, glutes in a squat). It is the method that best predicts growth according to the most complete evidence (Pelland and colleagues, 2025, 67 studies). The range of 10 to 20 sets per week comes from those same studies (Schoenfeld and colleagues, 2017).",
        "<b>Desc s:</b> descanso en segundos después de esa serie. Al tocar ✓ arranca el timer con ese tiempo (90 s si está vacío).":
            "<b>Rest s:</b> rest in seconds after that set. Tapping ✓ starts the timer with that time (90 s if empty).",
        "<b>Descanso y Tabata guiados por voz,</b> con aviso a los 10 segundos y ±15 s en el momento.":
            "<b>Voice-guided rest and Tabata,</b> with an alert at 10 seconds and ±15 s on the fly.",
        "<b>Deslizar:</b> pasá el dedo por una serie hacia la derecha para tildarla, o hacia la izquierda para destildarla.":
            "<b>Swipe:</b> slide your finger across a set to the right to tick it, or to the left to untick it.",
        "<b>Duración:</b> actividades largas sin descanso entre series (fútbol, clases).":
            "<b>Duration:</b> long activities without rest between sets (football, classes).",
        "<b>Ejercicio terminado:</b> cuando todas sus series tienen ✓, el bloque se contrae y muestra un resumen. Tocá <b>▸</b> al lado del nombre para volver a abrirlo (y <b>▾</b> para contraerlo cuando quieras).":
            "<b>Exercise finished:</b> when all its sets have ✓, the block collapses and shows a summary. Tap <b>▸</b> next to the name to open it again (and <b>▾</b> to collapse it whenever you want).",
        "<b>Empezar este programa</b> crea sus rutinas (ej. \"Completo · Día A\") y, si querés, pone sus días en tu plan semanal.":
            "<b>Start this program</b> creates its routines (e.g. \"Full body · Day A\") and, if you want, puts its days in your weekly plan.",
        "<b>Estadísticas:</b> total de entrenamientos, desde cuándo y promedio semanal.":
            "<b>Statistics:</b> total workouts, since when and weekly average.",
        "<b>Estilo:</b> <b>Neutro</b>, <b>Tierno</b>, <b>Militar</b>, <b>Motivador</b> o <b>Calma</b>. Cambia las frases (\"¡Cinco más, sin excusas!\") y el tono de la voz.":
            "<b>Style:</b> <b>Neutral</b>, <b>Gentle</b>, <b>Drill sergeant</b>, <b>Motivating</b> or <b>Calm</b>. It changes the phrases (\"Five more, no excuses!\") and the tone of the voice.",
        "<b>Esō Agōn</b> (en griego, <i>la lucha interior</i>: el agón era la competencia de los Juegos Olímpicos antiguos) registra tus entrenamientos de gimnasio, cardio y Tabata, calcula tus récords y te muestra cómo venís progresando. Es un producto de Inquieto.":
            "<b>Esō Agōn</b> (in Greek, <i>the inner struggle</i>: the agon was the competition of the ancient Olympic Games) logs your gym, cardio and Tabata workouts, calculates your records and shows you how you are progressing. It is a product by Inquieto.",
        "<b>Fotos de progreso:</b> <b>📷 Agregar foto de hoy</b>, o sumala al cargar tus medidas. Se guardan comprimidas en tu celular. Tocá una para verla grande o borrarla. Consejo: misma luz y misma pose cada 2 a 4 semanas.":
            "<b>Progress photos:</b> <b>📷 Add today's photo</b>, or add one when logging your measurements. They are saved compressed on your phone. Tap one to see it large or delete it. Tip: same light and same pose every 2 to 4 weeks.",
        "<b>Fotos:</b> no salen de tu celular (solo van dentro del backup).":
            "<b>Photos:</b> they never leave your phone (they only go inside the backup).",
        "<b>Funciona sin internet</b> una vez que la abriste al menos una vez.":
            "<b>Works offline</b> once you have opened it at least once.",
        "<b>Hoy:</b> fecha, último entreno, duración de la sesión en curso y la rutina sugerida.":
            "<b>Today:</b> date, last workout, length of the current session and the suggested routine.",
        "<b>Instalala como app:</b> en Android, menú ⋮ del navegador → <i>Instalar app</i> o <i>Agregar a pantalla de inicio</i>. En iPhone (Safari), botón Compartir → <i>Agregar a inicio</i>.":
            "<b>Install it as an app:</b> on Android, browser menu ⋮ → <i>Install app</i> or <i>Add to home screen</i>. On iPhone (Safari), Share button → <i>Add to Home Screen</i>.",
        "<b>Kg + reps:</b> fuerza con peso.":
            "<b>Kg + reps:</b> strength with weight.",
        "<b>Mapa de músculos</b> con cuántas series por semana hace cada uno, comparado con el rango ideal, y la semana en curso.":
            "<b>Muscle map</b> showing how many sets per week each muscle gets, compared with the ideal range, and the current week.",
        "<b>Medallas:</b> 6 familias (constancia, semanas seguidas, kilos, récords, horas y cardio) con 6 niveles: bronce, plata, oro, platino, diamante y leyenda. Se ganan con tu historial real y muestran cuánto falta para el próximo nivel. <b>📤</b> arma una imagen de la medalla para compartir, en formato <b>historia</b> (9:16, Instagram y estados de WhatsApp) o <b>publicación</b> (4:5), con vista previa.":
            "<b>Medals:</b> 6 families (consistency, weeks in a row, kilos, records, hours and cardio) with 6 levels: bronze, silver, gold, platinum, diamond and legend. They are earned with your real history and show how much is left for the next level. <b>📤</b> makes an image of the medal to share, as a <b>story</b> (9:16, Instagram and WhatsApp status) or a <b>post</b> (4:5), with a preview.",
        "<b>Medidas:</b> cargá fecha y peso (obligatorios) y, si querés, grasa, músculo, agua, cintura y una <b>📷 foto de progreso</b>. El gráfico de <i>Evolución</i> muestra cómo cambian, y podés fijar la escala. Las fotos se ven en <b>Perfil → Fotos de progreso</b>.":
            "<b>Measurements:</b> enter date and weight (required) and, if you want, fat, muscle, water, waist and a <b>📷 progress photo</b>. The <i>Evolution</i> chart shows how they change, and you can set the scale. Photos are in <b>Profile → Progress photos</b>.",
        "<b>Min:</b> minutos, con coma o punto (60, 32,5).":
            "<b>Min:</b> minutes, with comma or dot (60, 32.5).",
        "<b>Mis grabaciones:</b> para cada aviso podés <b>● grabar</b> tu voz (o la de tu entrenador, hasta 5 segundos) o <b>📁 subir un audio</b> (un sonido o una voz, hasta 1 MB). El silencio del principio y del final se recorta solo. Lo que no grabes lo dice la voz del celular con el estilo elegido; los números siempre los dice la voz del celular. Todo se incluye en el backup.":
            "<b>My recordings:</b> for each alert you can <b>● record</b> your voice (or your coach's, up to 5 seconds) or <b>📁 upload an audio</b> (a sound or a voice, up to 1 MB). The silence at the start and end is trimmed automatically. Whatever you do not record is said by the phone voice with the chosen style; numbers are always said by the phone voice. Everything is included in the backup.",
        "<b>Máquinas de placas y poleas:</b> en <i>Equipo</i> elegí <b>Máquina de placas / polea</b> y te dice en qué placa va la clavija. Por defecto: unos 5 kg sin placas (el carro y el cable), 10 kg con la clavija en la primera placa y 5 kg más por placa. Cambialo según tu máquina: queda guardado para ese ejercicio. Los ejercicios de polea, jalón o máquina ya arrancan en este modo. Son valores aproximados: cada máquina (y cada sistema de roldanas) es distinta.":
            "<b>Plate-stack machines and cables:</b> in <i>Equipment</i> choose <b>Plate-stack machine / cable</b> and it tells you which plate the pin goes in. By default: about 5 kg with no plates (the carriage and cable), 10 kg with the pin in the first plate and 5 kg more per plate. Change it to match your machine: it is saved for that exercise. Cable, pulldown or machine exercises already start in this mode. These are approximate values: every machine (and every pulley system) is different.",
        "<b>Músculos trabajados:</b> una figura de frente y de espalda con las series de cada músculo (sin calentamiento), en 5 niveles bien distintos: <b>sin trabajo</b> (gris), <b>bajo</b>, <b>moderado</b>, <b>ideal</b> (color pleno con borde: 10 a 20 series por semana, el rango habitual para ganar músculo) y <b>alto</b> (con rayas: más de 20). Tocá un músculo para ver qué ejercicios lo trabajaron.":
            "<b>Muscles worked:</b> a front and back figure with the sets of each muscle (no warm-ups), in 5 clearly different levels: <b>no work</b> (gray), <b>low</b>, <b>moderate</b>, <b>ideal</b> (solid color with border: 10 to 20 sets per week, the usual range to build muscle) and <b>high</b> (striped: more than 20). Tap a muscle to see which exercises worked it.",
        "<b>No perdés nada:</b> lo que vas cargando se guarda solo. Si cerrás la app sin guardar, al volver te recupera la sesión del día.":
            "<b>You lose nothing:</b> what you enter is saved automatically. If you close the app without saving, when you come back it recovers the day's session.",
        "<b>Nota del ejercicio:</b> abajo de las series. La nota de la última vez aparece con 💡.":
            "<b>Exercise note:</b> below the sets. The note from last time appears with 💡.",
        "<b>Pensada para todos:</b> colores que se leen bien en cualquier tema (norma WCAG AA), opción para daltonismo y botones grandes.":
            "<b>Made for everyone:</b> colors that read well in any theme (WCAG AA), a color-blind option and big buttons.",
        "<b>Período del mapa:</b> <b>últimos 7 días</b> (los 7 días corridos hasta hoy, no depende de la semana; es el que viene por defecto), <b>esta semana</b> (en curso, con lo que falta para el rango y los días que quedan), la semana pasada, o el promedio de las últimas 4 o 12 semanas. El día en que empieza la semana se elige en Ajustes → General.":
            "<b>Map period:</b> <b>last 7 days</b> (the 7 days up to today, regardless of the week; it is the default), <b>this week</b> (in progress, with what is left to reach the range and the days left), last week, or the average of the last 4 or 12 weeks. The day the week starts is set in Settings → General.",
        "<b>Piernas por partes:</b> los <b>cuádriceps</b> (frente del muslo: sentadillas, prensa, extensiones) se ven en la figura de frente, y los <b>isquios</b> (atrás: curl femoral, peso muerto rumano) en la de espalda. Si un ejercicio quedó en el grupo equivocado, cambialo desde su detalle (tocá el nombre) o en Biblioteca → Ejercicios.":
            "<b>Legs by parts:</b> the <b>quads</b> (front of the thigh: squats, leg press, extensions) are shown on the front figure, and the <b>hamstrings</b> (back: leg curl, Romanian deadlift) on the back one. If an exercise ended up in the wrong group, change it from its details (tap the name) or in Library → Exercises.",
        "<b>Plan gratis.</b> Todo lo que ves hoy es gratis.":
            "<b>Free plan.</b> Everything you see today is free.",
        "<b>Plan semanal con recordatorios</b> en tu calendario.":
            "<b>Weekly plan with reminders</b> in your calendar.",
        "<b>Programa:</b> el programa en curso y qué día te toca (ver <i>Programas con progresión</i>).":
            "<b>Program:</b> the current program and which day is next (see <i>Programs with progression</i>).",
        "<b>Programas con progresión automática:</b> te dice cuántas reps y qué peso hacer cada día (primero subís reps, después peso).":
            "<b>Programs with automatic progression:</b> it tells you how many reps and what weight to do each day (first you add reps, then weight).",
        "<b>Progresión doble: primero reps, después peso.</b> Con el mismo peso vas sumando una rep por serie. Cuando llegás al tope del rango en todas las series, la app te sugiere subir el peso (de a 2,5 o 5 kg, o una placa en las máquinas) y volver al mínimo del rango. Si no llegaste al mínimo, repetís el peso. En los de peso corporal, al llegar arriba te sugiere una variante más difícil.":
            "<b>Double progression: reps first, then weight.</b> With the same weight you add one rep per set. When you reach the top of the range in every set, the app suggests raising the weight (by 2.5 or 5 kg, or one plate on machines) and going back to the bottom of the range. If you did not reach the minimum, you repeat the weight. In bodyweight exercises, when you reach the top it suggests a harder variation.",
        "<b>Proteger con contraseña:</b> tildá la opción antes de descargar. El archivo queda cifrado (AES-256): sin la contraseña no se puede abrir, y si alguien lo modifica, tampoco. <b>Si olvidás la contraseña no hay forma de recuperarlo</b>: guardala bien. Recomendado si lo mandás por mail o WhatsApp.":
            "<b>Protect with a password:</b> tick the option before downloading. The file is encrypted (AES-256): without the password it cannot be opened, nor if someone tampers with it. <b>If you forget the password there is no way to recover it</b>: keep it safe. Recommended if you send it by email or WhatsApp.",
        "<b>Qué cuenta como récord</b> al guardar una sesión: más peso, más reps, más volumen, o el mismo esfuerzo con menos descanso. En cardio: más distancia, más velocidad o más duración. El calentamiento no cuenta.":
            "<b>What counts as a record</b> when saving a session: more weight, more reps, more volume, or the same effort with less rest. In cardio: more distance, more speed or more duration. Warm-ups do not count.",
        "<b>RIR:</b> repeticiones que te quedaban en reserva. <b>F</b> = llegaste al fallo; 1, 2, 3, 4+ = cuántas más podrías haber hecho.":
            "<b>RIR:</b> reps you had left in reserve. <b>F</b> = you reached failure; 1, 2, 3, 4+ = how many more you could have done.",
        "<b>Renombrar:</b> tocá dos veces el nombre.":
            "<b>Rename:</b> double-tap the name.",
        "<b>Reordenar:</b> mantené apretados los puntos <b>⠿</b> a la izquierda del ejercicio hasta que se llenen de color (y vibre), y arrastrá. Los bloques se achican para moverlos fácil, y si llegás al borde la pantalla se desplaza sola. El orden queda guardado. Con teclado: foco en los puntos y flechas ↑ ↓.":
            "<b>Reorder:</b> press and hold the <b>⠿</b> dots to the left of the exercise until they fill with color (and it vibrates), then drag. Blocks shrink so they are easy to move, and if you reach the edge the screen scrolls by itself. The order is saved. With a keyboard: focus on the dots and ↑ ↓ arrows.",
        "<b>Rutina sugerida</b> (Inicio): la que hace más tiempo que no hacés. Tocala para empezarla.":
            "<b>Suggested routine</b> (Home): the one you have not done for the longest. Tap it to start it.",
        "<b>Rutinas por link:</b> importá solo las de personas de confianza. Igual, la app revisa el link, descarta lo que no corresponde y te pide confirmar antes de guardar.":
            "<b>Routines by link:</b> only import those from people you trust. Even so, the app checks the link, drops anything that does not belong and asks you to confirm before saving.",
        "<b>Rutinas y gráficos sin límite:</b> otras apps cobran por tener más de 3 o 4 rutinas o por ver tu progreso.":
            "<b>Unlimited routines and charts:</b> other apps charge for having more than 3 or 4 routines or for seeing your progress.",
        "<b>Récords más justos:</b> también cuenta como récord hacer lo mismo con menos descanso.":
            "<b>Fairer records:</b> doing the same with less rest also counts as a record.",
        "<b>Secciones plegadas:</b> en todas las pantallas cada sección muestra en una línea qué tiene; tocá la que necesites. En Inicio quedan abiertas <b>Hoy</b> y el <b>Calendario</b>.":
            "<b>Collapsed sections:</b> on every screen each section shows in one line what it has; tap the one you need. On Home, <b>Today</b> and the <b>Calendar</b> stay open.",
        "<b>Seg:</b> tipeás segundos (45).":
            "<b>Sec:</b> you type seconds (45).",
        "<b>Si recargás la página</b> (o se cierra la app), volvés a la misma pantalla, con las mismas secciones abiertas y a la misma altura.":
            "<b>If you reload the page</b> (or the app closes), you go back to the same screen, with the same sections open and at the same scroll position.",
        "<b>Sin cuenta y sin internet:</b> tus datos quedan en tu teléfono, y el backup se lleva todo (con contraseña si querés).":
            "<b>No account and no internet:</b> your data stays on your phone, and the backup takes everything (with a password if you want).",
        "<b>Sin cuenta:</b> todo se guarda en este celular (o navegador). Nada se sube a internet.":
            "<b>No account:</b> everything is saved on this phone (or browser). Nothing is uploaded to the internet.",
        "<b>Solo reps:</b> peso corporal (flexiones, dominadas).":
            "<b>Reps only:</b> bodyweight (push-ups, pull-ups).",
        "<b>Sonido propio:</b> en Mis grabaciones, 📁 en cualquier aviso sube un sonido o una voz. En la app instalable desde Google Play vas a poder elegir los sonidos del sistema.":
            "<b>Your own sound:</b> in My recordings, 📁 on any alert uploads a sound or a voice. In the app installable from Google Play you will be able to choose system sounds.",
        "<b>Sonido</b> (Ajustes): el aviso de fin de descanso y su volumen.":
            "<b>Sound</b> (Settings): the end-of-rest alert and its volume.",
        "<b>Superseries y circuitos</b> que manejan solos el descanso, y <b>calculadora de discos y de placas</b> (poleas y máquinas).":
            "<b>Supersets and circuits</b> that handle rest by themselves, and a <b>plate calculator for barbells and stacks</b> (cables and machines).",
        "<b>Terminar</b> deja las rutinas y todo tu historial; solo se dejan de mostrar los objetivos.":
            "<b>End</b> keeps the routines and all your history; only the targets stop being shown.",
        "<b>Tiempo + km:</b> cardio con distancia (bici, correr). La velocidad se calcula sola.":
            "<b>Time + km:</b> cardio with distance (bike, running). Speed is calculated automatically.",
        "<b>Tiempo y descanso:</b> según la unidad (segundos o minutos)":
            "<b>Time and rest:</b> depending on the unit (seconds or minutes)",
        "<b>Tiempo:</b> esfuerzos por tiempo con descanso (plancha, isométricos).":
            "<b>Time:</b> timed efforts with rest (plank, isometrics).",
        "<b>Tocá un ejercicio</b> para abrir sus gráficos: peso promedio, 1RM estimado, reps y volumen. Ahí mismo podés <b>cambiarle el grupo muscular</b>.":
            "<b>Tap an exercise</b> to open its charts: average weight, estimated 1RM, reps and volume. Right there you can <b>change its muscle group</b>.",
        "<b>Trofeos:</b> cada récord personal (más peso, más reps, más distancia) es un trofeo con cuánto mejoraste. También se comparten con 📤, y al guardar una sesión con récord aparece <b>📤 Compartir</b> en el aviso.":
            "<b>Trophies:</b> every personal record (more weight, more reps, more distance) is a trophy showing how much you improved. They are also shared with 📤, and when you save a session with a record, <b>📤 Share</b> appears in the notice.",
        "<b>Tu actividad:</b> sesiones, días entrenados, horas, semanas seguidas, récords y kilos levantados, además de tu mejor racha y tu ejercicio más hecho.":
            "<b>Your activity:</b> sessions, days trained, hours, weeks in a row, records and kilos lifted, plus your best streak and your most done exercise.",
        "<b>Tu nombre, tu foto y tu fecha de nacimiento</b> (la edad se calcula sola). Tocá el círculo para elegir la foto.":
            "<b>Your name, your photo and your date of birth</b> (age is calculated automatically). Tap the circle to pick the photo.",
        "<b>Tus datos quedan en tu celular.</b> La app no manda nada a ningún servidor ni usa servicios de terceros: hasta las fuentes y los gráficos vienen dentro de la app.":
            "<b>Your data stays on your phone.</b> The app does not send anything to any server or use third-party services: even the fonts and charts come inside the app.",
        "<b>Unidades:</b> peso en <b>kg o libras</b> y distancia en <b>km o millas</b> (Ajustes → General → Unidades). Tu historial no cambia: se guarda en kg y km y se convierte al mostrarlo. En libras, la barra rápida suma de a 5 y 10 lb y la calculadora usa barra de 45 lb y discos en libras.":
            "<b>Units:</b> weight in <b>kg or pounds</b> and distance in <b>km or miles</b> (Settings → General → Units). Your history does not change: it is stored in kg and km and converted when shown. In pounds, the quick bar adds 5 and 10 lb and the calculator uses a 45 lb bar and plates in pounds.",
        "<b>Unificar Ejercicios Duplicados:</b> si el mismo ejercicio quedó con dos nombres, juntalos y se unen sus estadísticas.":
            "<b>Merge duplicate exercises:</b> if the same exercise ended up with two names, merge them and their stats are combined.",
        "<b>Unilaterales de verdad:</b> cada serie se marca de un lado y del otro, con unos segundos para cambiar de lado en vez de un descanso.":
            "<b>Real unilateral exercises:</b> each set is marked on one side and then the other, with a few seconds to switch sides instead of a rest.",
        "<b>Usar este peso</b> lo pasa a la serie.":
            "<b>Use this weight</b> moves it to the set.",
        "<b>Valores en gris:</b> son los de la última vez. Si hiciste lo mismo, tocá <b>✓</b> y se completan solos.":
            "<b>Gray values:</b> they are the ones from last time. If you did the same, tap <b>✓</b> and they fill in automatically.",
        "<b>Variantes:</b> ahora están en <b>Biblioteca → Ejercicios</b>: alternativas para cada ejercicio, agrupadas por músculo, con un link a videos de la técnica.":
            "<b>Variations:</b> they are now in <b>Library → Exercises</b>: alternatives for each exercise, grouped by muscle, with a link to technique videos.",
        "<b>Ver su progreso:</b> tocá el nombre del ejercicio.":
            "<b>See its progress:</b> tap the exercise name.",
        "<b>Voz y avisos:</b> la app habla con la voz del celular, sin internet. Cada aviso (descanso, contador, Tabata, récords) se activa por separado. También podés elegir la voz y su velocidad.":
            "<b>Voice and alerts:</b> the app speaks with the phone voice, offline. Each alert (rest, counter, Tabata, records) is turned on separately. You can also choose the voice and its speed.",
        "<b>Voz y tono:</b> elegí entre las voces del celular y ajustá el tono (más grave o más agudo). Para tener voces de hombre y de mujer, instalalas en el celular (Android: Ajustes → Sistema → Idioma → Salida de texto a voz; iPhone: Accesibilidad → Contenido leído → Voces).":
            "<b>Voice and pitch:</b> choose among the phone voices and adjust the pitch (deeper or higher). To have male and female voices, install them on the phone (Android: Settings → System → Language → Text-to-speech output; iPhone: Accessibility → Spoken Content → Voices).",
        "<b>m:ss y h:mm:</b> tipeás solo números y se acomodan solos, como en un microondas: 145 → 1:45.":
            "<b>m:ss and h:mm:</b> you type only digits and they arrange themselves, like a microwave: 145 → 1:45.",
        "<b>Últimas Rutinas:</b> peso y reps promedio de tus últimas sesiones de fuerza.":
            "<b>Recent routines:</b> average weight and reps of your last strength sessions.",
        "<b>−15s / +15s</b> para ajustarlo en el momento; <b>Saltar</b> lo termina.":
            "<b>−15s / +15s</b> to adjust it on the fly; <b>Skip</b> ends it.",
        "<b>⏹ Finalizar Sesión Tabata</b> guarda todos los bloques juntos como un entrenamiento.":
            "<b>⏹ Finish Tabata session</b> saves all the blocks together as one workout.",
        "<b>▶ Iniciar Bloque:</b> el timer alterna trabajo y descanso (con colores distintos y el texto de la fase), con voz y cuenta 3-2-1.":
            "<b>▶ Start block:</b> the timer alternates work and rest (with different colors and the phase text), with voice and a 3-2-1 countdown.",
        "<b>✏️ Renombrar</b> y <b>📥 Archivar</b> aparecen al elegir una rutina. Archivar no borra nada: la rutina deja de aparecer en el selector.":
            "<b>✏️ Rename</b> and <b>📥 Archive</b> appear when you choose a routine. Archiving does not delete anything: the routine stops showing in the picker.",
        "<b>✏️</b> cambia la fecha de una sesión. <b>🗑</b> borra una sesión cargada por error.":
            "<b>✏️</b> changes the date of a session. <b>🗑</b> deletes a session entered by mistake.",
        "<b>✕</b> lo quita solo de la sesión de hoy. <b>📥</b> lo archiva en esa rutina: deja de aparecer, pero su historial queda. Los archivados están en el <i>Reservorio de ejercicios</i>, al final de la rutina, para restaurarlos.":
            "<b>✕</b> removes it only from today's session. <b>📥</b> archives it in that routine: it stops showing, but its history stays. Archived ones are in the <i>Exercise reserve</i>, at the end of the routine, to restore them.",
        "<b>🌱 Tu flor</b> (Inicio → Hoy): crece con cada semana en que entrenás tantos días como dice tu plan. Semilla → brote (1 semana) → capullo (3) → flor (6) → flor con frutos (10), y un fruto más cada 4 semanas. Cada entrenamiento es una gota 💧. Si una semana no llegás, se usa sola una <b>semana libre</b> (empezás con 2 y se suma 1 por mes, hasta 3); sin semanas libres se marchita un poco, pero nunca vuelve atrás y se recupera con la próxima semana cumplida.":
            "<b>🌱 Your flower</b> (Home → Today): it grows with every week in which you train as many days as your plan says. Seed → sprout (1 week) → bud (3) → flower (6) → flower with fruit (10), and one more fruit every 4 weeks. Every workout is a drop 💧. If you fall short one week, a <b>free week</b> is used automatically (you start with 2 and get 1 more per month, up to 3); with no free weeks left it wilts a little, but it never goes back and recovers with the next completed week.",
        "<b>💪 Ejercicios:</b> todo lo que entrenaste, agrupado por músculo, con tu última marca. Tocá uno para ver sus gráficos y cambiarle el grupo muscular. Debajo, <b>Variantes y videos</b> de cada ejercicio.":
            "<b>💪 Exercises:</b> everything you trained, grouped by muscle, with your last mark. Tap one to see its charts and change its muscle group. Below, <b>Variations and videos</b> for each exercise.",
        "<b>📝</b> agrega una nota a esa serie (ej. \"se me fue la técnica\").":
            "<b>📝</b> adds a note to that set (e.g. \"form broke down\").",
        "<b>📤 Cargar backup</b> lo restaura. Si está protegido, te pide la contraseña. Antes te muestra qué contiene y te pide confirmación. Si el archivo tiene algún problema, no cambia nada.":
            "<b>📤 Load backup</b> restores it. If it is protected, it asks for the password. First it shows what it contains and asks you to confirm. If the file has any problem, nothing changes.",
        "<b>📥 Descargar backup</b> (Ajustes → Datos) baja un archivo con <b>todo</b>: sesiones, medidas, rutinas y sus nombres, archivados, ajustes, grabaciones de voz, perfil y fotos.":
            "<b>📥 Download backup</b> (Settings → Data) downloads a file with <b>everything</b>: sessions, measurements, routines and their names, archived items, settings, voice recordings, profile and photos.",
        "<b>🔅</b> (arriba) mantiene la pantalla encendida mientras entrenás. El <b>tema</b> (automático como el celular, oscuro o claro) está en Ajustes → General.":
            "<b>🔅</b> keeps the screen on while you train. The <b>theme</b> (automatic like the phone, dark or light) is in Settings → General.",
        "<b>🗂️ Rutinas:</b> las tuyas, las de programas, las básicas y las archivadas. Cada una muestra sus ejercicios y cuándo la hiciste por última vez, con <b>▶ Entrenar</b>, <b>🔗 Compartir</b> y <b>📥 Archivar</b>. Abajo, <b>Importar una rutina</b> pegando el link que te pasaron.":
            "<b>🗂️ Routines:</b> yours, program ones, the basic ones and the archived ones. Each one shows its exercises and when you last did it, with <b>▶ Train</b>, <b>🔗 Share</b> and <b>📥 Archive</b>. Below, <b>Import a routine</b> by pasting the link you were sent.",
        "<b>🗑️ Resetear todo</b> borra todos los datos de este celular. No se puede deshacer: hacé un backup antes.":
            "<b>🗑️ Reset everything</b> deletes all the data on this phone. It cannot be undone: make a backup first.",
        "Agregalo a tu calendario: <b>📅 Google Calendar</b> (un botón por cada horario) o <b>📥 Agregar al calendario del celular</b> (iPhone y otros calendarios).":
            "Add it to your calendar: <b>📅 Google Calendar</b> (one button per time slot) or <b>📥 Add to phone calendar</b> (iPhone and other calendars).",
        "Al tildar la <b>última serie</b> de la sesión, la app te pregunta si guardar: elegí cómo te sentiste y tocá <b>✅ Guardar sesión</b> (o <b>Seguir entrenando</b>). Si dejaste algún ejercicio sin hacer, guardá desde <b>Finalizar Sesión</b>, al final de Entrenar (ahí también podés sumar una nota).":
            "When you tick the <b>last set</b> of the session, the app asks whether to save: choose how you felt and tap <b>✅ Save session</b> (or <b>Keep training</b>). If you skipped an exercise, save from <b>Finish session</b>, at the end of Train (there you can also add a note).",
        "Al tildar una serie, la app te lleva a la misma serie del ejercicio siguiente, <b>sin descanso</b>. El descanso arranca recién al terminar el último ejercicio de la vuelta.":
            "When you tick a set, the app takes you to the same set of the next exercise, <b>with no rest</b>. Rest starts only after the last exercise of the round.",
        "Al tocar el peso de una serie, en la barra de botones rápidos aparece <b>🧮</b>. Te dice qué discos poner de cada lado de la barra para ese peso.":
            "When you tap the weight of a set, <b>🧮</b> appears in the quick buttons bar. It tells you which plates to put on each side of the bar for that weight.",
        "Cada ejercicio es un bloque con <b>una fila por serie</b>. Las columnas dependen de cómo se mide el ejercicio (ver <i>Tipos de medición</i>).":
            "Each exercise is a block with <b>one row per set</b>. The columns depend on how the exercise is measured (see <i>Measurement types</i>).",
        "Con <b>▶ Contar reps</b> cuenta un lado, te avisa \"Cambiá de lado\", cuenta el otro y después descansás.":
            "With <b>▶ Count reps</b> it counts one side, tells you \"Switch sides\", counts the other and then you rest.",
        "El primer ✓ marca un lado: la serie queda en <b>½</b> y solo tenés unos segundos para cambiar de lado (5 por defecto, se cambia en Ajustes → General), no un descanso. El segundo ✓ la completa y recién ahí arranca el descanso.":
            "The first ✓ marks one side: the set stays at <b>½</b> and you only have a few seconds to switch sides (5 by default, changed in Settings → General), not a rest. The second ✓ completes it and only then does the rest start.",
        "Elegí con cuáles se hace seguido (con 3 o más es una triserie o un circuito) y tocá <b>Guardar superserie</b>.":
            "Choose which ones are done back to back (with 3 or more it is a tri-set or a circuit) and tap <b>Save superset</b>.",
        "Elegí con cuánta anticipación querés el aviso y tocá <b>💾 Guardar plan</b>.":
            "Choose how far in advance you want the reminder and tap <b>💾 Save plan</b>.",
        "En <b>Biblioteca</b> (menú Más) están todas tus rutinas y todos los ejercicios, en dos pestañas:":
            "In <b>Library</b> (More menu) you have all your routines and all the exercises, in two tabs:",
        "En <b>Entrenar → pestaña ⏱️ Tabata / Intervalos</b>, poné un nombre al bloque (ej. Burpees), los segundos de trabajo, de descanso y las rondas.":
            "In <b>Train → ⏱️ Tabata / Intervals tab</b>, give the block a name (e.g. Burpees), the seconds of work, of rest and the rounds.",
        "En <b>Entrenar</b>, pestaña <b>🏋️ Rutina</b>, elegí la rutina del día en el selector (o tocá ▶ Entrenar en la Biblioteca). Para intervalos, pestaña <b>⏱️ Tabata / Intervalos</b>.":
            "In <b>Train</b>, <b>🏋️ Routine</b> tab, choose the routine of the day in the picker (or tap ▶ Train in the Library). For intervals, <b>⏱️ Tabata / Intervals</b> tab.",
        "En <b>Inicio → Mi plan semanal</b>, tildá los días que entrenás y elegí la hora y los minutos de cada uno (puede ser distinto cada día).":
            "In <b>Home → My weekly plan</b>, tick the days you train and choose the hour and minutes for each one (it can be different every day).",
        "En <b>Inicio → Programa</b> (o <b>Biblioteca → Programas</b>), <b>📚 Ver programas</b> muestra programas armados (cuerpo completo, en casa, fuerza 5×5, torso/pierna, empuje/tirón/pierna, glúteos y piernas) con sus días y ejercicios.":
            "In <b>Home → Program</b> (or <b>Library → Programs</b>), <b>📚 See programs</b> shows ready-made programs (full body, at home, 5×5 strength, upper/lower, push/pull/legs, glutes and legs) with their days and exercises.",
        "En Entrenar, los botones <b>Spotify</b> y <b>YouTube Music</b> abren esas apps. Si guardás el link de tu playlist en Ajustes → Música (en la app de música: Compartir → Copiar link), se abre directo en ella.":
            "In Train, the <b>Spotify</b> and <b>YouTube Music</b> buttons open those apps. If you save your playlist link in Settings → Music (in the music app: Share → Copy link), it opens straight into it.",
        "En Inicio ves qué día te toca y lo empezás con <b>▶ Entrenar</b>.":
            "On Home you see which day is next and you start it with <b>▶ Train</b>.",
        "En cada día podés elegir <b>qué rutina toca</b>. Si lo dejás en \"automática\", la tarjeta de Inicio propone la rutina que tenga ese día en el nombre (por ejemplo \"Torso C (jue)\"), la del programa en curso o la que hace más que no hacés.":
            "For each day you can choose <b>which routine is next</b>. If you leave it on \"automatic\", the Home card suggests the routine that has that day in its name (for example \"Torso C (jue)\"), the one from the current program or the one you have not done for the longest.",
        "En cada ejercicio, cargá las series y tocá <b>✓</b> al terminar cada una: arranca el descanso.":
            "In each exercise, enter the sets and tap <b>✓</b> when you finish each one: the rest starts.",
        "En cardio, en vez de RIR aparece <b>Esfuerzo</b> (Suave, Media, Alta, Máx).":
            "In cardio, instead of RIR you see <b>Effort</b> (Easy, Medium, Hard, Max).",
        "En la otra app buscá <b>Exportar datos</b> (suele estar en Ajustes o en el Perfil), guardá el archivo <b>CSV</b> y elegilo acá. Funciona con <b>Hevy</b>, <b>Strong</b> y <b>Fitbod</b>, y con el CSV que exporta esta app. Antes de guardar te muestro un resumen; si importás el mismo archivo dos veces, no se duplica.":
            "In the other app look for <b>Export data</b> (usually in Settings or in the Profile), save the <b>CSV</b> file and choose it here. It works with <b>Hevy</b>, <b>Strong</b> and <b>Fitbod</b>, and with the CSV this app exports. Before saving I show you a summary; if you import the same file twice, it is not duplicated.",
        "En las máquinas de placas, junto al peso se ve en qué placa va la clavija (ej. <b>placa 7</b>).":
            "On plate-stack machines, next to the weight you see which plate the pin goes in (e.g. <b>plate 7</b>).",
        "En los ejercicios con reps, <b>▶ Contar reps</b> cuenta la próxima serie sin marcar:":
            "In exercises with reps, <b>▶ Count reps</b> counts the next unmarked set:",
        "Las reps y el peso que cargás son <b>por lado</b>.":
            "The reps and the weight you enter are <b>per side</b>.",
        "Los avisos los da el <b>calendario del celular</b>, así llegan aunque la app esté cerrada.":
            "The reminders come from the <b>phone calendar</b>, so they arrive even if the app is closed.",
        "Los ejercicios quedan con el nombre que tenían (por ejemplo, en inglés). Si querés juntarlos con los tuyos, usá <b>🔗 Unificar Ejercicios Duplicados</b>, más arriba en Ajustes.":
            "Exercises keep the name they had (for example, in English). If you want to merge them with yours, use <b>🔗 Merge duplicate exercises</b>, further up in Settings.",
        "Mientras cuenta: <b>🐢 Más lento / 🐇 Más rápido</b> (la cadencia queda guardada para ese ejercicio), <b>⏸ Pausa</b>, <b>±1 rep</b> y <b>✕</b> para detenerlo. La cantidad de reps sale de lo cargado en la serie o, si está vacía, de la última vez.":
            "While counting: <b>🐢 Slower / 🐇 Faster</b> (the tempo is saved for that exercise), <b>⏸ Pause</b>, <b>±1 rep</b> and <b>✕</b> to stop it. The number of reps comes from what is entered in the set or, if it is empty, from last time.",
        "Mirá las <b>últimas sesiones</b>, o filtrá <b>por mes</b> o <b>por año</b>. Arriba hay un resumen del período.":
            "Look at the <b>recent sessions</b>, or filter <b>by month</b> or <b>by year</b>. At the top there is a summary of the period.",
        "Para leer, la app siempre usa unidades: <b>45 s</b>, <b>1 min 30 s</b>, <b>1 h</b>, <b>1 h 05 min</b>.":
            "For reading, the app always uses units: <b>45 s</b>, <b>1 min 30 s</b>, <b>1 h</b>, <b>1 h 05 min</b>.",
        "Punto o coma da igual: <b>22.5</b> y <b>22,5</b> se guardan igual.":
            "Dot or comma, it does not matter: <b>22.5</b> and <b>22,5</b> are saved the same.",
        "Queda guardada en la rutina y se marca en el historial. Para deshacerla: 🔗 → <b>Quitar de la superserie</b>.":
            "It is saved in the routine and marked in the history. To undo it: 🔗 → <b>Remove from superset</b>.",
        "Si el campo está vacío, parte del valor de la última vez. La barra se va sola cuando terminás de editar: al tocar <i>Listo</i> o cerrar el teclado, al tocar fuera de la serie o al marcarla con ✓.":
            "If the field is empty, it starts from last time's value. The bar goes away by itself when you finish editing: when you tap <i>Done</i> or close the keyboard, when you tap outside the set or when you tick it with ✓.",
        "Si una semana no llegás, se usa sola una <b>semana libre</b> (para vacaciones, lesión o enfermedad): empezás con 2 y se suma 1 por mes, hasta 3. Sin semanas libres se marchita un poco, pero nunca vuelve atrás.":
            "If you fall short one week, a <b>free week</b> is used automatically (for holidays, injury or illness): you start with 2 and get 1 more per month, up to 3. With no free weeks left it wilts a little, but it never goes back.",
        "Tocá <b>↔</b> debajo del nombre para marcarlo como unilateral (queda <b>↔ Por lado</b>). Los que tienen \"a un brazo\", \"unilateral\" o \"búlgara\" en el nombre ya vienen marcados.":
            "Tap <b>↔</b> below the name to mark it as unilateral (it shows <b>↔ Per side</b>). Those with \"a un brazo\", \"unilateral\" or \"búlgara\" in the name come already marked.",
        "Tocá <b>▶ Iniciar Rutina</b> para medir la duración. Si te olvidás, arranca sola cuando cargás el primer dato.":
            "Tap <b>▶ Start routine</b> to time it. If you forget, it starts by itself when you enter the first data.",
        "Tocá <b>🔗</b> debajo del nombre de un ejercicio.":
            "Tap <b>🔗</b> below the name of an exercise.",
        "Tocá el encabezado de la columna de tiempo (ej. <b>Min ⇄</b>) para elegir cómo cargarlo en ese ejercicio: <b>Seg → m:ss → Min → h:mm</b>. Lo que ya cargaste se convierte, y la elección queda guardada.":
            "Tap the header of the time column (e.g. <b>Min ⇄</b>) to choose how to enter it for that exercise: <b>Sec → m:ss → Min → h:mm</b>. What you already entered is converted, and the choice is saved.",
        "Un tic por rep marca el ritmo, y uno más grave a mitad de cada rep marca la <b>ida y vuelta</b>.":
            "One tick per rep sets the pace, and a deeper one halfway through each rep marks the <b>down and up</b>.",
        "¿Querés otro sonido? En <b>Mis grabaciones</b>, tocá 📁 en «¡Vamos! A la próxima serie» y subí el que quieras (por ejemplo, un tono del celular). En la app instalable desde Google Play vas a poder elegir directamente los sonidos del sistema.":
            "Want another sound? In <b>My recordings</b>, tap 📁 on \"Let's go! Next set\" and upload the one you want (for example, a phone ringtone). In the app installable from Google Play you will be able to choose system sounds directly.",
        "💾 Como los datos viven en el celular, descargá un <b>backup</b> de vez en cuando (Ajustes → Datos). Es lo que te permite recuperar todo si cambiás de teléfono o borrás el navegador.":
            "💾 Since the data lives on your phone, download a <b>backup</b> from time to time (Settings → Data). It is what lets you recover everything if you change phones or clear the browser."
    },
    // </html>

    patterns: [
        ['{a} · {b}', '{a} · {b}'],
        ['{n:num} de {m:num} entrenamientos esta semana', '{n} of {m} workouts this week'],
        ['{n:num} de {m:num} esta semana', '{n} of {m} this week'],
        ['{n:num} de {m:num} esta semana ✓', '{n} of {m} this week ✓'],
        ['{a:num} de {b:num} para {tier:tr}', '{a} of {b} for {tier}'],
        ['{a:num} de {b:num} {u:tr} para {tier:tr}', '{a} of {b} {u} for {tier}'],
        ['{n:num} ejercicios', '{n} exercises'], ['1 ejercicio', '1 exercise'],
        ['{n:num} series', '{n} sets'], ['1 serie', '1 set'],
        ['{n:num} sesiones', '{n} sessions'], ['1 sesión', '1 session'],
        ['{g:tr}: {n:num} series', '{g}: {n} sets'],
        ['{g:tr}: {n:num} series/semana', '{g}: {n} sets/week'],
        ['{n:num} series/semana', '{n} sets/week'],
        ['({d:num} directas + {i:num} indirectas)', '({d} direct + {i} indirect)'],
        ['última vez {d}', 'last time {d}'],
        ['La última vez: hace {n:num} días', 'Last time: {n} days ago'], ['La última vez: hace 1 día', 'Last time: 1 day ago'],
        ['faltan {n:num} para el rango', '{n} to reach the range'],
        ['Del {a:num} al {b:num}', 'From {a} to {b}'],
        ['semana en curso, quedan {n:num} días', 'week in progress, {n} days left'], ['semana en curso, queda 1 día', 'week in progress, 1 day left'], ['semana en curso, último día', 'week in progress, last day'],
        ['promedio de {n:num} semanas', 'average of {n} weeks'],
        ['Entrenando desde el {d}', 'Training since {d}'],
        ['Mejor racha: {n} semanas seguidas. Sesión promedio: {m} min. Tu ejercicio más hecho: {ex}.', 'Best streak: {n} weeks in a row. Average session: {m} min. Your most done exercise: {ex}.'],
        ['Próximo entrenamiento: {x}.', 'Next workout: {x}.'],
        ['Próximo: {x}.', 'Next: {x}.'],
        ['el {d:tr} a las {t:num}', '{d} at {t}'], ['hoy a las {t:num}', 'today at {t}'],
        ['Sesión en curso · {r} · {n} min', 'Session in progress · {r} · {n} min'],
        ['Hoy toca entrenar · {t:num}', 'Time to train today · {t}'],
        ['Hoy ya entrenaste. ¡Bien! Próximo: {x}.', 'You already trained today. Nice! Next: {x}.'],
        ['Hoy es día de descanso. Próximo: {x}.', 'Today is a rest day. Next: {x}.'],
        ['Hoy toca entrenar ({t:num})', 'Time to train today ({t})'],
        ['Últ: {x}', 'Last: {x}'], ['Máx {x}', 'Best {x}'],
        ['Ver {n:num} más', 'Show {n} more'],
        ['Cada entrenamiento la riega. {x}.', 'Every workout waters it. {x}.'],
        ['¡Semana cumplida! Ya la regaste. {x}.', 'Week done! You watered it. {x}.'],
        ['Se marchitó un poco: cumplí esta semana y se recupera. {x}.', 'It wilted a little: complete this week and it recovers. {x}.'],
        ['Falta 1 semana para {x:tr}', '1 week until {x}'], ['Faltan {n:num} semanas para {x:tr}', '{n} weeks until {x}'],
        ['{n:num} semanas libres', '{n} free weeks'], ['1 semana libre', '1 free week'],
        ['{n:num} semanas cumplidas', '{n} weeks completed'], ['1 semana cumplida', '1 week completed'],
        ['{s} · {n:num} frutos', '{s} · {n} fruits'], ['{s} · 1 fruto', '{s} · 1 fruit'],
        ['Llevás {w:num} semanas en {x}. Probá con {y} aunque hagas menos reps.', "{w} weeks at {x}. Try {y} even if you do fewer reps."],
        ['Llevás {w:num} semanas en {x}. Apuntá a {n:num} reps con el mismo peso antes de subir.', '{w} weeks at {x}. Aim for {n} reps at the same weight before going up.'],
        ['Llevás {w:num} semanas en {x}. Apuntá a {n:num} reps antes de subir.', '{w} weeks at {x}. Aim for {n} reps before going up.'],
        ['Llevás {w:num} semanas en {n:num} reps. Pasá a una variante más difícil o sumá peso (lastre).', '{w} weeks at {n} reps. Move to a harder variation or add weight.'],
        ['{x} Si sigue igual, probá una variante ({v}) o una semana más liviana (descarga).', '{x} If nothing changes, try a variation ({v}) or a lighter week (deload).'],
        ['{x} Si sigue igual, probá una variante o una semana más liviana (descarga).', '{x} If nothing changes, try a variation or a lighter week (deload).'],
        ['{ex}: {v} (antes {b})', '{ex}: {v} (was {b})'],
        ['{ex}: volumen total {v} (antes {b})', '{ex}: total volume {v} (was {b})'],
        ['{ex}: {n} reps (antes {b})', '{ex}: {n} reps (was {b})'],
        ['Peso máximo: {v}', 'Max weight: {v}'], ['Más reps: {v}', 'Most reps: {v}'], ['Volumen total: {v}', 'Total volume: {v}'],
        ['Próxima: {tier:tr} a {v}', 'Next: {tier} at {v}'],
        ['Compartir medalla {x:name}', 'Share medal {x}'], ['Compartir el récord de {x:name}', 'Share the record of {x}'],
        ['Compartir {x:name}', 'Share {x}'], ['Entrenar {x:name}', 'Train {x}'], ['Archivar {x:name}', 'Archive {x}'],
        ['Contraer {x:name}', 'Collapse {x}'], ['Cómo se mide {x:name}', 'How {x} is measured'],
        ['Reordenar {x}: mantené apretado y arrastrá, o usá las flechas ↑ ↓', 'Reorder {x}: press and hold and drag, or use the ↑ ↓ arrows'],
        ['Borrar la sesión del {d}', 'Delete the session of {d}'],
        ['Borrar grabación de «{x}»', 'Delete recording of "{x}"'], ['Escuchar «{x}»', 'Listen to "{x}"'], ['Subir un audio para «{x}»', 'Upload audio for "{x}"'],
        ['Voz del celular: «{x}»', 'Phone voice: "{x}"'], ['«{x}»', '"{x}"'],
        ['«{x}» al guardar la sesión', '"{x}" when saving the session'],
        ['Hora del {d:tr}', 'Hour for {d}'], ['Minutos del {d:tr}', 'Minutes for {d}'], ['Rutina del {d:tr}', 'Routine for {d}'],
        ['Reps, serie {n:num}', 'Reps, set {n}'], ['Peso en kg, serie {n:num}', 'Weight in kg, set {n}'], ['Peso en lb, serie {n:num}', 'Weight in lb, set {n}'],
        ['Descanso en segundos, serie {n:num}', 'Rest in seconds, set {n}'], ['Distancia en km, serie {n:num}', 'Distance in km, set {n}'],
        ['Tiempo en minutos:segundos, serie {n:num}', 'Time in minutes:seconds, set {n}'], ['Nota de la serie {n:num}', 'Note for set {n}'],
        ['Reps en reserva (F = al fallo), serie {n:num}', 'Reps in reserve (F = to failure), set {n}'],
        ['Serie {n:num} hecha', 'Set {n} done'], ['Serie {n:num}: marcar como calentamiento', 'Set {n}: mark as warm-up'],
        ['{lvl:tr} · {n:num} días por semana ({d}) · {w:num} semanas', '{lvl} · {n} days per week ({d}) · {w} weeks'],
        ['Principiante', 'Beginner'], ['Intermedio', 'Intermediate'], ['Todos', 'Everyone'],
        ['Desde el {d} · semana {a} de {b} · {n} sesiones', 'Since {d} · week {a} of {b} · {n} sessions'],
        ['Entrenar {x:name}', 'Train {x}'],
        ['{n:num} semanas', '{n} weeks'], ['{n:num} días', '{n} days'], ['{n:num} min', '{n} min'],
        ['⏱ {x}', '⏱ {x}']
    ]
};

// ---- Segunda parte: ayuda (preguntas, respuestas y títulos), rutinas que trae la app y etiquetas ----
Object.assign(I18N_DICTIONARIES.en.text, {
    // Títulos de la ayuda
    'Primeros pasos': 'Getting started', 'Lo que tiene esta app': 'What this app has', 'Entrenar: una sesión paso a paso': 'Train: a session step by step',
    'Series: cómo cargarlas': 'Sets: how to enter them', 'Tipos de medición (kg, reps, tiempo, km)': 'Measurement types (kg, reps, time, km)',
    'Tiempo: segundos, minutos u horas': 'Time: seconds, minutes or hours', 'Botones rápidos (+/−)': 'Quick buttons (+/−)', 'Timer de descanso': 'Rest timer',
    'Ejercicios unilaterales (de a un lado)': 'Unilateral exercises (one side at a time)', 'Contador de reps con cadencia': 'Rep counter with tempo',
    'Superseries y circuitos': 'Supersets and circuits', 'Calculadora de discos y de placas': 'Plate calculator for barbells and stacks',
    'Organizar los ejercicios de una rutina': "Organize a routine's exercises", 'Programas con progresión': 'Programs with progression',
    'Biblioteca: rutinas y ejercicios': 'Library: routines and exercises', 'Tabata e intervalos': 'Tabata and intervals', 'Plan semanal y recordatorios': 'Weekly plan and reminders',
    'Progreso y récords': 'Progress and records', 'Medidas corporales y fotos': 'Body measurements and photos', 'Perfil, medallas, trofeos y fotos': 'Profile, medals, trophies and photos',
    'Voz, sonidos y tus grabaciones': 'Voice, sounds and your recordings', 'Tus datos y el backup': 'Your data and the backup', 'Privacidad y seguridad': 'Privacy and security',
    // Párrafos sin formato de la ayuda
    'Al agregar un ejercicio nuevo, la app sugiere el tipo por el nombre ("Plancha" → Tiempo, "Bici" → Tiempo + km). El tipo vale para ese ejercicio en todas las rutinas. Cambiarlo no toca el historial ni borra lo que cargaste hoy.':
        'When you add a new exercise, the app suggests the type from the name ("Plancha" → Time, "Bici" → Time + km). The type applies to that exercise in every routine. Changing it does not touch the history or delete what you entered today.',
    'Al terminar, marca la serie como hecha y arranca el descanso.': 'When it finishes, it marks the set as done and starts the rest.',
    'Android: menú ⋮ del navegador → Instalar app. iPhone (Safari): Compartir → Agregar a inicio.': 'Android: browser menu ⋮ → Install app. iPhone (Safari): Share → Add to Home Screen.',
    'Arranca solo al marcar una serie con ✓, con el descanso de esa serie.': "It starts by itself when you tick a set with ✓, with that set's rest.",
    'Avisa por voz cuando quedan 10 segundos y suena al terminar (se configura en Ajustes).': 'It tells you by voice when 10 seconds are left and rings at the end (set it up in Settings).',
    'Botón «▶ Contar reps» en cada ejercicio': '"▶ Count reps" button on each exercise',
    'Busca la combinación con menos discos, aunque falten algunos. Si el peso no se puede armar exacto, te muestra el más cercano por debajo y por encima.':
        'It finds the combination with the fewest plates, even if some are missing. If the weight cannot be made exactly, it shows the closest below and above.',
    'Básicos con barra a 5 series de 5. Si completás las 25 reps, la próxima vez sumás peso (piernas de a 5 kg, torso de a 2,5 kg).':
        'Barbell basics at 5 sets of 5. If you complete the 25 reps, next time you add weight (legs by 5 kg, upper body by 2.5 kg).',
    'Cada ejercicio muestra su objetivo (🎯 3 × 8–12) y qué hacer hoy. Los valores sugeridos aparecen en gris: si los hiciste, tocá ✓.':
        'Each exercise shows its target (🎯 3 × 8–12) and what to do today. Suggested values appear in gray: if you did them, tap ✓.',
    'Cada ejercicio se mide de una forma. Se cambia con el selector debajo del nombre del ejercicio:': 'Each exercise is measured one way. Change it with the picker below the exercise name:',
    'Cada superserie tiene una letra (A, B…) y un color en el borde del bloque.': 'Each superset has a letter (A, B…) and a color on the block border.',
    'Cambiar el plan rige desde esta semana: las semanas anteriores se siguen evaluando con el plan que tenían. Si cambiás días u horarios, borrá los eventos viejos del calendario y volvé a agregarlos.':
        'Plan changes apply from this week: previous weeks are still evaluated with the plan they had. If you change days or times, delete the old calendar events and add them again.',
    'Crece con cada semana en que entrenás tantos días como dice tu plan: semilla → brote (1 semana) → capullo (3) → flor (6) → flor con frutos (10), y suma un fruto cada 4 semanas más.':
        'It grows with every week in which you train as many days as your plan says: seed → sprout (1 week) → bud (3) → flower (6) → flower with fruit (10), and adds a fruit every 4 more weeks.',
    'Dos rutinas (A y B) que se alternan tres veces por semana. Todo el cuerpo en cada sesión: ideal para empezar o volver.': 'Two routines (A and B) alternated three times a week. Full body every session: ideal to start or come back.',
    'Dos sesiones por semana centradas en glúteos y piernas. Se combina bien con uno o dos días de torso.': 'Two sessions a week focused on glutes and legs. It combines well with one or two upper-body days.',
    'El estado de la semana te dice si vas al día con tu plan.': 'The week status tells you whether you are on track with your plan.',
    'El timer no suena con la pantalla bloqueada.': 'The timer does not ring with the screen locked.',
    'Elegí la barra (olímpica de 20 kg, de 15, técnica, Z o sin barra) y tocá los discos que tenés en tu gimnasio. La app los recuerda.':
        'Choose the bar (20 kg Olympic, 15 kg, technique, EZ or no bar) and tap the plates your gym has. The app remembers them.',
    'En Ajustes → Accesibilidad podés agrandar botones y campos (Grandes o Muy grandes) y activar los colores para daltonismo, que cambian el verde y el rojo por azul y naranja.':
        'In Settings → Accessibility you can enlarge buttons and fields (Large or Extra large) and turn on color-blind colors, which swap green and red for blue and orange.',
    'En Biblioteca → Rutinas, tocá 🔗 en la rutina y mandá el link por WhatsApp. Quien lo abre la agrega a su Biblioteca con un toque, con los objetivos de cada ejercicio. No hace falta cuenta.':
        "In Library → Routines, tap 🔗 on the routine and send the link by WhatsApp. Whoever opens it adds it to their Library with one tap, with each exercise's targets. No account needed.",
    'En Historial, ✏️ cambia la fecha y 🗑 borra la sesión. Para cargarla bien, volvé a Entrenar y guardala de nuevo.': 'In History, ✏️ changes the date and 🗑 deletes the session. To enter it correctly, go back to Train and save it again.',
    'En ejercicios como remo a un brazo, búlgara o curl femoral unilateral, cada serie se hace de un lado y después del otro.': 'In exercises like one-arm rows, Bulgarian split squats or single-leg curls, each set is done on one side and then the other.',
    'En los ejercicios de Duración y de Tiempo + km no hay descanso ni timer.': 'Duration and Time + km exercises have no rest or timer.',
    'En los unilaterales cuenta un lado, te da unos segundos para cambiar y cuenta el otro.': 'In unilateral exercises it counts one side, gives you a few seconds to switch and counts the other.',
    'Ese ejercicio lleva 3 semanas o más (y al menos 3 sesiones) sin mejorar: ni más peso ni más reps con ese peso. Si ya llegás al tope de reps (el de tu objetivo, o 12), te sugiere subir el peso; si no, sumar una rep. Con 6 semanas o más, también probar una variante o una semana más liviana (descarga). Si bajaste el peso a propósito, cuenta desde ahí.':
        'That exercise has gone 3 weeks or more (and at least 3 sessions) without improving: no more weight and no more reps at that weight. If you already reach the top of the rep range (your target, or 12), it suggests raising the weight; if not, adding a rep. At 6 weeks or more, it also suggests a variation or a lighter week (deload). If you lowered the weight on purpose, it counts from there.',
    'Hay que mantenerlos apretados un momento, hasta que se llenen de color y el celular vibre. Recién ahí arrastrá. Así se evita mover algo sin querer.':
        'You have to hold them for a moment, until they fill with color and the phone vibrates. Only then drag. This avoids moving things by accident.',
    'La app se revisó en busca de fallas de seguridad y las que aparecieron se corrigieron.': 'The app was reviewed for security flaws and the ones found were fixed.',
    'La app te habla con la voz del celular (funciona sin internet). Cada aviso se activa o desactiva por separado. En iPhone, el interruptor de silencio puede apagar la voz.':
        'The app speaks with the phone voice (works offline). Each alert is turned on or off separately. On iPhone, the silent switch can mute the voice.',
    'La suma de peso × reps de todas tus series efectivas. Es una buena medida del trabajo total: si subís el peso pero bajan las reps, el volumen dice si en total hiciste más.':
        'The sum of weight × reps of all your working sets. It is a good measure of total work: if you raise the weight but the reps drop, volume tells you whether you did more in total.',
    'La voz dice el número al empezar cada rep y los ánimos (la mitad, quedan cinco, quedan dos, ¡última!) a mitad de la rep, así nunca perdés la cuenta.':
        'The voice says the number at the start of each rep and the encouragement (halfway, five left, two left, last one!) halfway through the rep, so you never lose count.',
    'La voz o los sonidos no se escuchan.': 'I cannot hear the voice or the sounds.',
    'Las fotos no salen de tu celular: se guardan comprimidas y entran en el backup. Si compartís el backup, protegelo con contraseña (Ajustes → Datos).':
        'Photos never leave your phone: they are saved compressed and go into the backup. If you share the backup, protect it with a password (Settings → Data).',
    'Las voces (de hombre o de mujer, y con distintos tonos) dependen de las que tenga instaladas tu celular. Una app web no puede abrir esos ajustes; la app de Google Play sí lo va a hacer.':
        'Voices (male or female, with different pitches) depend on the ones installed on your phone. A web app cannot open those settings; the Google Play app will.',
    'Los avisos los da el calendario de tu celular: llegan aunque la app esté cerrada. Si cambiás el plan, borrá los eventos viejos del calendario y volvé a agregarlos.':
        'The reminders come from your phone calendar: they arrive even if the app is closed. If you change the plan, delete the old calendar events and add them again.',
    'Los botones me quedan chicos o me cuesta distinguir los colores.': 'The buttons are too small for me or I have trouble telling the colors apart.',
    'Mientras contás podés hacerla más lenta o más rápida; queda guardada para ese ejercicio.': 'While counting you can make it slower or faster; it is saved for that exercise.',
    'No se puede recuperar: la contraseña no se guarda en ningún lado (así nadie más puede abrirlo). Si todavía tenés los datos en el celular, descargá un backup nuevo.':
        'It cannot be recovered: the password is not stored anywhere (so nobody else can open it). If you still have the data on your phone, download a new backup.',
    'No. Después de abrir la app una vez, funciona sin conexión. Solo los links de música y de videos necesitan internet.': 'No. After opening the app once, it works offline. Only the music and video links need internet.',
    'Olvidé la contraseña de un backup protegido.': 'I forgot the password of a protected backup.',
    'Para bloques de tiempo (HIIT, plancha, bici, etc.) en vez de reps y peso.': 'For timed blocks (HIIT, plank, bike, etc.) instead of reps and weight.',
    'Pasaba en versiones anteriores al reordenar ejercicios. Ya está corregido; si alguna vez ves los bloques achicados, volvé a elegir la rutina en el selector y se ven normales.':
        'It happened in earlier versions when reordering exercises. It is fixed now; if you ever see the blocks shrunk, choose the routine again in the picker and they look normal.',
    'Pausar o pasar de tema se hace desde la app de música o los controles del celular: una web no puede manejar otra app.': 'Pausing or skipping tracks is done from the music app or the phone controls: a website cannot control another app.',
    'Pegá el link de tu playlist (en la app de música: Compartir → Copiar link) y la abrís con un toque desde Entrenar. Sin link, se abre la app en su inicio. Pausar o pasar de tema se hace desde la app de música o desde los controles del celular: una web no puede manejar otra app.':
        'Paste your playlist link (in the music app: Share → Copy link) and open it with one tap from Train. Without a link, the app opens on its home page. Pausing or skipping tracks is done from the music app or the phone controls: a website cannot control another app.',
    'Primero te da unos segundos para prepararte (5 por defecto): "Preparate… 3, 2, 1, ¡Ya!".': 'First it gives you a few seconds to get ready (5 by default): "Get ready… 3, 2, 1, Go!".',
    'Revisá el volumen del celular y de la app (Ajustes → Sonido). En iPhone, el interruptor de silencio los apaga. El navegador solo deja sonar audio después de tocar la pantalla al menos una vez.':
        'Check the phone and app volume (Settings → Sound). On iPhone, the silent switch mutes them. The browser only plays audio after you have touched the screen at least once.',
    'Se pierde todo lo guardado en este celular. Por eso conviene descargar un backup de vez en cuando.': 'Everything saved on this phone is lost. That is why it is a good idea to download a backup from time to time.',
    'Solo se guardan las series que marcaste con ✓ o en las que escribiste algo. Lo que se ve en gris no se guarda por sí solo.': 'Only the sets you ticked with ✓ or typed something into are saved. What is shown in gray is not saved on its own.',
    'Son los de la última vez que hiciste ese ejercicio, como sugerencia. No se guardan hasta que tocás ✓ o escribís algo en esa serie.': 'They are from the last time you did that exercise, as a suggestion. They are not saved until you tap ✓ or type something in that set.',
    'Sí. En la otra app buscá "Exportar datos" y guardá el CSV. Después, en Ajustes → 📥 Traer historial de otra app, elegí el archivo: te muestra cuántas sesiones, series y fechas trae antes de guardar. Si lo importás dos veces, no se duplica. Los ejercicios quedan con su nombre original; el grupo muscular se reconoce solo en la mayoría (también en inglés). Para llevar tu historial a una planilla, usá Ajustes → Datos → 📄 Exportar historial (CSV).':
        'Yes. In the other app look for "Export data" and save the CSV. Then, in Settings → 📥 Bring history from another app, choose the file: it shows how many sessions, sets and dates it brings before saving. If you import it twice, it is not duplicated. Exercises keep their original name; the muscle group is recognized automatically for most of them (also in English). To take your history to a spreadsheet, use Settings → Data → 📄 Export history (CSV).',
    'Tabata ahora es una pestaña dentro de Entrenar (⏱️ Tabata / Intervalos). Variantes está en Biblioteca → Ejercicios.': 'Tabata is now a tab inside Train (⏱️ Tabata / Intervals). Variations are in Library → Exercises.',
    'Toco los puntos ⠿ pero no se mueve el ejercicio.': 'I tap the ⠿ dots but the exercise does not move.',
    'Tres sesiones por movimiento: empujes (pecho, hombros, tríceps), tirones (espalda, bíceps) y pierna. Se puede hacer dos vueltas por semana (6 días).': 'Three sessions by movement: push (chest, shoulders, triceps), pull (back, biceps) and legs. It can be done twice a week (6 days).',
    'Una app web no puede programar notificaciones confiables sin un servidor. El calendario del celular sí avisa a la hora exacta, aunque la app esté cerrada. En la futura versión instalable desde Google Play, los avisos van a ser notificaciones de la propia app.':
        "A web app cannot schedule reliable notifications without a server. The phone calendar does alert you at the exact time, even if the app is closed. In the future version installable from Google Play, reminders will be the app's own notifications.",
    'Una rutina con el peso del cuerpo, tres veces por semana. Se progresa sumando reps; al llegar arriba, se pasa a una variante más difícil.': 'A bodyweight routine, three times a week. You progress by adding reps; at the top, you move to a harder variation.',
    'Una web no puede controlar otra app. La app abre Spotify o YouTube Music (o tu playlist); la reproducción se maneja desde ahí.': 'A website cannot control another app. The app opens Spotify or YouTube Music (or your playlist); playback is handled from there.',
    // Preguntas frecuentes
    'Cargué mal una sesión, ¿cómo la corrijo?': 'I entered a session wrong, how do I fix it?', '¿Cómo aviso de un error o mando una idea?': 'How do I report a bug or send an idea?',
    '¿Cómo instalo la app en la pantalla de inicio?': 'How do I install the app on the home screen?', '¿Cómo le paso una rutina a un alumno (o a un amigo)?': 'How do I send a routine to a client (or a friend)?',
    '¿Dónde está el cambio de tema claro / oscuro?': 'Where is the light / dark theme switch?', '¿Dónde quedó Tabata? ¿Y Variantes?': 'Where did Tabata go? And Variations?',
    '¿Necesito internet?': 'Do I need internet?', '¿Por qué algunos valores se ven en gris?': 'Why are some values shown in gray?',
    '¿Por qué los avisos del plan llegan por el calendario y no como notificación de la app?': 'Why do plan reminders come through the calendar and not as app notifications?',
    '¿Por qué no puedo pausar Spotify desde la app?': "Why can't I pause Spotify from the app?", '¿Puedo traer mi historial de Hevy, Strong o Fitbod?': 'Can I bring my history from Hevy, Strong or Fitbod?',
    '¿Qué es el 1RM estimado?': 'What is the estimated 1RM?', '¿Qué es el volumen?': 'What is volume?', '¿Qué es la C que aparece al tocar el número de una serie?': 'What is the C that appears when I tap a set number?',
    '¿Qué pasa si borro los datos del navegador?': 'What happens if I clear the browser data?', '¿Qué significa el aviso 📈 "Llevás X semanas en…"?': 'What does the 📈 "X weeks at…" notice mean?',
    // Rutinas que trae la app
    'Rutina A - Superior': 'Routine A - Upper', 'Rutina B - Inferior': 'Routine B - Lower', 'Rutina C - Superior': 'Routine C - Upper', 'Rutina D - Inferior': 'Routine D - Lower',
    'Rutina A1 - Micro Upper 1 (pecho + espalda + hombro)': 'Routine A1 - Micro Upper 1 (chest + back + shoulder)', 'Rutina A2 - Micro Upper 2 (hombro + espalda + bíceps)': 'Routine A2 - Micro Upper 2 (shoulder + back + biceps)',
    'Rutina B1 - Micro Lower 1 (cuádriceps + isquios)': 'Routine B1 - Micro Lower 1 (quads + hamstrings)', 'Rutina C1 - Micro hombro ancho + tríceps': 'Routine C1 - Micro wide shoulders + triceps',
    'Rutina C2 - Micro pecho accesorio + brazos': 'Routine C2 - Micro chest accessory + arms', 'Rutina D1 - Micro Lower 2 (glúteos + gemelos + core)': 'Routine D1 - Micro Lower 2 (glutes + calves + core)',
    // Programas
    'Cuerpo completo 3 días': 'Full body 3 days', 'En casa sin equipamiento': 'At home, no equipment', 'Fuerza base 5×5': 'Base strength 5×5', 'Torso / Pierna 4 días': 'Upper / Lower 4 days',
    'Empuje / Tirón / Pierna': 'Push / Pull / Legs', 'Glúteos y piernas': 'Glutes and legs', 'Gratis': 'Free', 'Pro': 'Pro',
    'Empuje': 'Push', 'Tirón': 'Pull', 'Pierna': 'Legs', 'Pierna A': 'Legs A', 'Pierna B': 'Legs B', 'Torso A': 'Upper A', 'Torso B': 'Upper B',
    // Etiquetas sueltas
    'Reps': 'Reps', 'Reps:': 'Reps:', 'RIR': 'RIR', 'Desc s': 'Rest s', 'normal': 'normal',
    'Cadencia inicial': 'Starting tempo', 'Tiempo para prepararte antes de arrancar': 'Time to get ready before starting', 'Tono de la voz': 'Voice pitch', 'Velocidad de la voz': 'Voice speed', 'Volumen': 'Volume',
    'Voz activada': 'Voice on', 'Distancia en cardio': 'Cardio distance', 'días entrenados': 'days trained', 'levantados': 'lifted', 'semanas seguidas': 'weeks in a row',
    '½ Un lado': '½ One side', 'Hecho': 'Done', 'Press, Remo, Plancha, Bici': 'Press, Row, Plank, Bike', 'by Inquieto': 'by Inquieto',
    'Ánimo: «la mitad», «quedan cinco», «quedan dos», «¡última!»': 'Encouragement: "halfway", "five left", "two left", "last one!"',
    '±0,5 y ±1': '±0.5 and ±1', 'Esfuerzo': 'Effort', 'Suave': 'Easy', 'Media': 'Medium', 'Alta': 'Hard', 'Máx': 'Max'
});
I18N_DICTIONARIES.en.patterns.push(
    ['Día {x:name}', 'Day {x}'],
    ['{n:num} s por rep', '{n} s per rep'],
    ['{n:num} / semana', '{n} / week'],
    ['Duración prom.: {x}', 'Avg. length: {x}'], ['Volumen prom.: {x}', 'Avg. volume: {x}'],
    ['{n:num} sesiónes', '{n} sessions'],
    ['+{n:num} más', '+{n} more']
);

// ---- Tercera parte: voz (todos los estilos), avisos, ventanas del sistema y títulos de secciones ----
Object.assign(I18N_DICTIONARIES.en.text, {
    // Voz: frases por defecto (neutro)
    'Quedan diez segundos': 'Ten seconds left', '¡Vamos! A la próxima serie': "Let's go! Next set", 'Preparate': 'Get ready', '¡Ya!': 'Go!',
    '¡Dale, la mitad!': 'Come on, halfway!', '¡Dale, quedan cinco!': 'Come on, five left!', '¡Quedan dos!': 'Two left!', '¡Última!': 'Last one!',
    'Cambiá de lado': 'Switch sides', '¡Bien! Serie terminada': 'Nice! Set done', '¡Trabajo!': 'Work!', '¡Última ronda!': 'Last round!',
    '¡Terminaste! Muy bien': 'You did it! Well done', '¡Nuevo récord!': 'New record!', '¡Misión cumplida!': 'Mission accomplished!', 'Seguimos': "Let's continue",
    '¡Última ronda! ¡Trabajo!': 'Last round! Work!', '¡Nuevos récords!': 'New records!',
    // Tierno
    'Quedan diez segunditos': 'Just ten little seconds left', '¡Vamos, vos podés! A la próxima': 'Come on, you can do it! On to the next', 'Preparate, tranqui': 'Get ready, nice and easy',
    '¡Arrancamos!': "Here we go!", '¡Muy bien, ya vas por la mitad!': "Very good, you're halfway there!", '¡Quedan cinco, dale que podés!': 'Five left, come on, you can!',
    '¡Dos más, ya casi!': 'Two more, almost there!', '¡La última, vos podés!': 'Last one, you can do it!', 'Ahora el otro ladito': 'Now the other side',
    '¡Genial! Serie terminada': 'Great! Set done', '¡A darle!': "Let's do it!", 'Descansá un poquito': 'Rest a little', '¡Terminaste! Qué orgullo': "You finished! I'm so proud",
    '¡Nuevo récord! ¡Qué grande!': 'New record! Amazing!', '¡Última ronda! ¡A darle!': "Last round! Let's do it!",
    // Militar
    '¡Diez segundos!': 'Ten seconds!', '¡En posición! ¡Siguiente serie!': 'In position! Next set!', '¡Atención!': 'Attention!', '¡Mitad! ¡No afloje!': "Halfway! Don't slack!",
    '¡Cinco más, sin excusas!': 'Five more, no excuses!', '¡Dos! ¡Con todo!': 'Two! All in!', '¡Última! ¡Aguante!': 'Last one! Hold on!', '¡Cambio de lado!': 'Switch sides!',
    '¡Serie cumplida!': 'Set complete!', '¡Trabajo! ¡Ya!': 'Work! Now!', '¡Descanso!': 'Rest!', '¡Última ronda! ¡Todo!': 'Last round! Everything!', '¡Récord! ¡Así se hace!': "Record! That's how it's done!",
    '¡Última ronda! ¡Todo! ¡Trabajo! ¡Ya!': 'Last round! Everything! Work! Now!',
    // Motivador
    '¡Diez segundos, preparate!': 'Ten seconds, get ready!', '¡Vamos con todo! ¡A la próxima!': 'All in! On to the next!', '¡Preparate, esta es tuya!': 'Get ready, this one is yours!',
    '¡Vamos!': "Let's go!", '¡La mitad! ¡Seguí así!': 'Halfway! Keep it up!', '¡Cinco más, dale que se viene!': 'Five more, come on, here it comes!', '¡Dos más, empujá!': 'Two more, push!',
    '¡La última, dejá todo!': 'Last one, give it everything!', '¡Cambiá de lado, seguimos!': 'Switch sides, keep going!', '¡Tremenda serie!': 'Awesome set!',
    '¡A full!': 'Full power!', '¡Respirá!': 'Breathe!', '¡Última ronda, vaciate!': 'Last round, empty the tank!', '¡Lo lograste, crack!': 'You did it, champ!', '¡Nuevo récord! ¡Imparable!': 'New record! Unstoppable!',
    '¡Última ronda, vaciate! ¡A full!': 'Last round, empty the tank! Full power!',
    // Calma
    'Diez segundos': 'Ten seconds', 'Cuando quieras, la próxima serie': 'Whenever you are ready, the next set', 'Respirá y preparate': 'Breathe and get ready', 'Empezamos': "Let's start",
    'La mitad, buen ritmo': 'Halfway, good pace', 'Quedan cinco': 'Five left', 'Quedan dos': 'Two left', 'La última': 'Last one', 'Serie terminada, bien hecho': 'Set done, well done',
    'Última ronda': 'Last round', 'Terminaste, muy bien': 'You finished, well done', 'Nuevo récord': 'New record', 'Última ronda Trabajo': 'Last round Work',

    // Títulos de secciones que faltaban
    'Contacto': 'Contact', 'Tu plan': 'Your plan', 'Variantes y videos': 'Variations and videos', 'Ver video': 'Watch video', 'Tu actividad': 'Your activity',
    'Evolución': 'Evolution', 'Cargar Medición': 'Log measurement', 'Voz y avisos': 'Voice and alerts', 'PRs de esta sesión:': 'PRs this session:', 'Tus ejercicios': 'Your exercises',

    // Avisos
    'Agregá otro ejercicio a la rutina para armar una superserie': 'Add another exercise to the routine to make a superset',
    'Bloque cancelado (no llegaste a completar ni una ronda, no se guardó)': 'Block cancelled (not even one round was completed, nothing was saved)',
    'C = serie de calentamiento: se guarda, pero no cuenta para récords ni volumen. Tocá la C para volver a serie normal.': 'C = warm-up set: it is saved, but it does not count for records or volume. Tap the C to turn it back into a normal set.',
    'Cargá los valores de la serie antes de marcarla': 'Enter the set values before ticking it', 'Completá fecha y peso': 'Fill in date and weight',
    'El archivo es demasiado grande (más de 20 MB).': 'The file is too large (more than 20 MB).', 'El audio es muy largo: tiene que pesar menos de 1 MB (unos segundos).': 'The audio is too long: it must be under 1 MB (a few seconds).',
    'El nombre no puede estar vacío': 'The name cannot be empty', 'El plan ya estaba así': 'The plan was already like that', 'Elegí dos ejercicios distintos': 'Choose two different exercises',
    'Elegí el músculo que trabaja (o "Otro")': 'Choose the muscle it works (or "Other")', 'Elegí los dos ejercicios que querés unificar': 'Choose the two exercises you want to merge',
    'Elegí un archivo de audio (mp3, m4a, wav, ogg…)': 'Choose an audio file (mp3, m4a, wav, ogg…)', 'Escribí el nombre del ejercicio': 'Type the exercise name',
    'Escribí un nombre para la nueva rutina (ej: Fútbol, Yoga, Natación)': 'Type a name for the new routine (e.g. Football, Yoga, Swimming)',
    'Este navegador no permite grabar audio desde la app.': 'This browser does not allow recording audio from the app.',
    'Formato de fecha inválido. Usá AAAA-MM-DD, por ejemplo 2026-08-11': 'Invalid date format. Use YYYY-MM-DD, for example 2026-08-11',
    'Ingresá la cantidad de rondas': 'Enter the number of rounds', 'Ingresá los segundos de trabajo': 'Enter the work seconds',
    'Las contraseñas no coinciden': 'The passwords do not match', 'Marcá (✓) o cargá al menos una serie': 'Tick (✓) or enter at least one set', 'Mínimo 8 caracteres': 'At least 8 characters',
    'No hay permiso para usar el micrófono. Habilitalo en los permisos del navegador para esta app.': 'There is no permission to use the microphone. Enable it in the browser permissions for this app.',
    'No se grabó nada. Probá de nuevo.': 'Nothing was recorded. Try again.', 'No se pudo guardar el ajuste': 'The setting could not be saved', 'No se pudo guardar el perfil': 'The profile could not be saved',
    'No se pudo guardar la grabación. Probá de nuevo.': 'The recording could not be saved. Try again.', 'No se pudo leer ese audio. Probá con otro formato (mp3 o m4a).': 'That audio could not be read. Try another format (mp3 or m4a).',
    'Pegá el link completo que te pasaron': 'Paste the full link you were sent', 'Primero iniciá la rutina': 'Start the routine first', 'Programa terminado': 'Program ended',
    'Seleccioná rutina y fecha': 'Choose a routine and date', 'Seleccioná una rutina primero': 'Choose a routine first',
    'Todas las series están hechas. Agregá una con "+ Agregar serie".': 'All sets are done. Add one with "+ Add set".', 'Todavía no hay sesiones para exportar': 'There are no sessions to export yet',
    '⚠️ Este navegador no permite guardar datos: lo que cargues se pierde al cerrar.': '⚠️ This browser does not allow saving data: what you enter is lost when you close it.',
    '⚠️ No se pudieron actualizar los datos al formato nuevo. La app sigue funcionando con el formato anterior.': '⚠️ The data could not be updated to the new format. The app keeps working with the previous format.',
    'Ejercicio agregado': 'Exercise added', 'Métricas guardadas': 'Measurements saved', 'Error: no se encontró el selector de archivo': 'Error: the file picker was not found',
    'No se pudo leer el archivo': 'The file could not be read', 'No se seleccionó archivo': 'No file was selected', 'Grabación guardada': 'Recording saved',
    'Historial exportado en CSV (se abre con Excel o Google Sheets)': 'History exported to CSV (opens with Excel or Google Sheets)',
    'Abrí el archivo descargado para agregarlo a tu calendario': 'Open the downloaded file to add it to your calendar',
    'Se abrió tu app de mail: revisá y tocá Enviar. ¡Gracias!': 'Your mail app opened: check it and tap Send. Thank you!', 'Foto guardada': 'Photo saved',
    'Se actualizaron datos que cambiaron en otra ventana': 'Data that changed in another window was updated', 'Se recuperaron los datos de tu entrenamiento sin guardar': 'Your unsaved workout data was recovered',
    'Audio guardado para este aviso': 'Audio saved for this alert', 'Link copiado: pegalo en WhatsApp o donde quieras': 'Link copied: paste it in WhatsApp or anywhere',
    'Imagen guardada: compartila en tus redes': 'Image saved: share it on your social networks', 'Sesión borrada': 'Session deleted', 'Plan borrado': 'Plan deleted',
    'Plan guardado. Agregalo al calendario (abajo) para recibir los avisos con la app cerrada.': 'Plan saved. Add it to the calendar (below) to get reminders with the app closed.',
    'Imagen descargada: compartila en tus redes': 'Image downloaded: share it on your social networks', 'Compartir récord': 'Share record',
    // Guardar sesión (aviso de varias líneas)
    '🏆 ¡Nuevo PR!': '🏆 New PR!', '📝 Para tener en cuenta:': '📝 Keep in mind:',
    // Ventanas del sistema (por línea)
    '¿Restaurar este backup?': 'Restore this backup?', 'Reemplaza los datos de este celular por los del archivo.': "It replaces this phone's data with the file's data.",
    '⚠️ ¿Borrar TODOS tus datos de este celular?': '⚠️ Delete ALL your data on this phone?', 'Sesiones, medidas, rutinas, ajustes, grabaciones y fotos. No se puede deshacer.': 'Sessions, measurements, routines, settings, recordings and photos. It cannot be undone.',
    '¿Querés descargar un backup antes de borrar? (Aceptar = descargar primero)': 'Do you want to download a backup before deleting? (OK = download first)',
    'Backup descargado. ¿Borrar todo ahora?': 'Backup downloaded. Delete everything now?', '¿Confirmás?': 'Do you confirm?',
    'Se crea como una rutina tuya: la podés modificar cuando quieras.': 'It is created as your own routine: you can change it whenever you want.',
    'Esto no se puede deshacer: se pierden la plantilla y su lista de ejercicios. Los entrenamientos ya guardados con esta rutina siguen en el historial.':
        'This cannot be undone: the template and its exercise list are lost. Workouts already saved with this routine stay in the history.',
    '¿Archivar de todas formas?': 'Archive anyway?', '¿Terminar el programa?': 'End the program?',
    'Sus rutinas y todo lo que entrenaste quedan; solo se dejan de mostrar los objetivos de cada ejercicio.': "Its routines and everything you trained stay; only each exercise's targets stop being shown.",
    '¿Reiniciar el marcado de tiempo? Se perderá la hora de inicio/fin actual (no afecta ejercicios ya cargados).': 'Reset time tracking? The current start/end time will be lost (exercises already entered are not affected).',
    '¿Borrar esta foto? No se puede deshacer.': 'Delete this photo? It cannot be undone.',
    '✅ BACKUP RESTAURADO': '✅ BACKUP RESTORED', '📊 Datos cargados:': '📊 Data loaded:', '🔄 Recargando página...': '🔄 Reloading page...',
    'Copiá este link para compartir la rutina:': 'Copy this link to share the routine:', 'Copiá este texto:': 'Copy this text:', 'Editar fecha (AAAA-MM-DD):': 'Edit date (YYYY-MM-DD):',
    'Editar nombre (si escribís uno que ya existe en otra rutina, se puede unificar y fusionar sus estadísticas):': 'Edit name (if you type one that already exists in another routine, they can be merged and their stats combined):',
    'Nuevo nombre para la rutina:': 'New name for the routine:'
});
I18N_DICTIONARIES.en.patterns.push(
    ['¡{n:num} récords nuevos!', '{n} new records!'],
    ['antes {x}', 'was {x}'],
    ['¡Gané la medalla de {t} en {x}! ({v})', 'I earned the {t} medal in {x}! ({v})'],
    ['¡Nuevo récord en {x}: {v}!', 'New record in {x}: {v}!'],
    ['Automática ({x})', 'Automatic ({x})'],
    ['"{n}" ahora se mide en: {t}. El historial anterior no cambia.', '"{n}" is now measured as: {t}. The previous history does not change.'],
    ['"{n}" ya está en esta rutina', '"{n}" is already in this routine'],
    ['Contador detenido en la rep {a} de {b}', 'Counter stopped at rep {a} of {b}'],
    ['Ese link no parece de {x}. Copialo desde "Compartir → Copiar link".', 'That link does not look like {x}. Copy it from "Share → Copy link".'],
    ['↔ Cambiá de lado · {n} s', '↔ Switch sides · {n} s'],
    ['{n}: tiempo en {u}', '{n}: time in {u}'],
    ['"{n}" restaurado a la rutina', '"{n}" restored to the routine'],
    ['"{n}" agregada a tus rutinas', '"{n}" added to your routines'],
    ['{a:num} de {b:num} rutinas agregadas', '{a} of {b} routines added'],
    ['Rutina "{n}" restaurada', 'Routine "{n}" restored'],
    ['Rutina "{n}" creada. Agregá tu primer ejercicio con "+ Agregar" abajo.', 'Routine "{n}" created. Add your first exercise with "+ Add" below.'],
    ['Rutina renombrada a "{n}"', 'Routine renamed to "{n}"'],
    ['Sesión Tabata guardada — {n} bloque(s)', 'Tabata session saved — {n} block(s)'],
    ['Unificado: {n} registro(s) del historial ahora usan "{x}".', 'Merged: {n} history record(s) now use "{x}".'],
    ['No se pudo armar el backup. {e}', 'The backup could not be created. {e}'], ['No se pudo borrar. {e}', 'It could not be deleted. {e}'],
    ['No se pudo cambiar la fecha. {e}', 'The date could not be changed. {e}'], ['No se pudo guardar el plan. {e}', 'The plan could not be saved. {e}'],
    ['No se pudo guardar la medida. {e}', 'The measurement could not be saved. {e}'], ['No se pudo guardar la sesión Tabata. {e}', 'The Tabata session could not be saved. {e}'],
    ['No se pudo guardar la sesión. {e}', 'The session could not be saved. {e}'], ['No se pudo guardar la superserie. {e}', 'The superset could not be saved. {e}'],
    ['No se pudo importar: {e}', 'Import failed: {e}'], ['No se pudo unificar. {e}', 'They could not be merged. {e}'], ['No se restauró nada: {e}', 'Nothing was restored: {e}'],
    ['No se pudo empezar el programa: {e}', 'The program could not be started: {e}'], ['No se pudo guardar la rutina: {e}', 'The routine could not be saved: {e}'],
    ['La medición se guardó, pero la foto no: {e}', 'The measurement was saved, but the photo was not: {e}'],
    ['Copiado. Pegalo en un mail a {x}', 'Copied. Paste it into an email to {x}'],
    ['{p}: listo. Empezá por "{d}".', '{p}: ready. Start with "{d}".'],
    ['"{n}" archivado en esta rutina', '"{n}" archived in this routine'],
    ['Seguí con {n}, sin descanso', 'Go on with {n}, no rest'],
    ['Rutina "{n}" eliminada definitivamente', 'Routine "{n}" deleted for good'],
    ['Serie quitada de {n}', 'Set removed from {n}'], ['{n} quitado de la sesión', '{n} removed from the session'],
    ['Borraste {x} del {d}', 'You deleted {x} of {d}'], ['la sesión de {r}', 'the {r} session'], ['la sesión de Tabata', 'the Tabata session'],
    ['"{n}" archivada', '"{n}" archived'], ['Rutina "{n}" archivada', 'Routine "{n}" archived'],
    ['{n} → {g}', '{n} → {g}'],
    ['{n:num} sesiones importadas de {s:name}', '{n} sessions imported from {s}'], ['1 sesión importada de {s}', '1 session imported from {s}'],
    ['Sesión guardada — {n:num} ejercicios', 'Session saved — {n} exercises'], ['Duración: {d}', 'Length: {d}'], ['Volumen: {v}', 'Volume: {v}'],
    ['"{a}" y "{b}" van a quedar unificados como un solo ejercicio.', '"{a}" and "{b}" will be merged into a single exercise.'],
    ['Esto renombra "{a}" a "{b}" en TODAS las rutinas donde aparece y en todo el historial de sesiones ya guardadas, para que las estadísticas se junten.',
        'This renames "{a}" to "{b}" in ALL the routines where it appears and in the whole history of saved sessions, so the stats are combined.'],
    ['Ya existe un ejercicio parecido: "{x}".', 'A similar exercise already exists: "{x}".'], ['Aceptar → usar "{x}"', 'OK → use "{x}"'], ['Cancelar → crear "{x}" como ejercicio nuevo', 'Cancel → create "{x}" as a new exercise'],
    ['¿Agregar la rutina "{x}" a tu Biblioteca?', 'Add the routine "{x}" to your Library?'],
    ['¿Borrar tu grabación de «{x}»? Vuelve a sonar la voz del celular.', 'Delete your recording of "{x}"? The phone voice will be used again.'],
    ['¿Eliminar DEFINITIVAMENTE la rutina "{x}"?', 'Delete the routine "{x}" for GOOD?'], ['¿Empezar "{x}"?', 'Start "{x}"?'],
    ['Se crean sus {n} rutinas con el objetivo de cada ejercicio.{r}', 'Its {n} routines are created with each exercise\'s target.{r}'],
    ['Se crean su rutina con el objetivo de cada ejercicio.{r}', 'Its routine is created with each exercise\'s target.{r}'],
    ['¿Usar también los días del programa en tu plan semanal ({d})?', "Also use the program's days in your weekly plan ({d})?"],
    ['Tiene {d} en esta sesión (sin guardar). Si lo archivás ahora se pierden.', 'It has {d} in this session (unsaved). If you archive it now, they are lost.']
);

// ---- Usar el mismo valor en las series siguientes ----
I18N_DICTIONARIES.en.patterns.push(
    ['Usar {v} en las series {a:num} a {b:num}', 'Use {v} in sets {a} to {b}'],
    ['Usar {v} en la serie {n:num}', 'Use {v} in set {n}'],
    ['Usar {v} en las series {l}', 'Use {v} in sets {l}'],
    ['{v} en {n:num} series más', '{v} in {n} more sets'],
    ['{v} en 1 serie más', '{v} in 1 more set'],
    ['{n:num} s de descanso', '{n} s rest']
);

// ---- Textos que faltaban (octubre de 2026) ----
Object.assign(I18N_DICTIONARIES.en.text, {
 "Al abrir la app, arriba de Inicio ves si hoy toca entrenar (con la rutina sugerida para empezar de un toque), si ya entrenaste o si es día de descanso.": "When you open the app, at the top of Home you see whether it is a training day (with the suggested routine to start in one tap), whether you already trained or whether it is a rest day.",
 "Al tocar un campo de una serie aparece debajo una barra para subir o bajar sin escribir:": "When you tap a field of a set, a bar appears below to go up or down without typing:",
 "Cada ejercicio tiene un rango de reps. Con el mismo peso vas sumando reps; cuando llegás al tope en todas las series, la app te sugiere subir el peso y volver al mínimo. Los valores sugeridos aparecen en gris: tildá ✓ para usarlos.": "Each exercise has a rep range. With the same weight you keep adding reps; when you reach the top in every set, the app suggests raising the weight and going back to the minimum. Suggested values appear in gray: tick ✓ to use them.",
 "Cambia las frases y el tono de la voz: neutro, tierno, militar, motivador o calma. Si grabaste o subiste un audio para un aviso (Mis grabaciones), suena ese.": "It changes the phrases and the tone of the voice: neutral, gentle, drill sergeant, motivating or calm. If you recorded or uploaded an audio for an alert (My recordings), that one plays.",
 "Cuatro sesiones: dos de torso y dos de pierna. Cada músculo se entrena dos veces por semana, dentro del rango ideal de series.": "Four sessions: two upper body and two legs. Each muscle is trained twice a week, within the ideal set range.",
 "El peso máximo que podrías levantar una sola vez, calculado a partir de tus series (fórmula de Epley). Sirve para comparar tu fuerza aunque cambies peso y reps.": "The maximum weight you could lift once, calculated from your sets (Epley formula). It lets you compare your strength even if you change weight and reps.",
 "Grabá tu voz (o la de quien quieras) para cada aviso: hasta 5 segundos, y el silencio del principio y del final se recorta solo. Lo que no grabes lo dice la voz del celular; los números siempre los dice la voz del celular. Las grabaciones quedan en este celular y se incluyen en el backup.": "Record your voice (or anyone's) for each alert: up to 5 seconds, and the silence at the start and end is trimmed automatically. Whatever you do not record is said by the phone voice; numbers are always said by the phone voice. Recordings stay on this phone and are included in the backup.",
 "Marca esa serie como de calentamiento. Se guarda, pero no cuenta para récords, volumen ni el mapa de músculos. Tocá la C de nuevo para que vuelva a ser una serie normal.": "It marks that set as a warm-up. It is saved, but it does not count for records, volume or the muscle map. Tap the C again to turn it back into a normal set.",
 "Se me escondieron las series de los ejercicios.": "The sets of my exercises got hidden.",
 "Una app web no puede sonar de forma confiable con la pantalla bloqueada. Tocá 🔅 Mantener la pantalla encendida (al principio de Entrenar) para que no se apague mientras entrenás.": "A web app cannot ring reliably with the screen locked. Tap 🔅 Keep the screen on (at the top of Train) so it does not turn off while you train."
});
Object.assign(I18N_DICTIONARIES.en.html, {
 "Si cambiás el peso, las reps o el descanso y las series siguientes tienen otro valor, en la misma barra aparece <b>⇊ Usar … en las series …</b>: lo copia a las que todavía no hiciste (las tildadas no se tocan). Si fue sin querer, tocá <b>Deshacer</b>.": "If you change the weight, reps or rest and the following sets have a different value, <b>⇊ Use … in sets …</b> appears in the same bar: it copies it to the ones you have not done yet (ticked ones are not touched). If it was a mistake, tap <b>Undo</b>."
});
I18N_DICTIONARIES.en.patterns.push(["{a:tr}, {b}","{a}, {b}"]);

// ---- Resumen al guardar la sesión ----
Object.assign(I18N_DICTIONARIES.en.text, {
 "¡Sesión guardada!": "Session saved!",
 "Récords de hoy": "Today's records",
 "Para tener en cuenta": "Keep in mind",
 "¡Semana cumplida! Tu flor creció.": "Week done! Your flower grew.",
 "serie": "set",
 "series": "sets",
 "ejercicio": "exercise",
 "ejercicios": "exercises",
 "volumen": "volume",
 "duración": "duration"
});
I18N_DICTIONARIES.en.patterns.push(["{n:num} de {m:num} entrenamientos esta semana: falta 1 para cumplirla.","{n} of {m} workouts this week: 1 more to complete it."], ["{n:num} de {m:num} entrenamientos esta semana: faltan {k:num} para cumplirla.","{n} of {m} workouts this week: {k} more to complete it."]);
Object.assign(I18N_DICTIONARIES.en.html, {"Al guardar aparece un <b>resumen</b>: series, volumen y duración, los récords del día (con 📤 para compartir cada uno) y cuánto te falta para cumplir la semana.":"When you save, a <b>summary</b> appears: sets, volume and duration, the day's records (with 📤 to share each one) and how much is left to complete the week."});
