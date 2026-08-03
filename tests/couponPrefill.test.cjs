const assert = require("node:assert/strict");
const test = require("node:test");

require("sucrase/register/ts");

const {
  COUPON_SESSION_STORAGE_KEY,
  captureCouponFromSearch,
  clearStoredCoupon,
  getCouponCodeFromSearch,
  normalizeCouponCode,
  readStoredCoupon,
} = require("../src/utils/couponPrefill.ts");

function createStorage(initialValue) {
  const values = new Map();

  if (initialValue !== undefined) {
    values.set(COUPON_SESSION_STORAGE_KEY, initialValue);
  }

  return {
    getItem(key) {
      return values.get(key) ?? null;
    },
    setItem(key, value) {
      values.set(key, value);
    },
    removeItem(key) {
      values.delete(key);
    },
  };
}

test("normaliza espacios y minúsculas del código", () => {
  assert.equal(normalizeCouponCode("  web20  "), "WEB20");
});

test("lee y decodifica el parámetro cupon", () => {
  assert.equal(getCouponCodeFromSearch("?cupon=web%2020"), "WEB 20");
  assert.equal(getCouponCodeFromSearch("?otro=WEB20"), "");
});

test("captura un cupón no vacío y reemplaza el guardado", () => {
  const storage = createStorage("ANTERIOR");

  assert.equal(captureCouponFromSearch("?cupon=%20nuevo%20", storage), "NUEVO");
  assert.equal(readStoredCoupon(storage), "NUEVO");
});

test("un parámetro ausente o vacío no borra el cupón guardado", () => {
  const storage = createStorage("WEB20");

  assert.equal(captureCouponFromSearch("?cupon=%20%20", storage), "");
  assert.equal(captureCouponFromSearch("?categoria=filamento", storage), "");
  assert.equal(readStoredCoupon(storage), "WEB20");
});

test("elimina el cupón almacenado", () => {
  const storage = createStorage("WEB20");

  clearStoredCoupon(storage);

  assert.equal(readStoredCoupon(storage), "");
});
