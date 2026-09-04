import { mkdir, readFile, writeFile } from "node:fs/promises";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "..");
const distDir = path.join(rootDir, "dist");
const templatePath = path.join(distDir, "index.html");

const loadDotEnv = () => {
  const envPath = path.join(rootDir, ".env");

  if (!existsSync(envPath)) {
    return;
  }

  const entries = readFileSync(envPath, "utf8").split(/\r?\n/);

  entries.forEach((line) => {
    const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)\s*$/);

    if (!match || process.env[match[1]] !== undefined) {
      return;
    }

    process.env[match[1]] = match[2].replace(/^['"]|['"]$/g, "");
  });
};

loadDotEnv();

const siteUrl = (process.env.VITE_SITE_URL || process.env.SITE_URL || "https://shop.wetech.ar")
  .replace(/\/+$/, "");
const apiUrl = (process.env.SEO_API_URL || process.env.VITE_API_URL || "")
  .replace(/\/+$/, "");

const defaultImage = "/assets/franquicias/wetech-franquicias-logo.webp";

const routes = [
  {
    path: "/",
    title: "WeTECH | Impresion 3D, filamentos y repuestos en Argentina",
    description:
      "Tienda WeTECH de impresion 3D en Argentina. Compra filamentos, repuestos y accesorios para impresoras 3D con atencion especializada.",
    heading: "WeTECH",
    body: "Impresion 3D, filamentos, repuestos y accesorios en Argentina.",
  },
  {
    path: "/products",
    title: "Productos de impresion 3D | WeTECH",
    description:
      "Explora filamentos 3D, repuestos, accesorios e impresoras 3D en la tienda online de WeTECH.",
    heading: "Productos de impresion 3D",
    body: "Filamentos 3D, repuestos, accesorios e impresoras para makers, emprendedores y empresas.",
  },
  {
    path: "/search",
    title: "Buscar productos | WeTECH",
    description:
      "Busca productos de impresion 3D en WeTECH: filamentos, repuestos, accesorios e impresoras 3D.",
    heading: "Buscar productos",
    body: "Encuentra productos para impresion 3D en el catalogo de WeTECH.",
  },
  {
    path: "/franquicias/mendoza",
    title: "Franquicias WeTECH | Negocio de impresion 3D en Argentina",
    description:
      "Conoce las franquicias WeTECH y suma un negocio de impresion 3D a tu provincia con acompanamiento, proveedores y capacitacion.",
    heading: "Franquicias WeTECH",
    body: "Negocio de impresion 3D con acompanamiento, proveedores y capacitacion.",
    image: defaultImage,
  },
  {
    path: "/checkout",
    title: "Checkout | WeTECH",
    description:
      "Finaliza tu compra en WeTECH de forma simple y segura. Confirma tus datos, envio y metodo de pago.",
    heading: "Checkout WeTECH",
    body: "Finaliza tu compra de productos de impresion 3D en WeTECH.",
    noindex: true,
  },
  {
    path: "/under-development",
    title: "Seccion en desarrollo | WeTECH",
    description:
      "Esta seccion de WeTECH esta en desarrollo. Vuelve al inicio para ver productos de impresion 3D disponibles.",
    heading: "Seccion en desarrollo",
    body: "WeTECH esta preparando esta seccion.",
    noindex: true,
  },
];

const productPaths = (process.env.PRERENDER_PRODUCT_PATHS || "")
  .split(",")
  .map((route) => route.trim())
  .filter(Boolean)
  .map((route) => (route.startsWith("/") ? route : `/${route}`));

productPaths.forEach((routePath) => {
  routes.push({
    path: routePath,
    title: "Producto | WeTECH",
    description:
      "Compra productos de impresion 3D en WeTECH. Filamentos, repuestos y accesorios con atencion especializada.",
    heading: "Producto WeTECH",
    body: "Detalle de producto de impresion 3D disponible en WeTECH.",
    type: "product",
  });
});

const toNumber = (value) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : undefined;
};

const productAvailability = (stock) =>
  Number(stock) > 0
    ? "https://schema.org/InStock"
    : "https://schema.org/OutOfStock";

const productPrice = (product) =>
  toNumber(product.precioPromocional) ?? toNumber(product.precio);

const productDescription = (product) =>
  product.descripcion ||
  `Compra ${product.nombre} en WeTECH, tienda de impresion 3D en Argentina.`;

const productRoute = (product) => `/product/${encodeURIComponent(product.slug)}`;

const productStructuredData = (product) => {
  const price = productPrice(product);

  if (!price) {
    return null;
  }

  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.nombre,
    description: productDescription(product),
    image: absoluteUrl(product.fotoUrl),
    sku: product.id,
    brand: {
      "@type": "Brand",
      name: product.marca || "WeTECH",
    },
    category: product.categoria,
    offers: {
      "@type": "Offer",
      url: absoluteUrl(productRoute(product)),
      priceCurrency: product.moneda || "ARS",
      price: Number(price.toFixed(2)),
      availability: productAvailability(product.stock),
      itemCondition: "https://schema.org/NewCondition",
      seller: {
        "@type": "Organization",
        name: "WeTECH",
      },
    },
  };
};

const fetchSeoProducts = async () => {
  if (!apiUrl) {
    console.warn("SEO_API_URL or VITE_API_URL is not configured. Product prerender skipped.");
    return [];
  }

  try {
    const response = await fetch(`${apiUrl}/seo/products`);

    if (!response.ok) {
      throw new Error(`${response.status} ${response.statusText}`);
    }

    const products = await response.json();
    return Array.isArray(products) ? products : [];
  } catch (error) {
    console.warn(`Product prerender skipped: ${error.message}`);
    return [];
  }
};

const absoluteUrl = (value) => {
  if (/^https?:\/\//i.test(value)) {
    return value;
  }

  return `${siteUrl}${value.startsWith("/") ? value : `/${value}`}`;
};

const escapeHtml = (value) =>
  String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

const compactText = (value, maxLength = 170) => {
  const compacted = String(value).replace(/\s+/g, " ").trim();

  if (compacted.length <= maxLength) {
    return compacted;
  }

  return `${compacted.slice(0, maxLength - 1).trim()}...`;
};

const stripManagedHeadTags = (html) =>
  html
    .replace(/<title>[\s\S]*?<\/title>\s*/i, "")
    .replace(/\s*<meta\s+name="description"[\s\S]*?>/gi, "")
    .replace(/\s*<link\s+rel="canonical"[\s\S]*?>/gi, "")
    .replace(/\s*<meta\s+name="robots"[\s\S]*?>/gi, "")
    .replace(/\s*<meta\s+property="og:[^"]+"[\s\S]*?>/gi, "")
    .replace(/\s*<meta\s+name="twitter:[^"]+"[\s\S]*?>/gi, "");

const buildHeadTags = (route) => {
  const canonical = absoluteUrl(route.path);
  const image = absoluteUrl(route.image || defaultImage);
  const title = escapeHtml(route.title);
  const description = escapeHtml(route.description);
  const type = route.type || "website";

  return [
    `<title>${title}</title>`,
    `<meta name="description" content="${description}" />`,
    route.noindex ? `<meta name="robots" content="noindex,follow" />` : "",
    `<link rel="canonical" href="${canonical}" />`,
    `<meta property="og:site_name" content="WeTECH" />`,
    `<meta property="og:title" content="${title}" />`,
    `<meta property="og:description" content="${description}" />`,
    `<meta property="og:type" content="${type}" />`,
    `<meta property="og:url" content="${canonical}" />`,
    `<meta property="og:image" content="${image}" />`,
    `<meta name="twitter:card" content="summary_large_image" />`,
    `<meta name="twitter:title" content="${title}" />`,
    `<meta name="twitter:description" content="${description}" />`,
    `<meta name="twitter:image" content="${image}" />`,
    route.structuredData
      ? `<script type="application/ld+json">${JSON.stringify(route.structuredData)}</script>`
      : "",
  ]
    .filter(Boolean)
    .join("\n    ");
};

const buildFallbackMarkup = (route) => `
      <section>
        <h1>${escapeHtml(route.heading)}</h1>
        <p>${escapeHtml(route.body)}</p>
      </section>
    `;

const renderRoute = (template, route) => {
  const htmlWithoutManagedTags = stripManagedHeadTags(template);
  return htmlWithoutManagedTags
    .replace("</head>", `    ${buildHeadTags(route)}\n  </head>`)
    .replace('<div id="root"></div>', `<div id="root">${buildFallbackMarkup(route)}</div>`);
};

const outputPathForRoute = (routePath) => {
  if (routePath === "/") {
    return templatePath;
  }

  return path.join(distDir, routePath.replace(/^\/+/, ""), "index.html");
};

const template = await readFile(templatePath, "utf8");
const seoProducts = await fetchSeoProducts();

seoProducts.forEach((product) => {
  if (!product.slug || !product.nombre) {
    return;
  }

  const price = productPrice(product);
  const priceText = price ? ` Precio: ${price.toLocaleString("es-AR")} ${product.moneda || "ARS"}.` : "";
  const metaDescription = compactText(`${productDescription(product)}${priceText}`);

  routes.push({
    path: productRoute(product),
    title: `${product.nombre} | WeTECH`,
    description: metaDescription,
    heading: product.nombre,
    body: `${productDescription(product)} Stock: ${Number(product.stock) > 0 ? "disponible" : "sin stock"}.`,
    image: product.fotoUrl,
    type: "product",
    structuredData: productStructuredData(product),
  });
});

await Promise.all(
  routes.map(async (route) => {
    const outputPath = outputPathForRoute(route.path);
    await mkdir(path.dirname(outputPath), { recursive: true });
    await writeFile(outputPath, renderRoute(template, route), "utf8");
  })
);

console.log(`Prerendered ${routes.length} route HTML files.`);
