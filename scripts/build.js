// Arma una copia optimizada de la app para publicar (web) o para meter en la app nativa.
//  - Los ~76 scripts de la página se unen, en el mismo orden, en js/app.min.js (minificado).
//    Son scripts clásicos que comparten el ámbito global: unirlos no cambia cómo se ven entre
//    sí, y esbuild no renombra los nombres globales (las acciones data-fn-* los llaman por nombre).
//  - Las hojas de estilo de la página se unen en css/app.min.css.
//  - boot.js y los diccionarios de idiomas (se cargan aparte) se minifican en su lugar.
//  - El service worker precachea exactamente lo que quedó.
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');
const esbuild = require('esbuild');

const ROOT = path.resolve(__dirname, '..');
const PAGE = 'entrenamiento_trackerv2.html';
const BASE_FILES = [PAGE, 'manifest.json', 'service-worker.js', 'icon-192.png', 'icon-512.png', 'icon-512-maskable.png', 'apple-touch-icon.png'];
const BASE_DIRS = ['js', 'css', 'fonts', 'vendor', 'legal'];
const TARGET = ['chrome90', 'firefox90', 'safari15'];

const gz = s => zlib.gzipSync(s, { level: 9 }).length;
const kb = n => `${(n / 1024).toFixed(0)} KB`;

function build(outDir, { extraFiles = [], extraDirs = [], indexHtml = null } = {}) {
    const OUT = path.resolve(ROOT, outDir);
    fs.rmSync(OUT, { recursive: true, force: true });
    fs.mkdirSync(OUT, { recursive: true });
    [...BASE_FILES, ...extraFiles].forEach(f => fs.copyFileSync(path.join(ROOT, f), path.join(OUT, f)));
    [...BASE_DIRS, ...extraDirs].forEach(d => fs.cpSync(path.join(ROOT, d), path.join(OUT, d), { recursive: true }));
    if (indexHtml) fs.writeFileSync(path.join(OUT, 'index.html'), indexHtml);

    let html = fs.readFileSync(path.join(ROOT, PAGE), 'utf8');

    // ---- JS: todos los <script src="js/..."> menos boot.js (va en <head>, antes de pintar) ----
    const scriptRe = /^[ \t]*<script src="(js\/[^"]+)"><\/script>\r?\n/gm;
    const scripts = [...html.matchAll(scriptRe)].map(m => m[1]).filter(s => s !== 'js/boot.js');
    const jsSource = scripts.map(s => `// ${s}\n${fs.readFileSync(path.join(ROOT, s), 'utf8')}\n;`).join('\n');
    const jsMin = esbuild.transformSync(jsSource, { minify: true, target: TARGET, legalComments: 'none', charset: 'utf8' }).code;
    fs.writeFileSync(path.join(OUT, 'js/app.min.js'), jsMin);
    let firstScript = true;
    html = html.replace(scriptRe, (line, src) => {
        if (src === 'js/boot.js') return line;
        if (!firstScript) return '';
        firstScript = false;
        return '    <script src="js/app.min.js"></script>\n';
    });

    // ---- CSS: las hojas de la página, en el mismo orden ----
    const linkRe = /^[ \t]*<link rel="stylesheet" href="(css\/[^"]+)">\r?\n/gm;
    const sheets = [...html.matchAll(linkRe)].map(m => m[1]);
    const cssSource = sheets.map(s => fs.readFileSync(path.join(ROOT, s), 'utf8')).join('\n');
    const cssMin = esbuild.transformSync(cssSource, { loader: 'css', minify: true, target: TARGET, charset: 'utf8' }).code;
    fs.writeFileSync(path.join(OUT, 'css/app.min.css'), cssMin);
    let firstSheet = true;
    html = html.replace(linkRe, () => {
        if (!firstSheet) return '';
        firstSheet = false;
        return '    <link rel="stylesheet" href="css/app.min.css">\n';
    });
    fs.writeFileSync(path.join(OUT, PAGE), html);

    // ---- Lo que ya quedó adentro del paquete no se publica suelto ----
    // (css/fonts.css queda: lo usan la página de presentación y los textos legales).
    scripts.forEach(s => fs.rmSync(path.join(OUT, s)));
    sheets.filter(s => s !== 'css/fonts.css').forEach(s => fs.rmSync(path.join(OUT, s)));
    const removeEmpty = dir => {
        fs.readdirSync(dir, { withFileTypes: true }).filter(e => e.isDirectory()).forEach(e => removeEmpty(path.join(dir, e.name)));
        if (fs.readdirSync(dir).length === 0) fs.rmdirSync(dir);
    };
    removeEmpty(path.join(OUT, 'js'));

    // ---- boot.js y diccionarios: minificados en su lugar ----
    const loose = ['js/boot.js', ...fs.readdirSync(path.join(OUT, 'js/i18n')).map(f => `js/i18n/${f}`)];
    loose.forEach(f => {
        const p = path.join(OUT, f);
        fs.writeFileSync(p, esbuild.transformSync(fs.readFileSync(p, 'utf8'), { minify: true, target: TARGET, legalComments: 'none', charset: 'utf8' }).code);
    });

    // ---- Service worker: precachear lo que existe en esta copia ----
    const swPath = path.join(OUT, 'service-worker.js');
    let sw = fs.readFileSync(swPath, 'utf8');
    const listRe = /const PRECACHE_URLS = \[([\s\S]*?)\];/;
    const original = [...sw.match(listRe)[1].matchAll(/'([^']+)'/g)].map(m => m[1]);
    const kept = original.filter(u => fs.existsSync(path.join(OUT, u)));
    const urls = [...new Set([...kept, './js/app.min.js', './css/app.min.css'])];
    sw = sw.replace(listRe, `const PRECACHE_URLS = [\n${urls.map(u => `    '${u}',`).join('\n')}\n];`);
    fs.writeFileSync(swPath, sw);
    const missing = urls.filter(u => !fs.existsSync(path.join(OUT, u)));
    if (missing.length) throw new Error(`El service worker precachea archivos que no existen: ${missing.join(', ')}`);

    const count = dir => fs.readdirSync(dir, { withFileTypes: true }).reduce((n, e) => n + (e.isDirectory() ? count(path.join(dir, e.name)) : 1), 0);
    console.log(`${outDir}/ listo: ${count(OUT)} archivos`);
    console.log(`  JS:  ${scripts.length} archivos, ${kb(jsSource.length)} (${kb(gz(jsSource))} comprimido) → 1 archivo, ${kb(jsMin.length)} (${kb(gz(jsMin))} comprimido)`);
    console.log(`  CSS: ${sheets.length} archivos, ${kb(cssSource.length)} (${kb(gz(cssSource))} comprimido) → 1 archivo, ${kb(cssMin.length)} (${kb(gz(cssMin))} comprimido)`);
    return OUT;
}

module.exports = { build };
