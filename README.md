# Tracker de Entrenamiento

App para registrar rutinas de gimnasio, series, cardio, récords y progreso, con timer de
descanso, contador de reps con voz y Tabata. Sin cuentas: los datos quedan en el
dispositivo de cada usuario y se llevan de un lado a otro con el backup JSON.

Es una PWA: se instala en la pantalla de inicio del celular y funciona sin conexión.

## Usarla

Se abre desde su dirección web (GitHub Pages u otro servidor estático). Desde que la app se
separó en varios archivos, **abrir el HTML suelto desde el celular ya no funciona**: hace
falta la carpeta completa servida por un servidor.

## Desarrollo

No hay paso de build: se editan los archivos y se recarga.

```bash
npx serve .            # o cualquier servidor estático; abrir /entrenamiento_trackerv2.html
node --test "tests/**/*.test.js"   # pruebas automáticas (Node 22 o más nuevo)
```

- Estructura, reglas para hacer cambios y garantías sobre los datos: [docs/ARQUITECTURA.md](docs/ARQUITECTURA.md)
- Formato de los datos, backup y esquema SQL propuesto: [docs/MODELO-DE-DATOS.md](docs/MODELO-DE-DATOS.md)

Al agregar o renombrar un archivo JS o CSS: sumarlo también a `PRECACHE_URLS` en
`service-worker.js` y subir `SW_VERSION` (las pruebas avisan si falta).

Los datos de entrenamiento nunca van al repo: los backups (`*.json`) están excluidos en
`.gitignore`, y las pruebas usan datos sintéticos.
