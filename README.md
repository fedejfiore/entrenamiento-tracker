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
- Plan para pasar a app nativa (Android/iOS) manteniendo la web: [docs/MIGRACION-NATIVA.md](docs/MIGRACION-NATIVA.md)
- Diseño del modo entrenador (panel para gestionar alumnos): [docs/MODO-ENTRENADOR.md](docs/MODO-ENTRENADOR.md)
- Servidor propio (VPS + Docker + PostgreSQL) y sincronización sin internet primero: [docs/SERVIDOR-Y-SINCRONIZACION.md](docs/SERVIDOR-Y-SINCRONIZACION.md)
- Decisiones de producto, plan gratis/Pro, cuentas, sin internet, programas, IA e idiomas: [docs/HOJA-DE-RUTA.md](docs/HOJA-DE-RUTA.md)
- Gamificación (florcita, mascota o personaje, trofeos e insignias): [docs/GAMIFICACION.md](docs/GAMIFICACION.md)
- Costos, ROI y escenarios del negocio: [docs/ANALISIS-FINANCIERO.md](docs/ANALISIS-FINANCIERO.md) (modelo en `tools/modelo-financiero.js`)
- Usabilidad y accesibilidad: [docs/UX-UI.md](docs/UX-UI.md)
- Prototipo del personaje y la florcita: `docs/prototipos/personaje.html` (abrir en el navegador)
- Tutorial para el usuario: dentro de la app, Ajustes → Ayuda (contenido en `js/features/help.js`)

Al agregar o renombrar un archivo JS o CSS: sumarlo también a `PRECACHE_URLS` en
`service-worker.js` y subir `SW_VERSION` (las pruebas avisan si falta).

Los datos de entrenamiento nunca van al repo: los backups (`*.json`) están excluidos en
`.gitignore`, y las pruebas usan datos sintéticos.
