# Carpeta de descargas

El APK se distribuye directamente desde GitHub Releases:

https://github.com/cflopez1193/deuda-clara-web/releases/download/v1.0.0/deuda-clara.apk

La landing configura `apkUrl` con esa URL absoluta y `apkAvailable: true`.

## Si necesitas regenerar el APK

1. Construir con EAS: `npx eas-cli@latest build --platform android --profile preview`
2. Subir el APK a una nueva Release de GitHub
3. Actualizar `apkUrl`, `apkSize` y `sha256` en `site-config.js`
4. Hacer push y redeploy en Vercel

Mientras no haya un APK disponible, la landing muestra **"APK en preparación"**.
