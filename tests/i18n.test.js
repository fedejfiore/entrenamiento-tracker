// Idiomas: elección del idioma y motor de traducción (textos, bloques y partes variables).
const test = require('node:test');
const assert = require('node:assert/strict');
const { loadApp, CORE_FILES } = require('./helpers/load-app');

const app = loadApp([...CORE_FILES, 'js/core/i18n.js']);
const Translator = app('Translator');

test('idioma: el elegido, o el del celular (español, portugués; el resto, inglés)', () => {
    const resolve = app('resolveLanguage');
    assert.equal(resolve('en', 'es-AR'), 'en');
    assert.equal(resolve('auto', 'es-AR'), 'es');
    assert.equal(resolve('auto', 'pt-BR'), 'pt');
    assert.equal(resolve(null, 'de-DE'), 'en');
    assert.equal(resolve('xx', 'es-MX'), 'es');
    assert.equal(resolve(null, ''), 'es');
});

const t = new Translator({
    text: { 'Guardar sesión': 'Save session', 'Brote': 'Sprout', 'Pecho': 'Chest' },
    html: { 'Tocá <b>📤</b> para compartir': 'Tap <b>📤</b> to share' },
    patterns: [
        ['Faltan {n} semanas para {x}', '{n} weeks until {x}'],
        ['Falta 1 semana para {x}', '1 week until {x}'],
        ['{ex}: {v} (antes {b})', '{ex}: {v} (was {b})']
    ]
});

test('texto exacto, con espacios de más y respetando los de los bordes', () => {
    assert.equal(t.tr('Guardar sesión'), 'Save session');
    assert.equal(t.tr('  Guardar   sesión '), '  Save session ');
    assert.equal(t.tr('Algo que no está'), 'Algo que no está');
    assert.equal(t.lookup('Algo que no está'), null);
});

test('partes variables: se capturan y, si se puede, también se traducen', () => {
    assert.equal(t.tr('Faltan 3 semanas para brote'), '3 weeks until brote');
    assert.equal(t.tr('Faltan 3 semanas para Brote'), '3 weeks until Sprout');
    assert.equal(t.tr('Falta 1 semana para Brote'), '1 week until Sprout', 'el más específico gana');
    assert.equal(t.tr('Press de pecho: 82,5kg (antes 80kg)'), 'Press de pecho: 82,5kg (was 80kg)');
});

test('bloques con formato', () => {
    assert.equal(t.lookupHtml('Tocá  <b>📤</b> para compartir'), 'Tap <b>📤</b> to share');
    assert.equal(t.lookupHtml('<b>otro</b>'), null);
});

test('los caracteres especiales del texto no rompen los patrones', () => {
    const t2 = new Translator({ patterns: [['¿Borrar {x}? (sí/no) [1+2]', 'Delete {x}? (yes/no) [1+2]']] });
    assert.equal(t2.tr('¿Borrar la foto? (sí/no) [1+2]'), 'Delete la foto? (yes/no) [1+2]');
});

test('emojis y símbolos adelante, puntuación al final: se traduce el centro', () => {
    const t3 = new Translator({ text: { 'Compartir': 'Share', 'Comparar contra': 'Compare with', 'Espalda': 'Back' }, patterns: [['{g}: {n} series', '{g}: {n} sets']] });
    assert.equal(t3.tr('📤 Compartir'), '📤 Share');
    assert.equal(t3.tr('▶ 🔙 Espalda'), '▶ 🔙 Back');
    assert.equal(t3.tr('Comparar contra:'), 'Compare with:');
    assert.equal(t3.tr('Espalda: 4 series'), 'Back: 4 sets');
    assert.equal(t3.tr('▶ Press de pecho'), '▶ Press de pecho', 'lo que no está queda igual');
    assert.equal(t3.tr('2 semanas'), '2 semanas', 'un número adelante no se separa');
});
