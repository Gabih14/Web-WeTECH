const assert = require("node:assert/strict");
const test = require("node:test");

require("sucrase/register/ts");

const {
  buildMaterialGroups,
  grupoWebLabel,
  hasMaterialFilterOptions,
  isGrupoWebAvailable,
  materialLabel,
  matchesMaterialFilter,
  partitionMaterialGroups,
  preferredSubmaterial,
  setMaterialSearchParams,
  showsSubmaterialOptionsForGrupoWeb,
  submaterialsForGrupoWeb,
} = require("../src/utils/materialFilters.ts");

const product = (material, submaterial, historical = material, grupoWebValues = []) => ({
  material: historical,
  materialClassifications: [{ material, submaterial, grupoWebValues }],
});

test("presenta PLA como PLA / PLA+ sin cambiar su valor", () => {
  assert.equal(materialLabel("PLA"), "PLA / PLA+");
  assert.equal(buildMaterialGroups([product("PLA", null)])[0].material, "PLA");
});

test("usa Submaterial antes que Sub-linea y Sub-linea solo como fallback", () => {
  assert.equal(preferredSubmaterial("SILK", "Ecofila"), "SILK");
  assert.equal(preferredSubmaterial(null, "Ecofila"), "Ecofila");
  assert.equal(preferredSubmaterial("  FLEX  ", "Otra"), "FLEX");
  assert.equal(preferredSubmaterial(null, null), null);
});

test("muestra Estandar como General sin cambiar el valor del filtro", () => {
  assert.equal(grupoWebLabel("Estandar"), "General");
  assert.equal(grupoWebLabel("Tecnico"), "Tecnico");
  assert.equal(grupoWebLabel("Estandar", "PLA"), "PLA General");
  assert.equal(grupoWebLabel("Decorativo", "PLA+"), "PLA Decorativo");
  assert.equal(grupoWebLabel("Tecnico", "PLA"), "PLA Tecnico");
  assert.equal(grupoWebLabel("Tecnico", "PETG"), "Tecnico");
  assert.equal(
    setMaterialSearchParams(new URLSearchParams(), "PLA", null, "Estandar").toString(),
    "material=PLA&grupoWeb=Estandar",
  );
});

test("General no despliega opciones de Submaterial o Sub-linea", () => {
  assert.equal(showsSubmaterialOptionsForGrupoWeb("Estandar"), false);
  assert.equal(showsSubmaterialOptionsForGrupoWeb(" estandar "), false);
  assert.equal(showsSubmaterialOptionsForGrupoWeb("Decorativo"), true);
  assert.equal(showsSubmaterialOptionsForGrupoWeb("Tecnico"), true);
});

test("solo despliega materiales con opciones ademas de Todos", () => {
  const [withoutOptions] = buildMaterialGroups([product("ABS", null)]);
  const [withOptions] = buildMaterialGroups([
    product("PLA", "SILK", "PLA Silk", ["Decorativo"]),
  ]);

  assert.equal(hasMaterialFilterOptions(withoutOptions), false);
  assert.equal(hasMaterialFilterOptions(withOptions), true);
});

test("agrupa PLA y PLA+ bajo la clave PLA", () => {
  const groups = buildMaterialGroups([
    product("PLA", "SILK"),
    product("PLA+", "MATTE"),
  ]);
  assert.deepEqual(groups, [{
    material: "PLA",
    label: "PLA / PLA+",
    grupoWebValues: [],
    submaterials: [
      { value: "MATTE", label: "MATTE", grupoWebValues: [] },
      { value: "SILK", label: "SILK", grupoWebValues: [] },
    ],
  }]);
  assert.equal(matchesMaterialFilter(product("PLA+", null), "PLA", null), true);
  assert.equal(matchesMaterialFilter(product("PLA", null), "PLA+", null), true);
  assert.equal(matchesMaterialFilter({ material: "PLA+" }, "PLA", null), true);
});

test("separa PLA / PLA+ de los materiales Tecnicos", () => {
  const groups = buildMaterialGroups([
    product("PLA", "SILK"),
    product("PLA+", "MATTE"),
    product("PETG", "FIBRA DE CARBONO"),
    product("NYLON", "6"),
  ]);
  const partition = partitionMaterialGroups(groups);

  assert.deepEqual(partition.pla.map(({ material }) => material), ["PLA"]);
  assert.deepEqual(
    partition.technical.map(({ material }) => material),
    ["NYLON", "PETG"],
  );
});

test("unifica cualquier material que solo se diferencia por un + final", () => {
  const groups = buildMaterialGroups([
    product("PETG", null),
    product("PETG+", "FIBRA DE CARBONO"),
  ]);
  assert.deepEqual(groups, [{
    material: "PETG",
    label: "PETG / PETG+",
    grupoWebValues: [],
    submaterials: [{
      value: "FIBRA DE CARBONO",
      label: "FIBRA DE CARBONO",
      grupoWebValues: [],
    }],
  }]);
  assert.equal(matchesMaterialFilter(product("PETG+", null), "PETG", null), true);
});

test("Todos conserva material y elimina submaterial de la query", () => {
  const result = setMaterialSearchParams(
    new URLSearchParams("category=FILAMENTO+3D&material=PLA&submaterial=SILK"),
    "PLA",
    null,
  );
  assert.equal(result.get("material"), "PLA");
  assert.equal(result.has("submaterial"), false);
  assert.equal(result.get("category"), "FILAMENTO 3D");
});

test("seleccionar SILK serializa material y submaterial", () => {
  assert.equal(
    setMaterialSearchParams(new URLSearchParams(), "PLA", "SILK").toString(),
    "material=PLA&submaterial=SILK",
  );
});

test("cambiar de PLA a NYLON elimina el submaterial anterior", () => {
  const result = setMaterialSearchParams(
    new URLSearchParams("material=PLA&submaterial=SILK"),
    "NYLON",
    null,
  );
  assert.equal(result.toString(), "material=NYLON");
});

test("deduplica submateriales con comparacion normalizada", () => {
  const groups = buildMaterialGroups([product("PLA", "SILK"), product("PLA", " silk ")]);
  assert.deepEqual(groups[0].submaterials, [
    { value: "SILK", label: "SILK", grupoWebValues: [] },
  ]);
});

test("precarga solamente submateriales publicados por la faceta", () => {
  const groups = buildMaterialGroups(
    [
      product("PLA", "SILK", "PLA Silk", ["Decorativo"]),
      product("PLA", "LEGACY", "PLA Legacy", ["Decorativo"]),
    ],
    ["SILK"],
  );

  assert.deepEqual(groups[0].submaterials.map(({ value }) => value), ["SILK"]);
});

test("no infiere MATTE desde el valor historico", () => {
  const groups = buildMaterialGroups([product("PLA", null, "PLA+ Matte")]);
  assert.deepEqual(groups[0].submaterials, []);
});

test("una URL historica sigue filtrando por el valor historico", () => {
  assert.equal(matchesMaterialFilter(product("PLA", null, "PLA Boutique"), "PLA Boutique", null), true);
});

test("cada submaterial pertenece solamente a su material", () => {
  const groups = buildMaterialGroups([product("PLA", "SILK"), product("PETG+", "FIBRA DE CARBONO")]);
  assert.deepEqual(
    groups.find((group) => group.material === "PLA").submaterials.map(({ value }) => value),
    ["SILK"],
  );
  assert.deepEqual(
    groups.find((group) => group.material === "PETG").submaterials.map(({ value }) => value),
    ["FIBRA DE CARBONO"],
  );
});

test("asocia Grupo Web al material y solamente a su submaterial real", () => {
  const groups = buildMaterialGroups([
    product("PLA", "SILK", "PLA Silk", ["Decorativo"]),
    product("PLA", "MATTE", "PLA Matte", ["Estandar"]),
    product("PETG", null, "PETG", ["Tecnico"]),
  ]);
  const pla = groups.find((group) => group.material === "PLA");

  assert.deepEqual(pla.grupoWebValues, ["Estandar", "Decorativo"]);
  assert.deepEqual(
    pla.submaterials.find(({ value }) => value === "SILK").grupoWebValues,
    ["Decorativo"],
  );
  assert.deepEqual(
    pla.submaterials.find(({ value }) => value === "MATTE").grupoWebValues,
    ["Estandar"],
  );
  assert.equal(pla.grupoWebValues.includes("Tecnico"), false);
  assert.deepEqual(
    submaterialsForGrupoWeb(pla, "Decorativo").map(({ value }) => value),
    ["SILK"],
  );
  assert.deepEqual(
    submaterialsForGrupoWeb(pla, "Estandar").map(({ value }) => value),
    ["MATTE"],
  );
});

test("deduplica y ordena Grupo Web sin valores hardcodeados", () => {
  const groups = buildMaterialGroups([
    product("PLA", "SILK", "PLA Silk", ["Zeta", " decorativo "]),
    product("PLA+", "SILK", "PLA+ Silk", ["DECORATIVO", "Alfa"]),
  ]);

  assert.deepEqual(groups[0].grupoWebValues, ["Alfa", "decorativo", "Zeta"]);
  assert.deepEqual(groups[0].submaterials[0].grupoWebValues, ["Alfa", "decorativo", "Zeta"]);
});

test("ordena General antes de Decorativo", () => {
  const groups = buildMaterialGroups([
    product("PLA", "SILK", "PLA Silk", ["Decorativo", "Estandar", "Tecnico"]),
  ]);

  assert.deepEqual(groups[0].grupoWebValues, ["Estandar", "Decorativo", "Tecnico"]);
});

test("filtra Grupo Web junto con la combinacion Material y Submaterial", () => {
  const silk = product("PLA", "SILK", "PLA Silk", ["Decorativo"]);
  assert.equal(matchesMaterialFilter(silk, "PLA", null, "Decorativo"), true);
  assert.equal(matchesMaterialFilter(silk, "PLA", "SILK", "Decorativo"), true);
  assert.equal(matchesMaterialFilter(silk, "PLA", "MATTE", "Decorativo"), false);
  assert.equal(matchesMaterialFilter(silk, "PLA", "SILK", "Tecnico"), false);
  assert.equal(matchesMaterialFilter(product("PLA", "SILK"), "PLA", "SILK", null), true);
  assert.equal(matchesMaterialFilter(product("PLA", "SILK"), "PLA", "SILK", "Decorativo"), false);
});

test("serializa Grupo Web para Todos y para un submaterial", () => {
  assert.equal(
    setMaterialSearchParams(new URLSearchParams(), "PLA", null, "Decorativo").toString(),
    "material=PLA&grupoWeb=Decorativo",
  );
  assert.equal(
    setMaterialSearchParams(new URLSearchParams(), "PLA", "SILK", "Decorativo").toString(),
    "material=PLA&submaterial=SILK&grupoWeb=Decorativo",
  );
});

test("quitar Grupo Web conserva Material y Submaterial", () => {
  const result = setMaterialSearchParams(
    new URLSearchParams("material=PLA&submaterial=SILK&grupoWeb=Decorativo"),
    "PLA",
    "SILK",
    null,
  );
  assert.equal(result.toString(), "material=PLA&submaterial=SILK");
});

test("cambiar de material limpia Submaterial y Grupo Web", () => {
  const result = setMaterialSearchParams(
    new URLSearchParams("material=PLA&submaterial=SILK&grupoWeb=Decorativo"),
    "PETG",
    null,
    null,
  );
  assert.equal(result.toString(), "material=PETG");
});

test("detecta Grupo Web valido o invalido para la seleccion exacta", () => {
  const group = buildMaterialGroups([
    product("PLA", "SILK", "PLA Silk", ["Decorativo"]),
    product("PLA", "MATTE", "PLA Matte", ["Estandar"]),
  ])[0];

  assert.equal(isGrupoWebAvailable(group, null, "Decorativo"), true);
  assert.equal(isGrupoWebAvailable(group, "SILK", "Decorativo"), true);
  assert.equal(isGrupoWebAvailable(group, "MATTE", "Decorativo"), false);
  assert.equal(isGrupoWebAvailable(group, "SILK", "Inexistente"), false);
});

test("no inventa Grupo Web desde valores historicos", () => {
  const groups = buildMaterialGroups([{ material: "PLA Boutique" }]);
  assert.deepEqual(groups[0].grupoWebValues, []);
  assert.equal(matchesMaterialFilter({ material: "PLA Silk" }, "PLA Silk", null, "Decorativo"), false);
});
