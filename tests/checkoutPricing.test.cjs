const assert = require("node:assert/strict");
const test = require("node:test");

require("sucrase/register/ts");

const {
  calculateCheckoutLinePricing,
} = require("../src/utils/checkoutPricing.ts");

test("calcula importes de checkout con el redondeo del backend", () => {
  const pricing = calculateCheckoutLinePricing(21764, 2, 15);

  assert.equal(pricing.precioUnitarioNeto, 18500);
  assert.equal(pricing.subtotalBruto, 43528);
  assert.equal(pricing.subtotalNeto, 36999);
});

test("calcula el descuento sobre la línea completa antes de derivar el unitario", () => {
  const pricing = calculateCheckoutLinePricing(23528, 5, 17);

  assert.equal(pricing.subtotalBruto, 117640);
  assert.equal(pricing.subtotalNeto, 97641);
  assert.equal(pricing.precioUnitarioNeto, 19528);
  assert.notEqual(
    pricing.subtotalNeto,
    pricing.precioUnitarioNeto * 5
  );
});

test("normaliza el precio base al peso igual que PedidoService", () => {
  const pricing = calculateCheckoutLinePricing(3498.9, 10, 0);

  assert.equal(pricing.subtotalBruto, 34990);
  assert.equal(pricing.subtotalNeto, 34990);
  assert.equal(pricing.precioUnitarioNeto, 3499);
});
