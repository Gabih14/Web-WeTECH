export const DEFAULT_SITE_URL = "https://shop.wetech.ar";
export const STRUCTURED_DATA_ID = "wetech-structured-data";

export function absoluteHttpUrl(value, siteUrl = DEFAULT_SITE_URL) {
  if (typeof value !== "string" || !value.trim()) return undefined;
  try {
    const url = new URL(value, siteUrl);
    return ["http:", "https:"].includes(url.protocol) ? url.href : undefined;
  } catch {
    return undefined;
  }
}

// Shared by the initial HTML and React. Conditional payment discounts must not
// replace the regular price of the public offer.
export function buildProductSchema(product, siteUrl = DEFAULT_SITE_URL) {
  const url = absoluteHttpUrl(product.url, siteUrl);
  const price = Number(product.price);
  if (!product.name || !url || !Number.isFinite(price) || price <= 0) return null;
  const stock = product.stock == null ? NaN : Number(product.stock);
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    "@id": `${url}#product`,
    name: product.name,
    description: product.description,
    image: absoluteHttpUrl(product.image, siteUrl),
    sku: product.sku,
    ...(product.brand ? { brand: { "@type": "Brand", name: product.brand } } : {}),
    category: product.category,
    offers: {
      "@type": "Offer",
      url,
      priceCurrency: product.currency || "ARS",
      price: Number(price.toFixed(2)),
      ...(Number.isFinite(stock) ? {
        availability: `https://schema.org/${stock > 0 ? "InStock" : "OutOfStock"}`,
      } : {}),
      itemCondition: "https://schema.org/NewCondition",
      seller: { "@type": "Organization", name: "WeTECH" },
    },
  };
}

export function serializeStructuredData(value) {
  return JSON.stringify(value).replace(/</g, "\\u003c");
}
