// Backup completo en un archivo JSON: arma, valida y restaura.
//
// Formato (formatVersion 3):
// {
//   "format": "entrenamiento-tracker-backup", "formatVersion": 3,
//   "schemaVersion": 2, "exportedAt": "2026-09-28T...",
//   "data": { <cada clave de los grupos data y prefs del esquema> },
//   "recordings": { "<aviso>": { mime, duration, updatedAt, data: <audio en base64> } },
//   "photos": { "<id>": { kind, date, mime, updatedAt, data: <imagen en base64> } },
//   "workouts": [...], "bodyMetrics": [...], "customRoutines": {...}, "version": "2.0"
// }
// Las claves sueltas del final repiten datos de "data" para que una versión anterior de
// la app también pueda restaurar este archivo.
//
// Opcionalmente el archivo entero va cifrado con contraseña (js/data/backup-crypto.js).
//
// Se aceptan también los backups viejos (workouts/bodyMetrics/customRoutines sueltos): en
// ese caso solo se restauran esas claves y lo demás queda como está.

const BACKUP_FORMAT = 'entrenamiento-tracker-backup';
const BACKUP_FORMAT_VERSION = 3;

class BackupService {
    /**
     * Límites de un backup al importarlo (un archivo puede venir de cualquier lado: se revisa
     * todo antes de escribir). Holgados para un uso real de años; lo que los pasa no es un
     * backup de la app.
     */
    static LIMITS = {
        fileChars: 150 * 1024 * 1024,   // el archivo entero (las fotos van en base64)
        depth: 12,                      // anidamiento de objetos y listas
        items: 100000,                  // elementos de una lista o claves de un objeto
        textChars: 20000,               // un texto (notas, nombres, etiquetas)
        mediaCount: 1000,               // grabaciones o fotos
        mediaChars: 15 * 1024 * 1024    // una grabación o foto, en base64
    };

    // Claves que en un objeto armado a mano pueden cambiar el prototipo de otros objetos.
    static FORBIDDEN_KEYS = new Set(['__proto__', 'constructor', 'prototype']);

    /** Revisa la forma de los datos: profundidad, tamaños y claves peligrosas. */
    static checkShape(value, path = 'datos', skip = [], depth = 0) {
        const L = BackupService.LIMITS;
        if (depth > L.depth) throw new ValidationError(`El backup tiene datos demasiado anidados (${path}).`);
        if (typeof value === 'string') {
            if (value.length > L.textChars) throw new ValidationError(`El backup tiene un texto demasiado largo (${path}).`);
            return;
        }
        if (!value || typeof value !== 'object') return;
        const entries = Array.isArray(value) ? value.map((v, i) => [String(i), v]) : Object.keys(value).map(k => [k, value[k]]);
        if (entries.length > L.items) throw new ValidationError(`El backup tiene demasiados elementos (${path}).`);
        entries.forEach(([k, v]) => {
            if (BackupService.FORBIDDEN_KEYS.has(k)) throw new ValidationError(`El backup tiene una clave no permitida ("${k}").`);
            if (depth === 0 && skip.includes(k)) return;
            BackupService.checkShape(v, `${path}.${k}`, skip, depth + 1);
        });
    }

    /** Grabaciones y fotos: cantidad, tipo y tamaño de cada una. */
    static checkMedia(map, label, mimeRe) {
        if (map == null) return;
        if (typeof map !== 'object' || Array.isArray(map)) throw new ValidationError(`Las ${label} del backup no tienen el formato esperado.`);
        const L = BackupService.LIMITS;
        const ids = Object.keys(map);
        if (ids.length > L.mediaCount) throw new ValidationError(`El backup tiene demasiadas ${label}.`);
        ids.forEach(id => {
            const rec = map[id];
            if (BackupService.FORBIDDEN_KEYS.has(id) || !rec || typeof rec !== 'object') throw new ValidationError(`Hay ${label} con un formato no válido.`);
            Object.keys(rec).forEach(k => { if (BackupService.FORBIDDEN_KEYS.has(k)) throw new ValidationError(`Hay ${label} con una clave no permitida.`); });
            if (typeof rec.data !== 'string' || rec.data.length > L.mediaChars || !/^[A-Za-z0-9+/=]*$/.test(rec.data)) throw new ValidationError(`Hay ${label} dañadas o demasiado grandes.`);
            if (rec.mime != null && (typeof rec.mime !== 'string' || !mimeRe.test(rec.mime))) throw new ValidationError(`Hay ${label} de un tipo no permitido.`);
        });
    }

    constructor(store, recordings, photos = null) {
        this.store = store;
        this.recordings = recordings;
        this.photos = photos;
    }

    async build() {
        const data = this.store.snapshot(def => BACKUP_GROUPS.includes(def.group));
        let recordings = {};
        try { recordings = await this.recordings.exportAll(); } catch (e) { console.warn('Backup sin grabaciones:', e); }
        let photos = {};
        try { if (this.photos) photos = await this.photos.exportAll(); } catch (e) { console.warn('Backup sin fotos:', e); }
        return {
            format: BACKUP_FORMAT,
            formatVersion: BACKUP_FORMAT_VERSION,
            schemaVersion: parseInt(this.store.get('schemaVersion') || '1', 10),
            exportedAt: new Date().toISOString(),
            data,
            recordings,
            photos,
            // Compatibilidad con versiones anteriores de la app:
            version: '2.0',
            workouts: data.workouts || [],
            bodyMetrics: data.bodyMetrics || [],
            customRoutines: data.customRoutines || {},
            exerciseTypes: data.exerciseTypes || {},
            exerciseTimeUnits: data.exerciseTimeUnits || {}
        };
    }

    /**
     * Lee y valida un backup SIN escribir nada. Devuelve { data, recordings, schemaVersion,
     * summary } o lanza ValidationError explicando qué está mal.
     */
    parse(text) {
        if (typeof text !== 'string' || text.length > BackupService.LIMITS.fileChars) {
            throw new ValidationError('El archivo es demasiado grande para ser un backup.');
        }
        let raw;
        try { raw = JSON.parse(text); } catch (e) { throw new ValidationError('El archivo no es un JSON válido.'); }
        if (!raw || typeof raw !== 'object') throw new ValidationError('El archivo no tiene el formato de un backup.');
        BackupService.checkShape(raw.data || raw, 'datos', ['recordings', 'photos']);
        BackupService.checkMedia(raw.recordings, 'grabaciones', /^audio\//);
        BackupService.checkMedia(raw.photos, 'fotos', /^image\/(jpeg|png|webp)$/);

        let data;
        let schemaVersion = 1;
        if (raw.format === BACKUP_FORMAT && raw.data && typeof raw.data === 'object') {
            data = {};
            Object.entries(raw.data).forEach(([key, value]) => {
                const def = this.store.schema[key];
                if (def && BACKUP_GROUPS.includes(def.group)) data[key] = value;
                else console.warn(`Backup: se ignora la clave desconocida "${key}".`);
            });
            schemaVersion = parseInt(raw.schemaVersion, 10) || 1;
        } else {
            // Formato viejo: mismas reglas que tenía la restauración original.
            data = {
                workouts: raw.workouts,
                bodyMetrics: raw.bodyMetrics || [],
                customRoutines: raw.customRoutines || {},
                workoutSessions: raw.workoutSessions || []
            };
            if (raw.exerciseTypes) data.exerciseTypes = raw.exerciseTypes;
            if (raw.exerciseTimeUnits) data.exerciseTimeUnits = raw.exerciseTimeUnits;
        }

        if (!Array.isArray(data.workouts)) throw new ValidationError('Archivo no válido: falta "workouts".');
        Object.entries(data).forEach(([key, value]) => {
            try { this.store.validate(key, value); }
            catch (e) { throw new ValidationError(`El backup tiene un dato inválido en "${key}": ${e.message}`); }
        });

        const recordings = raw.recordings && typeof raw.recordings === 'object' ? raw.recordings : null;
        const photos = raw.photos && typeof raw.photos === 'object' && !Array.isArray(raw.photos) ? raw.photos : null;
        return {
            data,
            recordings,
            photos,
            schemaVersion,
            version: raw.version || '2.0',
            summary: {
                sessions: data.workouts.length,
                measurements: Array.isArray(data.bodyMetrics) ? data.bodyMetrics.length : 0,
                recordings: recordings ? Object.keys(recordings).length : 0,
                photos: photos ? Object.keys(photos).length : 0
            }
        };
    }

    /**
     * Restaura un backup ya validado. Los datos se escriben en UNA transacción (todo o nada).
     * Las grabaciones van después, en su propia transacción de IndexedDB: si fallaran, los
     * datos ya quedaron restaurados y se informa el error.
     */
    async restore(parsed) {
        this.store.transaction(tx => {
            Object.entries(parsed.data).forEach(([key, value]) => tx.set(key, value));
            tx.set('version', parsed.version);
            // Las migraciones corren al recargar según la versión de esquema del backup.
            tx.set('schemaVersion', String(parsed.schemaVersion));
        });
        let recordingsError = null;
        if (parsed.recordings) {
            try { await this.recordings.replaceAll(parsed.recordings); }
            catch (e) { recordingsError = e; console.error('No se pudieron restaurar las grabaciones:', e); }
        }
        let photosError = null;
        if (parsed.photos && this.photos) {
            try { await this.photos.replaceAll(parsed.photos); }
            catch (e) { photosError = e; console.error('No se pudieron restaurar las fotos:', e); }
        }
        return { recordingsError, photosError };
    }
}

const backupService = new BackupService(db, recordingRepo, photoRepo);
