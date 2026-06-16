const assert = require("node:assert/strict");
const test = require("node:test");

require("sucrase/register/ts");

const {
  calculateDiscountedPriceForProduct,
  getDiscountPercentageForProduct,
  getEffectiveQuantityForProductDiscount,
  getEligibleQuantityDiscountCartQuantity,
  isEligibleForQuantityDiscount,
} = require("../src/utils/discounts.ts");

const filament = (id) => ({ id, category: "FILAMENTO 3D" });

test("suma familias elegibles mezcladas para el descuento diferencial", () => {
  const items = [
    { product: filament("3N3-PLA"), weight: 1, quantity: 2 },
    { product: filament("GRILON3-PLA BOUTIQUE"), weight: 1, quantity: 3 },
    { product: filament("G3-PETG"), weight: 1, quantity: 4 },
  ];

  const eligibleQuantity = getEligibleQuantityDiscountCartQuantity(items);

  assert.equal(eligibleQuantity, 5);
  assert.equal(
    getEffectiveQuantityForProductDiscount(
      items[0].product,
      items[0].quantity,
      items[0].weight,
      eligibleQuantity
    ),
    5
  );
  assert.equal(
    getDiscountPercentageForProduct(items[0].product, 2, 1, eligibleQuantity),
    "17%"
  );
  assert.equal(
    getDiscountPercentageForProduct(items[1].product, 3, 1, eligibleQuantity),
    "17%"
  );
});

test("reconoce familias elegibles desde codigos de variantes", () => {
  assert.equal(
    isEligibleForQuantityDiscount(filament("3N-PLA-1KG-BLAN"), 1),
    true
  );
  assert.equal(
    isEligibleForQuantityDiscount(filament("GS-PLA-1KG-MOST"), 1),
    true
  );
  assert.equal(
    calculateDiscountedPriceForProduct(
      filament("FM-PLA-1KG-AMAR"),
      28234,
      1,
      1,
      5
    ),
    23434
  );
});
