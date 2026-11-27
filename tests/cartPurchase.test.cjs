const assert = require("node:assert/strict");
const test = require("node:test");

require("sucrase/register/ts");

const { getColorForWeight, isCartItemOutOfStock } = require("../src/utils/cartPurchase.ts");
const { syncCartItemsWithCatalog } = require("../src/utils/cartCatalogSync.ts");

const product = {
  colors: [
    { name: "Azul", stock: { "0.5": 2 } },
    { name: "Negro", stock: { "0.5": 0, "1": 3 } },
    { name: "Rojo", stock: { "1": 4 } },
  ],
};

test("conserva el color cuando existe para el nuevo peso", () => {
  assert.equal(getColorForWeight(product, 0.5, "Negro"), "Negro");
});

test("elige el primer color existente cuando cambia a un peso inexistente para el color", () => {
  assert.equal(getColorForWeight(product, 1, "Azul"), "Negro");
});

test("detecta stock por variante, incluso para peso cero y variantes inexistentes", () => {
  const item = { product, color: "Negro", weight: 0.5, quantity: 1 };
  assert.equal(isCartItemOutOfStock(item), true);
  assert.equal(isCartItemOutOfStock({ ...item, weight: 1 }), false);
  assert.equal(isCartItemOutOfStock({ ...item, color: "Azul", weight: 1 }), true);
  assert.equal(isCartItemOutOfStock({ ...item, product: { colors: [{ name: "Negro", stock: { 0: 2 } }] }, weight: 0 }), false);
});

test("eliminar los sin stock conserva los productos disponibles", () => {
  const items = [0, -1, undefined, 2].map((stock, index) => ({
    product: { id: String(index), stock }, color: "", weight: 0, quantity: 1,
  }));
  assert.deepEqual(items.filter((item) => !isCartItemOutOfStock(item)), [items[3]]);
});

test("sincroniza cambios de stock aunque el precio no cambie", () => {
  const item = { product: { id: "P", price: 1000, stock: 2 }, color: "", weight: 0, quantity: 1 };
  const result = syncCartItemsWithCatalog([item], [{ ...item.product, stock: 0 }]);
  assert.equal(result.hasChanges, true);
  assert.equal(isCartItemOutOfStock(result.items[0]), true);
  assert.equal(syncCartItemsWithCatalog(result.items, [{ ...item.product, stock: 0 }]).hasChanges, false);

  const variant = { product: { ...product, id: "V", price: 1000 }, color: "Negro", weight: 1, quantity: 1 };
  const freshProduct = { ...variant.product, colors: [{ name: "Negro", stock: { 1: 0 } }] };
  const variantResult = syncCartItemsWithCatalog([variant], [freshProduct]);
  assert.equal(variantResult.hasChanges, true);
  assert.equal(isCartItemOutOfStock(variantResult.items[0]), true);
});
