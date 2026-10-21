const assert = require("node:assert/strict");
const test = require("node:test");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const { transform } = require("sucrase");

require("sucrase/register/ts");
const { getDefaultProductWeight, getPurchaseState } = require("../src/utils/cartPurchase.ts");
const { getVariantItemId, getVariantPrice } = require("../src/utils/pricing.ts");
const { syncCartItemsWithCatalog } = require("../src/utils/cartCatalogSync.ts");

const variant = (id, pesoKg, descripcion, price, stock) => ({
  id, pesoKg, descripcion, precioVtaCotizadoMin: String(price), stock,
  familia: "PLA", visible: true, fotoUrl: `${id}.webp`,
  opciones: { Colores: "Negro" }, atributos: [],
});

const family = (variantes, grupo = "FILAMENTO 3D") => ({
  key: "fam:pla", nombre: "PLA", marca: "3N3", material: "PLA",
  linea: "General", origen: "Argentina", grupo, atributos: [], variantes,
});

async function loadProducts(catalog) {
  const filename = path.resolve(__dirname, "../src/services/fetchProducts.ts");
  const source = fs.readFileSync(filename, "utf8").replaceAll("import.meta.env.DEV", "false");
  const exports = {};
  const localRequire = (name) => {
    if (name === "../services/api") return {
      apiFetch: async () => catalog,
      dashboardReadApiFetch: async () => [],
    };
    if (name.endsWith(".jpg")) return "fallback.jpg";
    return require(path.resolve(path.dirname(filename), name));
  };
  vm.runInThisContext(`(function(require, exports) { ${transform(source, {
    transforms: ["typescript", "imports"],
  }).code}\n})`, { filename })(localRequire, exports);
  return exports.fetchProducts();
}

test("separa cada filamento sin peso y conserva las variantes con peso en su familia", async () => {
  const weighted = variant("3N-PLA-NEG-1", 1, "PLA 1 kg", 20000, 8);
  const zero = variant("3N-PLA-KIT-A", 0, "Kit de filamentos", 30000, 3);
  const missing = variant("3N-PLA-KIT-B", null, "Muestras de filamentos", 15000, 2);
  const products = await loadProducts([family([weighted, zero, missing])]);

  assert.equal(products.length, 3);
  assert.equal(products[0].id, "3N3-PLA-GENERAL-ARGENTINA");
  assert.deepEqual(products[0].weights.map((w) => w.weight), [1]);
  for (const v of [zero, missing]) {
    const product = products.find((p) => p.id === v.id);
    assert.equal(product.name, v.descripcion);
    assert.deepEqual(product.weights.map((w) => w.weight), [0]);
    assert.equal(getDefaultProductWeight(product), 0);
    assert.equal(getVariantPrice(product, "Negro", 0), Number(v.precioVtaCotizadoMin));
    assert.equal(getVariantItemId(product, "Negro", 0), v.id);
    const state = getPurchaseState({
      product, items: [], selectedColor: "Negro", selectedWeight: 0, quantity: 1,
    });
    assert.equal(state.availableStock, v.stock);
    assert.equal(state.canAddToCart, true);
  }

  const oldProduct = { ...products[1], id: products[0].id };
  const synced = syncCartItemsWithCatalog([
    { product: oldProduct, color: "Negro", weight: 0, quantity: 1 },
  ], products);
  assert.equal(synced.items[0].product.id, zero.id);
  assert.equal(synced.removedItems.length, 0);
});

test("no divide otras categorias ni crea familias vacias cuando todos pesan cero", async () => {
  const zero = variant("3N-PLA-KIT-A", 0, "Kit", 30000, 3);
  const products = await loadProducts([
    family([zero]),
    { ...family([zero], "REPUESTOS & ACCESORIOS"), key: "item:repuesto" },
  ]);
  assert.equal(products.length, 2);
  assert.equal(products[0].id, zero.id);
  assert.equal(products[1].id, "repuesto");
  assert.equal(products[1].name, "PLA");
  assert.equal(products[1].stock, 3);
});
