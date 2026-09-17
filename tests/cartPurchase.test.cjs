const assert = require("node:assert/strict");
const test = require("node:test");

require("sucrase/register/ts");

const { getColorForWeight } = require("../src/utils/cartPurchase.ts");

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
