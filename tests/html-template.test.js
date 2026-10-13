// La plantilla html`…`: escapa todo lo que se interpola salvo lo que ya es HTML seguro.
const test = require('node:test');
const assert = require('node:assert/strict');
const { loadApp, CORE_FILES } = require('./helpers/load-app');

const app = loadApp([...CORE_FILES]);
const html = app('html');

test('escapa los datos interpolados (texto y atributos)', () => {
    const evil = '<img src=x onerror=alert(1)>"\'&';
    const out = String(html`<p title="${evil}">${evil}</p>`);
    assert.ok(!out.includes('<img'), out);
    assert.ok(out.includes('&lt;img src=x onerror=alert(1)&gt;&quot;&#39;&amp;'));
});

test('lo armado con html va tal cual; listas se unen; null, undefined y false no muestran nada', () => {
    const items = ['a<b', 'c'].map(x => html`<li>${x}</li>`);
    assert.equal(String(html`<ul>${items}</ul>`), '<ul><li>a&lt;b</li><li>c</li></ul>');
    assert.equal(String(html`${null}${undefined}${false}${0}`), '0');
});

test('un texto común nunca se toma como HTML seguro', () => {
    assert.equal(String(html`${'<b>x</b>'}`), '&lt;b&gt;x&lt;/b&gt;');
});
