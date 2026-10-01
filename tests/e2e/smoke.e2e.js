// Prueba de punta a punta en un navegador real (Playwright), con la política de seguridad
// (CSP) estricta de la app: sin permisos especiales para la prueba.
//   - Todas las pantallas abren sin errores ni bloqueos de seguridad.
//   - Flujo de entrenamiento: tildar todas las series → pregunta → guardar → historial.
//   - Ataque: datos con código escondido no se ejecutan en ninguna pantalla.
//   - Importar historial de Hevy y formulario de errores.
// Uso: npm run test:e2e   (en la integración continua usa el Chromium de Playwright; en la
// compu, el Chrome instalado).
const { chromium } = require('playwright');
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..', '..');
const MIME = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.json': 'application/json', '.png': 'image/png', '.woff2': 'font/woff2', '.svg': 'image/svg+xml' };

const server = http.createServer((req, res) => {
    const p = decodeURIComponent(new URL(req.url, 'http://x').pathname);
    const file = path.join(ROOT, p === '/' ? 'entrenamiento_trackerv2.html' : p);
    if (!file.startsWith(ROOT) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) { res.writeHead(404); return res.end(); }
    res.writeHead(200, { 'Content-Type': MIME[path.extname(file)] || 'application/octet-stream' });
    res.end(fs.readFileSync(file));
});

const results = [];
const check = (name, ok, detail = '') => { results.push({ name, ok: !!ok, detail }); };

// Datos de prueba con código escondido en todos los textos que se muestran.
const EVIL = '<img src=x onerror="window.__pwn=1">';
const evilSeed = {
    workouts: [{ id: 1, date: '2026-09-01', routine: 'EV', mood: 3, notes: EVIL, exercises: [{ name: `Press ${EVIL}`, type: 'kg', sets: [{ reps: '10', kg: '50', done: true, note: EVIL }] }] }],
    customRoutines: { EV: [`Press ${EVIL}`, `Curl <script>window.__pwn=1</script>`] },
    customRoutineLabels: { EV: `Rutina ${EVIL}` },
    exerciseGroupOverrides: { [`press ${EVIL}`]: EVIL },
    bodyMetrics: [{ date: '2026-09-01', weight: 80, fat: null, muscle: null, water: null, waist: null }]
};

async function newPage(browser, seed) {
    const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
    const errors = [];
    page.on('pageerror', e => errors.push(e.message));
    await page.addInitScript(data => {
        window.__csp = [];
        document.addEventListener('securitypolicyviolation', e => window.__csp.push(`${e.violatedDirective} ${e.blockedURI}`));
        if (sessionStorage.getItem('seeded')) return;
        sessionStorage.setItem('seeded', '1');
        localStorage.clear();
        localStorage.setItem('schemaVersion', '3');
        localStorage.setItem('onboardingDone', '1'); // la guía de primer uso tiene su propia prueba
        Object.entries(data || {}).forEach(([k, v]) => localStorage.setItem(k, typeof v === 'string' ? v : JSON.stringify(v)));
        window.confirm = () => true;
    }, seed);
    await page.goto(`http://127.0.0.1:${server.address().port}/`);
    await page.waitForFunction(() => document.querySelector('#todayPlanBanner:not([hidden])'));
    return { page, errors };
}

const SCREENS = ['inicio', 'entrenar', 'historial', 'progreso', 'medidas', 'biblioteca', 'perfil', 'ajustes'];

async function visitAll(page) {
    for (const s of SCREENS) {
        await page.evaluate(id => showScreen(id, true), s);
        // Abre todas las secciones plegables de la pantalla (lo de adentro también se dibuja).
        await page.evaluate(id => document.querySelectorAll(`[data-screen="${id}"] .section.collapsible`).forEach(sec => setSectionOpen(sec, true, false)), s);
        await page.waitForTimeout(80);
    }
}

server.listen(0, '127.0.0.1', async () => {
    const browser = await chromium.launch(process.env.CI ? {} : { channel: 'chrome' });
    try {
        // 1. Todas las pantallas, sin datos
        {
            const { page, errors } = await newPage(browser, {});
            await visitAll(page);
            check('todas las pantallas abren sin errores', errors.length === 0, errors.join(' | '));
            check('sin bloqueos de la política de seguridad', (await page.evaluate(() => window.__csp)).length === 0, (await page.evaluate(() => window.__csp)).join(' | '));
            check('no queda código en línea en el HTML', await page.evaluate(() => document.querySelectorAll('[onclick],[onchange],[oninput]').length === 0));
            await page.close();
        }
        // 2. Entrenar: tildar todo → pregunta → guardar
        {
            const { page, errors } = await newPage(browser, { customRoutines: { T: ['Press de pecho', 'Remo sentado'] }, customRoutineLabels: { T: 'Prueba' } });
            await page.click('[data-today="start"]').catch(() => {});
            const res = await page.evaluate(async () => {
                const wait = ms => new Promise(r => setTimeout(r, ms));
                showScreen('entrenar', true);
                const sel = document.getElementById('routine');
                sel.value = 'T'; sel.dispatchEvent(new Event('change'));
                await wait(100);
                for (const row of document.querySelectorAll('#exercisesContainer .set-row')) {
                    row.querySelector('[data-f=reps]').value = '10';
                    row.querySelector('[data-f=kg]').value = '40';
                    row.querySelector('.set-check').click();
                    cancelRestTimer();
                    await wait(20);
                }
                await wait(600);
                const asked = document.getElementById('finishPrompt').classList.contains('open');
                document.querySelector('#finishPrompt [data-finish="save"]').click();
                await wait(300);
                return { asked, saved: repo.workouts.all().length };
            });
            check('al tildar la última serie pregunta si guardar', res.asked);
            check('la sesión se guarda', res.saved === 1, `sesiones: ${res.saved}`);
            check('flujo de entrenamiento sin errores', errors.length === 0, errors.join(' | '));
            await page.close();
        }
        // 3. Ataque: datos con código escondido
        {
            const { page, errors } = await newPage(browser, evilSeed);
            await visitAll(page);
            await page.evaluate(() => { openHelp(); openFeedback(); });
            const res = await page.evaluate(() => ({ pwn: window.__pwn === 1, imgs: document.querySelectorAll('img[src="x"]').length, scripts: [...document.querySelectorAll('script')].filter(s => !s.src).length }));
            check('el código escondido en los datos no se ejecuta', !res.pwn);
            check('no se inyectan imágenes ni scripts', res.imgs === 0 && res.scripts === 0, JSON.stringify(res));
            check('con datos raros no hay errores', errors.length === 0, errors.join(' | '));
            await page.close();
        }
        // 4. Importar de Hevy y formulario de errores
        {
            const { page, errors } = await newPage(browser, {});
            const res = await page.evaluate(async () => {
                const csv = ['"title","start_time","end_time","description","exercise_title","superset_id","exercise_notes","set_index","set_type","weight_kg","reps","distance_km","duration_seconds","rpe"',
                    '"Push","30 Sep 2024, 18:00","30 Sep 2024, 19:00","","Bench Press (Barbell)",,"",0,"normal",80,8,,,',
                    '"Legs","2 Oct 2024, 18:00","2 Oct 2024, 19:00","","Squat (Barbell)",,"",0,"normal",100,5,,,'].join(String.fromCharCode(10));
                showScreen('ajustes', true);
                await onImportHistoryFile(new File([csv], 'hevy.csv'));
                document.querySelector('[data-import="confirm"]').click();
                await new Promise(r => setTimeout(r, 200));
                const imported = repo.workouts.all().length;
                openFeedback();
                document.querySelector('#feedbackModal [data-feedback="send"]').click();
                await new Promise(r => setTimeout(r, 100));
                const fbErrors = [...document.querySelectorAll('#feedbackModal [data-error-for]')].filter(e => !e.hidden).length;
                return { imported, fbErrors };
            });
            check('importa el historial de Hevy', res.imported === 2, `sesiones: ${res.imported}`);
            check('el formulario de errores valida los campos', res.fbErrors === 4, `avisos: ${res.fbErrors}`);
            check('importar y formulario sin errores', errors.length === 0, errors.join(' | '));
            await page.close();
        }
        // 5. En inglés: todas las pantallas sin errores y los textos principales traducidos
        {
            const { page, errors } = await newPage(browser, { language: 'en' });
            await page.waitForFunction(() => document.documentElement.lang === 'en' && !document.documentElement.classList.contains('i18n-pending'));
            await visitAll(page);
            const res = await page.evaluate(() => ({
                nav: [...document.querySelectorAll('.bottom-nav-item span:last-child')].map(s => s.textContent)
            }));
            check('en inglés, la barra de navegación está traducida', res.nav.join(',') === 'Home,Train,History,Progress,More', res.nav.join(','));
            check('en inglés, todas las pantallas abren sin errores', errors.length === 0, errors.join(' | '));
            await page.close();
        }
        // 6. En portugués
        {
            const { page, errors } = await newPage(browser, { language: 'pt' });
            await page.waitForFunction(() => document.documentElement.lang === 'pt' && !document.documentElement.classList.contains('i18n-pending'));
            await visitAll(page);
            const nav = await page.evaluate(() => [...document.querySelectorAll('.bottom-nav-item span:last-child')].map(s => s.textContent).join(','));
            check('em português, a barra de navegação está traduzida', nav === 'Início,Treinar,Histórico,Progresso,Mais', nav);
            check('em português, todas as telas abrem sem erros', errors.length === 0, errors.join(' | '));
            await page.close();
        }
    } catch (err) {
        check('la prueba terminó', false, err.stack);
    } finally {
        await browser.close();
        server.close();
    }
    results.forEach(r => console.log(`${r.ok ? '✔' : '✖'} ${r.name}${!r.ok && r.detail ? `\n    ${r.detail}` : ''}`));
    const failed = results.filter(r => !r.ok).length;
    console.log(`\n${results.length - failed} de ${results.length} pasaron`);
    process.exit(failed ? 1 : 0);
});
