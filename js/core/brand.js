// Marca de la app: un solo lugar para el nombre (se usa en las imágenes para compartir, la
// ayuda y los textos). La app es un producto de Inquieto, división SFT (software).
//
// Esō Agōn (en griego, ἔσω ἀγών): "la lucha interior". El agón era la competencia de los
// Juegos Olímpicos antiguos; ἔσω, "hacia adentro". La lucha con uno mismo por superarse.
const APP_BRAND = {
    name: 'Esō Agōn',
    by: 'by Inquieto',
    company: 'Inquieto',
    division: 'SFT',
    meaning: 'la lucha interior'
};

function appBrandLine() {
    return `${APP_BRAND.name} ${APP_BRAND.by}`;
}
