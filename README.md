# App de entrenamiento · Inquieto SFT

App para registrar rutinas de gimnasio, series, cardio y progreso. Es una PWA: se instala en
la pantalla de inicio del celular y funciona sin conexión. Los datos quedan en el
dispositivo de cada usuario.

## Usarla

Se abre desde su dirección web. Hace falta la carpeta completa servida por un servidor
(abrir el HTML suelto no funciona).

## Desarrollo

```bash
npx serve .                          # abrir /entrenamiento_trackerv2.html
node --test "tests/**/*.test.js"     # pruebas automáticas (Node 22 o más nuevo)
```

Al agregar o renombrar un archivo JS o CSS: sumarlo a `PRECACHE_URLS` en
`service-worker.js` y subir `SW_VERSION` (las pruebas avisan si falta).

© Inquieto. Todos los derechos reservados.
