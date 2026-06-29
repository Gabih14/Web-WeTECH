const assert = require("node:assert/strict");
const test = require("node:test");

require("sucrase/register/ts");

const {
  getVariantInvoicePrice,
  getVariantPrice,
} = require("../src/utils/pricing.ts");

test("lee el precio de factura por color y peso cuando existe", () => {
  const product = {
    id: "3N-EPET",
    category: "FILAMENTO 3D",
    price: 21999,
    invoicePrice: 21764,
    weights: [{ weight: 1, price: 21999, invoicePrice: 21764 }],
    colors: [
      {
        name: "Azul Traful",
        hex: "#0070c0",
        stock: { 1: 16 },
        prices: { 1: 21999 },
        invoicePrices: { 1: 21764 },
      },
    ],
  };

  assert.equal(getVariantPrice(product, "Azul Traful", 1), 21999);
  assert.equal(getVariantInvoicePrice(product, "Azul Traful", 1), 21764);
});

test("si falta precio de factura usa el precio normal como fallback", () => {
  const product = {
    id: "3N-PLA",
    category: "FILAMENTO 3D",
    price: 20000,
    weights: [{ weight: 1, price: 20000 }],
    colors: [
      {
        name: "Negro",
        hex: "#000000",
        stock: { 1: 5 },
        prices: { 1: 20000 },
      },
    ],
  };

  assert.equal(getVariantInvoicePrice(product, "Negro", 1), 20000);
});
