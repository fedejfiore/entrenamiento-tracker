// Marca de la app: un solo lugar para el nombre (se usa en las imágenes para compartir, la
// ayuda y los textos). Cuando se elija el nombre definitivo, se cambia acá.
// La app es un producto de Inquieto, división SFT (software).
const APP_BRAND = {
    name: 'Tracker de entrenamiento',
    company: 'Inquieto',
    division: 'SFT'
};

function appBrandLine() {
    return `${APP_BRAND.name} · ${APP_BRAND.company} ${APP_BRAND.division}`;
}
