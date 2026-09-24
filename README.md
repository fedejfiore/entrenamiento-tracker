# Tracker de Entrenamiento

App de un solo archivo HTML para registrar rutinas de gimnasio, series, PRs y progreso — sin backend, sin cuentas: todo se guarda en el `localStorage` del navegador donde la abras.

Pensada como PWA instalable: se puede agregar a la pantalla de inicio del celular y funciona offline.

## Desarrollo

Es un único HTML (`entrenamiento_trackerv2.html`) + `manifest.json` + `service-worker.js`. No hay build: cualquier servidor estático sirve.

Los datos de entrenamiento nunca viven en este repo — quedan en el dispositivo de cada usuario.
