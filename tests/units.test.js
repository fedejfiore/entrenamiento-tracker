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
