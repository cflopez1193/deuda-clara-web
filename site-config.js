/**
 * Configuración de la landing de Deuda Clara.
 *
 * Edita este archivo cuando tengas el APK y un correo de contacto reales.
 * No necesitas compilar nada: Vercel sirve estos archivos tal cual.
 */
window.DEUDA_CLARA_SITE = {
  /** Versión que se muestra en la página y en los metadatos. */
  version: "1.0.0",

  /** Ruta del ZIP con el APK dentro del sitio (o una URL absoluta). */
  apkUrl: "descargas/deuda-clara.apk.zip",

  /**
   * "auto": comprueba con una petición HEAD si el archivo ya existe.
   * true:   muestra la descarga sin comprobar (útil con GitHub Releases).
   * false:  muestra "APK en preparación" aunque el archivo exista.
   */
  apkAvailable: "auto",

  /**
   * Tamaño opcional, en bytes o como texto ("12,4 MB"). Si se deja vacío,
   * se usa el tamaño que devuelva el servidor en la comprobación HEAD.
   */
  apkSize: null,

  /** SHA-256 opcional del ZIP. Si se define, aparece en un desplegable. */
  sha256: "",

  /**
   * Correo de contacto para privacidad y soporte. Déjalo vacío hasta tener
   * uno real: los bloques de contacto se ocultan automáticamente.
   */
  contactEmail: "",
};
