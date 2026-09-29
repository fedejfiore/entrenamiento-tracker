// Unidades de distancia: se guarda en km y se muestra / tipea en km o millas.
const test = require('node:test');
const assert = require('node:assert/strict');
const { loadApp, CORE_FILES } = require('./helpers/load-app');

const app = loadApp([...CORE_FILES, 'js/domain/sets.js']);
const set = app('setDistanceUnit');

test('en km no se toca lo guardado ni lo tipeado', () => {
    set('km');
    assert.equal(app('kmStringToDisplay')('9,5'), '9,5');
    assert.equal(app('displayStringToKm')('9,5'), '9,5');
    assert.equal(app('formatSpeed')(24.46), '24,5 km/h');
    assert.equal(app('formatSetValue')({ time: '00:30:00', km: '10' }, 'km'), '30 min · 10km · 20 km/h');
});

test('en millas se muestra convertido y se guarda en km', () => {
    set('mi');
    assert.equal(app('kmStringToDisplay')('10'), '6,21');
    assert.equal(app('displayStringToKm')('5'), '8,047');
    assert.equal(app('formatDistance')(16.09344), '10mi');
    assert.equal(app('formatSpeed')(16.09344), '10 mph');
    assert.equal(app('formatSetValue')({ time: '01:00:00', km: '16,09344' }, 'km'), '1 h · 10mi · 10 mph');
    // ida y vuelta sin perder precisión útil
    assert.equal(app('kmStringToDisplay')(app('displayStringToKm')('3,1')), '3,1');
    set('km');
});

test('peso: en kg no cambia nada; en libras se muestra convertido y se guarda en kg', () => {
    const setW = app('setWeightUnit');
    setW('kg');
    assert.equal(app('kgStringToDisplay')('22,5'), '22,5');
    assert.equal(app('formatSetValue')({ reps: '10', kg: '50' }, 'kg'), '10×50kg');
    setW('lb');
    assert.equal(app('kgStringToDisplay')('100'), '220,5');
    assert.equal(app('displayStringToKg')('225'), '102,058');
    assert.equal(app('formatWeight')(20), '44,1lb');
    assert.equal(app('formatWeightTotal')(1000), '2.205 lb');
    assert.equal(app('formatSetValue')({ reps: '8', kg: '102,058' }, 'kg'), '8×225lb');
    assert.equal(app('displayIncrement')(2.5), 5);
    assert.equal(app('displayIncrement')(5), 10);
    // Ida y vuelta: lo que se tipea en libras vuelve igual
    assert.equal(app('kgStringToDisplay')(app('displayStringToKg')('135')), '135');
    setW('kg');
});
