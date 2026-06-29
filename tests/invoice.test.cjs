const assert = require("node:assert/strict");
const test = require("node:test");

require("sucrase/register/ts");

const {
  applyInvoiceTax,
  calculateInvoiceLine,
  requiresInvoice,
  round2,
  roundPeso,
} = require("../src/utils/invoice.ts");

test("solo factura A y B requieren precios de factura", () => {
  assert.equal(requiresInvoice("none"), false);
  assert.equal(requiresInvoice("A"), true);
  assert.equal(requiresInvoice("B"), true);
});

test("aplica 21% sobre el precio de lista minorista con iva", () => {
  assert.equal(applyInvoiceTax(21764), 26334.44);
});

test("calcula linea de factura redondeando neto final al peso", () => {
  const line = calculateInvoiceLine({
    precioMinoristaConIva: 23528,
    cantidad: 2,
    descuentoPorcentaje: 17,
  });

  assert.equal(line.subtotal, 56937.76);
  assert.equal(line.netoFinal, 39056);
  assert.equal(line.iva, 8201.76);
  assert.equal(line.subtotalFinal, 47257.76);
  assert.equal(line.precio_unitario, 23628.88);
  assert.equal(line.ajuste_porcentaje, 17);
});

test("calcula linea de factura de un producto unitario", () => {
  const line = calculateInvoiceLine({
    precioMinoristaConIva: 32352,
    cantidad: 1,
    descuentoPorcentaje: 17,
  });

  assert.equal(line.subtotal, 39145.92);
  assert.equal(line.netoFinal, 26852);
  assert.equal(line.iva, 5638.92);
  assert.equal(line.subtotalFinal, 32490.92);
  assert.equal(line.precio_unitario, 32490.92);
});

test("usa subtotal S/A override cuando Nacional difiere del calculo matematico", () => {
  const line = calculateInvoiceLine({
    precioMinoristaConIva: 30587,
    cantidad: 1,
    descuentoPorcentaje: 17,
    subtotalSAOverride: 37010.84,
  });

  assert.equal(line.subtotal, 37010.84);
  assert.equal(line.netoFinal, 25388);
  assert.equal(line.iva, 5331.48);
  assert.equal(line.subtotalFinal, 30719.48);
  assert.equal(line.precio_unitario, 30719.48);
});

test("round2 conserva centavos fiscales", () => {
  assert.equal(round2(26334.444), 26334.44);
  assert.equal(round2(26334.445), 26334.45);
  assert.equal(roundPeso(22384.27), 22384);
});
