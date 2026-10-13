// Marca de la app: un solo lugar para el nombre (se usa en las imágenes para compartir, la
// ayuda y los textos). La app es un producto de Inquieto, división SFT (software).
//
// Gymnastés (en griego, γυμναστής): en la antigua Grecia, el entrenador de los atletas, el que
// sabía qué ejercicios hacía falta y cuánto. Es lo que la app quiere ser: tu entrenador personal.
export const APP_BRAND = {
    name: 'Gymnastés',
    by: 'by Inquieto',
    company: 'Inquieto',
    division: 'SFT',
    meaning: 'tu entrenador personal',
    // A dónde llegan los errores y sugerencias (Ajustes → Ayuda). Cambiar por el mail
    // corporativo cuando exista.
    feedbackEmail: 'federicojfiore@gmail.com'
};

export function appBrandLine() {
    return `${APP_BRAND.name} ${APP_BRAND.by}`;
}
