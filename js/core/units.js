// Unidades de distancia: los datos se guardan SIEMPRE en km (así el historial y los récords
// no mezclan unidades) y solo se convierte lo que se ve y lo que se tipea.
// Script clásico (no módulo): comparte el ámbito global con el resto de la app.
// (Las libras van a seguir el mismo camino: ver docs/HOJA-DE-RUTA.md → Idiomas y unidades.)

const KM_PER_MILE = 1.609344;

const DISTANCE_UNITS = {
    km: { label: 'km', head: 'Km', speed: 'km/h', speedHead: 'Km/h', name: 'Kilómetros (km, km/h)' },
    mi: { label: 'mi', head: 'Mi', speed: 'mph', speedHead: 'Mph', name: 'Millas (mi, mph)' }
};

let distanceUnit = 'km';

function setDistanceUnit(unit) {
    distanceUnit = DISTANCE_UNITS[unit] ? unit : 'km';
}

function distanceUnitDef() { return DISTANCE_UNITS[distanceUnit]; }

/** km guardados → número en la unidad elegida. */
function kmToDisplay(km) {
    return km == null ? null : (distanceUnit === 'mi' ? km / KM_PER_MILE : km);
}

/** Número tipeado en la unidad elegida → km. */
function displayToKm(value) {
    return value == null ? null : (distanceUnit === 'mi' ? value * KM_PER_MILE : value);
}

const roundTo = (n, decimals) => Math.round(n * 10 ** decimals) / 10 ** decimals;

/** Texto guardado en km ("9,5") → texto para el campo en la unidad elegida. */
function kmStringToDisplay(str) {
    if (distanceUnit === 'km') return String(str || '');
    const km = parseDecimal(str);
    return km == null ? '' : String(roundTo(kmToDisplay(km), 2)).replace('.', ',');
}

/** Texto tipeado en la unidad elegida → texto en km para guardar (en km queda tal cual). */
function displayStringToKm(str) {
    if (distanceUnit === 'km') return String(str || '');
    const v = parseDecimal(str);
    return v == null ? '' : String(roundTo(displayToKm(v), 3)).replace('.', ',');
}

/** "9,5km" o "5,9mi". */
function formatDistance(km) {
    return km ? `${formatNumber(roundTo(kmToDisplay(km), 2))}${distanceUnitDef().label}` : '';
}

/** km/h → "24,5 km/h" o "15,2 mph". */
function formatSpeed(kmh) {
    return kmh ? `${formatNumber(roundTo(kmToDisplay(kmh), 1))} ${distanceUnitDef().speed}` : '';
}
