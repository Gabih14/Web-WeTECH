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
