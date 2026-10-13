// La mascota (Pro): crece con las semanas cumplidas del plan (como la flor), se pone musculosa
// con lo que entrenás (los mismos niveles que el mapa muscular, promediados en 4 semanas, así
// refleja constancia y no un día suelto) y tiene ánimo: contenta si cumplís la semana, con
// sueño si faltás. Nunca triste ni enferma (ver docs/GAMIFICACION.md).
// Todo se calcula a partir del historial: no se guarda nada (salvo la mascota elegida).
import { muscleLevel } from './training-tools.js';

export const MASCOT_STAGES = [
    { id: 'baby', label: 'Cachorro', weeks: 0, scale: 0.7 },
    { id: 'young', label: 'Joven', weeks: 4, scale: 0.85 },
    { id: 'adult', label: 'Adulto', weeks: 12, scale: 1 }
];

// Músculos que se ven en la mascota (los del mapa).
export const MASCOT_MUSCLES = ['Pecho', 'Espalda', 'Hombros', 'Bíceps', 'Tríceps', 'Core', 'Cuádriceps', 'Isquios', 'Glúteos', 'Gemelos'];

/**
 * Cada animal: su modelo, las animaciones de cada ánimo y qué huesos engrosa cada músculo.
 * Los nombres de huesos dependen del modelo (los de Meshy se cargan cuando estén).
 * clips: idle (quieto), happy (festejo), sleepy (con sueño; si no hay, idle más lento).
 */
export const MASCOT_SPECIES = {
    fox: {
        label: 'Zorro', icon: '🦊', model: 'assets/models/fox.glb', height: 1,
        credit: 'Zorro: modelo de PixelMannen (CC0), rigging y animación de tomkranis (CC BY 4.0), conversión a glTF de AsoboStudio y scurest (CC BY 4.0).',
        clips: { idle: 'Survey', happy: 'Run', walk: 'Walk', sleepy: 'Survey' },
        bones: {
            Pecho: ['b_Spine02_03'],
            Espalda: ['b_Spine01_02'],
            Core: ['b_Hip_01'],
            Hombros: ['b_RightUpperArm_06', 'b_LeftUpperArm_09'],
            Bíceps: ['b_RightUpperArm_06', 'b_LeftUpperArm_09'],
            Tríceps: ['b_RightForeArm_07', 'b_LeftForeArm_010'],
            Cuádriceps: ['b_RightLeg01_019', 'b_LeftLeg01_015'],
            Isquios: ['b_RightLeg01_019', 'b_LeftLeg01_015'],
            Glúteos: ['b_Hip_01'],
            Gemelos: ['b_RightLeg02_020', 'b_LeftLeg02_016']
        }
    }
};

/** Etapa según las semanas cumplidas (la misma cuenta que la flor). */
export function mascotStage(grownWeeks) {
    let stage = MASCOT_STAGES[0];
    MASCOT_STAGES.forEach(s => { if (grownWeeks >= s.weeks) stage = s; });
    const next = MASCOT_STAGES[MASCOT_STAGES.indexOf(stage) + 1] || null;
    return { ...stage, next, weeksToNext: next ? next.weeks - grownWeeks : 0 };
}

/**
 * Ánimo: contenta si la semana en curso ya está cumplida (o la anterior lo estuvo y la actual
 * recién empieza), con sueño si la última semana terminada no se cumplió (sin semana libre).
 */
export function mascotMood(garden) {
    if (!garden || !garden.hasPlan) return 'normal';
    if (garden.current && garden.current.done) return 'happy';
    const last = (garden.weeks || []).filter(w => w.status !== 'en-curso').slice(-1)[0];
    if (last && last.status === 'no') return 'sleepy';
    if (last && (last.status === 'cumplida' || last.status === 'libre')) return 'happy';
    return 'normal';
}

/** Nivel (0 a 4) de cada músculo con el promedio semanal de las últimas 4 semanas. */
export function mascotMuscleLevels(byGroup, weeks = 4) {
    const out = {};
    MASCOT_MUSCLES.forEach(m => { out[m] = muscleLevel((byGroup[m]?.sets || 0) / weeks); });
    return out;
}

/**
 * Cuánto engrosa cada hueso: el promedio de los niveles de los músculos que lo usan, de 1
 * (sin trabajo) a 1 + 0,08 × 4 = 1,32 (alto). Así un hueso compartido (la cadera: core y
 * glúteos) refleja los dos.
 */
export function mascotBoneScales(species, levels, perLevel = 0.08) {
    const sums = {};
    Object.entries(species.bones || {}).forEach(([muscle, bones]) => bones.forEach(b => {
        (sums[b] ||= []).push(levels[muscle] || 0);
    }));
    const out = {};
    Object.entries(sums).forEach(([bone, list]) => {
        out[bone] = 1 + perLevel * (list.reduce((a, b) => a + b, 0) / list.length);
    });
    return out;
}

/** Todo lo que la pantalla necesita para dibujar la mascota. */
export function mascotSnapshot({ speciesId = 'fox', garden, byGroup }) {
    const species = MASCOT_SPECIES[speciesId] || MASCOT_SPECIES.fox;
    const grown = garden?.grown || 0;
    const levels = mascotMuscleLevels(byGroup || {});
    return {
        species,
        stage: mascotStage(grown),
        mood: mascotMood(garden),
        levels,
        boneScales: mascotBoneScales(species, levels)
    };
}
