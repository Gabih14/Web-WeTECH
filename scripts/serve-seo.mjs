import { createServer } from "node:http";
import { createReadStream } from "node:fs";
import { readFile, realpath, stat } from "node:fs/promises";
import { pipeline } from "node:stream/promises";
import { createGzip } from "node:zlib";
import path from "node:path";
import { fileURLToPath } from "node:url";

const types = {
  ".html": "text/html; charset=utf-8", ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8", ".json": "application/json; charset=utf-8",
  ".txt": "text/plain; charset=utf-8", ".xml": "application/xml; charset=utf-8",
  ".svg": "image/svg+xml", ".png": "image/png", ".jpg": "image/jpeg", ".jpeg": "image/jpeg",
  ".webp": "image/webp", ".avif": "image/avif", ".gif": "image/gif", ".ico": "image/x-icon",
  ".pdf": "application/pdf", ".woff": "font/woff", ".woff2": "font/woff2", ".ttf": "font/ttf",
  ".mp4": "video/mp4", ".webm": "video/webm",
};

const isWithin = (root, target) => {
  const relative = path.relative(root, target);
  return relative !== ".." && !relative.startsWith(`..${path.sep}`) && !path.isAbsolute(relative);
};

export async function createSeoServer({ distDir }) {
  const root = await realpath(distDir);
  const manifest = JSON.parse(await readFile(path.join(root, "seo-routes.json"), "utf8"));
  const routeFiles = new Map(Object.entries(manifest.routes).map(([url, route]) => [`/${route.file}`, url]));

  return createServer(async (req, res) => {
    res.setHeader("X-Content-Type-Options", "nosniff");
    if (!["GET", "HEAD"].includes(req.method)) {
      res.writeHead(405, { Allow: "GET, HEAD" });
      res.end();
      return;
    }
    try {
      const url = new URL(req.url, "http://localhost");
      let parts;
      try { parts = url.pathname.split("/").map(decodeURIComponent); }
      catch { res.writeHead(400); res.end(); return; }
      if (parts.some((part) => part.startsWith(".") || /[\\/\0:]/.test(part))) {
        res.writeHead(400); res.end(); return;
      }
      const normalized = parts.map(encodeURIComponent).join("/").replace(/\/+$/, "") || "/";
      let destination = manifest.redirects[normalized];
      // All province URLs already render the same franchise page in React.
      if (/^\/franquicias\/[^/]+$/.test(normalized) && normalized !== "/franquicias/mendoza") {
        destination = "/franquicias/mendoza";
      }
      destination ||= routeFiles.get(normalized);
      const route = manifest.routes[normalized];
      if (destination || (route && normalized !== url.pathname)) {
        res.writeHead(301, { Location: `${destination || normalized}${url.search}` });
        res.end(); return;
      }

      let file;
      let status = 200;
      let noindex = route?.noindex || false;
      if (route) {
        file = path.join(root, route.file);
      } else {
        const decoded = parts.join("/");
        const candidate = path.resolve(root, `.${decoded}`);
        // Only generated routes may serve HTML. Never expose build internals.
        if (isWithin(root, candidate) && path.basename(candidate) !== "seo-routes.json" &&
            path.extname(candidate).toLowerCase() !== ".html") {
          try {
            const actual = await realpath(candidate);
            if (isWithin(root, actual) && (await stat(actual)).isFile()) file = actual;
          } catch (error) {
            if (!["ENOENT", "ENOTDIR", "EINVAL"].includes(error.code)) throw error;
          }
        }
        if (!file) { file = path.join(root, "404.html"); status = 404; noindex = true; }
      }
      const info = await stat(file);
      const contentType = types[path.extname(file).toLowerCase()] || "application/octet-stream";
      const compressible = /^(text\/|application\/(json|xml)|image\/svg)/.test(contentType);
      const gzip = compressible && info.size > 1024 &&
        /(?:^|,)\s*gzip\s*(?:,|$)/i.test(req.headers["accept-encoding"] || "");
      res.statusCode = status;
      res.setHeader("Content-Type", contentType);
      res.setHeader("Cache-Control", noindex ? "no-store" :
        /(?:html|xml|plain)/.test(contentType) ? "no-cache" : "public, max-age=3600");
      if (noindex) res.setHeader("X-Robots-Tag", "noindex, follow");
      if (compressible) res.setHeader("Vary", "Accept-Encoding");
      if (gzip) res.setHeader("Content-Encoding", "gzip");
      else res.setHeader("Content-Length", info.size);
      if (req.method === "HEAD") { res.end(); return; }
      if (gzip) await pipeline(createReadStream(file), createGzip(), res);
      else await pipeline(createReadStream(file), res);
    } catch (error) {
      if (res.destroyed) return;
      if (res.headersSent) { res.destroy(); return; }
      console.error("Static response failed:", error.code || error.name);
      res.writeHead(500, { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-store" });
      res.end("No se pudo cargar la página.");
    }
  });
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const server = await createSeoServer({ distDir: path.resolve(process.argv[2] || "dist") });
  const port = Number(process.env.PORT || 3000);
  server.listen(port, "0.0.0.0", () => console.log(`WeTECH: http://localhost:${port}`));
}
