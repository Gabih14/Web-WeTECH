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
  wholesaleMinimumPurchaseKg: isWholesaleCatalog ? 10 : undefined,
  weights: [{ weight: 1, pesoKg: 1, price: 100000, retailPrice: 100000, wholesalePrice: 80000 }],
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

test("usuario aprobado ve wholesalePrice solo al alcanzar el mínimo", () => {
  assert.equal(getVariantPrice(product(true), "Negro", 1), 100000);
  assert.equal(getVariantPrice(product(true), "Negro", 1, true), 80000);
});

test("10 kg de filamentos habilitan el precio mayorista", () => {
  const state = getWholesaleCartState([item(10)]);
  assert.equal(state.filamentKg, 10);
  assert.equal(state.reached, true);
  assert.equal(getVariantPrice(product(true), "Negro", 1, state.reached), 80000);
});

test("una impresora de 10 kg no suma al mínimo", () => {
  const printer = { ...product(true), id: "IMP", category: "IMPRESORAS", weights: [{ weight: 10, pesoKg: 10, price: 500000, wholesalePrice: 1 }] };
  const state = getWholesaleCartState([{ product: printer, color: "", weight: 10, quantity: 1 }]);
  assert.equal(state.filamentKg, 0);
  assert.equal(state.reached, false);
});

test("un carrito mixto solo aplica precio mayorista a los filamentos", () => {
  const filament = item(10);
  const printer = { ...product(true), id: "IMP", category: "IMPRESORAS", weights: [{ weight: 10, pesoKg: 10, price: 500000, retailPrice: 500000, wholesalePrice: 1 }] };
  const state = getWholesaleCartState([filament, { product: printer, color: "", weight: 10, quantity: 1 }]);
  assert.equal(getVariantPrice(filament.product, filament.color, filament.weight, state.reached), 80000);
  assert.equal(getVariantPrice(printer, "", 10, state.reached), 500000);
});

test("peso nulo se trata como cero sin bloquear checkout", () => {
  const nullWeight = product(true);
  nullWeight.weights[0].pesoKg = null;
  const state = getWholesaleCartState([{ product: nullWeight, color: "Negro", weight: 1, quantity: 10 }]);
  assert.equal(state.filamentKg, 0);
  assert.equal(state.canCheckout, true);
});

test("carrito debajo del mínimo conserva precio minorista", () => {
  const state = getWholesaleCartState([item(1)]);
  assert.equal(state.filamentKg, 1);
  assert.equal(state.missingKg, 9);
  assert.equal(state.reached, false);
  assert.equal(getVariantPrice(product(true), "Negro", 1, state.reached), 100000);
});

test("respuesta 401/403 elimina información mayorista y vuelve al precio normal", () => {
  assert.equal(shouldFallbackFromWholesaleStatus(401), true);
  assert.equal(shouldFallbackFromWholesaleStatus(403), true);
  const retailProduct = stripWholesaleProduct(product(true));
  assert.equal(retailProduct.isWholesaleCatalog, false);
  assert.equal(retailProduct.colors[0].wholesalePrices, undefined);
  assert.equal(getVariantPrice(retailProduct, "Negro", 1), 100000);
});
