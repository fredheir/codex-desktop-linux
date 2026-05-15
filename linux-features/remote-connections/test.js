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
  applyRemoteConnectionsCopyPatch,
  applyRemoteConnectionsVisibilityPatch,
} = require("./patch.js");

function withTempFeatureRoot(enabled, callback) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "codex-remote-connections-feature-"));
  try {
    fs.writeFileSync(path.join(root, "features.example.json"), JSON.stringify({ enabled: [] }, null, 2));
    fs.writeFileSync(path.join(root, "features.json"), JSON.stringify({ enabled }, null, 2));
    fs.cpSync(__dirname, path.join(root, "remote-connections"), { recursive: true });
    return callback(root);
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
}

test("Remote Connections visibility gate returns true for both upstream gates", () => {
  const source = "function d(){let a=c(`4114442250`);return a}function f(){return c(`1042620455`)}";
  const patched = applyRemoteConnectionsVisibilityPatch(source);

  assert.match(patched, /function d\(\)\{\/\* codex-linux-remote-connections-visibility:remote connections \*\/return!0\}/);
  assert.match(patched, /function f\(\)\{\/\* codex-linux-remote-connections-visibility:remote control connections \*\/return!0\}/);
});

test("Remote Connections visibility gate handles older minified names", () => {
  const source = "function c(){let a=o(`4114442250`);return a}function l(){return o(`1042620455`)}export{c as n,l as r}";
  const patched = applyRemoteConnectionsVisibilityPatch(source);

  assert.match(patched, /function c\(\)\{\/\* codex-linux-remote-connections-visibility:remote connections \*\/return!0\}/);
  assert.match(patched, /function l\(\)\{\/\* codex-linux-remote-connections-visibility:remote control connections \*\/return!0\}/);
});

test("Remote Connections copy patch uses Linux labels", () => {
  const source = "Control this Mac from your phone. SSH connections from this Mac. un.remoteControlClientsDeviceLabelMac";
  const patched = applyRemoteConnectionsCopyPatch(source);

  assert.match(patched, /Control this Linux host from your phone/);
  assert.match(patched, /SSH connections from this Linux host/);
  assert.match(patched, /un\.remoteControlClientsDeviceLabelMac/);
});

test("Remote Connections feature stays disabled until listed in features.json", () => {
  withTempFeatureRoot([], (root) => {
    assert.deepEqual(enabledLinuxFeatureIds({ featuresRoot: root }), []);
    assert.deepEqual(loadLinuxFeaturePatchDescriptors({ featuresRoot: root }), []);
  });
});

test("Remote Connections feature exposes webview asset patches when enabled", () => {
  withTempFeatureRoot(["remote-connections"], (root) => {
    assert.deepEqual(enabledLinuxFeatureIds({ featuresRoot: root }), ["remote-connections"]);

    const descriptors = loadLinuxFeaturePatchDescriptors({ featuresRoot: root });
    assert.deepEqual(
      descriptors.map((descriptor) => descriptor.id),
      [
        "feature:remote-connections:visibility",
        "feature:remote-connections:settings-copy",
      ],
    );
  });
});
