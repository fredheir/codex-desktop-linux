"use strict";

const assert = require("node:assert/strict");
const test = require("node:test");

const {
  applyCodexMobileVisibilityPatch,
} = require("./patch.js");

test("Codex Mobile visibility patch enables only the current remote-control gate", () => {
  const source = "function d(){return c(`4114442250`)}function f(){return c(`1042620455`)}";
  const patched = applyCodexMobileVisibilityPatch(source);

  assert.doesNotMatch(patched, /function d\(\)\{\/\* codex-linux-codex-mobile-visibility \*\/return!0\}/);
  assert.match(patched, /function f\(\)\{\/\* codex-linux-codex-mobile-visibility \*\/return!0\}/);
});

test("Codex Mobile visibility patch handles older minified names", () => {
  const source = "function c(){return o(`4114442250`)}function l(){return o(`1042620455`)}export{c as n,l as r}";
  const patched = applyCodexMobileVisibilityPatch(source);

  assert.doesNotMatch(patched, /function c\(\)\{\/\* codex-linux-codex-mobile-visibility \*\/return!0\}/);
  assert.match(patched, /function l\(\)\{\/\* codex-linux-codex-mobile-visibility \*\/return!0\}/);
});
