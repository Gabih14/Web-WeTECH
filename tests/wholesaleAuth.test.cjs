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
