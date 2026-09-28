// Backup protegido con contraseña (opcional). El backup puede llevar datos sensibles
// (medidas corporales, fotos de progreso, notas): con contraseña, el archivo no se puede
// leer aunque se pierda o se comparta por error.
//
// - Clave: PBKDF2-SHA256 con 600.000 iteraciones y sal aleatoria de 16 bytes (recomendación
//   de OWASP 2023+ para PBKDF2-SHA256).
// - Cifrado: AES-GCM de 256 bits con IV aleatorio de 12 bytes. GCM además detecta si el
//   archivo fue modificado (si alguien lo toca, no se puede abrir).
// - Todo con la Web Crypto API del navegador: la contraseña nunca sale del dispositivo ni se
//   guarda. Si se olvida, el backup no se puede recuperar (no hay "puerta trasera").
//
// Formato: { format, formatVersion, kdf: { name, hash, iterations, salt }, cipher: { name, iv }, data }
// Script clásico (no módulo): comparte el ámbito global con el resto de la app.

const ENCRYPTED_BACKUP_FORMAT = 'entrenamiento-tracker-backup-encrypted';
const BACKUP_KDF_ITERATIONS = 600000;

function isEncryptedBackup(obj) {
    return !!obj && typeof obj === 'object' && obj.format === ENCRYPTED_BACKUP_FORMAT;
}

async function deriveBackupKey(password, salt, iterations) {
    const material = await crypto.subtle.importKey('raw', new TextEncoder().encode(password), 'PBKDF2', false, ['deriveKey']);
    return crypto.subtle.deriveKey(
        { name: 'PBKDF2', hash: 'SHA-256', salt, iterations },
        material,
        { name: 'AES-GCM', length: 256 },
        false,
        ['encrypt', 'decrypt']
    );
}

/** Texto del backup → texto JSON cifrado con la contraseña. */
async function encryptBackupText(text, password, iterations = BACKUP_KDF_ITERATIONS) {
    if (!password || password.length < 8) throw new ValidationError('La contraseña tiene que tener al menos 8 caracteres.');
    const salt = crypto.getRandomValues(new Uint8Array(16));
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const key = await deriveBackupKey(password, salt, iterations);
    const cipher = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, new TextEncoder().encode(text));
    return JSON.stringify({
        format: ENCRYPTED_BACKUP_FORMAT,
        formatVersion: 1,
        kdf: { name: 'PBKDF2', hash: 'SHA-256', iterations, salt: arrayBufferToBase64(salt.buffer) },
        cipher: { name: 'AES-GCM', iv: arrayBufferToBase64(iv.buffer) },
        data: arrayBufferToBase64(cipher)
    });
}

/** Backup cifrado (objeto ya parseado) → texto original, o ValidationError si la contraseña no es la correcta. */
async function decryptBackupText(obj, password) {
    if (!isEncryptedBackup(obj) || obj.formatVersion !== 1 || !obj.kdf || !obj.cipher || typeof obj.data !== 'string') {
        throw new ValidationError('El archivo cifrado no tiene un formato válido.');
    }
    const iterations = Number(obj.kdf.iterations);
    if (obj.kdf.name !== 'PBKDF2' || obj.kdf.hash !== 'SHA-256' || obj.cipher.name !== 'AES-GCM' || !(iterations >= 100000 && iterations <= 10000000)) {
        throw new ValidationError('El archivo cifrado usa un método que esta versión no conoce.');
    }
    try {
        const key = await deriveBackupKey(password || '', new Uint8Array(base64ToArrayBuffer(obj.kdf.salt)), iterations);
        const plain = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: new Uint8Array(base64ToArrayBuffer(obj.cipher.iv)) }, key, base64ToArrayBuffer(obj.data));
        return new TextDecoder().decode(plain);
    } catch (e) {
        throw new ValidationError('La contraseña no es correcta o el archivo fue modificado.');
    }
}
