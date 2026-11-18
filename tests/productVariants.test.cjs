const test = require("node:test");
const assert = require("node:assert/strict");
const variantsModule = import("../src/seo/productVariants.mjs");

const product = {
  id: "3NMAX-PLA+-ESTÁNDAR-NACIONAL", name: "3nMax PLA+", image: "/blanco.png",
  colors: [
    { name: "Blanco", stock: { "1": 10 }, itemIds: { "1": "BLANCO" },
      retailPrices: { "1": 20000 }, imagesByWeight: { "1": "/blanco.png" } },
    { name: "Amarillo", stock: { "0.5": 0, "1": 3 }, itemIds: { "0.5": "AMAR-MEDIO", "1": "AMAR" },
      retailPrices: { "0.5": 12000, "1": 20000 }, imagesByWeight: { "0.5": "/amarillo-medio.png", "1": "/amarillo%201.png" } },
  ],
};

test("family identity wins over duplicate display names", async () => {
  const { findSeoCatalogProduct } = await variantsModule;
  const other = { ...product, id: "OTRA-FAMILIA" };
  const seo = { id: "fam|3nMax|PLA+|Estándar|Nacional", nombre: product.name };
  assert.equal(findSeoCatalogProduct([other, product], seo), product);
  assert.equal(findSeoCatalogProduct([other, product], { ...seo, id: "missing" }), undefined);
});

test("legacy family link selects the representative yellow image, not the first white color", async () => {
  const { getLinkedVariant } = await variantsModule;
  assert.equal(getLinkedVariant(product, { fotoUrl: "https://cdn.example/amarillo%201.png?updatedAt=12" }).sku, "AMAR");
  assert.equal(getLinkedVariant(product, null), null);
  assert.equal(getLinkedVariant(product, { fotoUrl: "/unknown.png" }), null);
});

test("explicit variant wins over the family image even when out of stock", async () => {
  const { getLinkedVariant } = await variantsModule;
  const linked = getLinkedVariant(product, { fotoUrl: "/blanco.png" }, "?cupon=ABC&variant=AMAR-MEDIO");
  assert.equal(linked.color, "Amarillo");
  assert.equal(linked.weight, 0.5);
  assert.equal(linked.stock, 0);
  assert.equal(getLinkedVariant(product, null, "?variant=missing"), null);
});

test("structured data includes every existing combination, its SKU, price and availability", async () => {
  const { buildProductGroupSchema, getProductVariants } = await variantsModule;
  assert.equal(getProductVariants(product).length, 3);
  const schema = buildProductGroupSchema(product, "/product/pla", "https://shop.example");
  assert.equal(schema["@type"], "ProductGroup");
  assert.equal(schema.hasVariant.length, 3);
  const yellow = schema.hasVariant.find((variant) => variant.sku === "AMAR-MEDIO");
  assert.equal(yellow.color, "Amarillo");
  assert.equal(yellow.weight.value, 0.5);
  assert.equal(yellow.offers.price, 12000);
  assert.equal(yellow.offers.availability, "https://schema.org/OutOfStock");
  assert.equal(yellow.offers.url, "https://shop.example/product/pla?variant=AMAR-MEDIO");
  assert.equal(buildProductGroupSchema({ colors: [] }, "/product/test", "https://shop.example"), null);
});
