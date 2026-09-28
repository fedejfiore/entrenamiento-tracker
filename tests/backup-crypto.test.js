// Backup protegido con contraseña: ida y vuelta, contraseña incorrecta y archivo modificado.
const test = require('node:test');
const assert = require('node:assert/strict');
const { loadApp, CORE_FILES } = require('./helpers/load-app');

const app = loadApp([...CORE_FILES, 'js/data/backup-crypto.js']);
const encrypt = app('encryptBackupText');
const decrypt = app('decryptBackupText');
const isEncrypted = app('isEncryptedBackup');
const FAST = 100000; // menos iteraciones solo para que la prueba sea rápida

test('ida y vuelta con la contraseña correcta (con tildes y emojis)', async () => {
    const text = JSON.stringify({ workouts: [{ note: 'Pierna 🔥 — sentadilla búlgara' }] });
    const enc = await encrypt(text, 'contraseña segura', FAST);
    const obj = JSON.parse(enc);
    assert.ok(isEncrypted(obj));
    assert.ok(!enc.includes('búlgara'), 'el contenido no queda legible');
    assert.equal(await decrypt(obj, 'contraseña segura'), text);
});

test('contraseña incorrecta o archivo modificado: no se abre', async () => {
    const obj = JSON.parse(await encrypt('{"a":1}', 'correcta123', FAST));
    await assert.rejects(decrypt(obj, 'incorrecta1'), /no es correcta/);
    const tampered = { ...obj, data: obj.data.slice(0, -4) + (obj.data.endsWith('AAAA') ? 'BBBB' : 'AAAA') };
    await assert.rejects(decrypt(tampered, 'correcta123'), /no es correcta o el archivo fue modificado/);
});

test('cada backup usa sal e IV distintos; contraseña corta se rechaza', async () => {
    const a = JSON.parse(await encrypt('x', 'misma clave', FAST));
    const b = JSON.parse(await encrypt('x', 'misma clave', FAST));
    assert.notEqual(a.kdf.salt, b.kdf.salt);
    assert.notEqual(a.cipher.iv, b.cipher.iv);
    await assert.rejects(encrypt('x', 'corta'), /al menos 8/);
});

test('parámetros raros en el archivo se rechazan', async () => {
    const obj = JSON.parse(await encrypt('x', 'clave larga', FAST));
    await assert.rejects(decrypt({ ...obj, kdf: { ...obj.kdf, iterations: 10 } }, 'clave larga'), /método/);
    await assert.rejects(decrypt({ ...obj, formatVersion: 9 }, 'clave larga'), /formato/);
});
