const assert = require("node:assert/strict");
const test = require("node:test");

require("sucrase/register/ts");

const {
  buildOrderAddressPayload,
} = require("../src/utils/orderAddress.ts");

const originalAddress = Object.freeze({
  street: "B° Unidad Latinoamérica MC",
  number: "C3",
  city: "Las Heras",
  postalCode: "5539",
  addressWithoutNumber: false,
});

test("envía los campos originales y la dirección normalizada de Google por separado", () => {
  const payload = buildOrderAddressPayload({
    originalAddress,
    googleFormattedAddress:
      "Dorrego 229, M5539 Las Heras, Mendoza, Argentina",
  });

  assert.deepEqual(payload, {
    calle: "B° Unidad Latinoamérica MC",
    ciudad: "Las Heras",
    region: "Mendoza",
    pais: "AR",
    codigo_postal: "5539",
    direccion: "Dorrego 229, M5539 Las Heras, Mendoza, Argentina",
    billing_address: {
      street: "B° Unidad Latinoamérica MC",
      number: "C3",
      city: "Las Heras",
      region: "Mendoza",
      country: "AR",
      postal_code: "5539",
    },
  });
});

test("incluye direccion_link cuando se confirma una URL de Google Maps", () => {
  const payload = buildOrderAddressPayload({
    originalAddress,
    googleFormattedAddress:
      "Dorrego 229, M5539 Las Heras, Mendoza, Argentina",
    googleMapsUrl:
      "https://www.google.com/maps/search/?api=1&query=Dorrego%20229%2C%20Mendoza",
  });

  assert.equal(
    payload.direccion_link,
    "https://www.google.com/maps/search/?api=1&query=Dorrego%20229%2C%20Mendoza"
  );
});

test("omite direccion_link cuando la URL es invalida", () => {
  const payload = buildOrderAddressPayload({
    originalAddress,
    googleFormattedAddress:
      "Dorrego 229, M5539 Las Heras, Mendoza, Argentina",
    googleMapsUrl: "javascript:alert(1)",
  });

  assert.equal(payload.direccion_link, undefined);
});

test("mover el pin cambia solamente direccion y no modifica los datos originales", () => {
  const firstSelection = buildOrderAddressPayload({
    originalAddress,
    googleFormattedAddress:
      "Dorrego 229, M5539 Las Heras, Mendoza, Argentina",
  });
  const secondSelection = buildOrderAddressPayload({
    originalAddress,
    googleFormattedAddress:
      "Dorrego 245, M5539 Las Heras, Mendoza, Argentina",
  });

  assert.equal(
    secondSelection.direccion,
    "Dorrego 245, M5539 Las Heras, Mendoza, Argentina"
  );
  assert.deepEqual(
    { ...secondSelection, direccion: firstSelection.direccion },
    firstSelection
  );
  assert.deepEqual(originalAddress, {
    street: "B° Unidad Latinoamérica MC",
    number: "C3",
    city: "Las Heras",
    postalCode: "5539",
    addressWithoutNumber: false,
  });
});

test("una dirección sin número conserva los demás originales y vacía solo billing number", () => {
  const payload = buildOrderAddressPayload({
    originalAddress: {
      ...originalAddress,
      number: "",
      addressWithoutNumber: true,
    },
    googleFormattedAddress:
      "Barrio Unidad Latinoamérica, M5539 Las Heras, Mendoza, Argentina",
  });

  assert.equal(payload.calle, originalAddress.street);
  assert.equal(payload.billing_address.street, originalAddress.street);
  assert.equal(payload.billing_address.number, "");
  assert.equal(
    payload.direccion,
    "Barrio Unidad Latinoamérica, M5539 Las Heras, Mendoza, Argentina"
  );
});
