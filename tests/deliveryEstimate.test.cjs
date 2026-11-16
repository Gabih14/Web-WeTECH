const assert = require("node:assert/strict");
const test = require("node:test");

require("sucrase/register/ts");

const {
  calculateDeliveryEstimate,
  getKnownShippingZone,
  getShippingZone,
} = require("../src/utils/deliveryEstimate.ts");

const config = { holidays: [], fridayBefore16Delivery: "monday" };
const estimate = (iso, zone) => calculateDeliveryEstimate(new Date(iso), zone, config);

test("calcula las situaciones de aceptación de Gran Mendoza", () => {
  assert.equal(estimate("2026-11-17T14:00:00Z", "gran-mendoza").answer, "Llega hoy");
  assert.equal(estimate("2026-11-17T21:00:00Z", "gran-mendoza").answer, "Llega mañana");
  assert.equal(estimate("2026-11-20T21:00:00Z", "gran-mendoza").answer, "Llega mañana");
  assert.equal(estimate("2026-11-21T15:00:00Z", "gran-mendoza").answer, "Llega hoy");
  assert.equal(estimate("2026-11-21T19:00:00Z", "gran-mendoza").answer, "Llega el lunes");
  assert.equal(estimate("2026-11-22T15:00:00Z", "gran-mendoza").answer, "Llega el lunes");
});

test("calcula las situaciones de aceptación del resto de Mendoza", () => {
  assert.equal(estimate("2026-11-17T14:00:00Z", "resto-mendoza").answer, "Llega mañana");
  assert.equal(estimate("2026-11-17T21:00:00Z", "resto-mendoza").answer, "Llega el jueves");
  assert.equal(estimate("2026-11-20T21:00:00Z", "resto-mendoza").answer, "Llega el martes");
  assert.equal(estimate("2026-11-21T15:00:00Z", "resto-mendoza").answer, "Llega el martes");
  assert.equal(estimate("2026-11-22T15:00:00Z", "resto-mendoza").answer, "Llega el martes");
});

test("salta feriados y clasifica departamentos del Gran Mendoza", () => {
  const holidayConfig = { holidays: ["2026-11-18"], fridayBefore16Delivery: "monday" };
  const result = calculateDeliveryEstimate(new Date("2026-11-17T21:00:00Z"), "gran-mendoza", holidayConfig);
  assert.equal(result.answer, "Llega el jueves");
  assert.equal(getShippingZone("Guaymallén"), "gran-mendoza");
  assert.equal(getShippingZone("San Rafael"), "resto-mendoza");
  assert.equal(getKnownShippingZone("Ciudad desconocida"), undefined);
});
