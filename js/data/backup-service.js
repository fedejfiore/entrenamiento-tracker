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
        let raw;
        try { raw = JSON.parse(text); } catch (e) { throw new ValidationError('El archivo no es un JSON válido.'); }
        if (!raw || typeof raw !== 'object') throw new ValidationError('El archivo no tiene el formato de un backup.');

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
