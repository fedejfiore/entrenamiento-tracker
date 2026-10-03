// App nativa: notificaciones del descanso y del plan, con un plugin de Capacitor simulado.
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { loadApp, CORE_FILES, ROOT } = require('./helpers/load-app');

const NATIVE_JS = fs.readFileSync(path.join(ROOT, 'js/features/native.js'), 'utf8');

function nativeApp({ granted = true } = {}) {
    const app = loadApp([...CORE_FILES, 'js/domain/plan.js']);
    const calls = [];
    const plugin = {
        checkPermissions: async () => ({ display: granted ? 'granted' : 'denied' }),
        requestPermissions: async () => ({ display: granted ? 'granted' : 'denied' }),
        createChannel: async ch => { calls.push(['channel', ch.id]); },
        checkExactNotificationSetting: async () => ({ exact_alarm: 'granted' }),
        schedule: async opts => { calls.push(['schedule', opts.notifications]); },
        cancel: async opts => { calls.push(['cancel', opts.notifications.map(n => n.id)]); }
    };
    const ctx = app('this');
    ctx.window = ctx;
    ctx.Capacitor = { isNativePlatform: () => true, registerPlugin: () => plugin };
    ctx.tr = t => t;
    ctx.showActionToast = () => {};
    ctx.routineLabelOf = key => `Rutina ${key}`;
    ctx.restTimerInterval = null;
    ctx.restTimerEndsAt = null;
    app(NATIVE_JS);
    return { app, ctx, calls };
}

test('en la web no hace nada', () => {
    const app = loadApp([...CORE_FILES, 'js/domain/plan.js']);
    const ctx = app('this');
    ctx.window = ctx;
    app(NATIVE_JS);
    assert.equal(app('isNativeApp()'), false);
    assert.equal(app('localNotifications()'), null);
});

test('con un descanso corriendo, programa el aviso para el momento exacto en que termina', async () => {
    const { app, ctx, calls } = nativeApp();
    const endsAt = Date.now() + 90000;
    ctx.restTimerInterval = 1;
    ctx.restTimerEndsAt = endsAt;
    await app('scheduleRestEndNotification()');
    const [, notifications] = calls.find(c => c[0] === 'schedule');
    assert.equal(notifications.length, 1);
    assert.equal(notifications[0].id, 1001);
    assert.equal(notifications[0].schedule.at.getTime(), endsAt);
    assert.equal(notifications[0].channelId, 'descanso');
});

test('sin descanso, o si está por terminar, no programa nada', async () => {
    const { app, ctx, calls } = nativeApp();
    await app('scheduleRestEndNotification()');
    ctx.restTimerInterval = 1;
    ctx.restTimerEndsAt = Date.now() + 500;
    await app('scheduleRestEndNotification()');
    assert.equal(calls.filter(c => c[0] === 'schedule').length, 0);
});

test('sin permiso de notificaciones no programa nada', async () => {
    const { app, ctx, calls } = nativeApp({ granted: false });
    ctx.restTimerInterval = 1;
    ctx.restTimerEndsAt = Date.now() + 60000;
    await app('scheduleRestEndNotification()');
    assert.equal(calls.filter(c => c[0] === 'schedule').length, 0);
});

test('el plan genera un aviso semanal por día, restando el aviso previo', async () => {
    const { app, calls } = nativeApp();
    // Lunes 19:00 con rutina, domingo 00:15 (el aviso de 30 min cae el sábado).
    await app(`syncNativePlanReminders(new TrainingPlan({ days: [1, 0], times: { 1: '19:00', 0: '00:15' }, remind: 30, routines: { 1: 'torsoA' } }))`);
    const [, notifications] = calls.find(c => c[0] === 'schedule');
    const byId = Object.fromEntries(notifications.map(n => [n.id, n]));
    assert.deepEqual({ ...byId[2001].schedule.on }, { weekday: 2, hour: 18, minute: 30 });
    assert.equal(byId[2001].body, 'Rutina torsoA · 19:00');
    assert.deepEqual({ ...byId[2000].schedule.on }, { weekday: 7, hour: 23, minute: 45 });
    // Antes de programar, borra los avisos anteriores de los 7 días.
    assert.deepEqual([...calls.find(c => c[0] === 'cancel')[1]], [2000, 2001, 2002, 2003, 2004, 2005, 2006]);
});

test('un plan vacío solo borra los avisos', async () => {
    const { app, calls } = nativeApp();
    await app('syncNativePlanReminders(new TrainingPlan({ days: [] }))');
    assert.equal(calls.filter(c => c[0] === 'schedule').length, 0);
    assert.equal(calls.filter(c => c[0] === 'cancel').length, 1);
});
