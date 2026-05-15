"use strict";

const PATCH_MARKER = "codex-linux-codex-mobile-visibility";

function patchFunctionReturnTrue(source, functionName) {
  const pattern = new RegExp(`function ${functionName}\\(\\)\\{`);
  const match = pattern.exec(source);
  if (match == null) {
    console.warn("WARN: Could not find Codex Mobile visibility function - skipping patch");
    return source;
  }

  const bodyStart = match.index + match[0].length;
  let depth = 1;
  for (let index = bodyStart; index < source.length; index += 1) {
    const char = source[index];
    if (char === "{") {
      depth += 1;
    } else if (char === "}") {
      depth -= 1;
      if (depth === 0) {
        return `${source.slice(0, bodyStart)}/* ${PATCH_MARKER} */return!0${source.slice(index)}`;
      }
    }
  }

  console.warn("WARN: Could not parse Codex Mobile visibility function - skipping patch");
  return source;
}

function remoteControlVisibilityFunctionName(source) {
  return source.includes("export{c as n,l as r") ? "l" : "f";
}

function applyCodexMobileVisibilityPatch(source) {
  if (source.includes(PATCH_MARKER)) {
    return source;
  }
  return patchFunctionReturnTrue(source, remoteControlVisibilityFunctionName(source));
}

module.exports = {
  descriptors: [
    {
      id: "visibility",
      name: "codex-mobile-visibility",
      phase: "webview-asset",
      pattern: /^remote-connection-visibility-.*\.js$/,
      missingDescription: "remote connections visibility bundle",
      skipDescription: "Codex Mobile visibility patch",
      apply: applyCodexMobileVisibilityPatch,
    },
  ],
  applyCodexMobileVisibilityPatch,
};
