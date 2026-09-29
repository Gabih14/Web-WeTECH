const assert = require("node:assert/strict");
const test = require("node:test");

require("sucrase/register/ts");

const {
  buildShippingAddressFingerprint,
  buildShippingOrderPayloadFields,
  isShippingQuoteCurrent,
} = require("../src/utils/shippingQuote.ts");

const address = {
  street: "Sarmiento",
  number: "123",
  addressWithoutNumber: false,
  city: "Godoy Cruz",
  postalCode: "5501",
};

const quote = {
  distanciaEnvio: 18,
  provinciaEnvio: "Mendoza",
  departamentoEnvio: "Godoy Cruz",
  addressFingerprint: buildShippingAddressFingerprint(address),
  itemId: "ENV-ZE-ZECARGAS",
  costoTotal: 9999,
};

test("shipping envía la geografía usada para cotizar y el costo", () => {
  assert.deepEqual(buildShippingOrderPayloadFields("shipping", quote, 9999), {
    costo_envio: 9999,
    distancia_envio: 18,
    provincia_envio: "Mendoza",
    departamento_envio: "Godoy Cruz",
  });
});

test("un cambio de dirección invalida la cotización y exige recotizar", () => {
  assert.equal(isShippingQuoteCurrent(quote, address), true);
  assert.equal(isShippingQuoteCurrent(quote, { ...address, number: "125" }), false);
  assert.equal(isShippingQuoteCurrent(quote, { ...address, city: "Guaymallén" }), false);
});

test("pickup fuerza costo cero y no conserva geografía anterior", () => {
  assert.deepEqual(buildShippingOrderPayloadFields("pickup", quote, 9999), {
    costo_envio: 0,
  });
});
