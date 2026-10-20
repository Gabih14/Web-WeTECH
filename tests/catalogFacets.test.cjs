const assert = require("node:assert/strict");
const test = require("node:test");

require("sucrase/register/ts");

const {
  valuesForFacet,
} = require("../src/utils/catalogFacets.ts");

const facets = [
  { clase: "Material", valores: [{ valor: "PLA", color: null }] },
  {
    clase: "Submaterial",
    valores: [
      { valor: "FIBRA DE CARBONO", color: null },
      { valor: "FIBRA DE VIDRIO", color: null },
      { valor: "SILK", color: null },
    ],
  },
];

test("precarga los valores planos publicados por la faceta Submaterial", () => {
  assert.deepEqual(valuesForFacet(facets, "Submaterial"), [
    "FIBRA DE CARBONO",
    "FIBRA DE VIDRIO",
    "SILK",
  ]);
});

test("oculta Submaterial cuando la faceta no tiene valores", () => {
  assert.deepEqual(valuesForFacet([], "Submaterial"), []);
});

