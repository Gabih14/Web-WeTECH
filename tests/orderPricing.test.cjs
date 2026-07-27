const assert = require("node:assert/strict");
const test = require("node:test");

require("sucrase/register/ts");

const {
  buildOrderAmounts,
  calculateOrderLineAmounts,
  calculateOrderTotal,
  hasValidOrderLineAmounts,
  isShippingProductName,
} = require("../src/utils/orderPricing.ts");
const {
  calculateCheckoutLinePricing,
} = require("../src/utils/checkoutPricing.ts");
const {
  calculateDiscountedLineTotalForProduct,
  calculateDiscountedPriceForProduct,
} = require("../src/utils/discounts.ts");
const {
  isCouponApplicableToProductCategory,
  selectCheckoutDiscount,
} = require("../src/utils/checkoutDiscount.ts");

test("caso 1: checkout y payload preservan el subtotal de línea descontado", () => {
  const checkoutLine = calculateCheckoutLinePricing(23528, 5, 17);
  const order = buildOrderAmounts({
    products: [
      {
        nombre: "PRODUCTO-1",
        cantidad: 5,
        precioBaseUnitario: 23528,
        ajustePorcentaje: 17,
      },
    ],
  });

  assert.deepEqual(checkoutLine, {
    subtotalBruto: 117640,
    subtotalNeto: 97641,
    precioUnitarioNeto: 19528,
  });
  assert.deepEqual(order, {
    productos: [
      {
        nombre: "PRODUCTO-1",
        cantidad: 5,
        precio_unitario: 19528,
        subtotal: 97641,
        ajuste_porcentaje: 17,
      },
    ],
    total: 97641,
    costoEnvio: 0,
    descuentoCupon: 0,
    subtotalSinIva: 97641,
    ivaImporte: 0,
  });
  assert.equal(order.productos[0].precio_unitario * 5, 97640);
  assert.equal(hasValidOrderLineAmounts(order.productos), true);
});

test("caso 2: agrega el envío exactamente una vez", () => {
  const order = buildOrderAmounts({
    products: [
      {
        nombre: "PRODUCTO-2",
        cantidad: 10,
        precioBaseUnitario: 3499,
        ajustePorcentaje: 0,
      },
    ],
    shipping: {
      nombre: "ENVIO",
      costo: 5599,
    },
  });

  assert.deepEqual(order, {
    productos: [
      {
        nombre: "PRODUCTO-2",
        cantidad: 10,
        precio_unitario: 3499,
        subtotal: 34990,
        ajuste_porcentaje: 0,
      },
      {
        nombre: "ENVIO",
        cantidad: 1,
        precio_unitario: 5599,
        subtotal: 5599,
        ajuste_porcentaje: 0,
      },
    ],
    total: 40589,
    costoEnvio: 5599,
    descuentoCupon: 0,
    subtotalSinIva: 40589,
    ivaImporte: 0,
  });
  assert.equal(
    calculateOrderTotal([order.productos[0].subtotal], order.costoEnvio),
    40589
  );
  assert.equal(
    isShippingProductName("ENV-07K-GM-DELIVERY"),
    true
  );
});

test("los descuentos automáticos usan la fórmula de línea completa", () => {
  const product = { id: "3N3-PLA", category: "FILAMENTO 3D" };

  assert.equal(
    calculateDiscountedLineTotalForProduct(product, 23528, 5, 1, 5),
    97641
  );
  assert.equal(
    calculateDiscountedPriceForProduct(product, 23528, 5, 1, 5),
    19528
  );
});

test("el payload aplica el mayor porcentaje entre automático y cupón", () => {
  const decision = selectCheckoutDiscount({
    automaticPercentage: 17,
    couponPercentage: 20,
  });
  const order = buildOrderAmounts({
    products: [
      {
        nombre: "PRODUCTO-CUPON",
        cantidad: 5,
        precioBaseUnitario: 23528,
        ajustePorcentaje: decision.percentage,
        couponApplied: decision.source === "coupon",
      },
    ],
    shipping: {
      nombre: "ENV-07K-GM-DELIVERY",
      costo: 5599,
    },
  });

  assert.equal(decision.source, "coupon");
  assert.deepEqual(order.productos[0], {
    nombre: "PRODUCTO-CUPON",
    cantidad: 5,
    precio_unitario: 18822,
    subtotal: 94112,
    ajuste_porcentaje: 20,
  });
  assert.equal(order.productos[1].ajuste_porcentaje, 0);
  assert.equal(order.productos[1].subtotal, 5599);
  assert.equal(order.total, 99711);
  assert.equal(order.descuentoCupon, 23528);
});

test("automático 20% supera al cupón 17% y descuento_cupon queda en cero", () => {
  const decision = selectCheckoutDiscount({
    automaticPercentage: 20,
    couponPercentage: 17,
  });
  const order = buildOrderAmounts({
    products: [
      {
        nombre: "PRODUCTO-AUTO-20",
        cantidad: 5,
        precioBaseUnitario: 23528,
        ajustePorcentaje: decision.percentage,
        couponApplied: decision.source === "coupon",
      },
    ],
  });

  assert.equal(decision.source, "automatic");
  assert.equal(order.productos[0].subtotal, 94112);
  assert.equal(order.descuentoCupon, 0);
});

test("automático 17% empata al cupón 17% y descuento_cupon queda en cero", () => {
  const decision = selectCheckoutDiscount({
    automaticPercentage: 17,
    couponPercentage: 17,
  });
  const order = buildOrderAmounts({
    products: [
      {
        nombre: "PRODUCTO-EMPATE",
        cantidad: 5,
        precioBaseUnitario: 23528,
        ajustePorcentaje: decision.percentage,
        couponApplied: decision.source === "coupon",
      },
    ],
  });

  assert.equal(decision.source, "automatic");
  assert.equal(order.productos[0].subtotal, 97641);
  assert.equal(order.descuentoCupon, 0);
});

test("un cupón por categoría sólo modifica las líneas aplicables", () => {
  const categories = ["FILAMENTO 3D", "REPUESTOS"];
  const decisions = categories.map((productCategory) =>
    selectCheckoutDiscount({
      automaticPercentage: 0,
      couponPercentage: isCouponApplicableToProductCategory({
        couponCategory: "filamento",
        productCategory,
      })
        ? 20
        : 0,
    })
  );
  const order = buildOrderAmounts({
    products: decisions.map((decision, index) => ({
      nombre: `PRODUCTO-${index + 1}`,
      cantidad: 1,
      precioBaseUnitario: 100,
      ajustePorcentaje: decision.percentage,
      couponApplied: decision.source === "coupon",
    })),
  });

  assert.equal(order.productos[0].subtotal, 80);
  assert.equal(order.productos[1].subtotal, 100);
  assert.equal(order.descuentoCupon, 20);
  assert.equal(order.total, 180);
});

test("la validación acepta la diferencia válida entre subtotal y unitario por cantidad", () => {
  assert.equal(
    hasValidOrderLineAmounts([
      {
        cantidad: 5,
        precio_unitario: 19528,
        subtotal: 97641,
        ajuste_porcentaje: 17,
      },
    ]),
    true
  );
});

test("factura A/B conserva dos decimales y redondea el total fiscal", () => {
  const order = buildOrderAmounts({
    products: [
      {
        nombre: "PRODUCTO-FACTURA",
        cantidad: 2,
        precioBaseUnitario: 23528,
        ajustePorcentaje: 17,
      },
    ],
    shipping: {
      nombre: "ENVIO",
      costo: 5599,
    },
    facturaTipo: "A",
  });

  assert.deepEqual(order.productos[0], {
    nombre: "PRODUCTO-FACTURA",
    cantidad: 2,
    precio_unitario: 23628.88,
    subtotal: 56937.76,
    ajuste_porcentaje: 17,
  });
  assert.deepEqual(order.productos[1], {
    nombre: "ENVIO",
    cantidad: 1,
    precio_unitario: 6774.79,
    subtotal: 6774.79,
    ajuste_porcentaje: 0,
  });
  assert.equal(order.costoEnvio, 5599);
  assert.equal(order.subtotalSinIva, 44655);
  assert.equal(order.ivaImporte, 9377.55);
  assert.equal(order.total, 54032.55);
  assert.equal(order.descuentoCupon, 0);
  assert.equal(hasValidOrderLineAmounts(order.productos, "A"), true);
});

test("factura B calcula cupón completo sobre el neto y excluye envío", () => {
  const order = buildOrderAmounts({
    products: [
      {
        nombre: "PRODUCTO-FACTURA-CUPON",
        cantidad: 2,
        precioBaseUnitario: 23528,
        ajustePorcentaje: 20,
        couponApplied: true,
      },
    ],
    shipping: {
      nombre: "ENV-07K-GM-DELIVERY",
      costo: 5599,
    },
    facturaTipo: "B",
  });

  assert.deepEqual(order.productos[0], {
    nombre: "PRODUCTO-FACTURA-CUPON",
    cantidad: 2,
    precio_unitario: 22775.23,
    subtotal: 56937.76,
    ajuste_porcentaje: 20,
  });
  assert.equal(order.costoEnvio, 5599);
  assert.equal(order.descuentoCupon, 9411);
  assert.equal(order.subtotalSinIva, 43244);
  assert.equal(order.ivaImporte, 9081.24);
  assert.equal(order.total, 52325.24);
});

test("rechaza centavos en productos sin factura pero los acepta con factura", () => {
  const lineWithCents = calculateOrderLineAmounts({
    cantidad: 2,
    precioBaseUnitario: 23528,
    ajustePorcentaje: 17,
    facturaTipo: "B",
  });

  assert.equal(hasValidOrderLineAmounts([lineWithCents], "none"), false);
  assert.equal(hasValidOrderLineAmounts([lineWithCents], "B"), true);
});
