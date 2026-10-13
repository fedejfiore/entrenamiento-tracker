// Mascota: etapa por semanas cumplidas, ánimo sin castigo y músculos según el entrenamiento.
const test = require('node:test');
const assert = require('node:assert/strict');
const { loadApp, CORE_FILES } = require('./helpers/load-app');

const app = loadApp([...CORE_FILES, 'js/domain/training-tools.js', 'js/domain/mascot.js']);
const stage = app('mascotStage');
const mood = app('mascotMood');
const levels = app('mascotMuscleLevels');
const scales = app('mascotBoneScales');
const snapshot = app('mascotSnapshot');
const SPECIES = app('MASCOT_SPECIES');

test('crece por etapas con las semanas cumplidas', () => {
    assert.equal(stage(0).id, 'baby');
    assert.equal(stage(3).weeksToNext, 1);
    assert.equal(stage(4).id, 'young');
    assert.equal(stage(30).id, 'adult');
    assert.equal(stage(30).next, null);
});

test('ánimo: contenta al cumplir, con sueño si faltó, nunca triste', () => {
    assert.equal(mood({ hasPlan: false }), 'normal');
    assert.equal(mood({ hasPlan: true, current: { done: true }, weeks: [] }), 'happy');
    assert.equal(mood({ hasPlan: true, current: { done: false }, weeks: [{ status: 'no' }, { status: 'en-curso' }] }), 'sleepy');
    assert.equal(mood({ hasPlan: true, current: { done: false }, weeks: [{ status: 'libre' }, { status: 'en-curso' }] }), 'happy');
    const all = ['happy', 'normal', 'sleepy'];
    assert.ok(all.includes(mood({ hasPlan: true, current: {}, weeks: [{ status: 'sin-plan' }] })));
});

test('músculos: promedio de 4 semanas en los niveles del mapa', () => {
    const l = levels({ Pecho: { sets: 48 }, Cuádriceps: { sets: 8 } });
    assert.equal(l.Pecho, 3, '12 series por semana = ideal');
    assert.equal(l.Cuádriceps, 1, '2 por semana = bajo');
    assert.equal(l.Gemelos, 0);
});

test('los huesos engrosan con el nivel y un hueso compartido promedia sus músculos', () => {
    const fox = SPECIES.fox;
    const s = scales(fox, { Core: 4, Glúteos: 0, Pecho: 2 });
    assert.equal(s.b_Hip_01, 1 + 0.08 * 2, 'cadera: core 4 y glúteos 0');
    assert.equal(s.b_Spine02_03, 1 + 0.08 * 2);
    assert.equal(s.b_LeftLeg02_016, 1, 'sin trabajo: tamaño normal');
});

test('el resumen junta etapa, ánimo y músculos', () => {
    const snap = snapshot({ speciesId: 'fox', garden: { hasPlan: true, grown: 5, current: { done: true }, weeks: [] }, byGroup: { Espalda: { sets: 60 } } });
    assert.equal(snap.stage.id, 'young');
    assert.equal(snap.mood, 'happy');
    assert.equal(snap.levels.Espalda, 3);
    assert.ok(snap.boneScales.b_Spine01_02 > 1);
});
