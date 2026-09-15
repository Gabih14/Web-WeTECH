const assert = require("node:assert/strict");
const test = require("node:test");

require("sucrase/register/ts");

const {
  getProductDescriptionKind,
} = require("../src/utils/productDescription.ts");

test("trata los complementos para impresión 3D como accesorios", () => {
  assert.equal(
    getProductDescriptionKind({
      category: "COMPLEMENTOS PARA IMPRESION 3D",
      description: "Complemento para el proceso de impresión",
    }),
    "accessory"
  );
});
