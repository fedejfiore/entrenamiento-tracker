// Registro de nombres globales de la app (scripts clásicos que comparten el ámbito global).
//
// Cada archivo de js/ puede declarar funciones, clases y variables en el ámbito global, y los
// demás las usan por nombre. Este script las lista (con su archivo y si se pueden reasignar) en
// scripts/globals.json, que usan:
//   - ESLint (eslint.config.js): conoce los nombres válidos y marca los que no existen (no-undef).
//   - La prueba tests/globals.test.js: falla si aparece una global nueva o cambia de archivo sin
//     actualizar el registro. Es un trinquete: el objetivo es que la lista se achique (al pasar a
//     módulos ES), y sumar una tiene que ser una decisión, no un accidente.
//
// Uso: node scripts/globals.js          → muestra las diferencias con el registro
//      node scripts/globals.js --write  → actualiza el registro
const fs = require('fs');
const path = require('path');
const espree = require('espree');

const ROOT = path.resolve(__dirname, '..');
const PAGE = 'entrenamiento_trackerv2.html';
const LEDGER = path.join(__dirname, 'globals.json');

/** Los scripts de la página, en el orden en que se cargan. */
function pageScripts() {
    const html = fs.readFileSync(path.join(ROOT, PAGE), 'utf8');
    return [...html.matchAll(/<script src="(js\/[^"]+)"><\/script>/g)].map(m => m[1]);
}

/** Lo que un archivo declara en el ámbito global: { nombre: 'function' | 'class' | 'const' | 'let' | 'var' }. */
function topLevelDeclarations(file) {
    const code = fs.readFileSync(path.join(ROOT, file), 'utf8');
    const ast = espree.parse(code, { ecmaVersion: 'latest', sourceType: 'script' });
    const out = {};
    const names = pattern => {
        if (!pattern) return [];
        if (pattern.type === 'Identifier') return [pattern.name];
        if (pattern.type === 'ObjectPattern') return pattern.properties.flatMap(p => names(p.value || p.argument));
        if (pattern.type === 'ArrayPattern') return pattern.elements.flatMap(names);
        if (pattern.type === 'AssignmentPattern') return names(pattern.left);
        if (pattern.type === 'RestElement') return names(pattern.argument);
        return [];
    };
    ast.body.forEach(node => {
        if (node.type === 'FunctionDeclaration') out[node.id.name] = 'function';
        else if (node.type === 'ClassDeclaration') out[node.id.name] = 'class';
        else if (node.type === 'VariableDeclaration') node.declarations.forEach(d => names(d.id).forEach(n => { out[n] = node.kind; }));
    });
    return out;
}

/** { nombre: { file, kind } } de toda la app. Un nombre declarado en dos archivos es un error. */
function collectGlobals() {
    const all = {};
    const dupes = [];
    pageScripts().forEach(file => {
        Object.entries(topLevelDeclarations(file)).forEach(([name, kind]) => {
            if (all[name]) dupes.push(`${name}: ${all[name].file} y ${file}`);
            all[name] = { file, kind };
        });
    });
    return { globals: Object.fromEntries(Object.entries(all).sort(([a], [b]) => a.localeCompare(b))), dupes };
}

function loadLedger() {
    try { return JSON.parse(fs.readFileSync(LEDGER, 'utf8')); } catch (e) { return {}; }
}

/** Diferencias entre lo que hay en el código y el registro. */
function diff(current, ledger) {
    const added = Object.keys(current).filter(n => !ledger[n]);
    const removed = Object.keys(ledger).filter(n => !current[n]);
    const moved = Object.keys(current).filter(n => ledger[n] && (ledger[n].file !== current[n].file || ledger[n].kind !== current[n].kind));
    return { added, removed, moved };
}

module.exports = { pageScripts, topLevelDeclarations, collectGlobals, loadLedger, diff, LEDGER };

if (require.main === module) {
    const { globals, dupes } = collectGlobals();
    if (dupes.length) { console.error('Nombres declarados en dos archivos:\n  ' + dupes.join('\n  ')); process.exit(1); }
    const d = diff(globals, loadLedger());
    if (process.argv.includes('--write')) {
        fs.writeFileSync(LEDGER, JSON.stringify(globals, null, 1) + '\n');
        console.log(`Registro actualizado: ${Object.keys(globals).length} globales (+${d.added.length} −${d.removed.length}).`);
    } else {
        console.log(`${Object.keys(globals).length} globales. Nuevas: ${d.added.join(', ') || '—'}. Quitadas: ${d.removed.join(', ') || '—'}. Movidas: ${d.moved.join(', ') || '—'}.`);
    }
}
