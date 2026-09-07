import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { loadEnv } from "vite";
import { loadingHead, loadingMarkup } from "./seo-loading.mjs";
import {
  absoluteHttpUrl, buildProductSchema, DEFAULT_SITE_URL,
  serializeStructuredData, STRUCTURED_DATA_ID,
} from "../src/seo/productSchema.mjs";

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const defaultImage = "/assets/franquicias/wetech-franquicias-logo.webp";
const staticRoutes = [
  { path: "/", title: "WeTECH | Impresión 3D, filamentos y repuestos en Argentina",
    heading: "WeTECH", body: "Tienda WeTECH de impresión 3D en Argentina. Filamentos, repuestos y accesorios con atención especializada." },
  { path: "/products", title: "Productos de impresión 3D | WeTECH",
    heading: "Productos de impresión 3D", body: "Explorá el catálogo de filamentos, repuestos y accesorios de WeTECH." },
  { path: "/search", title: "Buscar productos | WeTECH", heading: "Buscar productos",
    body: "Encontrá productos para impresión 3D en el catálogo de WeTECH.", noindex: true },
  { path: "/franquicias/mendoza", title: "Franquicias WeTECH | Negocio de impresión 3D en Argentina",
    heading: "Franquicias WeTECH", body: "Conocé las franquicias WeTECH y sumá un negocio de impresión 3D a tu provincia con acompañamiento, proveedores y capacitación." },
  { path: "/checkout", title: "Checkout | WeTECH", heading: "Checkout WeTECH",
    body: "Confirmá tus datos, envío y método de pago para finalizar tu compra.", noindex: true },
  { path: "/checkout/callback", title: "Estado de pago | WeTECH", heading: "Estado de pago",
    body: "Consultá el estado de tu pago y pedido en WeTECH.", noindex: true },
  { path: "/under-development", title: "Sección en desarrollo | WeTECH", heading: "Sección en desarrollo",
    body: "Esta sección está en desarrollo. Explorá los productos disponibles en el catálogo.", noindex: true },
];

const notFoundRoute = {
  path: "/404", title: "Página no encontrada | WeTECH", heading: "Página no encontrada",
  body: "El enlace no existe o la página cambió de dirección. Explorá el catálogo de WeTECH.",
  noindex: true, canonical: false,
};

export const escapeHtml = (value) => String(value ?? "")
  .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
  .replace(/"/g, "&quot;").replace(/'/g, "&#39;");

const compactText = (value) => String(value).replace(/\s+/g, " ").trim().slice(0, 170);
const productPath = (product) => `/product/${encodeURIComponent(product.slug)}`;
const priceLabel = (product) => `${Number(product.precio).toLocaleString("es-AR", {
  minimumFractionDigits: 2, maximumFractionDigits: 2,
})} ${product.moneda || "ARS"}`;

const sectionTitles = new Set([
  "NIVEL", "IMPRESORA", "TEMPERATURAS", "UNA VEZ IMPRESO", "PARA QUE SIRVE",
  "POR QUE ELEGIRLO", "POR QUE ELEGIRLA", "ADVERTENCIA", "VENTAJA WETECH",
  "FACILIDAD DE USO", "ESPECIFICACIONES", "MATERIALES COMPATIBLES", "COMPATIBLE CON", "PUESTA EN MARCHA",
]);
const normalize = (value) => value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toUpperCase();

export function descriptionMarkup(description) {
  const blocks = [];
  let lines = [];
  const flush = () => {
    if (lines.length) blocks.push(`<p>${lines.map(escapeHtml).join("<br />")}</p>`);
    lines = [];
  };
  for (const line of String(description || "").split(/\r?\n/)) {
    const text = line.trim();
    if (sectionTitles.has(normalize(text))) {
      flush();
      blocks.push(`<h2>${escapeHtml(text)}</h2>`);
    } else if (!text) flush();
    else lines.push(text);
  }
  flush();
  return blocks.join("\n");
}

export function validateProducts(products, minProducts = 1) {
  if (!Number.isInteger(minProducts) || minProducts < 1) throw new Error("SEO_MIN_PRODUCTS must be a positive integer.");
  if (!Array.isArray(products) || products.length < minProducts) {
    throw new Error(`SEO catalog must contain at least ${minProducts} products.`);
  }
  const slugs = new Set();
  const ids = new Set();
  products.forEach((product, index) => {
    if (!product || typeof product.id !== "string" || !product.id.trim() ||
        typeof product.nombre !== "string" || !product.nombre.trim() ||
        typeof product.slug !== "string" || !/^[a-z0-9][a-z0-9_-]*$/i.test(product.slug) ||
        product.precio == null || !Number.isFinite(Number(product.precio)) || Number(product.precio) <= 0 ||
        product.stock == null || !Number.isFinite(Number(product.stock)) ||
        !absoluteHttpUrl(product.fotoUrl) ||
        (product.moneda && !/^[A-Z]{3}$/.test(product.moneda))) {
      throw new Error(`Invalid SEO product at index ${index}: check identity, slug, price, stock and image.`);
    }
    if (slugs.has(product.slug.toLowerCase()) || ids.has(product.id)) {
      throw new Error(`Duplicate SEO identity at index ${index}.`);
    }
    slugs.add(product.slug.toLowerCase());
    ids.add(product.id);
  });
  return products;
}

export async function fetchSeoProducts(apiUrl, minProducts = 1, fetchImpl = fetch) {
  if (!apiUrl) throw new Error("Configure SEO_API_URL or VITE_API_URL before building the SEO catalog.");
  const response = await fetchImpl(`${apiUrl.replace(/\/+$/, "")}/seo/products`, {
    signal: AbortSignal.timeout(30000),
  });
  if (!response.ok) throw new Error(`SEO catalog request failed with HTTP ${response.status}.`);
  return validateProducts(await response.json(), minProducts);
}

const stripManagedHeadTags = (html) => html
  .replace(/<title>[\s\S]*?<\/title>\s*/gi, "")
  .replace(/\s*<meta\s+name="(?:description|robots|twitter:[^"]+)"[^>]*>/gi, "")
  .replace(/\s*<link\s+rel="canonical"[^>]*>/gi, "")
  .replace(/\s*<meta\s+property="og:[^"]+"[^>]*>/gi, "")
  .replace(/<script\b[^>]*type="application\/ld\+json"[^>]*>[\s\S]*?<\/script>/gi, "");

export function renderRoute(template, route, siteUrl) {
  const canonical = route.canonical === false ? null : absoluteHttpUrl(route.path, siteUrl);
  const image = absoluteHttpUrl(route.image || defaultImage, siteUrl);
  const title = escapeHtml(route.title);
  const description = escapeHtml(compactText(route.description || route.body));
  const head = [
    `<title>${title}</title>`,
    `<meta name="description" content="${description}" />`,
    `<meta name="robots" content="${route.noindex ? "noindex,follow" : "index,follow,max-image-preview:large"}" />`,
    canonical ? `<link rel="canonical" href="${escapeHtml(canonical)}" />` : "",
    `<meta property="og:site_name" content="WeTECH" />`,
    `<meta property="og:title" content="${title}" />`,
    `<meta property="og:description" content="${description}" />`,
    `<meta property="og:type" content="${route.product ? "product" : "website"}" />`,
    canonical ? `<meta property="og:url" content="${escapeHtml(canonical)}" />` : "",
    `<meta property="og:image" content="${escapeHtml(image)}" />`,
    `<meta name="twitter:card" content="summary_large_image" />`,
    `<meta name="twitter:title" content="${title}" />`,
    `<meta name="twitter:description" content="${description}" />`,
    `<meta name="twitter:image" content="${escapeHtml(image)}" />`,
    route.structuredData ? `<script id="${STRUCTURED_DATA_ID}" type="application/ld+json">${serializeStructuredData(route.structuredData)}</script>` : "",
  ].filter(Boolean).join("\n");
  const markup = `<nav aria-label="Navegación principal"><a href="/">Inicio</a> · <a href="/products">Productos</a></nav>
    <main><h1>${escapeHtml(route.heading)}</h1>${route.content || `<p>${escapeHtml(route.body)}</p>`}</main>`;
  const initialMarkup = `${loadingMarkup}<div id="wetech-initial-content">${markup}</div>`;
  return stripManagedHeadTags(template)
    .replace("</head>", `${head}\n${loadingHead}\n</head>`)
    .replace('<div id="root"></div>', `<div id="root">${initialMarkup}</div>`);
}

function catalogMarkup(products) {
  return `<ul>${products.map((product) => `<li><a href="${productPath(product)}">${escapeHtml(product.nombre)}</a> — Precio de lista: ${escapeHtml(priceLabel(product))} — ${Number(product.stock) > 0 ? "Disponible" : "Sin stock"}</li>`).join("\n")}</ul>`;
}

export async function prerender({ distDir, siteUrl = DEFAULT_SITE_URL, apiUrl, minProducts = 1, fetchImpl = fetch }) {
  const site = new URL(siteUrl);
  if (!["https:", "http:"].includes(site.protocol) || site.username || site.password ||
      site.pathname !== "/" || site.search || site.hash) throw new Error("VITE_SITE_URL must be an HTTP(S) origin.");
  siteUrl = site.origin;
  const template = await readFile(path.join(distDir, "index.html"), "utf8");
  if (!template.includes('<div id="root"></div>')) throw new Error("Build a fresh Vite template before prerendering.");
  const products = await fetchSeoProducts(apiUrl, minProducts, fetchImpl);
  const routes = staticRoutes.map((route) => ({ ...route }));
  for (const route of routes) {
    if (["/", "/products"].includes(route.path)) {
      route.content = `<p>${escapeHtml(route.body)}</p><h2>Catálogo de productos</h2>${catalogMarkup(products)}`;
    }
  }
  for (const product of products) {
    const description = product.descripcion || `Comprá ${product.nombre} en WeTECH.`;
    const image = absoluteHttpUrl(product.fotoUrl, siteUrl);
    const related = products.filter((item) => item.id !== product.id && item.categoria === product.categoria).slice(0, 6);
    routes.push({
      path: productPath(product), title: `${product.nombre} | WeTECH`, heading: product.nombre,
      description, product: true, image, updatedAt: product.updatedAt,
      content: `<img src="${escapeHtml(image)}" alt="${escapeHtml(product.nombre)}" width="400" />
        <p>Precio de lista: ${escapeHtml(priceLabel(product))}. Stock: ${Number(product.stock) > 0 ? "disponible" : "sin stock"}.</p>
        <dl>${[["Marca", product.marca], ["Categoría", product.categoria], ["Subcategoría", product.subcategoria]]
          .filter(([, value]) => value).map(([label, value]) => `<dt>${label}</dt><dd>${escapeHtml(value)}</dd>`).join("")}</dl>
        ${descriptionMarkup(description)}
        ${product.observaciones && product.observaciones !== description ? descriptionMarkup(product.observaciones) : ""}
        ${related.length ? `<h2>Productos relacionados</h2>${catalogMarkup(related)}` : ""}`,
      structuredData: buildProductSchema({
        name: product.nombre, description, image, url: productPath(product),
        // A family identifier is not the SKU of a purchasable variant.
        sku: product.id.startsWith("fam|") ? undefined : product.id,
        brand: product.marca, category: product.categoria, currency: product.moneda,
        price: Number(product.precio), stock: Number(product.stock),
      }, siteUrl),
    });
  }
  const manifest = { generatedAt: new Date().toISOString(), productCount: products.length, routes: {}, redirects: {} };
  for (const route of routes) {
    const file = route.path === "/" ? "index.html" : `${route.path.slice(1)}/index.html`;
    const outputPath = path.join(distDir, file);
    await mkdir(path.dirname(outputPath), { recursive: true });
    await writeFile(outputPath, renderRoute(template, route, siteUrl), "utf8");
    manifest.routes[route.path] = { file, noindex: !!route.noindex };
  }
  for (const product of products) {
    const legacyId = product.id.startsWith("fam|")
      ? product.id.split("|").slice(1).filter(Boolean).join("-").toUpperCase()
      : product.id;
    const alias = `/product/${encodeURIComponent(legacyId)}`;
    if (alias !== productPath(product) && !manifest.routes[alias]) {
      if (manifest.redirects[alias] && manifest.redirects[alias] !== productPath(product)) {
        throw new Error("Conflicting legacy product URLs in SEO catalog.");
      }
      manifest.redirects[alias] = productPath(product);
    }
  }
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${routes.filter((route) => !route.noindex).map((route) => {
    const date = route.updatedAt ? new Date(route.updatedAt) : null;
    const lastmod = date && Number.isFinite(date.getTime()) && date.getTime() <= Date.now()
      ? `<lastmod>${date.toISOString()}</lastmod>` : "";
    return `<url><loc>${escapeHtml(absoluteHttpUrl(route.path, siteUrl))}</loc>${lastmod}</url>`;
  }).join("\n")}\n</urlset>\n`;
  await writeFile(path.join(distDir, "sitemap.xml"), sitemap, "utf8");
  // Allow crawlers to read noindex on search/checkout pages; don't block them here.
  await writeFile(path.join(distDir, "robots.txt"), `User-agent: *\nAllow: /\n\nSitemap: ${siteUrl}/sitemap.xml\n`, "utf8");
  await writeFile(path.join(distDir, "404.html"), renderRoute(template, notFoundRoute, siteUrl), "utf8");
  await writeFile(path.join(distDir, "seo-routes.json"), JSON.stringify(manifest, null, 2), "utf8");
  return manifest;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const env = { ...loadEnv("production", rootDir, ""), ...process.env };
  if (env.SITE_URL && env.SITE_URL !== (env.VITE_SITE_URL || DEFAULT_SITE_URL)) {
    throw new Error("Use VITE_SITE_URL so the build and browser share the same canonical origin.");
  }
  const manifest = await prerender({
    distDir: path.join(rootDir, "dist"), siteUrl: env.VITE_SITE_URL || DEFAULT_SITE_URL,
    apiUrl: env.SEO_API_URL || env.VITE_API_URL, minProducts: Number(env.SEO_MIN_PRODUCTS || 50),
  });
  console.log(`SEO: ${manifest.productCount} products, ${Object.keys(manifest.routes).length} HTML routes, sitemap and robots generated.`);
}
