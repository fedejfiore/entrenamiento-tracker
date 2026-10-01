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

// ---------- Peso: kg o libras ----------
// Igual que la distancia: se guarda SIEMPRE en kg y se convierte al mostrar y al tipear.

const KG_PER_LB = 0.45359237;

const WEIGHT_UNITS = {
    kg: { label: 'kg', head: 'Kg', name: 'Kilos (kg)', steps: [-5, -2.5, 2.5, 5], round: 2.5 },
    lb: { label: 'lb', head: 'Lb', name: 'Libras (lb)', steps: [-10, -5, 5, 10], round: 5 }
};

let weightUnit = 'kg';

function setWeightUnit(unit) {
    weightUnit = WEIGHT_UNITS[unit] ? unit : 'kg';
}

function weightUnitDef() { return WEIGHT_UNITS[weightUnit]; }

/** kg guardados → número en la unidad elegida. */
function kgToDisplay(kg) {
    return kg == null ? null : (weightUnit === 'lb' ? kg / KG_PER_LB : kg);
}

/** Número tipeado en la unidad elegida → kg. */
function displayToKg(value) {
    return value == null ? null : (weightUnit === 'lb' ? value * KG_PER_LB : value);
}

/** Texto guardado en kg ("22,5") → texto para el campo en la unidad elegida. */
function kgStringToDisplay(str) {
    const kg = parseDecimal(str);
    if (weightUnit === 'kg') {
        // Lo cargado en kg se ve tal cual; lo que vino de libras (muchos decimales) se redondea.
        if (kg == null || roundTo(kg, 2) === kg) return String(str ?? '');
        return String(roundTo(kg, 2)).replace('.', ',');
    }
    return kg == null ? '' : String(roundTo(kgToDisplay(kg), 1)).replace('.', ',');
}

/** Texto tipeado en la unidad elegida → texto en kg para guardar (en kg queda tal cual). */
function displayStringToKg(str) {
    if (weightUnit === 'kg') return String(str ?? '');
    const v = parseDecimal(str);
    return v == null ? '' : String(roundTo(displayToKg(v), 3)).replace('.', ',');
}

/** 50 → "50kg" o "110,2lb" (sep = ' ' para "50 kg"). */
function formatWeight(kg, sep = '') {
    if (kg == null || !Number.isFinite(Number(kg))) return '';
    return `${formatNumber(roundTo(kgToDisplay(Number(kg)), 1))}${sep}${weightUnitDef().label}`;
}

/** Volumen o totales grandes: "12.500 kg" / "27.558 lb" (sin decimales). */
function formatWeightTotal(kg) {
    return `${Math.round(kgToDisplay(Number(kg) || 0)).toLocaleString((typeof appLocale === 'function' ? appLocale() : 'es-AR'))} ${weightUnitDef().label}`;
}

/** Incremento en la unidad elegida, redondeado a algo que se pueda cargar (2,5 kg → 5 lb). */
function displayIncrement(kgInc) {
    if (weightUnit === 'kg') return kgInc;
    return Math.max(2.5, Math.round(kgToDisplay(kgInc) / 2.5) * 2.5);
}
