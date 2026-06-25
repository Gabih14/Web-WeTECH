const assert = require("node:assert/strict");
const test = require("node:test");

require("sucrase/register/ts");

const {
  applyInvoiceSurcharge,
  calculateInvoiceTotal,
  calculateInvoiceSurcharge,
  requiresInvoice,
  round2,
} = require("../src/utils/invoice.ts");

test("sin factura no cambia importes ni requiere factura", () => {
  assert.equal(requiresInvoice("none"), false);
  assert.equal(calculateInvoiceSurcharge(1000, "none"), 0);
  assert.equal(applyInvoiceSurcharge(1000, "none"), 1000);
});

test("factura A suma 21% al total", () => {
  assert.equal(requiresInvoice("A"), true);
  assert.equal(calculateInvoiceSurcharge(1000, "A"), 210);
  assert.equal(applyInvoiceSurcharge(1000, "A"), 1210);
});

test("factura B suma 21% al total", () => {
  assert.equal(requiresInvoice("B"), true);
  assert.equal(calculateInvoiceSurcharge(2500, "B"), 525);
  assert.equal(applyInvoiceSurcharge(2500, "B"), 3025);
});

test("el envio tambien recibe 21% cuando existe", () => {
  const shippingTotal = 3500;

  assert.equal(applyInvoiceSurcharge(shippingTotal, "A"), 4235);
});

test("calcula el total fiscal con centavos para factura A/B", () => {
  const subtotalSinIva = 92496;
  const { iva, total } = calculateInvoiceTotal(subtotalSinIva);

  assert.equal(iva, 19424.16);
  assert.equal(total, 111920.16);
});

test("round2 conserva dos decimales sin redondear al peso", () => {
  assert.equal(round2(111920.164), 111920.16);
  assert.equal(round2(111920.165), 111920.17);
});
