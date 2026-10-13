// App nativa: notificaciones del descanso y del plan, con un plugin de Capacitor simulado.
const test = require('node:test');
const assert = require('node:assert/strict');
const { loadApp, CORE_FILES } = require('./helpers/load-app');

// La clase recibe todo por constructor: el plugin, el timer y los textos son de prueba.
function nativeApp({ granted = true, native = true } = {}) {
    const app = loadApp([...CORE_FILES, 'js/domain/plan.js', 'js/core/native-notifications.js']);
    const calls = [];
    const plugin = {
        checkPermissions: async () => ({ display: granted ? 'granted' : 'denied' }),
        requestPermissions: async () => ({ display: granted ? 'granted' : 'denied' }),
        createChannel: async ch => { calls.push(['channel', ch.id]); },
        checkExactNotificationSetting: async () => ({ exact_alarm: 'granted' }),
        schedule: async opts => { calls.push(['schedule', opts.notifications]); },
        cancel: async opts => { calls.push(['cancel', opts.notifications.map(n => n.id)]); }
    };
    const timer = { running: false, endsAt: null };
    const notes = app('(deps) => new NativeNotifications(deps)')({
        capacitor: () => (native ? { isNativePlatform: () => true, registerPlugin: () => plugin } : undefined),
        restTimer: () => timer,
        routineLabel: key => `Rutina ${key}`,
        tr: t => t,
        actionToast: () => {},
        defaultPlanTime: '19:00'
    });
    return { app, notes, timer, calls };
}

test('en la web no hace nada', () => {
    const { notes } = nativeApp({ native: false });
    assert.equal(notes.isNative(), false);
    assert.equal(notes.local(), null);
});

test('con un descanso corriendo, programa el aviso para el momento exacto en que termina', async () => {
    const { notes, timer, calls } = nativeApp();
    const endsAt = Date.now() + 90000;
    timer.running = true;
    timer.endsAt = endsAt;
    await notes.scheduleRestEnd();
    const [, notifications] = calls.find(c => c[0] === 'schedule');
    assert.equal(notifications.length, 1);
    assert.equal(notifications[0].id, 1001);
    assert.equal(notifications[0].schedule.at.getTime(), endsAt);
    assert.equal(notifications[0].channelId, 'descanso');
});

test('sin descanso, o si está por terminar, no programa nada', async () => {
    const { notes, timer, calls } = nativeApp();
    await notes.scheduleRestEnd();
    timer.running = true;
    timer.endsAt = Date.now() + 500;
    await notes.scheduleRestEnd();
    assert.equal(calls.filter(c => c[0] === 'schedule').length, 0);
});

test('sin permiso de notificaciones no programa nada', async () => {
    const { notes, timer, calls } = nativeApp({ granted: false });
    timer.running = true;
    timer.endsAt = Date.now() + 60000;
    await notes.scheduleRestEnd();
    assert.equal(calls.filter(c => c[0] === 'schedule').length, 0);
});

test('el plan genera un aviso semanal por día, restando el aviso previo', async () => {
    const { app, notes, calls } = nativeApp();
    // Lunes 19:00 con rutina, domingo 00:15 (el aviso de 30 min cae el sábado).
    await notes.syncPlan(app(`new TrainingPlan({ days: [1, 0], times: { 1: '19:00', 0: '00:15' }, remind: 30, routines: { 1: 'torsoA' } })`));
    const [, notifications] = calls.find(c => c[0] === 'schedule');
    const byId = Object.fromEntries(notifications.map(n => [n.id, n]));
    assert.deepEqual({ ...byId[2001].schedule.on }, { weekday: 2, hour: 18, minute: 30 });
    assert.equal(byId[2001].body, 'Rutina torsoA · 19:00');
    assert.deepEqual({ ...byId[2000].schedule.on }, { weekday: 7, hour: 23, minute: 45 });
    // Antes de programar, borra los avisos anteriores de los 7 días.
    assert.deepEqual([...calls.find(c => c[0] === 'cancel')[1]], [2000, 2001, 2002, 2003, 2004, 2005, 2006]);
});

test('un plan vacío solo borra los avisos', async () => {
    const { app, notes, calls } = nativeApp();
    await notes.syncPlan(app('new TrainingPlan({ days: [] })'));
    assert.equal(calls.filter(c => c[0] === 'schedule').length, 0);
    assert.equal(calls.filter(c => c[0] === 'cancel').length, 1);
});
