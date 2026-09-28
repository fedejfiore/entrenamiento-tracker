// Grabaciones de voz: viven en IndexedDB (localStorage no sirve para audio: es solo texto
// y tiene poco espacio). IndexedDB ya es transaccional: cada operación de acá es atómica.
// Se guarda ArrayBuffer + tipo (no Blob): es lo más compatible, incluido iPhone.
//
// Registro guardado: { id, mime, duration (s), updatedAt (ms), data: ArrayBuffer }

class RecordingRepository {
    constructor(dbName = 'entrenamientoAudio', storeName = 'recordings') {
        this.dbName = dbName;
        this.storeName = storeName;
    }

    get supported() { return typeof indexedDB !== 'undefined'; }

    open() {
        return new Promise((resolve, reject) => {
            if (!this.supported) { reject(new StorageError('Este navegador no tiene IndexedDB.')); return; }
            const req = indexedDB.open(this.dbName, 1);
            req.onupgradeneeded = () => req.result.createObjectStore(this.storeName, { keyPath: 'id' });
            req.onsuccess = () => resolve(req.result);
            req.onerror = () => reject(req.error);
        });
    }

    /** Ejecuta work(objectStore) en una transacción; resuelve cuando se confirmó. */
    async transaction(mode, work) {
        const idb = await this.open();
        return new Promise((resolve, reject) => {
            const tx = idb.transaction(this.storeName, mode);
            const req = work(tx.objectStore(this.storeName));
            tx.oncomplete = () => { idb.close(); resolve(req ? req.result : undefined); };
            tx.onerror = () => { idb.close(); reject(tx.error); };
            tx.onabort = () => { idb.close(); reject(tx.error || new StorageError('Transacción cancelada')); };
        });
    }

    async all() { return (await this.transaction('readonly', s => s.getAll())) || []; }

    put(record) { return this.transaction('readwrite', s => s.put(record)); }

    delete(id) { return this.transaction('readwrite', s => s.delete(id)); }

    clear() { return this.transaction('readwrite', s => s.clear()); }

    /** { id: { mime, duration, updatedAt, data: base64 } } — formato del backup JSON. */
    async exportAll() {
        const out = {};
        (await this.all()).forEach(rec => {
            out[rec.id] = { mime: rec.mime, duration: rec.duration, updatedAt: rec.updatedAt, data: arrayBufferToBase64(rec.data) };
        });
        return out;
    }

    /** Reemplaza todas las grabaciones en UNA transacción: o quedan todas las nuevas o ninguna. */
    replaceAll(exported) {
        const records = Object.entries(exported || {})
            .filter(([, rec]) => rec && typeof rec.data === 'string')
            .map(([id, rec]) => ({ id, mime: rec.mime, duration: rec.duration, updatedAt: rec.updatedAt || Date.now(), data: base64ToArrayBuffer(rec.data) }));
        return this.transaction('readwrite', s => {
            s.clear();
            records.forEach(r => s.put(r));
        });
    }
}

const recordingRepo = new RecordingRepository();
