// Idiomas. La app está escrita en español; para otro idioma, una capa traduce lo que aparece
// en pantalla con un diccionario (js/i18n/<idioma>.js):
//   text      texto exacto → traducción (también atributos: placeholder, title, aria-label)
//   html      bloques con formato (<b>, <small>…) → traducción con el mismo formato
//   patterns  textos con partes variables: ['Faltan {n} semanas para {x}', '{n} weeks to {x}']
// Un MutationObserver traduce también lo que el código dibuja después (listas, avisos), y las
// ventanas del sistema (confirm, alert, prompt) pasan por la misma traducción. Lo que no está
// en el diccionario queda en español (nunca se rompe nada).
// Lo que es dato (nombres de ejercicios y rutinas) va dentro de translate="no" y no se toca.
// En español no se carga ni se ejecuta nada de esto.
// Script clásico (no módulo): comparte el ámbito global con el resto de la app.

const APP_LANGUAGES = {
    es: { name: 'Español', locale: 'es-AR' },
    en: { name: 'English', locale: 'en-US' },
    pt: { name: 'Português (Brasil)', locale: 'pt-BR' },
    de: { name: 'Deutsch', locale: 'de-DE' },
    zh: { name: '简体中文', locale: 'zh-CN' }
};
const I18N_DICTIONARIES = {};

/** Idioma elegido en Ajustes, o el del celular si está en "automático". */
function resolveLanguage(saved, navigatorLanguage) {
    if (saved && saved !== 'auto' && APP_LANGUAGES[saved]) return saved;
    const nav = String(navigatorLanguage || '').toLowerCase();
    if (nav.startsWith('es')) return 'es';
    if (nav.startsWith('pt')) return 'pt';
    if (nav.startsWith('de')) return 'de';
    if (nav.startsWith('zh')) return 'zh';
    if (nav) return 'en';
    return 'es';
}

let appLanguage = 'es';
try { appLanguage = resolveLanguage(localStorage.getItem('language'), navigator.language); } catch (e) { appLanguage = 'es'; }

/** Configuración regional para fechas y números (es-AR, en-US, pt-BR, de-DE, zh-CN). */
function appLocale() {
    return (APP_LANGUAGES[appLanguage] || APP_LANGUAGES.es).locale;
}

// ---------- Motor (sin DOM: se prueba en Node) ----------

class Translator {
    constructor(dict) {
        this.text = new Map(Object.entries(dict?.text || {}));
        this.html = new Map(Object.entries(dict?.html || {}));
        // {nombre} → grupo de captura; lo demás, literal. Los más largos primero (más específicos).
        // Con tipo, la parte variable tiene que ser de esa clase (si no, el patrón no aplica y
        // no "se pega" a cualquier oración que tenga las mismas palabras de unión):
        //   {n:num}   un número, hora o fecha, con unidad opcional (12, 82,5kg, 18:00, 25/9)
        //   {x:name}  un nombre (sin puntuación de oración)
        //   {d:tr}    algo que también está en el diccionario (un día, un nivel, un músculo)
        this.patterns = (dict?.patterns || [])
            .map(([from, to]) => {
                const names = [];
                const types = [];
                const re = from.split(/(\{\w+(?::\w+)?\})/).map(part => {
                    const m = part.match(/^\{(\w+)(?::(\w+))?\}$/);
                    if (!m) return part.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
                    names.push(m[1]);
                    types.push(m[2] || null);
                    if (m[2] === 'num') return '(\\d[\\d.,/:]*(?:\\s?(?:kg|lb|km|mi|min|s|h|%|reps?|km/h|mph))?)';
                    if (m[2] === 'name') return '([^.:;!?¿¡]{1,80}?)';
                    return '(.+?)';
                }).join('');
                return { re: new RegExp(`^${re}$`, 's'), names, types, to, len: from.length };
            })
            .sort((a, b) => b.len - a.len);
    }

    static normalize(s) { return String(s).replace(/\s+/g, ' ').trim(); }

    /** Traduce un texto (normalizado) o devuelve null si no lo conoce. */
    lookup(text, depth = 0) {
        const key = Translator.normalize(text);
        if (!key || depth > 12) return null;
        if (this.text.has(key)) return this.text.get(key);
        for (const p of this.patterns) {
            const m = key.match(p.re);
            if (!m) continue;
            const values = {};
            let ok = true;
            p.names.forEach((n, i) => {
                const translated = this.lookup(m[i + 1], depth + 1);
                if (p.types[i] === 'tr' && translated == null) ok = false;
                values[n] = translated ?? m[i + 1];
            });
            if (!ok) continue;
            return p.to.replace(/\{(\w+)\}/g, (all, n) => (n in values ? values[n] : all));
        }
        // Emojis y símbolos adelante ("📤 Compartir", "▶ Entrenar") o puntuación al final
        // ("Ver:", "Cargando…"): se traduce lo del medio y se los vuelve a poner.
        const pre = key.match(/^([^\p{L}\p{N}¿¡«"(]+)(\S.*)$/u);
        if (pre) { const core = this.lookup(pre[2], depth + 1); if (core != null) return pre[1] + core; }
        const post = key.match(/^(.*?\S)([\s:.…·]+)$/u);
        if (post) { const core = this.lookup(post[1], depth + 1); if (core != null) return core + post[2]; }
        return null;
    }

    /** Traducción o el mismo texto (para canvas, voz, ventanas del sistema). */
    tr(text) {
        if (text == null) return text;
        // Varias líneas (avisos, ventanas del sistema): cada línea por separado, sin perder los saltos.
        if (String(text).includes('\n')) return String(text).split('\n').map(line => this.tr(line)).join('\n');
        const out = this.lookup(text);
        if (out == null) return text;
        const m = String(text).match(/^(\s*)[\s\S]*?(\s*)$/);
        return m[1] + out + m[2];
    }

    lookupHtml(html) {
        return this.html.get(Translator.normalize(html)) ?? null;
    }
}

let appTranslator = null;

/** Traduce un texto al idioma de la app (en español lo devuelve igual). */
function tr(text) {
    return appTranslator ? appTranslator.tr(text) : text;
}

// ---------- Pantalla ----------

const I18N_ATTRS = ['placeholder', 'title', 'aria-label', 'alt'];
const I18N_INLINE = new Set(['B', 'STRONG', 'I', 'EM', 'SMALL', 'CODE', 'BR', 'A', 'KBD', 'SPAN']);
const i18nDone = new WeakMap(); // nodo → último texto que puso la traducción (para no repetir)
let i18nMissing = null;         // con ?i18n-debug en la URL: lo que faltó traducir

function i18nSkip(el) {
    return !el || el.closest('[translate="no"], script, style, textarea, svg') !== null;
}

function i18nTranslateText(node) {
    const value = node.nodeValue;
    if (!value || !/[A-Za-zÁÉÍÓÚáéíóúñÑ]/.test(value) || i18nDone.get(node) === value) return;
    if (i18nSkip(node.parentElement)) return;
    const out = appTranslator.tr(value);
    if (out !== value) { node.nodeValue = out; i18nDone.set(node, out); }
    else if (i18nMissing) i18nMissing.add(Translator.normalize(value));
}

function i18nTranslateAttrs(el) {
    I18N_ATTRS.forEach(a => {
        const v = el.getAttribute(a);
        if (!v || !/[A-Za-z]/.test(v)) return;
        const out = appTranslator.tr(v);
        if (out !== v) el.setAttribute(a, out);
    });
}

// Un bloque con formato (texto + <b>, <small>…) se traduce entero, así el orden de las
// palabras puede cambiar entre idiomas.
function i18nTranslateBlock(el) {
    const kids = el.childNodes;
    let hasElement = false;
    for (const k of kids) {
        if (k.nodeType === 1) {
            if (!I18N_INLINE.has(k.tagName) || k.querySelector('*:not(br)')) return false;
            hasElement = true;
        } else if (k.nodeType !== 3) return false;
    }
    if (!hasElement) return false;
    if (i18nDone.get(el) === el.innerHTML) return true;
    const out = appTranslator.lookupHtml(el.innerHTML);
    if (out == null) return false;
    el.innerHTML = out;
    i18nDone.set(el, el.innerHTML);
    // Lo de adentro ya está traducido: que no se vuelva a buscar (ni cuente como faltante).
    const texts = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
    for (let t = texts.nextNode(); t; t = texts.nextNode()) i18nDone.set(t, t.nodeValue);
    return true;
}

function i18nTranslateTree(root) {
    if (!appTranslator || !root) return;
    if (root.nodeType === 3) { i18nTranslateText(root); return; }
    if (root.nodeType !== 1 && root.nodeType !== 9 && root.nodeType !== 11) return;
    const start = root.nodeType === 9 ? root.body : root;
    if (!start || (start.nodeType === 1 && i18nSkip(start))) return;
    const walker = document.createTreeWalker(start, NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT, {
        acceptNode(n) {
            if (n.nodeType === 1 && (n.getAttribute('translate') === 'no' || ['SCRIPT', 'STYLE', 'TEXTAREA', 'svg'].includes(n.tagName))) return NodeFilter.FILTER_REJECT;
            return NodeFilter.FILTER_ACCEPT;
        }
    });
    const blocksDone = new Set();
    for (let n = walker.currentNode; n; n = walker.nextNode()) {
        if (n.nodeType === 1) {
            i18nTranslateAttrs(n);
            if (i18nTranslateBlock(n)) blocksDone.add(n);
        } else if (!(n.parentElement && blocksDone.has(n.parentElement))) {
            i18nTranslateText(n);
        }
    }
}

let i18nObserver = null;

function i18nObserve() {
    i18nObserver = new MutationObserver(records => {
        i18nObserver.disconnect();
        records.forEach(r => {
            if (r.type === 'characterData') i18nTranslateText(r.target);
            else if (r.type === 'attributes') { if (r.target.nodeType === 1 && !i18nSkip(r.target)) i18nTranslateAttrs(r.target); }
            else r.addedNodes.forEach(n => {
                if (n.nodeType === 3) i18nTranslateText(n);
                else if (n.nodeType === 1 && !i18nSkip(n)) { i18nTranslateTree(n); if (n.parentElement && !i18nSkip(n.parentElement)) i18nTranslateBlock(n.parentElement); }
            });
        });
        i18nObserver.takeRecords();
        i18nObserver.observe(document.body, { childList: true, subtree: true, characterData: true, attributes: true, attributeFilter: I18N_ATTRS });
    });
    i18nObserver.observe(document.body, { childList: true, subtree: true, characterData: true, attributes: true, attributeFilter: I18N_ATTRS });
}

// Ventanas del sistema: el mensaje también se traduce.
function i18nWrapDialogs() {
    ['alert', 'confirm', 'prompt'].forEach(fn => {
        const native = window[fn];
        if (typeof native !== 'function') return;
        window[fn] = (msg, ...rest) => native.call(window, tr(msg), ...rest);
    });
}

/**
 * Arranque: en español no hace nada. En otro idioma carga su diccionario (js/i18n/xx.js),
 * traduce la página, queda atento a los cambios y vuelve a mostrar la página (boot.js la
 * ocultó para que no se vea el español un instante).
 */
function initI18n() {
    document.documentElement.lang = appLanguage;
    const reveal = () => document.documentElement.classList.remove('i18n-pending');
    if (appLanguage === 'es') { reveal(); return; }
    const start = () => {
        appTranslator = new Translator(I18N_DICTIONARIES[appLanguage]);
        try { if (new URLSearchParams(location.search).has('i18n-debug')) { i18nMissing = new Set(); window.__i18nMissing = i18nMissing; } } catch (e) {}
        i18nWrapDialogs();
        i18nTranslateTree(document.body);
        i18nObserve();
        reveal();
    };
    if (I18N_DICTIONARIES[appLanguage]) { start(); return; }
    const s = document.createElement('script');
    s.src = `js/i18n/${appLanguage}.js`;
    s.onload = start;
    s.onerror = reveal;
    document.head.appendChild(s);
    setTimeout(reveal, 3000); // nunca dejar la pantalla oculta
}

/** Cambiar el idioma: se guarda y se recarga (así todo se dibuja de nuevo en ese idioma). */
function setAppLanguage(lang) {
    try { localStorage.setItem('language', lang); } catch (e) {}
    location.reload();
}
