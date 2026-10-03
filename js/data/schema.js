// Esquema de todo lo que la app guarda. Cada clave declara:
//   type     'array' | 'object' | 'string' | 'number' | 'any'
//   format   'json' (por defecto) | 'text' (se guarda tal cual, sin comillas de JSON)
//   default  valor cuando no hay nada guardado
//   group    'data'    datos del usuario                → van al backup
//            'prefs'   preferencias y ajustes           → van al backup
//            'session' estado temporal de la sesión     → NO van al backup
//            'meta'    control interno (versión)        → NO van al backup
//            'legacy'  claves de versiones viejas: solo se leen para migrar
//   validate (opcional) valida el valor completo antes de guardarlo
//
// Es también el mapa para una base de datos real: ver docs/MODELO-DE-DATOS.md.

const SCHEMA_VERSION = 3;

const STORAGE_SCHEMA = {
    // ---- Datos del usuario ----
    workouts: {
        group: 'data', type: 'array', default: [],
        description: 'Sesiones guardadas (fuerza y Tabata).',
        validate: list => WorkoutSession.validateList(list)
    },
    bodyMetrics: {
        group: 'data', type: 'array', default: [],
        description: 'Medidas corporales (peso, grasa, músculo, agua, cintura).',
        validate: list => BodyMeasurement.validateList(list)
    },
    customRoutines: { group: 'data', type: 'object', default: {}, description: 'Rutinas del usuario: clave → lista ordenada de ejercicios.' },
    customRoutineLabels: { group: 'data', type: 'object', default: {}, description: 'Nombre visible de cada rutina.' },
    archivedRoutines: { group: 'data', type: 'array', default: [], description: 'Rutinas archivadas (no se borran).' },
    archivedExercises: { group: 'data', type: 'object', default: {}, description: 'Ejercicios archivados por rutina.' },
    exerciseTypes: { group: 'data', type: 'object', default: {}, description: 'Tipo de medición por ejercicio (kg, bw, time, min, km).' },
    exerciseTimeUnits: { group: 'data', type: 'object', default: {}, description: 'Unidad de carga del tiempo por ejercicio (seg, mss, min, hmm).' },
    exerciseUnilateral: { group: 'data', type: 'object', default: {}, description: 'Ejercicios que se hacen de a un lado (true/false elegido a mano).' },
    exerciseTempos: { group: 'data', type: 'object', default: {}, description: 'Cadencia del contador de reps por ejercicio (s/rep).' },
    exerciseGroupOverrides: { group: 'data', type: 'object', default: {}, description: 'Grupo muscular elegido a mano por ejercicio.' },
    routineSupersets: { group: 'data', type: 'object', default: {}, description: 'Superseries por rutina: { rutina: { ejercicioNormalizado: "A" } }.' },
    routineTargets: { group: 'data', type: 'object', default: {}, description: 'Objetivos por rutina y ejercicio (series, rango de reps, descanso, incremento): { rutina: { ejercicioNormalizado: {...} } }.' },
    activeProgram: { group: 'data', type: 'object', default: {}, description: 'Programa prearmado en curso: { id, startedAt, routines: [claves] }.' },
    trainingDaysPlanHistory: { group: 'data', type: 'array', default: [], description: 'Plan semanal: días, horarios y aviso previo, con la fecha (lunes) desde la que rige.' },

    // ---- Preferencias ----
    accentColor: { group: 'prefs', format: 'text', type: 'string', default: null, description: 'Color de acento: naranja, turquesa, azul, fucsia, verde o violeta.' },
    uiSize: { group: 'prefs', format: 'text', type: 'string', default: null, description: 'Tamaño de botones y campos: normal, large o xlarge.' },
    contrast: { group: 'prefs', format: 'text', type: 'string', default: null, description: '"high" = alto contraste (texto oscuro sobre botones de color).' },
    colorVision: { group: 'prefs', format: 'text', type: 'string', default: null, description: '"cvd" = colores para daltonismo (azul / naranja en vez de verde / rojo).' },
    onboardingDone: { group: 'prefs', format: 'text', type: 'string', default: null, description: '"1" cuando ya se mostró (o se salteó) el primer uso guiado.' },
    gardenSeen: { group: 'prefs', type: 'object', default: {}, description: 'Última etapa de la flor que se vio (para festejar una sola vez cuando crece). La flor en sí se calcula del historial.' },
    feedbackContact: { group: 'prefs', type: 'object', default: {}, description: 'Nombre y mail o WhatsApp que la persona dejó al enviar un error o sugerencia (para no volver a escribirlos).' },
    language: { group: 'prefs', format: 'text', type: 'string', default: null, description: 'Idioma: "auto" (como el celular), "es", "en", "pt", "de" o "zh".' },
    theme: { group: 'prefs', format: 'text', type: 'string', default: null, description: 'Tema: "auto" (como el celular), "light" o "dark".' },
    soundType: { group: 'prefs', format: 'text', type: 'string', default: null, description: 'Sonido de fin de descanso.' },
    soundVolume: { group: 'prefs', format: 'text', type: 'string', default: null, description: 'Volumen 0-100.' },
    voiceSettings: { group: 'prefs', type: 'object', default: {}, description: 'Avisos por voz y contador de reps.' },
    musicLinks: { group: 'prefs', type: 'object', default: {}, description: 'Playlists de Spotify / YouTube Music.' },
    bodyChartScale: { group: 'prefs', type: 'object', default: {}, description: 'Escala manual del gráfico de medidas.' },
    plateCalculator: { group: 'prefs', type: 'object', default: {}, description: 'Calculadora de discos: barra y discos disponibles.' },
    userProfile: { group: 'data', type: 'object', default: {}, description: 'Perfil: nombre, fecha de nacimiento, email y teléfono (las fotos van en IndexedDB).' },
    appSettings: { group: 'prefs', type: 'object', default: {}, description: 'Ajustes generales: día en que empieza la semana, segundos para cambiar de lado.' },
    wakeLockEnabled: { group: 'prefs', format: 'text', type: 'string', default: null, description: 'Pantalla siempre encendida ("1"/"0").' },

    // ---- Estado temporal de la sesión en curso ----
    workoutDraft: { group: 'session', type: 'any', default: null, description: 'Series cargadas y todavía no guardadas.' },
    activeSessionStart: { group: 'session', format: 'text', type: 'string', default: null, description: 'Inicio de la sesión en curso (ms).' },
    activeSessionEnd: { group: 'session', format: 'text', type: 'string', default: null, description: 'Fin de la sesión en curso (ms).' },
    activeTabataBlocks: { group: 'session', type: 'array', default: [], description: 'Bloques de Tabata de la sesión en curso.' },
    activeScreen: { group: 'session', format: 'text', type: 'string', default: null, description: 'Última pantalla abierta.' },
    openSections: { group: 'session', format: 'text', type: 'string', default: null, description: 'Secciones plegables abiertas (para volver igual al recargar).' },
    trainMode: { group: 'session', format: 'text', type: 'string', default: null, description: 'Modo de Entrenar: rutina o tabata.' },
    activeScrollY: { group: 'session', format: 'text', type: 'string', default: null, description: 'Altura de desplazamiento de la última pantalla (para volver al recargar).' },
    planReminderShown: { group: 'session', format: 'text', type: 'string', default: null, description: 'Último día (AAAA-MM-DD) en que se avisó "hoy toca entrenar".' },

    // ---- Control interno ----
    schemaVersion: { group: 'meta', format: 'text', type: 'string', default: null, description: 'Versión del esquema de datos (ver migraciones).' },
    version: { group: 'meta', format: 'text', type: 'string', default: null, description: 'Versión del formato de backup de la app vieja.' },
    preMigrationBackup: { group: 'meta', format: 'text', type: 'string', default: null, description: 'Copia automática previa a la última migración.' },

    // ---- Claves de versiones anteriores (solo lectura para migrar) ----
    deletedBaseRoutines: { group: 'legacy', type: 'array', default: null, description: 'Nombre viejo de archivedRoutines.' },
    trainingDaysPlan: { group: 'legacy', type: 'any', default: null, description: 'Plan de días viejo (sin historial).' },
    workoutSessions: { group: 'legacy', type: 'array', default: [], description: 'Formato de sesiones de una versión muy vieja.' }
};

const BACKUP_GROUPS = ['data', 'prefs'];
