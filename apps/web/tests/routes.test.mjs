import assert from "node:assert/strict";
import test from "node:test";
import { toolsConfig, resolveRoute, toolHref, defaultToolId } from "../src/toolRoutes.ts";

test("every registered tool resolves to its own stable URL", () => {
  const tools = Object.values(toolsConfig).flat();
  assert.equal(new Set(tools.map((tool) => tool.id)).size, tools.length);
  for (const tool of tools) {
    const hash = toolHref(tool.id);
    assert.deepEqual(resolveRoute(hash), { view: "tools", toolId: tool.id, hash });
  }
});

test("legacy and invalid tool routes use the default tool", () => {
  for (const hash of ["#tools", "#tools/", "#tools/missing", "#tools/json-formatter/extra"]) {
    assert.deepEqual(resolveRoute(hash), {
      view: "tools", toolId: defaultToolId, hash: toolHref(defaultToolId),
    });
  }
});

test("home and unknown routes return home", () => {
  for (const hash of ["", "#home", "#missing", "#toolsmith"]) {
    assert.equal(resolveRoute(hash).view, "home");
    assert.equal(resolveRoute(hash).hash, "#home");
  }
});
