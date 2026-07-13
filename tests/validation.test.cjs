const assert = require("node:assert/strict");
const test = require("node:test");

require("sucrase/register/ts");

const {
  isValidCuitCuil,
  normalizeCuitCuil,
} = require("../src/utils/validation.ts");

test("valida CUIT/CUIL con digito verificador y acepta formato con guiones", () => {
  assert.equal(isValidCuitCuil("20-12345678-6"), true);
  assert.equal(normalizeCuitCuil("20-12345678-6"), "20123456786");
});

test("rechaza CUIT/CUIL incompleto o con digito verificador incorrecto", () => {
  assert.equal(isValidCuitCuil("20-12345678-9"), false);
  assert.equal(isValidCuitCuil("2012345678"), false);
});
