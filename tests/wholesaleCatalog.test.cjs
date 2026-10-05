const assert = require("node:assert/strict");
const test = require("node:test");

require("sucrase/register/ts");

const { getVariantPrice } = require("../src/utils/pricing.ts");
const {
  getWholesaleCartState,
  shouldFallbackFromWholesaleStatus,
  stripWholesaleProduct,
} = require("../src/utils/wholesalePricing.ts");

const product = (isWholesaleCatalog = false) => ({
  id: "PLA",
  name: "PLA",
  description: "PLA",
  image: "pla.webp",
  category: "FILAMENTO 3D",
  price: 100000,
  retailPrice: 100000,
  isWholesaleCatalog,
  wholesaleMinimumPurchase: isWholesaleCatalog ? 100000 : undefined,
  weights: [{ weight: 1, price: 100000, retailPrice: 100000, wholesalePrice: 80000 }],
  colors: [{
    name: "Negro",
    hex: "#000",
    stock: { 1: 10 },
    prices: { 1: 100000 },
    retailPrices: { 1: 100000 },
    wholesalePrices: { 1: 80000 },
  }],
});

const item = (quantity) => ({ product: product(true), color: "Negro", weight: 1, quantity });

test("usuario común no ve precios mayoristas", () => {
  assert.equal(getVariantPrice(product(false), "Negro", 1), 100000);
});

test("usuario aprobado ve wholesalePrice", () => {
  assert.equal(getVariantPrice(product(true), "Negro", 1), 80000);
});

test("carrito debajo del mínimo deshabilita checkout mayorista", () => {
  const state = getWholesaleCartState([item(1)]);
  assert.equal(state.subtotal, 80000);
  assert.equal(state.missing, 20000);
  assert.equal(state.canCheckout, false);
});

test("carrito que alcanza el mínimo habilita checkout", () => {
  assert.equal(getWholesaleCartState([item(2)]).canCheckout, true);
});

test("respuesta 401/403 elimina información mayorista y vuelve al precio normal", () => {
  assert.equal(shouldFallbackFromWholesaleStatus(401), true);
  assert.equal(shouldFallbackFromWholesaleStatus(403), true);
  const retailProduct = stripWholesaleProduct(product(true));
  assert.equal(retailProduct.isWholesaleCatalog, false);
  assert.equal(retailProduct.colors[0].wholesalePrices, undefined);
  assert.equal(getVariantPrice(retailProduct, "Negro", 1), 100000);
});
