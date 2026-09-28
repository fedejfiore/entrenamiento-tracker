// Tiempos: se cargan en la unidad que prefiera cada uno y se guardan siempre igual.
const test = require('node:test');
const assert = require('node:assert/strict');
const { loadApp } = require('./helpers/load-app');

const app = loadApp();
const parseTimeInput = app('parseTimeInput');
const formatTimeForUnit = app('formatTimeForUnit');
const formatTimeDigits = app('formatTimeDigits');
const formatDurationHuman = app('formatDurationHuman');
const parseTimeSeconds = app('parseTimeSeconds');

test('cada unidad interpreta lo tipeado', () => {
    assert.equal(parseTimeInput('45', 'seg'), 45);
    assert.equal(parseTimeInput('1:45', 'mss'), 105);
    assert.equal(parseTimeInput('60', 'min'), 3600);
    assert.equal(parseTimeInput('32,5', 'min'), 1950);
    assert.equal(parseTimeInput('32.5', 'min'), 1950);
    assert.equal(parseTimeInput('1:05', 'hmm'), 3900);
    assert.equal(parseTimeInput('', 'mss'), null);
});

test('ingreso tipo microondas (sin tener que buscar los dos puntos)', () => {
    assert.equal(formatTimeDigits('4'), '0:04');
    assert.equal(formatTimeDigits('45'), '0:45');
    assert.equal(formatTimeDigits('145'), '1:45');
    assert.equal(formatTimeDigits('9000'), '90:00');
});

test('ida y vuelta entre unidades sin perder el valor', () => {
    for (const unit of ['seg', 'mss', 'min', 'hmm']) {
        const shown = formatTimeForUnit(3900, unit);
        assert.equal(parseTimeInput(shown, unit), 3900, `${unit}: ${shown}`);
    }
});

test('forma guardada: un número suelto (fútbol viejo) son minutos', () => {
    assert.equal(parseTimeSeconds('60'), 3600);
    assert.equal(parseTimeSeconds('1:00:00'), 3600);
    assert.equal(parseTimeSeconds('0:45'), 45);
});

test('para leer: lo más simple, siempre con unidades', () => {
    assert.equal(formatDurationHuman(45), '45 s');
    assert.equal(formatDurationHuman(90), '1 min 30 s');
    assert.equal(formatDurationHuman(3600), '1 h');
    assert.equal(formatDurationHuman(3900), '1 h 05 min');
    assert.equal(formatDurationHuman(3930), '1 h 05 min 30 s');
});
