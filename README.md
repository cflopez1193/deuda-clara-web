# Deuda Clara — landing

Sitio estático de una sola página para presentar **Deuda Clara**, la app Android
local-first de finanzas personales, y ofrecer la descarga del APK comprimido.

- HTML, CSS y JavaScript sin dependencias ni paso de compilación.
- Tipografías autoalojadas (Manrope e Instrument Serif, licencias OFL incluidas).
- Modo claro/oscuro automático, con preferencia guardada en `localStorage`.
- Diseño responsive y accesible (navegación por teclado, `aria`, foco visible).
- Comprobación automática de que el ZIP existe antes de habilitar la descarga.
- Listo para Vercel Hobby o cualquier hosting estático.

## Vista local

Requiere Node.js 20 o superior.

```bash
cd deuda-clara-web
npm run dev
```

Abre `http://localhost:4173`. El servidor no tiene dependencias: solo usa los
módulos nativos de Node. También entiende URLs limpias como `/privacidad`.

Para probar el estado real de descarga, coloca el ZIP en
`descargas/deuda-clara.apk.zip`. Sin ese archivo, el botón muestra **“APK en
preparación”**, que es el comportamiento esperado.

## Estructura

```text
deuda-clara-web/
├── index.html              Página principal
├── privacidad.html         Política de privacidad
├── styles.css              Diseño completo, claro/oscuro y responsive
├── app.js                  Tema, menú, FAQ y comprobación del APK
├── site-config.js          ← configuración editable
├── server.mjs              Preview local sin dependencias
├── vercel.json             URLs limpias y cabeceras de seguridad
├── site.webmanifest        Iconos y metadatos PWA
├── robots.txt
├── assets/                 Iconos y tipografías (OFL)
└── descargas/              Aquí va deuda-clara.apk.zip
```

## Configuración (`site-config.js`)

| Campo | Para qué sirve |
| --- | --- |
| `version` | Versión que se muestra en la página. |
| `apkUrl` | Ruta del ZIP (`descargas/...`) o URL absoluta de un GitHub Release. |
| `apkAvailable` | `"auto"` comprueba con HEAD; `true` fuerza la descarga; `false` muestra “en preparación”. |
| `apkSize` | Opcional. Bytes o texto (`"12,4 MB"`). Si se omite, se usa el `Content-Length`. |
| `sha256` | Opcional. Si existe, aparece un desplegable con la suma. |
| `contactEmail` | Correo de soporte/privacidad. **Configúralo antes de publicar.** Si queda vacío, los bloques de contacto se ocultan. |

### Importante: correo de contacto

La política de privacidad menciona un canal de contacto. Antes de hacer pública
la landing, coloca un correo real en `contactEmail`. El enlace del pie y el
bloque de la política se mostrarán automáticamente.

## Preparar el APK

El APK se genera desde el proyecto móvil (`../AppDeudas`), no desde esta carpeta.

```bash
cd ../AppDeudas
npx eas-cli@latest build --platform android --profile preview
```

El perfil `preview` de `eas.json` genera un APK instalable (no un AAB). Cuando
termine la build, descarga el archivo y comprímelo con el nombre exacto que
espera la landing:

```bash
cd ../deuda-clara-web/descargas
cp /ruta/descargada/deuda-clara.apk .
zip -9 deuda-clara.apk.zip deuda-clara.apk
rm deuda-clara.apk
ls -lh deuda-clara.apk.zip
sha256sum deuda-clara.apk.zip
```

El ZIP debe contener el APK en la raíz. La landing espera este nombre:

```text
descargas/deuda-clara.apk.zip
```

Si cambias el nombre o la ruta, actualiza `apkUrl` en `site-config.js`.

Opcionalmente pega el resultado de `sha256sum` en `sha256` para mostrar la
verificación, y el tamaño en `apkSize` si quieres mostrarlo sin depender de la
cabecera del servidor.

Recuerda que las variables de Supabase (`EXPO_PUBLIC_SUPABASE_URL` y
`EXPO_PUBLIC_SUPABASE_ANON_KEY`) deben estar configuradas en EAS para el perfil
`preview`; de lo contrario el APK mostrará la pantalla de configuración.

## Dónde alojar el ZIP

### Opción A: en el mismo sitio de Vercel

Funciona si el ZIP pesa **menos de 100 MB**, el límite vigente de archivos
estáticos del plan Hobby. Revisa los límites actuales en
<https://vercel.com/docs/limits> antes de publicar.

- Coloca el ZIP en `descargas/`.
- Deja `apkUrl` como está y `apkAvailable: "auto"`.
- Despliega. La comprobación HEAD encontrará el archivo y habilitará el botón.

Un ZIP de APK de Expo suele estar muy por debajo de ese límite.

### Opción B: GitHub Releases

Úsala si el ZIP supera el límite de Vercel, si no quieres incluirlo en el
repositorio o si prefieres separar el código de la descarga.

1. Crea un repositorio en GitHub (puede ser privado o público).
2. En **Releases**, publica una release y adjunta el ZIP como asset.
3. Copia la URL del asset. Debe ser una URL de descarga directa.
4. En `site-config.js`:

```js
apkUrl: "https://github.com/tu-usuario/tu-repo/releases/download/v1.0.0/deuda-clara.apk.zip",
apkAvailable: true,
```

> GitHub muestra advertencia para archivos de más de 50 MB y bloquea archivos
> de más de 100 MB en el repositorio Git. Los assets de una Release tienen un
> límite distinto y mayor. Para ficheros grandes, usa Releases, no el commit.

Con una URL externa, la comprobación HEAD puede fallar por CORS. Por eso se
recomienda `apkAvailable: true`: la landing muestra la descarga sin intentar
verificar el archivo desde el navegador.

## Desplegar en Vercel

### CLI (sin configurar Git)

```bash
cd deuda-clara-web
npx vercel@latest
```

- Inicia sesión con GitHub, GitLab o tu correo.
- Framework preset: **Other**.
- Build command: vacío.
- Output directory: `.` (esta carpeta).
- No hay variables de entorno ni funciones serverless.

Para publicar en producción:

```bash
npx vercel@latest --prod
```

También puedes importar la carpeta en el panel de Vercel, o subirla con
**Add New → Project** si la tienes en un repositorio. Al no haber build, Vercel
sirve los archivos tal cual.

### Git + Vercel

Si prefieres el flujo automático:

```bash
cd deuda-clara-web
git init
git add .
git commit -m "Landing de Deuda Clara"
git branch -M main
git remote add origin https://github.com/tu-usuario/deuda-clara-web.git
git push -u origin main
```

Luego importa el repositorio en Vercel. Cada push a `main` redepliega. El ZIP
debe estar versionado o alojado en una Release; revisa el límite de 100 MB de
Git y de Vercel.

## Después de desplegar

1. Abre la URL `*.vercel.app` y revisa portada, menú móvil, tema y descarga.
2. Comprueba que el botón muestra “Listo para descargar”. Si muestra “APK en
   preparación”, el ZIP no está en la ruta o el HEAD falla.
3. Descarga el ZIP, extráelo e instálalo en un Android real. Verifica que el
   primer acceso por código funcione y que luego la app abra sin internet.
4. Define `contactEmail` y vuelve a desplegar.
5. Actualiza `og:image` a una URL absoluta (`https://tu-dominio.vercel.app/assets/icon-512.png`)
   si vas a compartir el enlace en WhatsApp o redes.
6. Revisa que la fecha de “Última actualización” de `privacidad.html` siga
   vigente.
7. Opcional: conecta un dominio propio desde **Project → Settings → Domains**.
   El subdominio `*.vercel.app` es gratuito; un dominio personalizado cuesta
   aparte.
8. No necesitas configurar redirects de Supabase para la landing: la app usa
   códigos OTP, no enlaces mágicos.

## Verificaciones rápidas

```bash
node --check app.js
node --check site-config.js
node --check server.mjs
```

Con el servidor local:

```bash
curl -I http://localhost:4173/
curl -I http://localhost:4173/privacidad
curl -I http://localhost:4173/descargas/deuda-clara.apk.zip
```

Las dos primeras deben devolver `200`. La tercera devuelve `200` solo cuando el
ZIP existe.

## Notas de contenido y privacidad

- La maqueta del teléfono es una ilustración hecha con HTML/CSS; los montos y
  el nombre son ejemplos, no una captura de una cuenta real.
- No se afirman conexiones bancarias, ahorros garantizados ni asesoría
  financiera regulada.
- El sitio no usa analítica, cookies de rastreo ni fuentes externas.
- La política de privacidad asume que los datos financieros siguen siendo
  locales. Si más adelante agregas sincronización o el espacio **Hogar**,
  actualiza la política y la landing antes de activarlo.
- Revisa la política con un profesional si vas a operar comercialmente en
  Colombia. La mención de la Ley 1581 de 2012 y la SIC es informativa.
- Las tipografías incluidas son OFL; conserva los archivos de licencia en
  `assets/fonts/`.

## Licencia

El código de la landing se distribuye bajo la licencia del proyecto Deuda
Clara. Las tipografías tienen sus propias licencias OFL, incluidas en
`assets/fonts/`.
# deployment trigger
