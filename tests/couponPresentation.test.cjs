const assert = require("node:assert/strict");
const test = require("node:test");

require("sucrase/register/ts");

const {
  formatCouponDate,
  getCouponCategoryLabel,
  getCouponExpiryCopy,
} = require("../src/utils/couponPresentation.ts");

test("formatea fechas de cupón como DD/MMM/AAAA", () => {
  assert.equal(
    formatCouponDate("2026-11-22T23:59:59.000Z"),
    "22/NOV/2026"
  );
});

test("avisa los últimos tres días de vigencia", () => {
  const now = new Date("2026-11-19T15:00:00.000Z");
  assert.equal(
    getCouponExpiryCopy("2026-11-22T23:59:59.000Z", now),
    "vence en 3 días"
  );
  assert.equal(
    getCouponExpiryCopy("2026-11-19T23:59:59.000Z", now),
    "vence hoy"
  );
});

test("usa la fecha completa cuando faltan más de tres días", () => {
  assert.equal(
    getCouponExpiryCopy(
      "2026-12-31T23:59:59.000Z",
      new Date("2026-11-17T15:00:00.000Z")
    ),
    "vence el 31/DIC/2026"
  );
});

test("presenta las categorías en plural", () => {
  assert.equal(getCouponCategoryLabel("filamento"), "filamentos");
  assert.equal(getCouponCategoryLabel("impresora"), "impresoras");
  assert.equal(getCouponCategoryLabel("repuesto"), "repuestos");
});
