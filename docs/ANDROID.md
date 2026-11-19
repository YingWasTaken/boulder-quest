# Publicar Boulder Quest en Android

La app usa [Capacitor](https://capacitorjs.com) (MIT): el juego web se empaqueta
tal cual dentro de una app Android nativa, en la carpeta `android/`.

## Requisitos

- Android Studio (incluye el SDK de Android y Java).
- Node 22+.

## Del código a Android Studio

```bash
npm run build:android   # compila el juego en modo Android y lo copia a android/
npm run android:open    # abre el proyecto en Android Studio
```

En Android Studio: **Build ▸ Generate Signed App Bundle / APK ▸ Android App Bundle**.
Google Play pide un `.aab` firmado. Guarda la clave de firma (`.jks`) y sus
contraseñas fuera del repositorio: si la pierdes no podrás publicar
actualizaciones. Es más seguro activar la firma de apps de Google Play.

Cada nueva versión: sube `versionCode` (y `versionName`) en
`android/app/build.gradle`, y `APP_VERSION` en `src/components/SettingsModal.tsx`.

## Iconos y pantalla de inicio

Salen de `public/logo.png` sobre fondo blanco:

```bash
npm run icons           # genera assets/*.png y los iconos web
npm run assets:android  # crea los iconos y splash de Android a partir de assets/
```

## Antes de enviar a Google Play (pendiente)

1. **Desplegar la web** con estos cambios. La política de privacidad que pide
   la Play Console queda en https://boulder-quest.vercel.app/legal/privacy-es.html
   (en inglés: https://boulder-quest.vercel.app/legal/privacy-en.html).
2. **Si cambias de dominio** (por ejemplo uno propio en vez de Vercel), actualiza
   la URL en la Play Console y el párrafo «Versión web» de la política.
3. **Comprobar el nombre**: busca «Boulder Quest» en Google Play, en la OEPM
   (oepm.es) y en la EUIPO (euipo.europa.eu) para confirmar que no es una marca
   registrada de otra persona en la clase de juegos/apps.
4. **El `appId` es `com.boulderquest.app`** (en `capacitor.config.ts` y
   `android/app/build.gradle`): no se puede cambiar después de la primera subida.

## Respuestas para la Play Console

- **Seguridad de los datos**: la app *no recoge ni comparte datos*. Los nombres
  de jugador se guardan solo en el dispositivo y nunca salen de él, por lo que
  no cuentan como datos recogidos. Sin cifrado en tránsito que declarar porque
  no se transmite nada. Los usuarios pueden borrar los datos desinstalando la
  app o borrando sus datos.
- **Anuncios**: no contiene anuncios.
- **Permisos**: solo `VIBRATE` (vibración). `INTERNET` viene por defecto en
  Capacitor y solo se usa para abrir el enlace de Discord en el navegador.
- **Clasificación de contenido**: cuestionario IARC; categoría Juego, sin
  violencia, sin contenido sexual, sin apuestas, sin compras, sin chat ni
  interacción entre usuarios dentro de la app.
- **Público objetivo**: se recomienda 13+ (o 16+). Si eliges menores de 13,
  la app entra en el programa de Familias de Google, con requisitos extra.
- **Acceso a la app**: no requiere inicio de sesión.

## Recursos y derechos

Todo lo que se distribuye es propio o de licencia libre:

| Recurso | Origen | Licencia |
|---|---|---|
| Logo, textos de cartas, diseño | Propios del autor | — |
| Sonidos `click.wav`, `swipe.wav` | Sintetizados por `scripts/generate_sounds.mjs` | Propios |
| Ilustraciones de cartas y presas | SVG dibujado en código (`Hold.tsx`, `CardArt.tsx`) | Propios |
| Fuentes Bricolage Grotesque y Figtree | Fontsource | SIL OFL 1.1 |
| Iconos | Lucide | ISC |
| Librerías (React, Capacitor, framer-motion…) | npm | MIT / ISC |

Los avisos de licencia de todo el software incluido se generan en
`public/legal/licenses.html` antes de cada build (`scripts/generate_licenses.mjs`).

El modo de colores se llama «Ruleta de colores» y no «Twister», porque
Twister es una marca registrada de Hasbro.

`scripts/translate_cards.js` usa un punto de acceso no oficial de Google
Traductor, cuyo uso automatizado no permiten sus condiciones. Para nuevas
traducciones usa un servicio con licencia (por ejemplo la API oficial de Google
Cloud Translation o DeepL) o tradúcelas a mano.
