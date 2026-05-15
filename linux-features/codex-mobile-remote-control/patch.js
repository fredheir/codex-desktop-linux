"use strict";

const VISIBILITY_PATCH_MARKER = "codex-linux-codex-mobile-remote-control-visibility";

function patchFunctionReturnTrue(source, functionName) {
  const pattern = new RegExp(`function ${functionName}\\(\\)\\{`);
  const match = pattern.exec(source);
  if (match == null) {
    console.warn("WARN: Could not find remote control visibility function - skipping Codex Mobile patch");
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
        return `${source.slice(0, bodyStart)}/* ${VISIBILITY_PATCH_MARKER} */return!0${source.slice(index)}`;
      }
    }
  }

  console.warn("WARN: Could not parse remote control visibility function - skipping Codex Mobile patch");
  return source;
}

function remoteControlVisibilityFunctionName(source) {
  if (source.includes("export{c as n,l as r")) {
    return "l";
  }
  return "f";
}

function applyCodexMobileRemoteControlVisibilityPatch(currentSource) {
  if (currentSource.includes(VISIBILITY_PATCH_MARKER)) {
    return currentSource;
  }

  return patchFunctionReturnTrue(
    currentSource,
    remoteControlVisibilityFunctionName(currentSource),
  );
}

module.exports = {
  descriptors: [
    {
      id: "visibility",
      name: "codex-mobile-remote-control-visibility",
      phase: "webview-asset",
      pattern: /^remote-connection-visibility-.*\.js$/,
      missingDescription: "remote connections visibility bundle",
      skipDescription: "Codex Mobile remote-control visibility patch",
      apply: applyCodexMobileRemoteControlVisibilityPatch,
    },
  ],
  applyCodexMobileRemoteControlVisibilityPatch,
};
