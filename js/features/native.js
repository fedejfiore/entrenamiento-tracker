// Funciones de la app nativa (Android con Capacitor). En la web no hace nada.
//  - Descanso con la pantalla bloqueada: si la app pasa a segundo plano (pantalla apagada, otra
//    app) con un descanso corriendo, se programa una notificación del sistema para el momento
//    exacto en que termina. Si la persona vuelve antes, se cancela (adentro de la app ya suena).
//  - Recordatorios del plan semanal como notificaciones propias (sin pasar por el calendario).
// Script clásico (no módulo): comparte el ámbito global con el resto de la app.

const NATIVE_REST_ID = 1001;
const NATIVE_PLAN_BASE_ID = 2000;

function isNativeApp() {
    return !!(window.Capacitor && typeof window.Capacitor.isNativePlatform === 'function' && window.Capacitor.isNativePlatform());
}

let nativeNotifications = null;
let nativeNotificationsReady = null;

function localNotifications() {
    if (!isNativeApp()) return null;
    if (!nativeNotifications) nativeNotifications = window.Capacitor.registerPlugin('LocalNotifications');
    return nativeNotifications;
}

/** Pide permiso una vez y crea los canales (sonido y vibración). Devuelve true si hay permiso. */
async function ensureNativeNotifications() {
    const LN = localNotifications();
    if (!LN) return false;
    if (!nativeNotificationsReady) {
        nativeNotificationsReady = (async () => {
            try {
                let perm = await LN.checkPermissions();
                if (perm.display !== 'granted') perm = await LN.requestPermissions();
                if (perm.display !== 'granted') return false;
                await LN.createChannel({ id: 'descanso', name: tr('Fin del descanso'), description: tr('Avisa cuando termina el descanso entre series'), importance: 5, visibility: 1, vibration: true });
                await LN.createChannel({ id: 'plan', name: tr('Plan semanal'), description: tr('Recordatorios de los días de entrenamiento'), importance: 4, visibility: 1, vibration: true });
                // Android 12+: sin "alarmas exactas" el aviso puede llegar con minutos de atraso.
                try {
                    const exact = await LN.checkExactNotificationSetting?.();
                    if (exact && exact.exact_alarm && exact.exact_alarm !== 'granted') {
                        showActionToast(tr('Para que el aviso del descanso llegue justo a tiempo, permití las alarmas exactas.'), 'success', 9000, tr('Permitir'), () => LN.changeExactNotificationSetting?.());
                    }
                } catch (e) { /* versiones sin esta opción */ }
                return true;
            } catch (e) {
                return false;
            }
        })();
    }
    return nativeNotificationsReady;
}

async function scheduleRestEndNotification() {
    const LN = localNotifications();
    if (!LN || !restTimerInterval || !restTimerEndsAt || restTimerEndsAt - Date.now() < 1500) return;
    if (!(await ensureNativeNotifications())) return;
    try {
        await LN.cancel({ notifications: [{ id: NATIVE_REST_ID }] });
        await LN.schedule({ notifications: [{
            id: NATIVE_REST_ID,
            title: tr('⏱️ Terminó el descanso'),
            body: tr('¡Vamos! A la próxima serie'),
            channelId: 'descanso',
            schedule: { at: new Date(restTimerEndsAt), allowWhileIdle: true }
        }] });
    } catch (e) { /* sin notificación: el timer de la app sigue igual */ }
}

async function cancelRestEndNotification() {
    const LN = localNotifications();
    if (!LN) return;
    try { await LN.cancel({ notifications: [{ id: NATIVE_REST_ID }] }); } catch (e) {}
}

/** Recordatorios semanales del plan (una notificación por día, a la hora menos el aviso). */
async function syncNativePlanReminders(plan) {
    const LN = localNotifications();
    if (!LN) return;
    const ids = Array.from({ length: 7 }, (_, d) => ({ id: NATIVE_PLAN_BASE_ID + d }));
    try { await LN.cancel({ notifications: ids }); } catch (e) {}
    if (!plan || plan.isEmpty || !(await ensureNativeNotifications())) return;
    const notifications = plan.days.map(day => {
        const time = plan.timeFor(day) || DEFAULT_PLAN_TIME;
        const [h, m] = time.split(':').map(Number);
        // Restar el aviso previo, que puede caer el día anterior.
        let total = h * 60 + m - (plan.remind || 0);
        let weekday = day;
        while (total < 0) { total += 24 * 60; weekday = (weekday + 6) % 7; }
        const routine = plan.routineFor(day);
        return {
            id: NATIVE_PLAN_BASE_ID + day,
            title: tr('🏋️ Hoy toca entrenar'),
            body: routine ? `${routineLabelOf(routine)} · ${time}` : time,
            channelId: 'plan',
            // Capacitor: domingo = 1 … sábado = 7.
            schedule: { on: { weekday: weekday + 1, hour: Math.floor(total / 60), minute: total % 60 }, allowWhileIdle: true }
        };
    });
    try { await LN.schedule({ notifications }); } catch (e) {}
}

function initNativeFeatures() {
    if (!isNativeApp()) return;
    document.documentElement.classList.add('native-app');
    document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'hidden') scheduleRestEndNotification();
        else cancelRestEndNotification();
    });
    // El plan vigente, como notificaciones (se actualiza también al guardarlo).
    try { syncNativePlanReminders(getCurrentPlan()); } catch (e) {}
}
