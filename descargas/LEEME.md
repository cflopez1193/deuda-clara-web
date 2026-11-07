# Carpeta de descargas

Coloca aquí el archivo:

```text
deuda-clara.apk.zip
```

Debe ser un ZIP que contenga el APK en la raíz, por ejemplo:

```text
deuda-clara.apk.zip
└── deuda-clara.apk
```

## Crear el ZIP

```bash
cd deuda-clara-web/descargas
cp /ruta/al/deuda-clara.apk .
zip -9 deuda-clara.apk.zip deuda-clara.apk
rm deuda-clara.apk
```

## Comprobar

```bash
ls -lh deuda-clara.apk.zip
unzip -l deuda-clara.apk.zip
sha256sum deuda-clara.apk.zip
```

Si el ZIP pesa más de 100 MB, no lo subas a Vercel: publícalo en una Release
de GitHub y cambia `apkUrl` y `apkAvailable` en `site-config.js`.

Mientras el ZIP no esté presente, la landing mostrará **“APK en preparación”**.
Ese es el comportamiento intencional para no ofrecer una descarga rota.
