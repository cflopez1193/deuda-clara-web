/**
 * Servidor local sin dependencias para previsualizar la landing.
 * Uso: npm run dev   (o: PORT=3000 node server.mjs)
 *
 * También entiende URLs limpias (/privacidad → privacidad.html) para que
 * el comportamiento local se parezca al de Vercel con cleanUrls.
 */
import { createReadStream, existsSync, statSync } from "node:fs";
import { createServer } from "node:http";
import { extname, resolve, sep } from "node:path";

const root = resolve(process.cwd());
const port = Number(process.env.PORT || 4173);

const mimeTypes = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".webmanifest": "application/manifest+json; charset=utf-8",
  ".txt": "text/plain; charset=utf-8",
  ".md": "text/plain; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".woff2": "font/woff2",
  ".zip": "application/zip",
  ".apk": "application/vnd.android.package-archive",
};

function isFile(path) {
  return existsSync(path) && statSync(path).isFile();
}

function resolveRequestPath(requestUrl) {
  let pathname;

  try {
    pathname = decodeURIComponent(
      new URL(requestUrl, "http://localhost").pathname
    );
  } catch (error) {
    return null;
  }

  if (pathname === "/") {
    pathname = "/index.html";
  }

  let filePath = resolve(root, "." + pathname);

  if (filePath !== root && !filePath.startsWith(root + sep)) {
    return null;
  }

  if (existsSync(filePath) && statSync(filePath).isDirectory()) {
    filePath = resolve(filePath, "index.html");
  }

  if (isFile(filePath)) {
    return filePath;
  }

  // URLs limpias: /privacidad → privacidad.html
  if (!extname(pathname)) {
    const htmlPath = filePath + ".html";
    if (isFile(htmlPath)) {
      return htmlPath;
    }
  }

  return null;
}

const server = createServer((request, response) => {
  if (request.method !== "GET" && request.method !== "HEAD") {
    response.writeHead(405, {
      Allow: "GET, HEAD",
      "Content-Type": "text/plain; charset=utf-8",
    });
    response.end("Método no permitido");
    return;
  }

  const filePath = resolveRequestPath(request.url || "/");

  const securityHeaders = {
    "X-Content-Type-Options": "nosniff",
    "X-Frame-Options": "DENY",
    "Referrer-Policy": "strict-origin-when-cross-origin",
    "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
    "Cache-Control": "no-store",
  };

  if (!filePath) {
    response.writeHead(404, {
      ...securityHeaders,
      "Content-Type": "text/html; charset=utf-8",
    });
    response.end(
      "<!doctype html><html lang=\"es\"><meta charset=\"utf-8\"><title>404 — Deuda Clara</title><body style=\"font-family: sans-serif; padding: 3rem; background:#07110f; color:#eaf5f1\"><h1>404</h1><p>Esta página no existe.</p><p><a style=\"color:#c6f06d\" href=\"/\">Volver al inicio</a></p></body></html>"
    );
    return;
  }

  const extension = extname(filePath).toLowerCase();
  const contentType = mimeTypes[extension] || "application/octet-stream";
  const size = statSync(filePath).size;
  const headers = {
    ...securityHeaders,
    "Content-Type": contentType,
    "Content-Length": size,
  };

  if (extension === ".zip" || extension === ".apk") {
    headers["Content-Disposition"] =
      'attachment; filename="' + filePath.split(sep).pop() + '"';
  }

  response.writeHead(200, headers);

  if (request.method === "HEAD") {
    response.end();
    return;
  }

  const stream = createReadStream(filePath);
  stream.on("error", () => {
    if (!response.headersSent) {
      response.writeHead(500, { "Content-Type": "text/plain; charset=utf-8" });
    }
    response.end("Error al leer el archivo");
  });
  stream.pipe(response);
});

server.listen(port, () => {
  console.log(`Deuda Clara · preview en http://localhost:${port}`);
});
