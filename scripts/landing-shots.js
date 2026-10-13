// Capturas de la app para la landing (landing/img/<pantalla>-<idioma>.jpg), con datos de
// DEMOSTRACIÓN ficticios: ninguna persona real. Todas las funciones activas, tema oscuro.
// Uso: node scripts/landing-shots.js                → todas las pantallas en los 5 idiomas
//      LANGS=es,en ONLY=inicio,perfil node scripts/landing-shots.js
//      node scripts/landing-shots.js explorar       → solo imprime qué hay en cada pantalla
const { chromium } = require('playwright');
const http = require('http');
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const OUT = path.join(ROOT, 'landing', 'img');
const EXPLORE = process.argv[2] === 'explorar';
fs.mkdirSync(OUT, { recursive: true });
const MIME = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.png': 'image/png', '.woff2': 'font/woff2', '.glb': 'model/gltf-binary' };
const server = http.createServer((req, res) => {
    const p = decodeURIComponent(new URL(req.url, 'http://x').pathname);
    const file = path.join(ROOT, p === '/' ? 'entrenamiento_trackerv2.html' : p);
    if (!file.startsWith(ROOT) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) { res.writeHead(404); return res.end(); }
    res.writeHead(200, { 'Content-Type': MIME[path.extname(file)] || 'application/octet-stream' });
    res.end(fs.readFileSync(file));
});

const fmt = d => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
function monday(weeksAgo) { const d = new Date(); d.setHours(0, 0, 0, 0); d.setDate(d.getDate() - ((d.getDay() + 6) % 7) - weeksAgo * 7); return d; }

// Rutinas de demo (nombres del catálogo, para que el volumen por músculo los reconozca).
const ROUTINES = {
    TA: { label: 'Torso A', ex: [['Press de banca con mancuernas', 22, 2], ['Jalón al pecho', 45, 2.5], ['Press militar con mancuernas', 14, 1], ['Remo sentado', 40, 2.5], ['Curl de bíceps', 10, 1], ['Tríceps en polea', 20, 1.25]] },
    PI: { label: 'Pierna', ex: [['Sentadilla goblet', 20, 2], ['Curl de piernas', 30, 2.5], ['Sentadilla búlgara', 10, 1], ['Extensión de piernas', 35, 2.5], ['Gemelos de pie', 40, 2.5], ['Plancha (plank)', 0, 0]] },
    TB: { label: 'Torso B', ex: [['Press inclinado con barra', 35, 2.5], ['Remo con mancuerna a un brazo', 20, 2], ['Elevaciones laterales', 7, 0.5], ['Jalón al pecho', 45, 2.5], ['Curl martillo', 10, 1], ['Press francés', 15, 1.25]] }
};
// Tres días que terminan hoy (así la captura de Inicio siempre muestra "Hoy toca entrenar").
const TODAY_DOW = new Date().getDay();
const PLAN_DAYS = { [(TODAY_DOW + 3) % 7]: 'TA', [(TODAY_DOW + 5) % 7]: 'PI', [TODAY_DOW]: 'TB' };
const WEEKS = 10;

function buildData() {
    const workouts = [];
    const best = {};
    let id = 1700000000000;
    for (let w = WEEKS; w >= 0; w--) {
        const m = monday(w);
        for (const [day, key] of Object.entries(PLAN_DAYS)) {
            const d = new Date(m); d.setDate(d.getDate() + ((Number(day) + 6) % 7));
            const today = new Date(); today.setHours(0, 0, 0, 0);
            if (d >= today) continue; // hoy toca: sin hacer
            if (w === 6 && Number(day) === TODAY_DOW) continue; // una semana no perfecta
            const step = Math.floor((WEEKS - w) / 2);
            const exercises = ROUTINES[key].ex.map(([name, base, inc]) => {
                if (name.startsWith('Plancha')) return { name, type: 'time', sets: [1, 2, 3].map(() => ({ time: String(40 + step * 5), done: true })) };
                const kg = Math.round((base + inc * step) * 10) / 10;
                const reps = [10, 9, 8].map(r => String(r + ((WEEKS - w) % 2)));
                const sets = reps.map(r => ({ reps: r, kg: String(kg), done: true, rest: 90 }));
                return { name, type: 'kg', sets, reps: reps.join('-'), weight: reps.map(() => String(kg)).join('-'), pause: '90-90-90' };
            });
            const volume = exercises.reduce((a, e) => a + e.sets.reduce((b, s) => b + (Number(s.kg) || 0) * (Number(s.reps) || 0), 0), 0);
            const prs = [];
            exercises.forEach(e => { const kg = Number(e.sets[0].kg); if (!kg) return; if (best[e.name] && kg > best[e.name]) prs.push(`${e.name}: ${kg}kg (antes ${best[e.name]}kg)`); best[e.name] = Math.max(best[e.name] || 0, kg); });
            workouts.push({ id: id++, date: fmt(d), routine: key, mood: 4, duration: 52 + (id % 9), volume, exercises, prs });
        }
    }
    const bodyMetrics = [];
    for (let w = WEEKS; w >= 0; w--) {
        const d = new Date(monday(w)); d.setDate(d.getDate() + 1);
        if (d > new Date()) continue;
        const t = WEEKS - w;
        bodyMetrics.push({ date: fmt(d), weight: Math.round((78.4 - t * 0.18 + (t % 3 === 0 ? 0.3 : 0)) * 10) / 10, fat: Math.round((21.5 - t * 0.22) * 10) / 10, muscle: Math.round((36.1 + t * 0.12) * 10) / 10, water: null, waist: Math.round((86 - t * 0.35) * 10) / 10 });
    }
    return {
        workouts,
        bodyMetrics,
        customRoutines: Object.fromEntries(Object.entries(ROUTINES).map(([k, r]) => [k, r.ex.map(e => e[0])])),
        customRoutineLabels: Object.fromEntries(Object.entries(ROUTINES).map(([k, r]) => [k, r.label])),
        exerciseTypes: { 'plancha (plank)': 'time' },
        trainingDaysPlanHistory: [{ date: fmt(monday(WEEKS)), days: Object.keys(PLAN_DAYS).map(Number), times: Object.fromEntries(Object.keys(PLAN_DAYS).map(d => [d, Number(d) === TODAY_DOW ? '18:30' : '19:00'])), remind: 30, routines: PLAN_DAYS }],
        userProfile: { name: 'Sol' },
        appSettings: { disciplines: ['gym', 'mat', 'reformer'], module: 'gym' },
        onboardingDone: '1',
        schemaVersion: '3'
    };
}

const openSection = (page, selector) => page.evaluate(sel => {
    const s = document.querySelector(sel)?.closest('.section');
    if (s) { gym.setSectionOpen(s, true, false); window.scrollTo(0, s.getBoundingClientRect().top + scrollY - 12); }
}, selector);

const SHOTS = [
    { name: 'inicio', go: async page => { await page.evaluate(() => gym.showScreen('inicio')); } },
    {
        name: 'entrenar', go: async page => {
            await page.evaluate(() => { gym.startTodayRoutine(); });
            const checks = await page.$$('.exercise-row:not(.collapsed) .set-check');
            await checks[0].click(); await page.waitForTimeout(300); await checks[1].click(); await page.waitForTimeout(2500);
            await page.evaluate(() => { const ex = document.querySelector('.exercises-section'); window.scrollTo(0, ex.getBoundingClientRect().top + scrollY + 40); });
        }
    },
    { name: 'progreso', go: async page => { await page.evaluate(() => { gym.showScreen('progreso'); gym.setSectionOpen(document.getElementById('muscleMapSection'), true, false); }); } },
    { name: 'medidas', go: async page => { await page.evaluate(() => { gym.showScreen('medidas'); const secs = document.querySelectorAll('[data-screen="medidas"] .section.collapsible'); gym.setSectionOpen(secs[0], false, false); gym.setSectionOpen(secs[1], true, false); }); } },
    {
        name: 'perfil', go: async page => {
            await page.evaluate(() => gym.showScreen('perfil'));
            await openSection(page, '#mascotSection');
            await page.waitForFunction(() => document.querySelector('#mascotCanvas canvas'), null, { timeout: 20000 }).catch(() => {});
            await page.waitForTimeout(1500);
        }
    },
    {
        name: 'ejercicios', go: async page => {
            await page.evaluate(() => { gym.showScreen('biblioteca'); document.querySelector('[data-lib-tab="ejercicios"]').click(); });
            await openSection(page, '#gymCatalog');
            await page.click('#gymCatalog [data-gym-muscle="Pecho"]');
            await page.waitForTimeout(300);
        }
    },
    {
        name: 'pilates', go: async page => {
            await page.evaluate(() => { gym.setActiveModule('pilates'); gym.showScreen('biblioteca'); document.querySelector('[data-lib-tab="ejercicios"]').click(); });
            await openSection(page, '#pilatesCatalog');
            await page.evaluate(() => { const c = document.getElementById('pilatesCatalog'); window.scrollTo(0, c.getBoundingClientRect().top + scrollY - 70); });
        }
    }
];

server.listen(0, '127.0.0.1', async () => {
    const url = `http://127.0.0.1:${server.address().port}/`;
    const browser = await chromium.launch({ args: ['--use-gl=swiftshader', '--enable-webgl', '--ignore-gpu-blocklist'] });
    const data = buildData();
    const langs = EXPLORE ? ['es'] : (process.env.LANGS || 'es,en,pt,de,zh').split(',');
    for (const lang of langs) {
        for (const shot of SHOTS) {
            if (process.env.ONLY && !process.env.ONLY.split(',').includes(shot.name)) continue;
            const page = await browser.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, colorScheme: 'dark' });
            const errors = [];
            page.on('pageerror', e => errors.push(e.message));
            await page.addInitScript(([d, l]) => {
                if (sessionStorage.getItem('seeded')) return;
                sessionStorage.setItem('seeded', '1');
                localStorage.clear();
                Object.entries(d).forEach(([k, v]) => localStorage.setItem(k, typeof v === 'string' ? v : JSON.stringify(v)));
                localStorage.setItem('language', l);
                localStorage.setItem('theme', 'dark');
            }, [data, lang]);
            await page.goto(url);
            await page.waitForFunction(() => !document.documentElement.classList.contains('i18n-pending'));
            await page.evaluate(() => gym.features.useAll()); // la landing muestra la app completa
            await page.waitForTimeout(500);
            await shot.go(page);
            await page.waitForTimeout(900);
            if (EXPLORE) {
                const info = await page.evaluate(() => [...document.querySelectorAll('.screen-active .section, .screen-active > div > *')].slice(0, 14).map(s => `${s.tagName}.${[...s.classList].join('.')}#${s.id} :: ${(s.innerText || '').split('\n').filter(Boolean).slice(0, 2).join(' / ').slice(0, 90)} [y=${Math.round(s.getBoundingClientRect().top)}]`));
                console.log(`\n== ${shot.name}\n` + info.join('\n'));
            } else {
                await page.screenshot({ path: path.join(OUT, `${shot.name}-${lang}.jpg`), type: 'jpeg', quality: 78 });
            }
            if (errors.length) console.log('ERRORES', shot.name, lang, errors.join(' | '));
            await page.close();
        }
    }
    await browser.close();
    server.close();
    if (!EXPLORE) console.log(`${fs.readdirSync(OUT).length} capturas en landing/img`);
});
