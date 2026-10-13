// Notificaciones de la app nativa (Android con Capacitor). En la web no hace nada.
//  - Descanso con la pantalla bloqueada: si la app pasa a segundo plano (pantalla apagada, otra
//    app) con un descanso corriendo, se programa una notificación del sistema para el momento
//    exacto en que termina. Si la persona vuelve antes, se cancela (adentro de la app ya suena).
//  - Recordatorios del plan semanal como notificaciones propias (sin pasar por el calendario).
// No conoce ninguna pantalla: todo lo que necesita lo recibe por constructor.

export class NativeNotifications {
    static REST_ID = 1001;
    static PLAN_BASE_ID = 2000;

    /**
     * @param {object} deps
     *   capacitor()        el objeto Capacitor (o undefined en la web)
     *   restTimer()        { running, endsAt } del descanso en curso
     *   routineLabel(key)  nombre de una rutina
     *   tr(text)           traducción
     *   actionToast(text, type, ms, actionLabel, action)
     *   defaultPlanTime    hora si el plan no tiene una
     */
    constructor(deps) {
        this.deps = deps;
        this.plugin = null;
        this.ready = null;
    }

    isNative() {
        const C = this.deps.capacitor();
        return !!(C && typeof C.isNativePlatform === 'function' && C.isNativePlatform());
    }

    local() {
        if (!this.isNative()) return null;
        if (!this.plugin) this.plugin = this.deps.capacitor().registerPlugin('LocalNotifications');
        return this.plugin;
    }

    /** Pide permiso una vez y crea los canales (sonido y vibración). Devuelve true si hay permiso. */
    async ensure() {
        const LN = this.local();
        if (!LN) return false;
        const { tr } = this.deps;
        if (!this.ready) {
            this.ready = (async () => {
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
                            this.deps.actionToast(tr('Para que el aviso del descanso llegue justo a tiempo, permití las alarmas exactas.'), 'success', 9000, tr('Permitir'), () => LN.changeExactNotificationSetting?.());
                        }
                    } catch (e) { /* versiones sin esta opción */ }
                    return true;
                } catch (e) {
                    return false;
                }
            })();
        }
        return this.ready;
    }

    async scheduleRestEnd() {
        const LN = this.local();
        const { running, endsAt } = this.deps.restTimer();
        if (!LN || !running || !endsAt || endsAt - Date.now() < 1500) return;
        if (!(await this.ensure())) return;
        const { tr } = this.deps;
        try {
            await LN.cancel({ notifications: [{ id: NativeNotifications.REST_ID }] });
            await LN.schedule({ notifications: [{
                id: NativeNotifications.REST_ID,
                title: tr('⏱️ Terminó el descanso'),
                body: tr('¡Vamos! A la próxima serie'),
                channelId: 'descanso',
                schedule: { at: new Date(endsAt), allowWhileIdle: true }
            }] });
        } catch (e) { /* sin notificación: el timer de la app sigue igual */ }
    }

    async cancelRestEnd() {
        const LN = this.local();
        if (!LN) return;
        try { await LN.cancel({ notifications: [{ id: NativeNotifications.REST_ID }] }); } catch (e) {}
    }

    /** Recordatorios semanales del plan (una notificación por día, a la hora menos el aviso). */
    async syncPlan(plan) {
        const LN = this.local();
        if (!LN) return;
        const ids = Array.from({ length: 7 }, (_, d) => ({ id: NativeNotifications.PLAN_BASE_ID + d }));
        try { await LN.cancel({ notifications: ids }); } catch (e) {}
        if (!plan || plan.isEmpty || !(await this.ensure())) return;
        const { tr, routineLabel, defaultPlanTime } = this.deps;
        const notifications = plan.days.map(day => {
            const time = plan.timeFor(day) || defaultPlanTime;
            const [h, m] = time.split(':').map(Number);
            // Restar el aviso previo, que puede caer el día anterior.
            let total = h * 60 + m - (plan.remind || 0);
            let weekday = day;
            while (total < 0) { total += 24 * 60; weekday = (weekday + 6) % 7; }
            const routine = plan.routineFor(day);
            return {
                id: NativeNotifications.PLAN_BASE_ID + day,
                title: tr('🏋️ Hoy toca entrenar'),
                body: routine ? `${routineLabel(routine)} · ${time}` : time,
                channelId: 'plan',
                // Capacitor: domingo = 1 … sábado = 7.
                schedule: { on: { weekday: weekday + 1, hour: Math.floor(total / 60), minute: total % 60 }, allowWhileIdle: true }
            };
        });
        try { await LN.schedule({ notifications }); } catch (e) {}
    }
}
