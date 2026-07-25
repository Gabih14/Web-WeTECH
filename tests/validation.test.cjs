const assert = require("node:assert/strict");
const test = require("node:test");

require("sucrase/register/ts");

const {
  formatCustomerNameForOrder,
  formatArgentinaMobileForApi,
  getDocumentType,
  isValidCuitCuil,
  normalizeCuitCuil,
  normalizePhoneDigits,
  splitPersonalNameFromRazonSocial,
  stripArgentinaMobilePrefix,
} = require("../src/utils/validation.ts");

test("valida CUIT/CUIL con digito verificador y acepta formato con guiones", () => {
  assert.equal(isValidCuitCuil("20-12345678-6"), true);
  assert.equal(normalizeCuitCuil("20-12345678-6"), "20123456786");
});

test("rechaza CUIT/CUIL incompleto o con digito verificador incorrecto", () => {
  assert.equal(isValidCuitCuil("20-12345678-9"), false);
  assert.equal(isValidCuitCuil("2012345678"), false);
});

test("detecta CUIL por prefijos de persona", () => {
  assert.equal(getDocumentType("20-12345678-6"), "cuil");
  assert.equal(getDocumentType("23-12345678-9"), "cuil");
  assert.equal(getDocumentType("24-12345678-2"), "cuil");
  assert.equal(getDocumentType("27-12345678-4"), "cuil");
});

test("detecta CUIT por prefijos de empresa", () => {
  assert.equal(getDocumentType("30-12345678-1"), "cuit");
  assert.equal(getDocumentType("33-12345678-4"), "cuit");
  assert.equal(getDocumentType("34-12345678-5"), "cuit");
});

test("devuelve null cuando el prefijo no define CUIT o CUIL", () => {
  assert.equal(getDocumentType("99-12345678-0"), null);
});

test("separa razon social de persona con formato apellido coma nombre", () => {
  assert.deepEqual(splitPersonalNameFromRazonSocial("Perez, Juan Carlos"), {
    firstName: "Juan Carlos",
    lastName: "Perez",
  });
});

test("formatea nombre de pedido para CUIL como apellido coma nombre", () => {
  assert.equal(
    formatCustomerNameForOrder({
      documentType: "cuil",
      name: "",
      firstName: "Juan Carlos",
      lastName: "Perez",
    }),
    "Perez, Juan Carlos"
  );
});

test("mantiene razon social CUIT sin transformacion", () => {
  assert.equal(
    formatCustomerNameForOrder({
      documentType: "cuit",
      name: "WeTECH SA",
      firstName: "Juan",
      lastName: "Perez",
    }),
    "WeTECH SA"
  );
});

test("normaliza telefonos argentinos moviles para mostrar solo el numero nacional", () => {
  assert.equal(stripArgentinaMobilePrefix("5492611111111"), "2611111111");
  assert.equal(stripArgentinaMobilePrefix("+54 9 261 111-1111"), "2611111111");
});

test("no autocompleta telefonos sin prefijo argentino movil 549", () => {
  assert.equal(stripArgentinaMobilePrefix("2611111111"), "");
  assert.equal(stripArgentinaMobilePrefix("542611111111"), "");
});

test("formatea telefonos de checkout al estandar de la API", () => {
  assert.equal(formatArgentinaMobileForApi("2611111111"), "5492611111111");
  assert.equal(formatArgentinaMobileForApi("5492611111111"), "5492611111111");
  assert.equal(formatArgentinaMobileForApi("261 111-1111"), "5492611111111");
  assert.equal(normalizePhoneDigits("(261) 111-1111"), "2611111111");
});
