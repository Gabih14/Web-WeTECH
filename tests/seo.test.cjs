const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs/promises");
const os = require("node:os");
const path = require("node:path");

const product = {
  id: "fam|Marca|PLA|Estándar|Nacional", slug: "pla-estandar", nombre: "PLA Estándar",
  descripcion: "TEMPERATURAS\nBoquilla 200 °C\n\nPARA QUÉ SIRVE\nPrototipos & piezas <livianas>.",
  fotoUrl: "/assets/pla negro.png", precio: 20000, precioPromocional: 17000,
  stock: 3, marca: "Marca", categoria: "FILAMENTO 3D", moneda: "ARS", updatedAt: "2026-01-01T00:00:00Z",
};
const second = { ...product, id: "REP-1", slug: "otro-producto", nombre: "Otro producto", stock: 0 };
const template = '<!doctype html><html><head><title>Old</title><meta name="robots" content="noindex"><script type="application/ld+json">{"old":true}</script></head><body><div id="root"></div></body></html>';
const seoModule = import("../scripts/prerender-seo.mjs");

async function fixture(t) {
  const base = path.resolve(os.tmpdir());
  const dir = await fs.mkdtemp(path.join(base, "wetech-seo-"));
  t.after(async () => {
    assert.equal(path.dirname(dir), base);
    assert.ok(path.basename(dir).startsWith("wetech-seo-"));
    await fs.rm(dir, { recursive: true, force: true });
  });
  await fs.writeFile(path.join(dir, "index.html"), template);
  const { prerender } = await seoModule;
  const manifest = await prerender({
    distDir: dir, siteUrl: "https://shop.example", apiUrl: "https://api.example",
    fetchImpl: async () => new Response(JSON.stringify([product, second])),
  });
  return { dir, manifest };
}

test("SEO rejects missing, failed, empty, truncated or invalid catalogs", async () => {
  const { fetchSeoProducts, validateProducts } = await seoModule;
  await assert.rejects(fetchSeoProducts(""), /Configure/);
  await assert.rejects(fetchSeoProducts("https://api.example", 1, async () => new Response("", { status: 503 })), /503/);
  await assert.rejects(fetchSeoProducts("https://api.example", 1, async () => { throw new Error("timeout"); }), /timeout/);
  for (const input of [null, {}, [], [{ ...product, slug: "../../escape" }],
    [{ ...product, precio: null }], [{ ...product, stock: undefined }],
    [{ ...product, fotoUrl: "javascript:alert(1)" }], [product, product]]) {
    assert.throws(() => validateProducts(input));
  }
  assert.throws(() => validateProducts([product], 2), /at least 2/);
  assert.throws(() => validateProducts([product], NaN), /positive integer/);
  assert.equal(validateProducts([product, second]).length, 2);
});

test("build emits readable content, one schema, canonical links and an indexable-only sitemap", async (t) => {
  const { dir, manifest } = await fixture(t);
  const html = await fs.readFile(path.join(dir, "product/pla-estandar/index.html"), "utf8");
  assert.match(html, /<h2>TEMPERATURAS<\/h2>/);
  assert.match(html, /Prototipos &amp; piezas &lt;livianas&gt;/);
  assert.match(html, /Precio de lista: 20\.000,00 ARS/);
  assert.match(html, /href="\/product\/otro-producto"/);
  assert.match(html, /rel="canonical" href="https:\/\/shop.example\/product\/pla-estandar"/);
  assert.equal((html.match(/application\/ld\+json/g) || []).length, 1);
  const schema = JSON.parse(html.match(/id="wetech-structured-data" type="application\/ld\+json">(.*?)<\/script>/s)[1]);
  assert.equal(schema.offers.price, 20000);
  assert.equal(schema.offers.availability, "https://schema.org/InStock");
  assert.equal(schema.image, "https://shop.example/assets/pla%20negro.png");
  assert.equal(schema.sku, undefined);
  const catalog = await fs.readFile(path.join(dir, "products/index.html"), "utf8");
  assert.match(catalog, /href="\/product\/pla-estandar"/);
  const sitemap = await fs.readFile(path.join(dir, "sitemap.xml"), "utf8");
  assert.equal((sitemap.match(/<loc>/g) || []).length, 5);
  assert.doesNotMatch(sitemap, /checkout|search|under-development|404/);
  assert.match(sitemap, /<lastmod>2026-01-01T00:00:00.000Z<\/lastmod>/);
  for (const route of ["checkout", "checkout/callback", "search", "under-development"]) {
    assert.match(await fs.readFile(path.join(dir, route, "index.html"), "utf8"), /content="noindex,follow"/);
  }
  const missing = await fs.readFile(path.join(dir, "404.html"), "utf8");
  assert.match(missing, /noindex,follow/);
  assert.doesNotMatch(missing, /rel="canonical"|application\/ld\+json/);
  const robots = await fs.readFile(path.join(dir, "robots.txt"), "utf8");
  assert.match(robots, /Sitemap: https:\/\/shop.example\/sitemap.xml/);
  assert.doesNotMatch(robots, /Disallow/);
  assert.equal(manifest.redirects["/product/MARCA-PLA-EST%C3%81NDAR-NACIONAL"], "/product/pla-estandar");
});

test("catalog content cannot break out of HTML or JSON-LD", async () => {
  const { renderRoute, descriptionMarkup } = await seoModule;
  const { buildProductSchema } = await import("../src/seo/productSchema.mjs");
  const attack = '</script><script>alert("x")</script>';
  const html = renderRoute(template, {
    path: "/product/test", title: attack, heading: attack, body: attack,
    content: descriptionMarkup(attack),
    structuredData: buildProductSchema({ name: attack, url: "/product/test", price: 1 }),
  }, "https://shop.example");
  assert.doesNotMatch(html, /<script>alert/);
  assert.equal((html.match(/<script /g) || []).length, 1);
  const data = JSON.parse(html.match(/application\/ld\+json">(.*?)<\/script>/s)[1]);
  assert.equal(data.name, attack);
});

test("production HTTP serves deep links, redirects, gzip, noindex and real 404s", async (t) => {
  const { dir } = await fixture(t);
  await fs.mkdir(path.join(dir, "assets"));
  await fs.writeFile(path.join(dir, "assets/pla negro.png"), "image");
  const { createSeoServer } = await import("../scripts/serve-seo.mjs");
  const server = await createSeoServer({ distDir: dir });
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  t.after(() => new Promise((resolve) => { server.close(resolve); server.closeAllConnections(); }));
  const base = `http://127.0.0.1:${server.address().port}`;
  const page = await fetch(`${base}/product/pla-estandar`, { headers: { "Accept-Encoding": "gzip" } });
  assert.equal(page.status, 200);
  assert.equal(page.headers.get("content-encoding"), "gzip");
  assert.match(await page.text(), /Boquilla 200 °C/);
  for (const [from, to] of [
    ["/products/", "/products"], ["/products/index.html", "/products"], ["/index.html", "/"],
    ["/product/MARCA-PLA-EST%C3%81NDAR-NACIONAL?cupon=ABC", "/product/pla-estandar?cupon=ABC"],
    ["/franquicias/cordoba", "/franquicias/mendoza"],
  ]) {
    const response = await fetch(`${base}${from}`, { redirect: "manual" });
    assert.equal(response.status, 301, from);
    assert.equal(response.headers.get("location"), to);
  }
  for (const url of ["/does-not-exist", "/product/missing", "/assets/missing.js", "/seo-routes.json", "/404.html"]) {
    const response = await fetch(`${base}${url}`);
    assert.equal(response.status, 404, url);
    assert.match(response.headers.get("x-robots-tag"), /noindex/);
    assert.match(await response.text(), /Página no encontrada/);
  }
  const callback = await fetch(`${base}/checkout/callback?payment_id=123`);
  assert.equal(callback.status, 200);
  assert.equal(callback.headers.get("cache-control"), "no-store");
  assert.match(callback.headers.get("x-robots-tag"), /noindex/);
  const image = await fetch(`${base}/assets/pla%20negro.png`);
  assert.equal(image.status, 200);
  assert.equal(image.headers.get("content-type"), "image/png");
  assert.equal(await image.text(), "image");
  const head = await fetch(`${base}/product/pla-estandar`, { method: "HEAD" });
  assert.equal(head.status, 200);
  assert.equal(await head.text(), "");
  assert.equal((await fetch(`${base}/products`, { method: "POST" })).status, 405);
  assert.equal((await fetch(`${base}/assets/%2e%2e%2fprivate`)).status, 400);
});
