// Landing de Esō Agōn: idioma, carrusel de capturas, funciones que acompañan el scroll,
// contadores, aparición de bloques y la demo de series. Sin dependencias.
(() => {
    'use strict';
    document.documentElement.classList.add('js');
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // ---------- Idioma ----------
    // El castellano está en el HTML; acá van inglés y portugués. La elección se comparte con la
    // app (misma clave "language"), así quien elige un idioma acá ya lo tiene al abrirla.
    const T = {
        en: {
            'skip': 'Skip to content',
            'nav.features': 'Features', 'nav.try': 'Try it', 'nav.privacy': 'Privacy', 'nav.faq': 'FAQ',
            'cta.open': 'Open the app', 'cta.web': 'Use it free in your browser', 'cta.android': 'Download for Android',
            'hero.meaning': 'the inner struggle',
            'hero.title': 'Train with a plan.<br><span class="accent">See yourself progress.</span>',
            'hero.lead': 'Log your sets in seconds, rest with voice alerts and watch your progress week by week. No account, no ads and no connection needed: your data stays on your phone.',
            'hero.fine': 'Android: test version (installed manually). iPhone: open it in Safari and tap Share → Add to Home Screen.',
            'tab.home': 'Today', 'tab.train': 'Train', 'tab.progress': 'Progress', 'tab.body': 'Body', 'tab.profile': 'Achievements',
            'facts.cost': 'dollars: it’s free', 'facts.account': 'accounts to create', 'facts.offline': 'works offline', 'facts.langs': 'languages: Spanish, English and Portuguese',
            'features.title': 'Everything that happens at the gym, in one app',
            'features.lead': 'Designed to use with one hand, between sets.',
            'f1.title': 'Open the app and know what’s next',
            'f1.text': 'Build your weekly plan with days, times and a routine for each day. The app reminds you, shows what to train today and starts it with one tap. Every week you complete makes your flower grow.',
            'f2.title': 'Every set, one tap',
            'f2.text': 'See what you did last time, adjust weight and reps, and tick the set. Rest starts on its own, with a voice alert at 10 seconds and at the end. On Android, it alerts you even with the screen off.',
            'f3.title': 'Which muscles you worked, and whether it’s enough',
            'f3.text': 'A body map counts your effective sets per muscle and tells you if you’re in the range the evidence recommends for building muscle. If an exercise stalls, it suggests what to change.',
            'f4.title': 'Your body, in charts',
            'f4.text': 'Weight, fat, muscle, water and waist on one chart, with progress photos to compare. Everything is stored only on your phone.',
            'f5.title': 'Medals you earn by training',
            'f5.text': 'Consistency, weeks in a row, weight lifted and personal records. Every achievement can be shared as an image for your stories.',
            'try.title': 'Try it right here',
            'try.lead': 'Tick the three sets. See how the rest starts and what happens when you beat your mark.',
            'try.p1': 'Rest starts on its own when you tick the set.', 'try.p2': 'The app compares with your previous session.', 'try.p3': 'Records get celebrated (and shared).',
            'demo.last': 'Last time: 3 × 10 at 42.5 kg', 'demo.rest': 'Rest', 'demo.skip': 'Skip',
            'demo.pr': '🏆 New record! 45 kg (was 42.5 kg)', 'demo.again': 'Again', 'demo.hint': 'Tap ✓ on the first set.',
            'demo.next': 'Nice! Tick the next set when you’re ready.', 'demo.done': 'Session complete: your flower grew.', 'demo.restOver': 'Rest is over. Let’s go! Next set',
            'more.title': 'And much more',
            'm1.t': 'Programs with progression', 'm1.p': 'Ready-made programs that tell you what weight and how many reps to do each day.',
            'm2.t': 'Bring your history', 'm2.p': 'Import your workouts from Hevy, Strong or Fitbod with a CSV file.',
            'm3.t': 'Tabata and intervals', 'm3.p': 'Work and rest blocks with voice and sound alerts.',
            'm4.t': 'Voice rep counter', 'm4.p': 'Keeps the tempo of each rep. You can even record your own alerts.',
            'm5.t': 'Plate calculator', 'm5.p': 'Tells you which plates to load on each side for your bar.',
            'm6.t': 'Supersets and unilateral', 'm6.p': 'Group exercises and log per side the ones done with one arm or leg.',
            'm7.t': 'Encrypted backup', 'm7.p': 'One file with all your data, password-protected if you like. Switch phones without losing anything.',
            'm8.t': 'For everyone', 'm8.p': 'Large buttons, high contrast, color-blind friendly colors, light or dark theme, kg or lb.',
            'priv.title': 'Your data is yours',
            'priv.text': 'The app stores everything on your phone. It has no servers holding your data, uses no ads or trackers, and technically cannot connect to third-party services. Data leaves your device only when you decide: a backup, an image or feedback.',
            'priv.link': 'Read the privacy policy',
            'next.title': 'Coming next', 'next.lead': 'In development. Features that use data outside your phone will ask for your consent first.',
            'n1.t': 'App on Google Play', 'n1.p': 'The Android app, installed from the store.',
            'n2.t': 'Accounts and sync', 'n2.p': 'Your data on all your devices, if you want.',
            'n3.t': 'Coach mode', 'n3.p': 'So your coach can build your routines and follow your progress from a computer.',
            'n4.t': 'AI routines and nutrition', 'n4.p': 'General guidance on routines, calories and meals for healthy adults.',
            'n4.w': 'They do not replace a consultation with a doctor or a registered dietitian.',
            'faq.title': 'Frequently asked questions',
            'q1': 'Is it free?', 'a1': 'Yes. All of today’s features are free and ad-free. A paid plan with extra features may come later, but what you already use won’t be charged.',
            'q2': 'Do I need an account?', 'a2': 'No. Open the app and start. Your data stays on your phone.',
            'q3': 'Does it work without internet?', 'a3': 'Yes. After opening it once, it works offline, perfect for gyms with no signal.',
            'q4': 'How do I install it on my phone?', 'a4': 'On <b>Android</b>, download the installer from this page, or open the app in Chrome and tap "Install". On <b>iPhone</b>, open it in Safari, tap Share and then "Add to Home Screen".',
            'q5': 'Can I bring what I logged in another app?', 'a5': 'Yes, from Hevy, Strong or Fitbod: export your history as CSV and import it in Settings.',
            'q6': 'What if I change phones?', 'a6': 'Make a backup in Settings → Data, save it (for example, in your Drive) and load it on the new phone.',
            'q7': 'Does it replace a coach or a doctor?', 'a7': 'No. It is a tool to log and organize your training. Before you start training or increase intensity, consult a doctor, especially if you have any health condition.',
            'final.title': 'Your next set starts here',
            'foot.health': 'General information: it does not replace advice from a health professional.',
            'foot.privacy': 'Privacy', 'foot.terms': 'Terms', 'foot.contact': 'Contact',
            'alt.inicio': 'Home: time to train today, with the day’s routine and the plan flower',
            'alt.entrenar': 'Train: sets ticked and the rest timer running',
            'alt.progreso': 'Progress: muscles worked this week',
            'alt.medidas': 'Body: weight, fat and muscle over time',
            'alt.perfil': 'Profile: activity, records and medals',
            'meta.title': 'Esō Agōn · Your training, your progress',
            'meta.description': 'Log your sets in seconds, rest with voice alerts and see your progress week by week. Free, no account, works offline and your data stays on your phone.'
        },
        pt: {
            'skip': 'Pular para o conteúdo',
            'nav.features': 'Funções', 'nav.try': 'Experimente', 'nav.privacy': 'Privacidade', 'nav.faq': 'Perguntas',
            'cta.open': 'Abrir o app', 'cta.web': 'Usar grátis no navegador', 'cta.android': 'Baixar para Android',
            'hero.meaning': 'a luta interior',
            'hero.title': 'Treine com um plano.<br><span class="accent">Veja seu progresso.</span>',
            'hero.lead': 'Registre suas séries em segundos, descanse com aviso por voz e acompanhe seu progresso semana a semana. Sem conta, sem anúncios e sem conexão: seus dados ficam no seu celular.',
            'hero.fine': 'Android: versão de teste (instalada manualmente). iPhone: abra no Safari e toque em Compartilhar → Adicionar à Tela de Início.',
            'tab.home': 'Hoje', 'tab.train': 'Treinar', 'tab.progress': 'Progresso', 'tab.body': 'Medidas', 'tab.profile': 'Conquistas',
            'facts.cost': 'reais: é grátis', 'facts.account': 'contas para criar', 'facts.offline': 'funciona sem conexão', 'facts.langs': 'idiomas: espanhol, inglês e português',
            'features.title': 'Tudo o que acontece na academia, em um app',
            'features.lead': 'Pensado para usar com uma mão, entre uma série e outra.',
            'f1.title': 'Abra o app e saiba o que tem hoje',
            'f1.text': 'Monte seu plano semanal com dias, horários e a rotina de cada dia. O app avisa, mostra o que treinar hoje e começa com um toque. Cada semana cumprida faz sua flor crescer.',
            'f2.title': 'Cada série, um toque',
            'f2.text': 'Veja o que você fez na última vez, ajuste peso e reps e marque a série. O descanso começa sozinho, com aviso por voz aos 10 segundos e no final. No Android, avisa mesmo com a tela desligada.',
            'f3.title': 'Quais músculos você treinou, e se é suficiente',
            'f3.text': 'Um mapa do corpo conta suas séries efetivas por músculo e diz se você está na faixa que a evidência recomenda para ganhar músculo. Se um exercício estagnar, sugere o que mudar.',
            'f4.title': 'Seu corpo, em gráficos',
            'f4.text': 'Peso, gordura, músculo, água e cintura no mesmo gráfico, com fotos de progresso para comparar. Tudo fica salvo só no seu celular.',
            'f5.title': 'Medalhas que se ganham treinando',
            'f5.text': 'Constância, semanas seguidas, quilos levantados e recordes pessoais. Cada conquista pode ser compartilhada como imagem nos seus stories.',
            'try.title': 'Experimente aqui mesmo',
            'try.lead': 'Marque as três séries. Veja como o descanso começa e o que acontece quando você supera sua marca.',
            'try.p1': 'O descanso começa sozinho ao marcar a série.', 'try.p2': 'O app compara com a sua sessão anterior.', 'try.p3': 'Os recordes são comemorados (e compartilhados).',
            'demo.last': 'Última vez: 3 × 10 com 42,5 kg', 'demo.rest': 'Descanso', 'demo.skip': 'Pular',
            'demo.pr': '🏆 Novo recorde! 45 kg (antes 42,5 kg)', 'demo.again': 'Repetir', 'demo.hint': 'Toque em ✓ na primeira série.',
            'demo.next': 'Boa! Marque a próxima série quando estiver pronto.', 'demo.done': 'Sessão completa: sua flor cresceu.', 'demo.restOver': 'O descanso acabou. Vamos! Próxima série',
            'more.title': 'E muito mais',
            'm1.t': 'Programas com progressão', 'm1.p': 'Programas prontos que dizem qual peso e quantas reps fazer a cada dia.',
            'm2.t': 'Traga seu histórico', 'm2.p': 'Importe seus treinos do Hevy, Strong ou Fitbod com um arquivo CSV.',
            'm3.t': 'Tabata e intervalos', 'm3.p': 'Blocos de trabalho e descanso com aviso por voz e som.',
            'm4.t': 'Contador de reps por voz', 'm4.p': 'Marca a cadência de cada repetição. Você pode até gravar seus próprios avisos.',
            'm5.t': 'Calculadora de anilhas', 'm5.p': 'Diz quais anilhas colocar de cada lado de acordo com sua barra.',
            'm6.t': 'Supersséries e unilaterais', 'm6.p': 'Agrupe exercícios e registre por lado os feitos com um braço ou uma perna.',
            'm7.t': 'Backup criptografado', 'm7.p': 'Um arquivo com todos os seus dados, protegido por senha se quiser. Para trocar de celular sem perder nada.',
            'm8.t': 'Para todas as pessoas', 'm8.p': 'Botões grandes, alto contraste, cores para daltonismo, tema claro ou escuro, kg ou lb.',
            'priv.title': 'Seus dados são seus',
            'priv.text': 'O app salva tudo no seu celular. Não tem servidores com seus dados, não usa publicidade nem rastreadores e tecnicamente não pode se conectar a serviços de terceiros. Algo sai do seu dispositivo só quando você decide: um backup, uma imagem ou um comentário.',
            'priv.link': 'Ler a política de privacidade',
            'next.title': 'O que vem por aí', 'next.lead': 'Em desenvolvimento. As funções que usarem dados fora do seu celular vão pedir seu consentimento antes.',
            'n1.t': 'App no Google Play', 'n1.p': 'O app de Android, instalado pela loja.',
            'n2.t': 'Contas e sincronização', 'n2.p': 'Seus dados em todos os seus dispositivos, se quiser.',
            'n3.t': 'Modo treinador', 'n3.p': 'Para seu treinador montar suas rotinas e acompanhar seu progresso pelo computador.',
            'n4.t': 'Rotinas e nutrição com IA', 'n4.p': 'Sugestões orientativas de rotinas, calorias e refeições para adultos saudáveis.',
            'n4.w': 'Não substituem a consulta com um médico nem com um nutricionista registrado.',
            'faq.title': 'Perguntas frequentes',
            'q1': 'É grátis?', 'a1': 'Sim. Todas as funções de hoje são grátis e sem anúncios. Mais adiante pode haver um plano pago com funções extras, mas o que você já usa não vai ser cobrado.',
            'q2': 'Preciso criar uma conta?', 'a2': 'Não. Abra o app e comece. Seus dados ficam no seu celular.',
            'q3': 'Funciona sem internet?', 'a3': 'Sim. Depois de abrir uma vez, funciona sem conexão, ideal para academias sem sinal.',
            'q4': 'Como instalo no celular?', 'a4': 'No <b>Android</b>, baixe o instalador nesta página ou abra o app no Chrome e toque em "Instalar". No <b>iPhone</b>, abra no Safari, toque em Compartilhar e depois em "Adicionar à Tela de Início".',
            'q5': 'Posso trazer o que registrei em outro app?', 'a5': 'Sim, do Hevy, Strong ou Fitbod: exporte o histórico como CSV e importe em Ajustes.',
            'q6': 'E se eu trocar de celular?', 'a6': 'Faça um backup em Ajustes → Dados, salve (por exemplo, no seu Drive) e carregue no celular novo.',
            'q7': 'Substitui um treinador ou um médico?', 'a7': 'Não. É uma ferramenta para registrar e organizar seu treino. Antes de começar a treinar ou aumentar a intensidade, consulte um médico, principalmente se você tiver alguma condição de saúde.',
            'final.title': 'Sua próxima série começa aqui',
            'foot.health': 'Informação orientativa: não substitui o conselho de um profissional de saúde.',
            'foot.privacy': 'Privacidade', 'foot.terms': 'Termos', 'foot.contact': 'Contato',
            'alt.inicio': 'Início: hoje tem treino, com a rotina do dia e a flor do plano',
            'alt.entrenar': 'Treinar: séries marcadas e o descanso correndo',
            'alt.progreso': 'Progresso: músculos trabalhados na semana',
            'alt.medidas': 'Medidas: evolução do peso, da gordura e do músculo',
            'alt.perfil': 'Perfil: atividade, recordes e medalhas',
            'meta.title': 'Esō Agōn · Seu treino, seu progresso',
            'meta.description': 'Registre suas séries em segundos, descanse com aviso por voz e veja seu progresso semana a semana. Grátis, sem conta, funciona sem conexão e seus dados ficam no seu celular.'
        }
    };
    const ES = {
        'demo.next': '¡Bien! Marcá la próxima serie cuando estés.',
        'demo.done': 'Sesión completa: tu flor creció.',
        'demo.restOver': 'Terminó el descanso. ¡Vamos! A la próxima serie'
    };

    function pickLanguage() {
        const param = new URLSearchParams(location.search).get('lang');
        if (['es', 'en', 'pt'].includes(param)) return param;
        let saved = null;
        try { saved = localStorage.getItem('language'); } catch (e) { /* sin almacenamiento */ }
        if (['es', 'en', 'pt'].includes(saved)) return saved;
        const nav = (navigator.language || 'es').toLowerCase();
        if (nav.startsWith('es')) return 'es';
        if (nav.startsWith('pt')) return 'pt';
        return 'en';
    }

    // Se guarda el castellano original de cada elemento para poder volver a él.
    const original = new Map();
    let lang = 'es';
    const t = key => (lang === 'es' ? ES[key] : T[lang][key]) || ES[key] || key;

    function applyLanguage(next, save) {
        lang = next;
        document.documentElement.lang = lang;
        document.querySelectorAll('[data-i18n], [data-i18n-html]').forEach(el => {
            const html = el.hasAttribute('data-i18n-html');
            const key = el.getAttribute(html ? 'data-i18n-html' : 'data-i18n');
            if (!original.has(el)) original.set(el, html ? el.innerHTML : el.textContent);
            const value = lang === 'es' ? original.get(el) : T[lang][key];
            if (value == null) return;
            if (html) el.innerHTML = value; else el.textContent = value;
        });
        // Capturas en el idioma elegido.
        document.querySelectorAll('img[data-shot]').forEach(img => {
            const shot = img.dataset.shot;
            img.src = `landing/img/${shot}-${lang}.jpg`;
            if (img.alt) {
                if (!original.has(img)) original.set(img, img.alt);
                img.alt = lang === 'es' ? original.get(img) : T[lang][`alt.${shot}`];
            }
        });
        // Textos legales en castellano o en inglés.
        document.querySelectorAll('[data-legal]').forEach(a => {
            const es = lang === 'es';
            a.href = a.dataset.legal === 'terms' ? `legal/${es ? 'terminos' : 'terms'}.html` : `legal/${es ? 'privacidad' : 'privacy'}.html`;
        });
        if (!original.has('title')) {
            original.set('title', document.title);
            original.set('desc', document.querySelector('meta[name="description"]').content);
        }
        document.title = lang === 'es' ? original.get('title') : T[lang]['meta.title'];
        document.querySelector('meta[name="description"]').content = lang === 'es' ? original.get('desc') : T[lang]['meta.description'];
        document.querySelectorAll('.lang button').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.lang === lang)));
        if (save) { try { localStorage.setItem('language', lang); } catch (e) { /* sin almacenamiento */ } }
        resetDemo();
    }

    document.querySelectorAll('.lang button').forEach(b => b.addEventListener('click', () => applyLanguage(b.dataset.lang, true)));

    // ---------- Encabezado ----------
    const top = document.getElementById('top');
    const onScroll = () => top.classList.toggle('scrolled', window.scrollY > 8);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    // ---------- Carrusel de la portada ----------
    const SLIDE_MS = 4000;
    const heroShots = [...document.querySelectorAll('#heroScreens .shot')];
    const heroDots = document.getElementById('heroDots');
    const dotButtons = [...heroDots.querySelectorAll('button')];
    heroDots.style.setProperty('--slide-ms', `${SLIDE_MS}ms`);
    let slide = 0;
    let slideTimer = null;

    function showSlide(i) {
        slide = (i + heroShots.length) % heroShots.length;
        heroShots.forEach((img, n) => img.classList.toggle('on', n === slide));
        dotButtons.forEach((b, n) => {
            b.setAttribute('aria-selected', String(n === slide));
            // Reinicia la barrita de progreso del botón activo.
            if (n === slide) { b.style.animation = 'none'; void b.offsetWidth; b.style.animation = ''; }
        });
    }
    function play() {
        clearInterval(slideTimer);
        if (reduceMotion) { heroDots.classList.add('paused'); return; }
        heroDots.classList.remove('paused');
        slideTimer = setInterval(() => showSlide(slide + 1), SLIDE_MS);
    }
    function pause() { clearInterval(slideTimer); heroDots.classList.add('paused'); }
    dotButtons.forEach(b => b.addEventListener('click', () => { showSlide(Number(b.dataset.go)); play(); }));
    const heroPhone = document.querySelector('.hero-phone');
    heroPhone.addEventListener('mouseenter', pause);
    heroPhone.addEventListener('mouseleave', play);
    document.addEventListener('visibilitychange', () => (document.hidden ? pause() : play()));
    play();

    // ---------- Funciones: el teléfono muestra la pantalla de la que se está leyendo ----------
    const storyShots = [...document.querySelectorAll('#storyScreens .shot')];
    const steps = [...document.querySelectorAll('.step')];
    if ('IntersectionObserver' in window) {
        const stepObserver = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (!entry.isIntersecting) return;
                steps.forEach(s => s.classList.toggle('active', s === entry.target));
                storyShots.forEach(img => img.classList.toggle('on', img.dataset.shot === entry.target.dataset.shot));
            });
        }, { rootMargin: '-45% 0px -45% 0px' });
        steps.forEach(s => stepObserver.observe(s));
    } else {
        steps.forEach(s => s.classList.add('active'));
    }
    steps[0]?.classList.add('active');

    // ---------- Aparición de bloques y contadores ----------
    function countUp(el) {
        const to = Number(el.dataset.to);
        const suffix = el.dataset.suffix || '';
        if (reduceMotion || to === 0) { el.textContent = `${to}${suffix}`; return; }
        const start = performance.now();
        const dur = 1100;
        const tick = now => {
            const p = Math.min(1, (now - start) / dur);
            el.textContent = `${Math.round(to * (1 - Math.pow(1 - p, 3)))}${suffix}`;
            if (p < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
    }
    const reveals = document.querySelectorAll('.reveal');
    if ('IntersectionObserver' in window) {
        const revealObserver = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (!entry.isIntersecting) return;
                entry.target.classList.add('in');
                entry.target.querySelectorAll('.count').forEach(countUp);
                revealObserver.unobserve(entry.target);
            });
        }, { threshold: 0.15 });
        reveals.forEach((el, i) => {
            el.style.transitionDelay = `${(i % 4) * 70}ms`;
            revealObserver.observe(el);
        });
    } else {
        reveals.forEach(el => el.classList.add('in'));
    }

    // ---------- Demo de series ----------
    const REST_S = 5;
    const RING = 119.4; // 2πr con r = 19
    const checks = [...document.querySelectorAll('.demo-check')];
    const restBox = document.getElementById('demoRest');
    const ring = document.getElementById('demoRing');
    const timeEl = document.getElementById('demoTime');
    const prBox = document.getElementById('demoPr');
    const hint = document.getElementById('demoHint');
    const live = document.getElementById('demoLive');
    const flower = document.getElementById('demoFlower');
    let restTimer = null;
    let audio = null;

    function beep() {
        try {
            audio = audio || new (window.AudioContext || window.webkitAudioContext)();
            const osc = audio.createOscillator();
            const gain = audio.createGain();
            osc.frequency.value = 880;
            gain.gain.setValueAtTime(0.0001, audio.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.15, audio.currentTime + 0.02);
            gain.gain.exponentialRampToValueAtTime(0.0001, audio.currentTime + 0.35);
            osc.connect(gain).connect(audio.destination);
            osc.start();
            osc.stop(audio.currentTime + 0.4);
        } catch (e) { /* sin audio */ }
    }

    function say(text) {
        hint.textContent = text;
        live.textContent = text;
    }

    function stopRest() {
        clearInterval(restTimer);
        restTimer = null;
        restBox.hidden = true;
    }

    function startRest() {
        stopRest();
        restBox.hidden = false;
        const endsAt = Date.now() + REST_S * 1000;
        const update = () => {
            const left = Math.max(0, endsAt - Date.now());
            const s = Math.ceil(left / 1000);
            timeEl.textContent = `0:${String(s).padStart(2, '0')}`;
            ring.style.strokeDashoffset = String(RING * (1 - left / (REST_S * 1000)));
            if (left <= 0) {
                stopRest();
                beep();
                if (navigator.vibrate) navigator.vibrate(200);
                say(t('demo.restOver'));
                nextPulse();
            }
        };
        update();
        restTimer = setInterval(update, 100);
    }

    function nextPulse() {
        checks.forEach(c => c.classList.remove('pulse'));
        const next = checks.find(c => c.getAttribute('aria-pressed') !== 'true');
        if (next && !reduceMotion) next.classList.add('pulse');
    }

    function confetti() {
        if (reduceMotion) return;
        const colors = ['#ff6b35', '#39d98a', '#ffb020', '#3498db', '#f5f6f8'];
        const box = document.getElementById('demo').getBoundingClientRect();
        for (let i = 0; i < 40; i++) {
            const piece = document.createElement('span');
            piece.className = 'confetti';
            piece.style.background = colors[i % colors.length];
            document.body.appendChild(piece);
            const x0 = box.left + box.width / 2;
            const y0 = box.top + 40;
            const angle = Math.random() * Math.PI * 2;
            const dist = 80 + Math.random() * 160;
            piece.animate([
                { transform: `translate(${x0}px, ${y0}px) rotate(0deg)`, opacity: 1 },
                { transform: `translate(${x0 + Math.cos(angle) * dist}px, ${y0 + Math.sin(angle) * dist + 160}px) rotate(${Math.random() * 720}deg)`, opacity: 0 }
            ], { duration: 1200 + Math.random() * 600, easing: 'cubic-bezier(.2,.7,.4,1)' }).onfinish = () => piece.remove();
        }
    }

    const FLOWER = ['🌱', '🌿', '🌷', '🌸'];
    function setFlower(stage) {
        flower.textContent = FLOWER[stage];
        flower.classList.remove('grow');
        void flower.offsetWidth;
        if (stage > 0) flower.classList.add('grow');
    }

    checks.forEach((check, i) => check.addEventListener('click', () => {
        const done = check.getAttribute('aria-pressed') === 'true';
        if (done) return;
        check.setAttribute('aria-pressed', 'true');
        check.closest('.demo-set').classList.add('done');
        const count = checks.filter(c => c.getAttribute('aria-pressed') === 'true').length;
        setFlower(count);
        if (count === checks.length) {
            stopRest();
            checks.forEach(c => c.classList.remove('pulse'));
            prBox.hidden = false;
            say(t('demo.done'));
            confetti();
        } else {
            say(t('demo.next'));
            checks.forEach(c => c.classList.remove('pulse'));
            startRest();
        }
    }));
    document.getElementById('demoSkip').addEventListener('click', () => { stopRest(); nextPulse(); });
    document.getElementById('demoReset').addEventListener('click', resetDemo);

    function resetDemo() {
        stopRest();
        checks.forEach(c => { c.setAttribute('aria-pressed', 'false'); c.closest('.demo-set').classList.remove('done'); });
        prBox.hidden = true;
        flower.textContent = FLOWER[0];
        flower.classList.remove('grow');
        hint.textContent = lang === 'es' ? original.get(hint) || hint.textContent : T[lang]['demo.hint'];
        live.textContent = '';
        nextPulse();
    }

    applyLanguage(pickLanguage(), false);
})();
