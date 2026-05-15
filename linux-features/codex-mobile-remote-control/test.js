"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const test = require("node:test");

const {
  enabledLinuxFeatureIds,
  loadLinuxFeaturePatchDescriptors,
} = require("../../scripts/lib/linux-features.js");
const {
  applyCodexMobileRemoteControlVisibilityPatch,
} = require("./patch.js");

function withTempFeatureRoot(enabled, callback) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "codex-mobile-remote-control-feature-"));
  try {
    fs.writeFileSync(path.join(root, "features.example.json"), JSON.stringify({ enabled: [] }, null, 2));
    fs.writeFileSync(path.join(root, "features.json"), JSON.stringify({ enabled }, null, 2));
    fs.cpSync(__dirname, path.join(root, "codex-mobile-remote-control"), { recursive: true });
    return callback(root);
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
}

test("Codex Mobile visibility patch enables only the current remote-control gate", () => {
  const source = "function d(){let a=c(`4114442250`);return a}function f(){return c(`1042620455`)}";
  const patched = applyCodexMobileRemoteControlVisibilityPatch(source);

  assert.doesNotMatch(patched, /function d\(\)\{\/\* codex-linux-codex-mobile-remote-control-visibility \*\/return!0\}/);
  assert.match(patched, /function f\(\)\{\/\* codex-linux-codex-mobile-remote-control-visibility \*\/return!0\}/);
});

test("Codex Mobile visibility patch handles older minified names", () => {
  const source = "function c(){let a=o(`4114442250`);return a}function l(){return o(`1042620455`)}export{c as n,l as r}";
  const patched = applyCodexMobileRemoteControlVisibilityPatch(source);

  assert.doesNotMatch(patched, /function c\(\)\{\/\* codex-linux-codex-mobile-remote-control-visibility \*\/return!0\}/);
  assert.match(patched, /function l\(\)\{\/\* codex-linux-codex-mobile-remote-control-visibility \*\/return!0\}/);
});

test("Codex Mobile feature stays disabled until listed in features.json", () => {
  withTempFeatureRoot([], (root) => {
    assert.deepEqual(enabledLinuxFeatureIds({ featuresRoot: root }), []);
    assert.deepEqual(loadLinuxFeaturePatchDescriptors({ featuresRoot: root }), []);
  });
});

test("Codex Mobile feature exposes one webview asset patch when enabled", () => {
  withTempFeatureRoot(["codex-mobile-remote-control"], (root) => {
    assert.deepEqual(enabledLinuxFeatureIds({ featuresRoot: root }), ["codex-mobile-remote-control"]);

    const descriptors = loadLinuxFeaturePatchDescriptors({ featuresRoot: root });
    assert.deepEqual(
      descriptors.map((descriptor) => descriptor.id),
      ["feature:codex-mobile-remote-control:visibility"],
    );
  });
});
