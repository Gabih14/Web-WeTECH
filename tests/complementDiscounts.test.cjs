const assert = require("node:assert/strict");
const test = require("node:test");
require("sucrase/register/ts");
const { calculateCartPricing, buildCartOrderProducts } = require("../src/utils/cartPricing.ts");
const { buildOrderAmounts, hasValidShippingOrder } = require("../src/utils/orderPricing.ts");
const { calculateInvoiceLine } = require("../src/utils/invoice.ts");
const { calculateCheckoutLinePricing } = require("../src/utils/checkoutPricing.ts");
const { syncCartItemsWithCatalog } = require("../src/utils/cartCatalogSync.ts");
const CATEGORY = "COMPLEMENTOS PARA IMPRESION 3D";
const item = (sku, quantity, price = 10000, extra = {}) => ({
  product: { id: sku, itemId: sku, category: CATEGORY, price, invoicePrice: price, promotionalPrice: price * .85, ...extra },
  quantity, color: "", weight: 0,
});
const coupon = (percentage, extra = {}) => ({ code: "TEST", porcentajeDescuento: percentage, ...extra });
const price = (items, options = {}) => {
  const groups = calculateCartPricing(items, options);
  const products = groups.flatMap((group) => group.lines);
  return { groups, products, ...buildOrderAmounts({ products, facturaTipo: options.facturaTipo }) };
};

for (const [sku, parentItemId, tier] of [
  ["VASO ALUM 500ML", null, 21.29],
  ["VASO ALUM 600ML", null, 22.72],
  ["VASO ALUM 1L", null, 19.6],
  ["INS-MATE-BLAN", null, 27.2],
  ["INS-MATE-NEGR", null, 27.2],
  ["INS-TAZA-NEGR", null, 25.64],
  ["TAZA-OTRO-COLOR", "INS-TAZA-GENE", 25.64],
  ["INS-VASO-MILK", null, 32.01],
  ["MILK-OTRO-COLOR", "INS-VASO-MILK-GENE", 32.01],
  ["OTRO-COMPLEMENTO", null, 15],
]) {
  for (const quantity of [9, 10, 11]) {
    test(`${sku}: ${quantity} unidades, sin acumular el precio promocional`, () => {
      const result = price([item(sku, quantity, 12347.8, { parentItemId })]);
      const percentage = quantity < 10 ? 15 : tier;
      assert.equal(result.products[0].ajustePorcentaje, percentage);
      assert.equal(result.total, Math.round(12348 * quantity * (1 - percentage / 100)));
    });
  }
}

test("suma colores y SKU repetidos; separa capacidades y verifica el grupo", () => {
  const result = price([
    item("INS-MATE-BLAN", 3), item("INS-MATE-NEGR", 4), item("INS-MATE-BLAN", 3),
    item("VASO ALUM 500ML", 9), item("VASO ALUM 600ML", 1),
    item("INS-TAZA-NEGR", 9), item("TAZA-ROJA", 1, 20000, { parentItemId: "INS-TAZA-GENE" }),
    item("INS-MATE-BLAN", 99, 10000, { category: "REPUESTOS & ACCESORIOS" }),
  ]);
  assert.deepEqual(result.products.map((line) => line.ajustePorcentaje), [27.2, 27.2, 15, 15, 25.64, 25.64, 0]);
  assert.deepEqual(result.products.slice(0, 2).map((line) => line.cantidad), [6, 4]);
});

test("usa el SKU y precio del color seleccionado", () => {
  const product = {
    id: "MATES", category: CATEGORY, price: 999999,
    colors: [
      { name: "Blanco", itemIds: { 0: "INS-MATE-BLAN" }, prices: { 0: 10000 } },
      { name: "Negro", itemIds: { 0: "INS-MATE-NEGR" }, prices: { 0: 50000 } },
    ],
  };
  const result = price([
    { product, color: "Negro", weight: 0, quantity: 5 },
    { product, color: "Blanco", weight: 0, quantity: 5 },
    item("INS-BOMB-NEGR", 3),
  ]);
  assert.deepEqual(result.products.filter((line) => line.combo).map((line) => line.nombre).sort(), ["INS-BOMB-NEGR", "INS-MATE-BLAN"]);
  assert.equal(result.products.find((line) => line.nombre === "INS-MATE-NEGR").precioBaseUnitario, 50000);
});

for (const pairs of [1, 9, 10]) {
  test(`${pairs} combos, conserva SKU y cantidades reales`, () => {
    const result = price([item("INS-MATE-BLAN", pairs), item("INS-BOMB-NEGR", pairs)]);
    assert.deepEqual(result.products.map((line) => line.ajustePorcentaje), [pairs < 10 ? 25 : 35, pairs < 10 ? 25 : 35]);
    assert.equal(result.total, pairs * 20000 * (pairs < 10 ? .75 : .65));
    assert.deepEqual(buildCartOrderProducts(result.groups, "none").map((line) => [line.nombre, line.cantidad]), [["INS-MATE-BLAN", pairs], ["INS-BOMB-NEGR", pairs]]);
  });
}

test("sobrantes conservan el tramo de toda la presentación y las líneas no se deduplican", () => {
  const result = price([item("INS-MATE-BLAN", 12), item("INS-BOMB-NEGR", 10)]);
  assert.deepEqual(result.productos.map((line) => [line.nombre, line.cantidad, line.ajuste_porcentaje]), [
    ["INS-MATE-BLAN", 10, 35], ["INS-MATE-BLAN", 2, 27.2], ["INS-BOMB-NEGR", 10, 35],
  ]);
  assert.equal(result.total, 144560);
  const submitted = buildCartOrderProducts(result.groups, "none");
  assert.equal(submitted[0].cantidad, 12);
  assert.equal(submitted[0].subtotal, 79560);
  assert.equal(submitted[0].precio_unitario, 6630);
});

test("el individual gana si el combo encarece los mates; Milkshake y otros grupos no forman pares", () => {
  const result = price([item("INS-MATE-BLAN", 10), item("INS-BOMB-NEGR", 1, 100)]);
  assert.equal(result.total, 72885);
  assert.ok(result.products.every((line) => !line.combo));
  for (const mate of [item("INS-VASO-MILK", 10), item("INS-MATE-BLAN", 10, 10000, { category: "OTRO" })]) {
    assert.ok(price([mate, item("INS-BOMB-NEGR", 10)]).products.every((line) => !line.combo));
  }
});

test("el redondeo puede favorecer menos pares; en empate queda el individual", () => {
  const result = price([item("INS-MATE-BLAN", 12, 1), item("INS-BOMB-NEGR", 15, 1)]);
  assert.equal(result.total, 18);
  assert.deepEqual(result.products.filter((line) => line.combo).map((line) => line.cantidad), [11, 11]);
  const tie = price([item("INS-MATE-BLAN", 1, 1), item("INS-BOMB-NEGR", 1, 1)]);
  assert.ok(tie.products.every((line) => !line.combo));
});

test("cupones, categorías y cambio transferencia/online sin acumulación", () => {
  const items = [item("INS-MATE-BLAN", 10), item("INS-BOMB-NEGR", 10)];
  const individual = price(items, { coupon: coupon(40) });
  assert.equal(individual.total, 120000);
  assert.equal(individual.descuentoCupon, 80000);
  assert.ok(individual.products.every((line) => line.couponApplied && !line.combo));
  assert.equal(price(items, { coupon: coupon(30) }).total, 130000);
  assert.equal(price(items, { coupon: coupon(30) }).descuentoCupon, 0);
  const options = { coupon: coupon(40, { porcentajeDescuentoTarjeta: 12 }) };
  assert.equal(price(items, { ...options, paymentMethod: "online" }).total, 176000);
  assert.equal(price(items, { ...options, paymentMethod: "transfer" }).total, 120000);
  assert.equal(price(items, { paymentMethod: "online" }).total, 200000);
  assert.ok(price(items, { coupon: coupon(90, { categoriaAplicable: "filamento" }) }).products.every((line) => !line.couponApplied));
});

for (const facturaTipo of ["none", "A", "B"]) {
  test(`colores con redondeos: mínimo exhaustivo y payload, factura ${facturaTipo}`, () => {
    const inputs = [item("INS-MATE-BLAN", 3, 6), item("INS-MATE-NEGR", 6, 7), item("INS-MATE-BLAN", 3, 6), item("INS-BOMB-NEGR", 10, 1)];
    const result = price(inputs, { facturaTipo });
    const net = (p, q, d) => facturaTipo === "none"
      ? calculateCheckoutLinePricing(p, q, d).subtotalNeto
      : calculateInvoiceLine({ precioMinoristaConIva: p, cantidad: q, descuentoPorcentaje: d }).netoFinal;
    let minimum = net(6, 6, 27.2) + net(7, 6, 27.2) + net(1, 10, 15);
    for (let white = 0; white <= 6; white++) for (let black = 0; black <= 6; black++) {
      const pairs = white + black;
      if (!pairs || pairs > 10) continue;
      const d = pairs >= 10 ? 35 : 25;
      minimum = Math.min(minimum, net(6, white, d) + net(6, 6 - white, 27.2) + net(7, black, d) + net(7, 6 - black, 27.2) + net(1, pairs, d) + net(1, 10 - pairs, 15));
    }
    assert.equal(result.subtotalSinIva, minimum);
    assert.equal(price([...inputs].reverse(), { facturaTipo }).total, result.total);
    const submitted = buildCartOrderProducts(result.groups, facturaTipo);
    assert.deepEqual(submitted.map((line) => line.cantidad), [6, 6, 10]);
    assert.equal(Math.round(submitted.reduce((sum, line) => sum + line.subtotal, 0) * 100) / 100, facturaTipo === "none" ? minimum : 106.48);
  });
  test(`totales y envío con combo, factura ${facturaTipo}`, () => {
    const result = price([item("INS-MATE-BLAN", 12, 12347), item("INS-BOMB-NEGR", 10, 817)], { facturaTipo });
    const order = buildOrderAmounts({ products: result.products, facturaTipo, shipping: { nombre: "ENVIO", costo: 5599 } });
    assert.equal(hasValidShippingOrder({ shippingItemId: "ENVIO", distanciaEnvio: 10, productos: order.productos, total: order.total, visualTotal: order.total, facturaTipo }), true);
    if (facturaTipo !== "none") assert.equal(order.total, Math.round(order.subtotalSinIva * 121) / 100);
  });
}

test("regresión filamentos: tramos compartidos, cupón y pago online", () => {
  const items = [item("3N3-PLA", 4, 23528, { category: "FILAMENTO 3D" }), item("GRILON3-PLA", 6, 23528, { category: "FILAMENTO 3D" })].map((line) => ({ ...line, weight: 1 }));
  assert.deepEqual(price(items).products.map((line) => line.ajustePorcentaje), [20, 20]);
  assert.equal(price(items).total, Math.round(23528 * 4 * .8) + Math.round(23528 * 6 * .8));
  assert.deepEqual(price(items, { paymentMethod: "online", coupon: coupon(7) }).products.map((line) => line.ajustePorcentaje), [7, 7]);
});

test("sincronizar catálogo detecta cambios de padre, grupo y precio de factura", () => {
  const original = item("TAZA-ROJA", 10);
  for (const changed of [{ parentItemId: "INS-TAZA-GENE" }, { category: "OTRO" }, { invoicePrice: 20000 }]) {
    assert.equal(syncCartItemsWithCatalog([original], [{ ...original.product, ...changed }]).hasChanges, true);
  }
});
