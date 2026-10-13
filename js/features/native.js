// App nativa (Android con Capacitor): conecta las notificaciones (js/core/native-notifications.js)
// con el timer de descanso y el plan semanal. En la web no hace nada.
import { tr } from '../core/i18n.js';
import { NativeNotifications } from '../core/native-notifications.js';
import { DEFAULT_PLAN_TIME } from '../domain/plan.js';
import { showActionToast } from '../ui/toast.js';
import { restTimerEndsAt, restTimerInterval } from './rest-timer.js';
import { routineLabelOf } from './progress.js';
import { getCurrentPlan } from './plan-screen.js';

export const nativeNotifications = new NativeNotifications({
    capacitor: () => window.Capacitor,
    restTimer: () => ({ running: !!restTimerInterval, endsAt: restTimerEndsAt }),
    routineLabel: key => routineLabelOf(key),
    tr: text => tr(text),
    actionToast: (...args) => showActionToast(...args),
    defaultPlanTime: DEFAULT_PLAN_TIME
});

export function isNativeApp() { return nativeNotifications.isNative(); }
export function syncNativePlanReminders(plan) { return nativeNotifications.syncPlan(plan); }

export function initNativeFeatures() {
    if (!isNativeApp()) return;
    document.documentElement.classList.add('native-app');
    document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'hidden') nativeNotifications.scheduleRestEnd();
        else nativeNotifications.cancelRestEnd();
    });
    // El plan vigente, como notificaciones (se actualiza también al guardarlo).
    try { syncNativePlanReminders(getCurrentPlan()); } catch (e) {}
}
