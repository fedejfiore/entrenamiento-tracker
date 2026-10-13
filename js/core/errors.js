// Manejo de errores: que un fallo en una parte no tumbe el resto de la app.
//  - Captura lo no previsto (errores de la página y promesas rechazadas sin atender).
//  - Protege cada paso del arranque y cada acción: si uno falla, los demás siguen.
//  - Avisa con un mensaje amable (sin detalles técnicos y sin repetir avisos seguidos) y
//    guarda los últimos errores para el reporte de fallas (Ajustes → Ayuda).
// Los errores esperables (validación, guardado) se siguen manejando donde ocurren, con su
// mensaje propio; esto es la red de seguridad para lo inesperado.
// Script clásico (no módulo): comparte el ámbito global con el resto de la app.

class ErrorReporter {
    /**
     * @param {object} opts
     * @param {(message: string) => void} [opts.notify] cómo avisar a la persona
     * @param {number} [opts.max] cuántos errores recientes se guardan
     * @param {number} [opts.quietMs] tiempo mínimo entre avisos
     * @param {() => number} [opts.now] reloj (para las pruebas)
     */
    constructor({ notify = null, max = 20, quietMs = 8000, now = () => Date.now() } = {}) {
        this.notify = notify;
        this.max = max;
        this.quietMs = quietMs;
        this.now = now;
        this.recent = [];
        this.lastNotifiedAt = -Infinity;
    }

    /** Anota un error y, si hace rato que no se avisa, avisa. Nunca lanza. */
    capture(error, context = '') {
        try {
            const entry = {
                at: new Date(this.now()).toISOString(),
                context: String(context || ''),
                message: ErrorReporter.messageOf(error)
            };
            this.recent.push(entry);
            if (this.recent.length > this.max) this.recent.shift();
            if (typeof console !== 'undefined') console.error(`[${entry.context || 'app'}]`, error);
            if (this.notify && this.now() - this.lastNotifiedAt >= this.quietMs) {
                this.lastNotifiedAt = this.now();
                this.notify('Algo falló, pero tus datos están a salvo. Si se repite, contanos desde Ajustes → Ayuda.');
            }
            return entry;
        } catch (e) {
            return null; // el manejador de errores no puede fallar
        }
    }

    /** Ejecuta fn protegida: si lanza (o su promesa se rechaza), se captura y devuelve fallback. */
    run(fn, context = '', fallback = undefined) {
        try {
            const out = fn();
            if (out && typeof out.then === 'function') {
                return out.catch(err => { this.capture(err, context); return fallback; });
            }
            return out;
        } catch (err) {
            this.capture(err, context);
            return fallback;
        }
    }

    /** Devuelve una versión protegida de fn (para manejadores de eventos). */
    guard(fn, context = '') {
        const self = this;
        return function guarded(...args) { return self.run(() => fn.apply(this, args), context); };
    }

    /** El último error, como texto (para el reporte de fallas). */
    lastMessage() {
        const e = this.recent[this.recent.length - 1];
        return e ? `${e.message}${e.context ? ` (${e.context})` : ''}` : null;
    }

    /** Escucha los errores no atendidos de la página. */
    install(target) {
        target.addEventListener('error', e => {
            // Errores de recursos (una imagen que no carga) no son fallas de la app.
            if (!e.error && !e.message) return;
            this.capture(e.error || e.message, e.filename ? `${e.filename.split('/').pop()}:${e.lineno || '?'}` : 'página');
        });
        target.addEventListener('unhandledrejection', e => this.capture(e.reason, 'promesa'));
        return this;
    }

    static messageOf(error) {
        if (!error) return 'Error desconocido';
        if (typeof error === 'string') return error.slice(0, 300);
        return String(error.message || error.name || error).slice(0, 300);
    }
}

const appErrors = new ErrorReporter({
    notify: message => { if (typeof showToast === 'function') showToast(message, 'error', 5000); }
});
if (typeof window !== 'undefined') appErrors.install(window);
