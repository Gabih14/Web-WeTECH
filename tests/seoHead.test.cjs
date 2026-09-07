const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const ts = require("typescript");

// Minimal head DOM for testing the effect across route transitions, without
// adding a browser dependency to the project's unit test suite.
function documentHead() {
  const nodes = [];
  const document = {
    title: "",
    head: { appendChild: (node) => nodes.push(node) },
    createElement(tag) {
      return {
        tag, setAttribute(key, value) { this[key] = value; },
        remove() { const index = nodes.indexOf(this); if (index !== -1) nodes.splice(index, 1); },
      };
    },
    querySelector(selector) {
      const match = selector.match(/^(\w+)(?:#([\w-]+)|\[(\w+)="([^"]+)"\])$/);
      if (!match) throw new Error(`Unsupported test selector: ${selector}`);
      return nodes.find((node) => node.tag === match[1] &&
        (match[2] ? node.id === match[2] : node[match[3]] === match[4])) || null;
    },
  };
  return { document, nodes };
}

test("SEO head reuses prerendered schema and resets robots/canonical after navigation", async () => {
  const schemaModule = await import("../src/seo/productSchema.mjs");
  const { document, nodes } = documentHead();
  const source = fs.readFileSync(require.resolve("../src/hooks/useSEO.ts"), "utf8")
    .replaceAll("import.meta.env.VITE_SITE_URL", '"https://shop.example"');
  const compiled = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
  }).outputText;
  const exports = {};
  new Function("require", "exports", "document", "window", compiled)(
    (name) => name === "react" ? { useEffect: (effect) => effect() } : schemaModule,
    exports, document, { location: { pathname: "/product/pla" } },
  );
  const canonical = document.createElement("link");
  canonical.rel = "canonical";
  canonical.href = "https://shop.example/product/pla";
  document.head.appendChild(canonical);
  const prerendered = document.createElement("script");
  prerendered.id = schemaModule.STRUCTURED_DATA_ID;
  prerendered.textContent = '{"name":"Initial product"}';
  document.head.appendChild(prerendered);
  document.title = "Initial product | WeTECH";

  exports.useSEO({ title: "Loading", canonicalPath: "/product/pla", pending: true });
  assert.equal(document.title, "Initial product | WeTECH");
  assert.equal(nodes.filter((node) => node.tag === "script").length, 1);
  exports.useSEO({ canonicalPath: "/product/pla", structuredData: { name: "Live product" } });
  assert.equal(nodes.filter((node) => node.tag === "script").length, 1);
  assert.equal(JSON.parse(prerendered.textContent).name, "Live product");

  exports.useSEO({ canonicalPath: "/checkout", noindex: true });
  assert.equal(nodes.filter((node) => node.tag === "script").length, 0);
  assert.equal(document.querySelector('meta[name="robots"]').content, "noindex,follow");
  exports.useSEO({ canonicalPath: "/" });
  assert.match(document.querySelector('meta[name="robots"]').content, /^index,follow/);
  assert.equal(canonical.href, "https://shop.example/");

  exports.useSEO({ canonicalPath: "/product/another", pending: true });
  assert.equal(canonical.href, "https://shop.example/product/another");
  exports.useSEO({ canonicalPath: null, noindex: true });
  assert.equal(document.querySelector('link[rel="canonical"]'), null);
  assert.equal(document.querySelector('meta[property="og:url"]'), null);
  assert.equal(document.querySelector('meta[name="robots"]').content, "noindex,follow");
});
