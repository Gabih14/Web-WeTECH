require("sucrase/register/ts");

const test = require("node:test");
const assert = require("node:assert/strict");
const {
  createClerkAuthorizationHeaders,
  MissingAuthenticationError,
} = require("../src/utils/clerkRequest.ts");
const {
  getEcommerceAuthAction,
} = require("../src/utils/ecommerceAuthState.ts");
const {
  hasWholesaleAccess,
} = require("../src/types/ecommerceUser.ts");
const { validateWholesaleRequest } = require("../src/utils/wholesaleRequest.ts");

test("Clerk loading waits and signed out clears ecommerce state", () => {
  assert.equal(getEcommerceAuthAction(false, undefined), "WAIT");
  assert.equal(getEcommerceAuthAction(true, false), "CLEAR");
  assert.equal(getEcommerceAuthAction(true, true), "LOAD");
});

test("only APROBADO enables wholesale access", () => {
  for (const status of [
    "NO_SOLICITADO",
    "PENDIENTE",
    "RECHAZADO",
    "SUSPENDIDO",
    null,
  ]) {
    assert.equal(hasWholesaleAccess(status), false);
  }

  assert.equal(hasWholesaleAccess("APROBADO"), true);
});

test("authenticated headers use Clerk token and preserve existing headers", async () => {
  const headers = await createClerkAuthorizationHeaders(
    async () => "session-token",
    { Accept: "application/json", "X-Request-Id": "request-1" }
  );

  assert.equal(headers.get("Authorization"), "Bearer session-token");
  assert.equal(headers.get("Accept"), "application/json");
  assert.equal(headers.get("X-Request-Id"), "request-1");
});

test("missing Clerk authentication fails intentionally", async () => {
  await assert.rejects(
    createClerkAuthorizationHeaders(async () => null),
    MissingAuthenticationError
  );
});

test("wholesale request trims and validates the submitted fields", () => {
  const result = validateWholesaleRequest({
    nombreComercio: " Impresiones Cuyo ",
    personaResponsable: " Ana Pérez ",
    ubicacionZona: " Godoy Cruz, Mendoza ",
    telefono: " 2615551234 ",
    figuraFiscalComercial: "EMPRENDEDOR_MONOTRIBUTISTA",
    perfilCompraInicial: "GRAN_CONSUMIDOR_FINAL_96_239_KG",
    sedeComercial: "TALLER_OFICINA",
    ofertasPublico: ["SERVICIO_IMPRESION_3D", "VENTA_ACTUAL_FILAMENTOS", "SERVICIO_IMPRESION_3D"],
    marcasFilamento: " WeTech, Grilon3 ",
  });

  assert.deepEqual(result, {
    values: {
      nombreComercio: "Impresiones Cuyo",
      personaResponsable: "Ana Pérez",
      ubicacionZona: "Godoy Cruz, Mendoza",
      telefono: "2615551234",
      figuraFiscalComercial: "EMPRENDEDOR_MONOTRIBUTISTA",
      perfilCompraInicial: "GRAN_CONSUMIDOR_FINAL_96_239_KG",
      sedeComercial: "TALLER_OFICINA",
      ofertasPublico: ["SERVICIO_IMPRESION_3D", "VENTA_ACTUAL_FILAMENTOS"],
      marcasFilamento: "WeTech, Grilon3",
    },
    errors: {},
  });
});

test("wholesale request requires every field and at least one public offer", () => {
  const result = validateWholesaleRequest({
    nombreComercio: " ", personaResponsable: "", ubicacionZona: "", telefono: "",
    figuraFiscalComercial: "", perfilCompraInicial: "", sedeComercial: "",
    ofertasPublico: [], marcasFilamento: "ignored",
  });

  assert.deepEqual(Object.keys(result.errors).sort(), [
    "figuraFiscalComercial", "nombreComercio", "ofertasPublico", "perfilCompraInicial",
    "personaResponsable", "sedeComercial", "telefono", "ubicacionZona",
  ].sort());
  assert.equal("marcasFilamento" in result.values, false);
});

test("filament brands are conditional and required for filament sales", () => {
  const base = {
    nombreComercio: "Comercio", personaResponsable: "Persona", ubicacionZona: "Zona", telefono: "123",
    figuraFiscalComercial: "SOCIEDAD_SIMPLE", perfilCompraInicial: "PLUS_960_KG",
    sedeComercial: "LOCAL_PUBLICO", ofertasPublico: ["VENTA_ACTUAL_FILAMENTOS"], marcasFilamento: " ",
  };
  const result = validateWholesaleRequest(base);

  assert.equal(result.errors.marcasFilamento, "Ingresá al menos una marca de filamento.");
  assert.equal(result.values.marcasFilamento, "");
});

test("wholesale navbar shows the request button and submits into pending state", () => {
  const fs = require("node:fs");
  const path = require("node:path");
  const indicator = fs.readFileSync(
    require("node:path").join(__dirname, "../src/components/layout/WholesaleStatusIndicator.tsx"),
    "utf8"
  );
  const modal = fs.readFileSync(
    path.join(__dirname, "../src/components/layout/WholesaleRequestModal.tsx"),
    "utf8"
  );

  assert.match(indicator, /NO_SOLICITADO[\s\S]*Solicitar acceso mayorista/);
  assert.match(modal, /"\/mayorista\/solicitud"[\s\S]*method: "POST"[\s\S]*JSON\.stringify\(validated\.values\)/);
  assert.match(modal, /setWholesaleStatus\("PENDIENTE"\)/);
  assert.equal(require("../src/types/ecommerceUser.ts").WHOLESALE_STATUS_LABELS.PENDIENTE, "Solicitud mayorista pendiente de revisión");
});
