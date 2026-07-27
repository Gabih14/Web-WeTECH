const assert = require("node:assert/strict");
const test = require("node:test");

require("sucrase/register/ts");

const {
  deriveCouponCategory,
  getCouponPercentageForPaymentMethod,
  isCouponApplicableToProductCategory,
  selectCheckoutDiscount,
} = require("../src/utils/checkoutDiscount.ts");

const coupon = {
  code: "METODO",
  porcentajeDescuento: 10,
  porcentajeDescuentoTarjeta: 12,
  porcentajeDescuentoTransferencia: 18,
  activo: true,
  fechaDesde: new Date("2026-01-01"),
  fechaHasta: new Date("2026-12-31"),
};

test("usa TARJETA para online y CUENTA para transferencia como el backend", () => {
  assert.equal(
    getCouponPercentageForPaymentMethod(coupon, "online"),
    12
  );
  assert.equal(
    getCouponPercentageForPaymentMethod(coupon, "transfer"),
    18
  );
});

test("elige el cupón cuando su porcentaje es mayor", () => {
  assert.deepEqual(
    selectCheckoutDiscount({
      automaticPercentage: 17,
      couponPercentage: 20,
    }),
    { percentage: 20, source: "coupon" }
  );
});

test("elige el descuento automático cuando es mayor", () => {
  assert.deepEqual(
    selectCheckoutDiscount({
      automaticPercentage: 20,
      couponPercentage: 17,
    }),
    { percentage: 20, source: "automatic" }
  );
});

test("no suma cupón y descuento automático", () => {
  assert.notEqual(
    selectCheckoutDiscount({
      automaticPercentage: 17,
      couponPercentage: 20,
    }).percentage,
    37
  );
});

test("en caso de empate conserva el descuento automático", () => {
  assert.deepEqual(
    selectCheckoutDiscount({
      automaticPercentage: 17,
      couponPercentage: 17,
    }),
    { percentage: 17, source: "automatic" }
  );
});

test("aplica un cupón de categoría solamente a productos compatibles", () => {
  assert.equal(
    isCouponApplicableToProductCategory({
      couponCategory: "filamento",
      productCategory: "FILAMENTO 3D",
    }),
    true
  );
  assert.equal(
    isCouponApplicableToProductCategory({
      couponCategory: "filamento",
      productCategory: "REPUESTOS",
    }),
    false
  );
  assert.equal(
    isCouponApplicableToProductCategory({
      couponCategory: null,
      productCategory: "IMPRESORAS",
    }),
    true
  );
});

test("deriva categorías con la misma regla del backend", () => {
  assert.equal(deriveCouponCategory("FILAMENTOS"), "filamento");
  assert.equal(deriveCouponCategory("FILAMENTO 3D"), "filamento");
  assert.equal(deriveCouponCategory("IMPRESORAS"), "impresora");
  assert.equal(deriveCouponCategory("REPUESTOS"), "repuesto");
});
