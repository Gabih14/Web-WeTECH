import { buildProductSchema } from "./productSchema.mjs";

export function findSeoCatalogProduct(products, seoProduct) {
  if (!seoProduct) return undefined;
  const retailId = seoProduct.id.startsWith("fam|")
    ? seoProduct.id.split("|").slice(1).filter(Boolean).join("-").toUpperCase()
    : seoProduct.id;
  const byId = products.find((product) => product.id === retailId);
  if (byId) return byId;
  const normalize = (value) => value.trim().normalize("NFD").replace(/[\u0300-\u036f]/g, "").toUpperCase();
  const matches = products.filter((product) => normalize(product.name) === normalize(seoProduct.nombre));
  return matches.length === 1 ? matches[0] : undefined;
}

export function getProductVariants(product) {
  return (product.colors || []).flatMap((color) =>
    Object.entries(color.stock).map(([weight, stock]) => ({
      color: color.name,
      weight: Number(weight),
      stock,
      sku: color.itemIds?.[weight] || color.itemId,
      price: color.retailPrices?.[weight] ?? color.prices?.[weight],
      image: color.imagesByWeight?.[weight] || color.images?.[0] || product.image,
    }))
  );
}

export function getLinkedVariant(product, seoProduct, search = "") {
  const variants = getProductVariants(product);
  const sku = new URLSearchParams(search).get("variant");
  if (sku) return variants.find((variant) => variant.sku === sku) || null;
  // The family slug currently comes from its representative variant's image.
  const imagePath = (value) => {
    try { return decodeURIComponent(new URL(value, "https://shop.wetech.ar").pathname); }
    catch { return value; }
  };
  return seoProduct?.fotoUrl
    ? variants.find((variant) => imagePath(variant.image) === imagePath(seoProduct.fotoUrl)) || null
    : null;
}

export function buildProductGroupSchema(product, url, siteUrl) {
  const variants = getProductVariants(product);
  if (!variants.length) return null;
  return {
    "@context": "https://schema.org",
    "@type": "ProductGroup",
    "@id": new URL(`${url}#group`, siteUrl).href,
    productGroupID: product.id,
    name: product.name,
    description: product.observaciones || product.description,
    variesBy: ["https://schema.org/color", "https://schema.org/weight"],
    hasVariant: variants.map((variant) => ({
      ...buildProductSchema({
        name: `${product.name} — ${variant.color} — ${variant.weight} kg`,
        description: product.observaciones || product.description,
        url: `${url}?variant=${encodeURIComponent(variant.sku)}`,
        image: variant.image, sku: variant.sku, brand: product.brand,
        category: product.category, price: variant.price, stock: variant.stock,
      }, siteUrl),
      color: variant.color,
      weight: { "@type": "QuantitativeValue", value: variant.weight, unitCode: "KGM" },
    })),
  };
}
