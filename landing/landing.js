// Landing de Gymnastés: idioma, carrusel de capturas, funciones que acompañan el scroll,
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
            'hero.meaning': 'your personal trainer',
            'hero.title': 'Train with a plan.<br><span class="accent">See yourself progress.</span>',
            'hero.lead': "Log your sets in seconds, rest with voice alerts and watch your progress week by week. No account and no ads: your data stays on your phone.",
            'hero.fine': 'Android: test version (installed manually). iPhone: open it in Safari and tap Share → Add to Home Screen.',
            'tab.home': 'Today', 'tab.train': 'Train', 'tab.progress': 'Progress', 'tab.body': 'Body', 'tab.profile': 'Achievements',
            'facts.cost': 'dollars: it’s free', 'facts.account': 'accounts to create', 'facts.ads': "ads while you train", 'facts.langs': 'languages: Spanish, English, Portuguese, German and Chinese',
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
            'f5.title': "A companion that grows with you",
            'cat.title': "Over 230 exercises, explained",
            'cat.lead': "Each one with its guide: how to do it, common mistakes and how to fix them, precautions, alternatives and video.",
            'cat.gym.t': "Gym",
            'cat.gym.p': "Tap a muscle on the figure and see its exercises for your equipment: barbell, dumbbells, machines, cables or bodyweight.",
            'cat.pil.t': "Pilates mat and reformer",
            'cat.pil.p': "140 exercises by level and muscle, color-coded springs for your reformer, props and voice-guided breathing.",
            'alt.ejercicios': "Gym exercises: tap a muscle on the figure",
            'alt.pilates': "Pilates: mat and reformer catalog by level",
            'f5.text': "Your 3D mascot grows with every completed week and shows the muscles you train. Plus: medals, trophies and records to share in your stories.",
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
            'sp.title': "Simple to use.<br><span class=\"accent\">As professional as you need.</span>",
            'sp.lead': "The app starts with just the essentials. When you need more, turn it on with a tap, and if you don't use it, it takes no space on screen.",
            'sp.simple.t': "From day one",
            'sp.simple.1': "Your weekly plan and what's on today",
            'sp.simple.2': "One exercise at a time, with what you did last time",
            'sp.simple.3': "Automatic rest and calendar",
            'sp.simple.4': "Your history and the flower that grows every week",
            'sp.pro.t': "When you need it",
            'sp.pro.1': "RIR and warm-ups",
            'sp.pro.2': "Supersets",
            'sp.pro.3': "Programs with progression",
            'sp.pro.4': "Muscle map",
            'sp.pro.5': "Plateau alerts",
            'sp.pro.6': "Voice rep counter",
            'sp.pro.7': "Plate calculator",
            'sp.pro.8': "Tabata",
            'sp.pro.9': "Measurements and photos",
            'sp.pro.10': "Medals",
            'sp.pro.note': "All in Settings → Features. Turning something off deletes nothing.",
            'm9.t': "Exercises with guides",
            'm9.p': "Tap a muscle and see its exercises for your equipment, with technique, common mistakes and video.",
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
            'q3': 'Does it work without internet?', 'a3': "Today, yes: after opening it once it works without a connection, ideal for gyms with no signal. When accounts arrive, training offline will be part of the Pro plan.",
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
            'alt.perfil': "Profile: the 3D mascot, with the muscles you trained",
            'meta.title': 'Gymnastés · Your personal trainer',
            'meta.description': "Log your sets in seconds, rest with voice alerts and see your progress week by week. Free, no account, no ads, and your data stays on your phone."
        },
        pt: {
            'skip': 'Pular para o conteúdo',
            'nav.features': 'Funções', 'nav.try': 'Experimente', 'nav.privacy': 'Privacidade', 'nav.faq': 'Perguntas',
            'cta.open': 'Abrir o app', 'cta.web': 'Usar grátis no navegador', 'cta.android': 'Baixar para Android',
            'hero.meaning': 'seu personal trainer',
            'hero.title': 'Treine com um plano.<br><span class="accent">Veja seu progresso.</span>',
            'hero.lead': "Registre suas séries em segundos, descanse com aviso por voz e acompanhe seu progresso semana a semana. Sem conta e sem anúncios: seus dados ficam no seu celular.",
            'hero.fine': 'Android: versão de teste (instalada manualmente). iPhone: abra no Safari e toque em Compartilhar → Adicionar à Tela de Início.',
            'tab.home': 'Hoje', 'tab.train': 'Treinar', 'tab.progress': 'Progresso', 'tab.body': 'Medidas', 'tab.profile': 'Conquistas',
            'facts.cost': 'reais: é grátis', 'facts.account': 'contas para criar', 'facts.ads': "anúncios enquanto você treina", 'facts.langs': 'idiomas: espanhol, inglês, português, alemão e chinês',
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
            'f5.title': "Um companheiro que cresce com você",
            'cat.title': "Mais de 230 exercícios, explicados",
            'cat.lead': "Cada um com sua ficha: como fazer, erros comuns e como corrigi-los, precauções, alternativas e vídeo.",
            'cat.gym.t': "Academia",
            'cat.gym.p': "Toque um músculo na figura e veja seus exercícios de acordo com seu equipamento: barra, halteres, máquinas, polias ou peso corporal.",
            'cat.pil.t': "Pilates solo e reformer",
            'cat.pil.p': "140 exercícios por nível e por músculo, molas coloridas de acordo com seu reformer, acessórios e respiração guiada por voz.",
            'alt.ejercicios': "Exercícios de academia: toque um músculo na figura",
            'alt.pilates': "Pilates: catálogo de solo e reformer por nível",
            'f5.text': "Seu mascote 3D cresce a cada semana cumprida e mostra os músculos que você treina. E mais: medalhas, troféus e recordes para compartilhar nos stories.",
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
            'sp.title': "Simples de usar.<br><span class=\"accent\">Tão profissional quanto você precisar.</span>",
            'sp.lead': "O app começa com o essencial. Quando você precisar de mais, ativa com um toque, e o que você não usa não ocupa espaço na tela.",
            'sp.simple.t': "Desde o primeiro dia",
            'sp.simple.1': "Seu plano da semana e o que tem hoje",
            'sp.simple.2': "Um exercício por vez, com o que você fez da última vez",
            'sp.simple.3': "Descanso automático e calendário",
            'sp.simple.4': "Seu histórico e a flor que cresce a cada semana",
            'sp.pro.t': "Quando você precisar",
            'sp.pro.1': "RIR e aquecimento",
            'sp.pro.2': "Supersséries",
            'sp.pro.3': "Programas com progressão",
            'sp.pro.4': "Mapa muscular",
            'sp.pro.5': "Avisos de estagnação",
            'sp.pro.6': "Contador de reps por voz",
            'sp.pro.7': "Calculadora de anilhas",
            'sp.pro.8': "Tabata",
            'sp.pro.9': "Medidas e fotos",
            'sp.pro.10': "Medalhas",
            'sp.pro.note': "Tudo em Ajustes → Funções. Desligar algo não apaga nada.",
            'm9.t': "Exercícios com ficha",
            'm9.p': "Toque um músculo e veja seus exercícios de acordo com seu equipamento, com técnica, erros comuns e vídeo.",
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
            'q3': 'Funciona sem internet?', 'a3': "Hoje, sim: depois de abrir uma vez funciona sem conexão, ideal para academias sem sinal. Quando chegarem as contas, treinar sem internet vai fazer parte do plano Pro.",
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
            'alt.perfil': "Perfil: o mascote 3D, com os músculos que você treinou",
            'meta.title': 'Gymnastés · Seu personal trainer',
            'meta.description': "Registre suas séries em segundos, descanse com aviso por voz e veja seu progresso semana a semana. Grátis, sem conta, sem anúncios, e seus dados ficam no seu celular."
        }
    };
    T.de = {
        "skip": "Zum Inhalt springen",
        "nav.features": "Funktionen",
        "nav.try": "Ausprobieren",
        "nav.privacy": "Datenschutz",
        "nav.faq": "Fragen",
        "cta.open": "App öffnen",
        "cta.web": "Kostenlos im Browser nutzen",
        "cta.android": "Für Android herunterladen",
        "hero.meaning": "dein Personal Trainer",
        "hero.title": "Trainiere mit Plan.<br><span class=\"accent\">Sieh deinen Fortschritt.</span>",
        "hero.lead": "Trage deine Sätze in Sekunden ein, mach Pause mit Sprachhinweis und verfolge deinen Fortschritt Woche für Woche. Ohne Konto und ohne Werbung: Deine Daten bleiben auf deinem Handy.",
        "hero.fine": "Android: Testversion (wird manuell installiert). iPhone: in Safari öffnen und auf Teilen → Zum Home-Bildschirm tippen.",
        "tab.home": "Heute",
        "tab.train": "Training",
        "tab.progress": "Fortschritt",
        "tab.body": "Maße",
        "tab.profile": "Erfolge",
        "facts.cost": "Euro: Sie ist kostenlos",
        "facts.account": "Konten zu erstellen",
        "facts.ads": "Werbung beim Training",
        "facts.langs": "Sprachen: Spanisch, Englisch, Portugiesisch, Deutsch und Chinesisch",
        "features.title": "Alles, was im Studio passiert, in einer App",
        "features.lead": "Gemacht für die Bedienung mit einer Hand, zwischen zwei Sätzen.",
        "f1.title": "App öffnen und wissen, was dran ist",
        "f1.text": "Erstelle deinen Wochenplan mit Tagen, Uhrzeiten und der Routine für jeden Tag. Die App erinnert dich, zeigt, was heute dran ist, und startet es mit einem Tippen. Jede erfüllte Woche lässt deine Blume wachsen.",
        "f2.title": "Jeder Satz, ein Tippen",
        "f2.text": "Sieh, was du beim letzten Mal gemacht hast, passe Gewicht und Wiederholungen an und hake den Satz ab. Die Pause startet von selbst, mit Sprachhinweis bei 10 Sekunden und am Ende. Auf Android meldet sie sich sogar bei ausgeschaltetem Bildschirm.",
        "f3.title": "Welche Muskeln du trainiert hast, und ob es reicht",
        "f3.text": "Eine Körperkarte zählt deine effektiven Sätze pro Muskel und zeigt, ob du in dem Bereich bist, den die Evidenz für Muskelaufbau empfiehlt. Wenn eine Übung stagniert, schlägt sie vor, was du ändern kannst.",
        "f4.title": "Dein Körper in Diagrammen",
        "f4.text": "Gewicht, Fett, Muskeln, Wasser und Taille in einem Diagramm, mit Fortschrittsfotos zum Vergleichen. Alles bleibt nur auf deinem Handy.",
        "f5.title": "Ein Begleiter, der mit dir wächst",
        "cat.title": "Über 230 Übungen, erklärt",
        "cat.lead": "Jede mit Anleitung: Ausführung, häufige Fehler und ihre Korrektur, Vorsichtshinweise, Alternativen und Video.",
        "cat.gym.t": "Fitnessstudio",
        "cat.gym.p": "Tippe auf einen Muskel in der Figur und sieh seine Übungen passend zu deiner Ausrüstung: Langhantel, Kurzhanteln, Maschinen, Seilzug oder Körpergewicht.",
        "cat.pil.t": "Pilates Matte und Reformer",
        "cat.pil.p": "140 Übungen nach Niveau und Muskel, farbige Federn passend zu deinem Reformer, Hilfsmittel und sprachgeführte Atmung.",
        "alt.ejercicios": "Fitnessübungen: auf einen Muskel in der Figur tippen",
        "alt.pilates": "Pilates: Katalog für Matte und Reformer nach Niveau",
        "f5.text": "Dein 3D-Maskottchen wächst mit jeder erfüllten Woche und zeigt die Muskeln, die du trainierst. Dazu: Medaillen, Trophäen und Rekorde zum Teilen in deinen Storys.",
        "try.title": "Probier es gleich hier aus",
        "try.lead": "Hake die drei Sätze ab. Sieh, wie die Pause startet und was passiert, wenn du deine Marke übertriffst.",
        "try.p1": "Die Pause startet von selbst, wenn du den Satz abhakst.",
        "try.p2": "Die App vergleicht mit deiner letzten Einheit.",
        "try.p3": "Rekorde werden gefeiert (und geteilt).",
        "demo.last": "Letztes Mal: 3 × 10 mit 42,5 kg",
        "demo.rest": "Pause",
        "demo.skip": "Überspringen",
        "demo.pr": "🏆 Neuer Rekord! 45 kg (vorher 42,5 kg)",
        "demo.again": "Nochmal",
        "demo.hint": "Tippe beim ersten Satz auf ✓.",
        "demo.next": "Super! Hake den nächsten Satz ab, wenn du bereit bist.",
        "demo.done": "Einheit geschafft: Deine Blume ist gewachsen.",
        "demo.restOver": "Die Pause ist vorbei. Los! Nächster Satz",
        "more.title": "Und noch viel mehr",
        "m1.t": "Programme mit Progression",
        "m1.p": "Fertige Programme, die dir jeden Tag sagen, welches Gewicht und wie viele Wiederholungen.",
        "m2.t": "Bring deinen Verlauf mit",
        "m2.p": "Importiere deine Trainings aus Hevy, Strong oder Fitbod mit einer CSV-Datei.",
        "m3.t": "Tabata und Intervalle",
        "m3.p": "Arbeits- und Pausenblöcke mit Sprach- und Tonhinweisen.",
        "m4.t": "Wiederholungszähler mit Stimme",
        "m4.p": "Gibt das Tempo jeder Wiederholung vor. Du kannst sogar eigene Hinweise aufnehmen.",
        "sp.title": "Einfach zu bedienen.<br><span class=\"accent\">So professionell, wie du es brauchst.</span>",
        "sp.lead": "Die App startet mit dem Nötigsten. Wenn du mehr brauchst, aktivierst du es mit einem Tipp, und was du nicht nutzt, nimmt keinen Platz ein.",
        "sp.simple.t": "Ab dem ersten Tag",
        "sp.simple.1": "Dein Wochenplan und was heute dran ist",
        "sp.simple.2": "Eine Übung nach der anderen, mit dem, was du letztes Mal gemacht hast",
        "sp.simple.3": "Automatische Pause und Kalender",
        "sp.simple.4": "Dein Verlauf und die Blume, die jede Woche wächst",
        "sp.pro.t": "Wenn du es brauchst",
        "sp.pro.1": "RIR und Aufwärmsätze",
        "sp.pro.2": "Supersätze",
        "sp.pro.3": "Programme mit Progression",
        "sp.pro.4": "Muskelkarte",
        "sp.pro.5": "Stagnationshinweise",
        "sp.pro.6": "Wiederholungszähler mit Stimme",
        "sp.pro.7": "Scheibenrechner",
        "sp.pro.8": "Tabata",
        "sp.pro.9": "Maße und Fotos",
        "sp.pro.10": "Medaillen",
        "sp.pro.note": "Alles unter Einstellungen → Funktionen. Ausschalten löscht nichts.",
        "m9.t": "Übungen mit Anleitung",
        "m9.p": "Tippe auf einen Muskel und sieh seine Übungen passend zu deiner Ausrüstung, mit Technik, häufigen Fehlern und Video.",
        "m5.t": "Scheibenrechner",
        "m5.p": "Sagt dir, welche Scheiben du für deine Stange auf jede Seite legen musst.",
        "m6.t": "Supersätze und einseitige Übungen",
        "m6.p": "Gruppiere Übungen und trage einarmige oder einbeinige Übungen pro Seite ein.",
        "m7.t": "Verschlüsseltes Backup",
        "m7.p": "Eine Datei mit all deinen Daten, auf Wunsch mit Passwort. Handy wechseln, ohne etwas zu verlieren.",
        "m8.t": "Für alle Menschen",
        "m8.p": "Große Tasten, hoher Kontrast, Farben für Farbenblindheit, helles oder dunkles Design, kg oder lb.",
        "priv.title": "Deine Daten gehören dir",
        "priv.text": "Die App speichert alles auf deinem Handy. Sie hat keine Server mit deinen Daten, nutzt weder Werbung noch Tracker und kann technisch keine Verbindung zu Diensten Dritter herstellen. Daten verlassen dein Gerät nur, wenn du es entscheidest: ein Backup, ein Bild oder eine Rückmeldung.",
        "priv.link": "Datenschutzerklärung lesen (Englisch)",
        "next.title": "Was als Nächstes kommt",
        "next.lead": "In Entwicklung. Funktionen, die Daten außerhalb deines Handys nutzen, fragen vorher nach deiner Einwilligung.",
        "n1.t": "App bei Google Play",
        "n1.p": "Die Android-App, installiert aus dem Store.",
        "n2.t": "Konten und Synchronisierung",
        "n2.p": "Deine Daten auf all deinen Geräten, wenn du willst.",
        "n3.t": "Coach-Modus",
        "n3.p": "Damit dein Coach deine Routinen erstellt und deinen Fortschritt am Computer verfolgt.",
        "n4.t": "Routinen und Ernährung mit KI",
        "n4.p": "Allgemeine Vorschläge für Routinen, Kalorien und Mahlzeiten für gesunde Erwachsene.",
        "n4.w": "Sie ersetzen keine Beratung durch eine Ärztin, einen Arzt oder eine qualifizierte Ernährungsfachkraft.",
        "faq.title": "Häufige Fragen",
        "q1": "Ist sie kostenlos?",
        "a1": "Ja. Alle heutigen Funktionen sind kostenlos und ohne Werbung. Später kann es einen Bezahlplan mit Zusatzfunktionen geben, aber was du schon nutzt, wird nicht kostenpflichtig.",
        "q2": "Brauche ich ein Konto?",
        "a2": "Nein. App öffnen und loslegen. Deine Daten bleiben auf deinem Handy.",
        "q3": "Funktioniert sie ohne Internet?",
        "a3": "Heute ja: Nach dem ersten Öffnen funktioniert sie ohne Verbindung, ideal für Studios ohne Empfang. Wenn es Konten gibt, wird Offline-Training Teil des Pro-Plans.",
        "q4": "Wie installiere ich sie auf dem Handy?",
        "a4": "Auf <b>Android</b> lade den Installer von dieser Seite herunter oder öffne die App in Chrome und tippe auf „Installieren“. Auf dem <b>iPhone</b> öffne sie in Safari, tippe auf Teilen und dann auf „Zum Home-Bildschirm“.",
        "q5": "Kann ich übernehmen, was ich in einer anderen App eingetragen habe?",
        "a5": "Ja, aus Hevy, Strong oder Fitbod: Exportiere deinen Verlauf als CSV und importiere ihn in den Einstellungen.",
        "q6": "Was ist, wenn ich das Handy wechsle?",
        "a6": "Mach unter Einstellungen → Daten ein Backup, speichere es (zum Beispiel in deinem Drive) und lade es auf dem neuen Handy.",
        "q7": "Ersetzt sie einen Coach oder eine Ärztin bzw. einen Arzt?",
        "a7": "Nein. Sie ist ein Werkzeug, um dein Training zu protokollieren und zu organisieren. Bevor du mit dem Training beginnst oder die Intensität steigerst, sprich mit einer Ärztin oder einem Arzt, besonders wenn du gesundheitliche Probleme hast.",
        "final.title": "Dein nächster Satz beginnt hier",
        "foot.health": "Allgemeine Informationen: Sie ersetzen nicht den Rat medizinischer Fachleute.",
        "foot.privacy": "Datenschutz",
        "foot.terms": "Bedingungen",
        "foot.contact": "Kontakt",
        "alt.inicio": "Start: heute ist Training, mit der Routine des Tages und der Plan-Blume",
        "alt.entrenar": "Training: abgehakte Sätze und laufende Pause",
        "alt.progreso": "Fortschritt: in dieser Woche trainierte Muskeln",
        "alt.medidas": "Maße: Entwicklung von Gewicht, Fett und Muskeln",
        "alt.perfil": "Profil: das 3D-Maskottchen mit den trainierten Muskeln",
        "meta.title": "Gymnastés · Dein Personal Trainer",
        "meta.description": "Trage deine Sätze in Sekunden ein, mach Pause mit Sprachhinweis und sieh deinen Fortschritt Woche für Woche. Kostenlos, ohne Konto, ohne Werbung, und deine Daten bleiben auf deinem Handy."
    };
    T.zh = {
        "skip": "跳到内容",
        "nav.features": "功能",
        "nav.try": "试一试",
        "nav.privacy": "隐私",
        "nav.faq": "常见问题",
        "cta.open": "打开应用",
        "cta.web": "在浏览器中免费使用",
        "cta.android": "下载 Android 版",
        "hero.meaning": "你的私人教练",
        "hero.title": "按计划训练。<br><span class=\"accent\">看见自己的进步。</span>",
        "hero.lead": "几秒钟记录每一组，休息时有语音提醒，每周看到自己的进步。无需账户、没有广告：你的数据保存在你的手机上。",
        "hero.fine": "Android：测试版（需手动安装）。iPhone：在 Safari 中打开，点按 分享 → 添加到主屏幕。",
        "tab.home": "今天",
        "tab.train": "训练",
        "tab.progress": "进步",
        "tab.body": "身体数据",
        "tab.profile": "成就",
        "facts.cost": "元：完全免费",
        "facts.account": "个需要注册的账户",
        "facts.ads": "训练时的广告",
        "facts.langs": "种语言：西班牙语、英语、葡萄牙语、德语和中文",
        "features.title": "健身房里的一切，尽在一个应用",
        "features.lead": "专为组间单手操作设计。",
        "f1.title": "打开应用就知道今天练什么",
        "f1.text": "制定每周计划：训练日、时间和每天的训练计划。应用会提醒你，显示今天要练什么，点一下就开始。每完成一周，你的花就会长大。",
        "f2.title": "每一组，点一下",
        "f2.text": "查看上次做了什么，调整重量和次数，然后勾选这一组。休息自动开始，剩 10 秒和结束时有语音提醒。在 Android 上，即使屏幕关闭也会提醒你。",
        "f3.title": "练到了哪些肌肉，练得够不够",
        "f3.text": "人体图统计每块肌肉的有效组数，并告诉你是否处于科学证据推荐的增肌范围。如果某个动作停滞不前，会建议你做出调整。",
        "f4.title": "你的身体，一图看懂",
        "f4.text": "体重、体脂、肌肉、水分和腰围在同一张图表中，还有进步照片可以对比。所有内容只保存在你的手机上。",
        "f5.title": "与你一起成长的伙伴",
        "cat.title": "230 多个动作，详细讲解",
        "cat.lead": "每个动作都有说明：怎么做、常见错误及纠正、注意事项、替代动作和视频。",
        "cat.gym.t": "健身房",
        "cat.gym.p": "在人体图上点一块肌肉，按你的器材查看动作：杠铃、哑铃、器械、滑轮或自重。",
        "cat.pil.t": "普拉提垫上与核心床",
        "cat.pil.p": "140 个动作，按级别和肌肉分类，按你的核心床显示彩色弹簧，还有小器械和语音引导呼吸。",
        "alt.ejercicios": "健身房动作：在人体图上点一块肌肉",
        "alt.pilates": "普拉提：按级别分类的垫上与核心床动作",
        "f5.text": "你的 3D 伙伴随每个完成的周成长，并显现你练到的肌肉。还有：可分享到动态的奖章、奖杯和纪录。",
        "try.title": "就在这里试一试",
        "try.lead": "勾选三组。看看休息如何开始，以及打破纪录时会发生什么。",
        "try.p1": "勾选一组后休息自动开始。",
        "try.p2": "应用会与你上次的训练对比。",
        "try.p3": "纪录会被庆祝（还能分享）。",
        "demo.last": "上次：3 × 10，42.5 kg",
        "demo.rest": "休息",
        "demo.skip": "跳过",
        "demo.pr": "🏆 新纪录！45 kg（之前 42.5 kg）",
        "demo.again": "再来一次",
        "demo.hint": "点按第一组的 ✓。",
        "demo.next": "很好！准备好后勾选下一组。",
        "demo.done": "训练完成：你的花长大了。",
        "demo.restOver": "休息结束了。加油！下一组",
        "more.title": "还有更多",
        "m1.t": "带进阶的计划",
        "m1.p": "现成的计划，每天告诉你用多少重量、做几次。",
        "m2.t": "导入你的历史",
        "m2.p": "用 CSV 文件导入你在 Hevy、Strong 或 Fitbod 中的训练。",
        "m3.t": "Tabata 和间歇",
        "m3.p": "训练和休息区块，带语音和声音提醒。",
        "m4.t": "语音次数计数器",
        "m4.p": "为每次动作设定节奏。你甚至可以录制自己的提示。",
        "sp.title": "用起来简单。<br><span class=\"accent\">专业程度随你所需。</span>",
        "sp.lead": "应用从最基本的功能开始。需要更多时，点一下就能开启；不用的功能不占屏幕空间。",
        "sp.simple.t": "从第一天起",
        "sp.simple.1": "每周计划和今天要练什么",
        "sp.simple.2": "一次一个动作，附上次的记录",
        "sp.simple.3": "自动休息计时和日历",
        "sp.simple.4": "你的历史记录和每周成长的花",
        "sp.pro.t": "需要时再开启",
        "sp.pro.1": "RIR 和热身组",
        "sp.pro.2": "超级组",
        "sp.pro.3": "渐进式训练方案",
        "sp.pro.4": "肌肉图",
        "sp.pro.5": "停滞提醒",
        "sp.pro.6": "语音计数器",
        "sp.pro.7": "杠铃片计算器",
        "sp.pro.8": "Tabata",
        "sp.pro.9": "身体数据与照片",
        "sp.pro.10": "奖章",
        "sp.pro.note": "都在 设置 → 功能 中。关闭功能不会删除任何数据。",
        "m9.t": "带说明的动作库",
        "m9.p": "点一块肌肉，按你的器材查看对应动作，附技术要点、常见错误和视频。",
        "m5.t": "杠铃片计算器",
        "m5.p": "根据你的杠铃杆，告诉你两侧各放哪些杠铃片。",
        "m6.t": "超级组和单侧动作",
        "m6.p": "组合动作，并按侧记录单臂或单腿动作。",
        "m7.t": "加密备份",
        "m7.p": "一个包含你所有数据的文件，可选密码保护。换手机也不会丢失任何内容。",
        "m8.t": "为所有人设计",
        "m8.p": "大按钮、高对比度、色盲友好配色、浅色或深色主题、公斤或磅。",
        "priv.title": "你的数据属于你",
        "priv.text": "应用把一切都保存在你的手机上。它没有存放你数据的服务器，不使用广告或追踪器，技术上也无法连接第三方服务。只有在你决定时，数据才会离开你的设备：一份备份、一张图片或一条反馈。",
        "priv.link": "阅读隐私政策（英文）",
        "next.title": "即将推出",
        "next.lead": "开发中。需要在你手机以外使用数据的功能，会先征得你的同意。",
        "n1.t": "Google Play 上架",
        "n1.p": "从应用商店安装 Android 应用。",
        "n2.t": "账户和同步",
        "n2.p": "如果你愿意，你的数据可以在所有设备上同步。",
        "n3.t": "教练模式",
        "n3.p": "让你的教练在电脑上为你制定训练计划并跟踪你的进步。",
        "n4.t": "AI 训练计划和营养",
        "n4.p": "为健康成年人提供训练计划、热量和饮食方面的参考建议。",
        "n4.w": "这些建议不能替代医生或注册营养师的诊疗。",
        "faq.title": "常见问题",
        "q1": "免费吗？",
        "a1": "是的。现在的所有功能都免费且没有广告。以后可能会有带额外功能的付费方案，但你已经在用的功能不会收费。",
        "q2": "需要注册账户吗？",
        "a2": "不需要。打开应用就能开始。你的数据保存在你的手机上。",
        "q3": "没有网络能用吗？",
        "a3": "目前可以：打开一次之后就能离线使用，非常适合没有信号的健身房。等账户功能上线后，离线训练将成为 Pro 方案的一部分。",
        "q4": "怎么安装到手机上？",
        "a4": "在 <b>Android</b> 上，从本页面下载安装包，或在 Chrome 中打开应用并点按“安装”。在 <b>iPhone</b> 上，用 Safari 打开，点按“分享”，再点按“添加到主屏幕”。",
        "q5": "能导入我在其他应用中的记录吗？",
        "a5": "可以，支持 Hevy、Strong 或 Fitbod：把历史导出为 CSV，然后在设置中导入。",
        "q6": "换手机怎么办？",
        "a6": "在 设置 → 数据 中做一份备份，保存起来（例如存到你的云盘），然后在新手机上载入。",
        "q7": "它能替代教练或医生吗？",
        "a7": "不能。它是记录和规划训练的工具。开始训练或提高强度之前，请咨询医生，尤其是在你有健康问题的情况下。",
        "final.title": "你的下一组，从这里开始",
        "foot.health": "仅供参考：不能替代医疗专业人员的建议。",
        "foot.privacy": "隐私",
        "foot.terms": "条款",
        "foot.contact": "联系我们",
        "alt.inicio": "首页：今天要训练，显示当天的训练计划和计划之花",
        "alt.entrenar": "训练：已勾选的组和正在进行的休息",
        "alt.progreso": "进步：本周训练到的肌肉",
        "alt.medidas": "身体数据：体重、体脂和肌肉的变化",
        "alt.perfil": "个人资料：显示你练过肌肉的 3D 伙伴",
        "meta.title": "Gymnastés · 你的私人教练",
        "meta.description": "几秒钟记录每一组，休息时有语音提醒，每周看到自己的进步。免费、无需账户、没有广告，你的数据保存在你的手机上。"
    };
    const ES = {
        'demo.next': '¡Bien! Marcá la próxima serie cuando estés.',
        'demo.done': 'Sesión completa: tu flor creció.',
        'demo.restOver': 'Terminó el descanso. ¡Vamos! A la próxima serie'
    };

    const LANGS = ['es', 'en', 'pt', 'de', 'zh'];

    function pickLanguage() {
        const param = new URLSearchParams(location.search).get('lang');
        if (LANGS.includes(param)) return param;
        let saved = null;
        try { saved = localStorage.getItem('language'); } catch (e) { /* sin almacenamiento */ }
        if (LANGS.includes(saved)) return saved;
        const nav = (navigator.language || 'es').toLowerCase();
        if (nav.startsWith('es')) return 'es';
        if (nav.startsWith('pt')) return 'pt';
        if (nav.startsWith('de')) return 'de';
        if (nav.startsWith('zh')) return 'zh';
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
    document.querySelector('.logo')?.addEventListener('click', e => {
        e.preventDefault();
        window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
        if (location.hash) history.replaceState(null, '', location.pathname + location.search);
    });
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
