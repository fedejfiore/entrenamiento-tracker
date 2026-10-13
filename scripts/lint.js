// npm run lint: ESLint con trinquete para el HTML sin escapar.
//  - Cualquier regla que no sea no-unsanitized tiene que dar cero.
//  - no-unsanitized (innerHTML / insertAdjacentHTML con datos interpolados): lo que ya había al
//    activar la regla está anotado por archivo en scripts/lint-baseline.json. Un archivo no puede
//    tener más que eso; cuando se arregla alguno, el número baja (node scripts/lint.js --write).
//    Lo nuevo se escribe con escapeHtml(...) desde el principio.
const fs = require('fs');
const path = require('path');
const { ESLint } = require('eslint');

const ROOT = path.resolve(__dirname, '..');
const BASELINE = path.join(__dirname, 'lint-baseline.json');
const RATCHETED = rule => rule && rule.startsWith('no-unsanitized/');

async function main() {
    const results = await new ESLint({ cwd: ROOT }).lintFiles(['.']);
    const rel = f => path.relative(ROOT, f).split(path.sep).join('/');
    const errors = [];
    const unsafe = {};
    results.forEach(r => r.messages.forEach(m => {
        if (RATCHETED(m.ruleId)) unsafe[rel(r.filePath)] = (unsafe[rel(r.filePath)] || 0) + 1;
        else errors.push(`${rel(r.filePath)}:${m.line}:${m.column} ${m.ruleId || ''} ${m.message}`);
    }));
    let baseline = {};
    try { baseline = JSON.parse(fs.readFileSync(BASELINE, 'utf8')); } catch (e) { /* primera vez */ }

    if (process.argv.includes('--write')) {
        const sorted = Object.fromEntries(Object.entries(unsafe).sort(([a], [b]) => a.localeCompare(b)));
        fs.writeFileSync(BASELINE, JSON.stringify(sorted, null, 1) + '\n');
        baseline = sorted;
        console.log(`Línea de base: ${Object.values(unsafe).reduce((a, b) => a + b, 0)} usos de HTML sin escapar en ${Object.keys(unsafe).length} archivos.`);
    }
    const grew = Object.entries(unsafe).filter(([f, n]) => n > (baseline[f] || 0)).map(([f, n]) => `${f}: ${n} (antes ${baseline[f] || 0})`);
    const total = Object.values(unsafe).reduce((a, b) => a + b, 0);
    const before = Object.values(baseline).reduce((a, b) => a + b, 0);

    if (errors.length) console.error(`✖ ${errors.length} problemas:\n  ${errors.join('\n  ')}`);
    if (grew.length) console.error(`✖ HTML sin escapar nuevo (usá escapeHtml):\n  ${grew.join('\n  ')}\n  Para ver dónde: npx eslint <archivo>`);
    if (errors.length || grew.length) process.exit(1);
    console.log(`✔ Sin problemas. HTML sin escapar heredado: ${total}${total < before ? ` (bajó de ${before}: actualizá con node scripts/lint.js --write)` : ''}.`);
}

main().catch(e => { console.error(e); process.exit(1); });
