// Estilos de voz: cambian las frases de cada aviso y el tono / velocidad de la voz del
// celular. Si hay una grabación o un audio subido para un aviso, suena ese (así se pueden
// armar packs de voces reales: un entrenador, un actor "militar", etc.).
// Script clásico (no módulo): comparte el ámbito global con el resto de la app.

const VOICE_STYLES = {
    neutro: { label: 'Neutro', pitch: 1, rate: 1, texts: {} },
    tierno: {
        label: 'Tierno', pitch: 1.25, rate: 0.95,
        texts: {
            restWarn: 'Quedan diez segunditos', restEnd: '¡Vamos, vos podés! A la próxima',
            repPrep: 'Preparate, tranqui', repGo: '¡Arrancamos!', repHalf: '¡Muy bien, ya vas por la mitad!',
            repFive: '¡Quedan cinco, dale que podés!', repTwo: '¡Dos más, ya casi!', repLast: '¡La última, vos podés!',
            repSwitch: 'Ahora el otro ladito', repDone: '¡Genial! Serie terminada',
            tabataWork: '¡A darle!', tabataRest: 'Descansá un poquito', tabataLastRound: '¡Última ronda!',
            tabataDone: '¡Terminaste! Qué orgullo', record: '¡Nuevo récord! ¡Qué grande!'
        }
    },
    militar: {
        label: 'Militar', pitch: 0.8, rate: 1.1,
        texts: {
            restWarn: '¡Diez segundos!', restEnd: '¡En posición! ¡Siguiente serie!',
            repPrep: '¡Atención!', repGo: '¡Ya!', repHalf: '¡Mitad! ¡No afloje!',
            repFive: '¡Cinco más, sin excusas!', repTwo: '¡Dos! ¡Con todo!', repLast: '¡Última! ¡Aguante!',
            repSwitch: '¡Cambio de lado!', repDone: '¡Serie cumplida!',
            tabataWork: '¡Trabajo! ¡Ya!', tabataRest: '¡Descanso!', tabataLastRound: '¡Última ronda! ¡Todo!',
            tabataDone: '¡Misión cumplida!', record: '¡Récord! ¡Así se hace!'
        }
    },
    motivador: {
        label: 'Motivador', pitch: 1.05, rate: 1.1,
        texts: {
            restWarn: '¡Diez segundos, preparate!', restEnd: '¡Vamos con todo! ¡A la próxima!',
            repPrep: '¡Preparate, esta es tuya!', repGo: '¡Vamos!', repHalf: '¡La mitad! ¡Seguí así!',
            repFive: '¡Cinco más, dale que se viene!', repTwo: '¡Dos más, empujá!', repLast: '¡La última, dejá todo!',
            repSwitch: '¡Cambiá de lado, seguimos!', repDone: '¡Tremenda serie!',
            tabataWork: '¡A full!', tabataRest: '¡Respirá!', tabataLastRound: '¡Última ronda, vaciate!',
            tabataDone: '¡Lo lograste, crack!', record: '¡Nuevo récord! ¡Imparable!'
        }
    },
    calma: {
        label: 'Calma', pitch: 0.95, rate: 0.85,
        texts: {
            restWarn: 'Diez segundos', restEnd: 'Cuando quieras, la próxima serie',
            repPrep: 'Respirá y preparate', repGo: 'Empezamos', repHalf: 'La mitad, buen ritmo',
            repFive: 'Quedan cinco', repTwo: 'Quedan dos', repLast: 'La última',
            repSwitch: 'Cambiá de lado', repDone: 'Serie terminada, bien hecho',
            tabataWork: 'Trabajo', tabataRest: 'Descanso', tabataLastRound: 'Última ronda',
            tabataDone: 'Terminaste, muy bien', record: 'Nuevo récord'
        }
    }
};

function currentVoiceStyle() {
    return VOICE_STYLES[loadVoiceSettings().style] || VOICE_STYLES.neutro;
}

/** Frase del estilo elegido para esos avisos, o la frase por defecto si el estilo no la tiene. */
function styledCueText(ids, fallback) {
    const texts = currentVoiceStyle().texts;
    if (!ids || !ids.length || !ids.every(id => texts[id])) return fallback;
    return ids.map(id => texts[id]).join(' ');
}
