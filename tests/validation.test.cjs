const assert = require("node:assert/strict");
const test = require("node:test");

require("sucrase/register/ts");

const {
  formatArgentinaMobileForApi,
  isValidCuitCuil,
  normalizeCuitCuil,
  normalizePhoneDigits,
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
