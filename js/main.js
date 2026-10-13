// Punto de entrada de la app (módulos ES). Importa cada módulo en el mismo orden en que se
// cargaban los scripts, así lo que hace cada uno al cargarse pasa en el mismo orden.
// window.gym: acceso de solo lectura a lo que exportan los módulos, para las pruebas en el
// navegador y para depurar desde la consola. La app no lo usa.
import * as m0 from './core/errors.js';
import * as m1 from './core/feature-registry.js';
import * as m2 from './core/utils.js';
import * as m3 from './core/i18n.js';
import * as m4 from './ui/actions.js';
import * as m5 from './core/brand.js';
import * as m6 from './core/time.js';
import * as m7 from './core/units.js';
import * as m8 from './data/store.js';
import * as m9 from './data/schema.js';
import * as m10 from './domain/catalog.js';
import * as m11 from './domain/pilates.js';
import * as m12 from './domain/gym-catalog.js';
import * as m13 from './domain/pilates-catalog.js';
import * as m14 from './domain/pilates-reformer.js';
import * as m15 from './domain/legacy-format.js';
import * as m16 from './domain/sets.js';
import * as m17 from './domain/models.js';
import * as m18 from './domain/plan.js';
import * as m19 from './domain/garden.js';
import * as m20 from './domain/training-tools.js';
import * as m21 from './domain/mascot.js';
import * as m22 from './domain/feedback.js';
import * as m23 from './domain/programs.js';
import * as m24 from './domain/pilates-programs.js';
import * as m25 from './domain/routine-share.js';
import * as m26 from './domain/achievements.js';
import * as m27 from './data/migrations.js';
import * as m28 from './data/repositories.js';
import * as m29 from './data/recording-repository.js';
import * as m30 from './data/backup-crypto.js';
import * as m31 from './data/backup-service.js';
import * as m32 from './data/exercise-prefs.js';
import * as m33 from './data/routines-store.js';
import * as m34 from './domain/stats.js';
import * as m35 from './domain/import-csv.js';
import * as m36 from './ui/toast.js';
import * as m37 from './ui/wake-lock.js';
import * as m38 from './audio/sound.js';
import * as m39 from './audio/voice.js';
import * as m40 from './audio/voice-styles.js';
import * as m41 from './audio/recordings.js';
import * as m42 from './features/rest-timer.js';
import * as m43 from './features/native.js';
import * as m44 from './features/tabata.js';
import * as m45 from './features/rep-counter.js';
import * as m46 from './features/music.js';
import * as m47 from './features/training/session-clock.js';
import * as m48 from './features/training/draft.js';
import * as m49 from './features/training/routines-ui.js';
import * as m50 from './features/training/exercise-block.js';
import * as m51 from './features/training/set-stepper.js';
import * as m52 from './features/training/reorder.js';
import * as m53 from './features/training/workout.js';
import * as m54 from './features/training/workout-screen.js';
import * as m55 from './features/training/finish-prompt.js';
import * as m56 from './features/training/session-summary.js';
import * as m57 from './features/training/set-swipe.js';
import * as m58 from './features/training/train-mode.js';
import * as m59 from './features/training/supersets.js';
import * as m60 from './features/training/focus.js';
import * as m61 from './features/exercises.js';
import * as m62 from './features/history.js';
import * as m63 from './features/progress.js';
import * as m64 from './features/body-metrics.js';
import * as m65 from './features/home.js';
import * as m66 from './features/plan-screen.js';
import * as m67 from './features/garden.js';
import * as m68 from './features/mascot.js';
import * as m69 from './features/muscle-map.js';
import * as m70 from './features/plate-calculator.js';
import * as m71 from './features/general-settings.js';
import * as m72 from './features/feature-settings.js';
import * as m73 from './features/disciplines.js';
import * as m74 from './features/reformer.js';
import * as m75 from './features/pilates-library.js';
import * as m76 from './features/gym-library.js';
import * as m77 from './features/programs.js';
import * as m78 from './features/library.js';
import * as m79 from './features/share-cards.js';
import * as m80 from './features/profile.js';
import * as m81 from './features/backup.js';
import * as m82 from './features/import-history.js';
import * as m83 from './features/onboarding.js';
import * as m84 from './features/help.js';
import * as m85 from './features/feedback.js';
import * as m86 from './ui/collapsible.js';
import * as m87 from './ui/accessibility.js';
import * as m88 from './ui/navigation.js';
import * as m89 from './app.js';

const modules = [m0, m1, m2, m3, m4, m5, m6, m7, m8, m9, m10, m11, m12, m13, m14, m15, m16, m17, m18, m19, m20, m21, m22, m23, m24, m25, m26, m27, m28, m29, m30, m31, m32, m33, m34, m35, m36, m37, m38, m39, m40, m41, m42, m43, m44, m45, m46, m47, m48, m49, m50, m51, m52, m53, m54, m55, m56, m57, m58, m59, m60, m61, m62, m63, m64, m65, m66, m67, m68, m69, m70, m71, m72, m73, m74, m75, m76, m77, m78, m79, m80, m81, m82, m83, m84, m85, m86, m87, m88, m89];
const find = name => modules.find(m => Object.prototype.hasOwnProperty.call(m, name));
const names = () => [...new Set(modules.flatMap(m => Object.keys(m)))];
window.gym = new Proxy({}, {
    get: (_, name) => find(name)?.[name],
    has: (_, name) => !!find(name),
    set: () => false,
    ownKeys: () => names(),
    getOwnPropertyDescriptor: (_, name) => (find(name) ? { enumerable: true, configurable: true, value: find(name)[name] } : undefined)
});
