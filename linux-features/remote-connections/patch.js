"use strict";

const VISIBILITY_PATCH_MARKER = "codex-linux-remote-connections-visibility";
const COPY_PATCH_MARKER = "codex-linux-remote-connections-copy";

function patchFunctionReturnTrue(source, functionName, label) {
  const pattern = new RegExp(`function ${functionName}\\(\\)\\{`);
  const match = pattern.exec(source);
  if (match == null) {
    console.warn(`WARN: Could not find ${label} function - skipping Remote Connections visibility patch`);
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
        return `${source.slice(0, bodyStart)}/* ${VISIBILITY_PATCH_MARKER}:${label} */return!0${source.slice(index)}`;
      }
    }
  }

  console.warn(`WARN: Could not parse ${label} function - skipping Remote Connections visibility patch`);
  return source;
}

function applyRemoteConnectionsVisibilityPatch(currentSource) {
  if (currentSource.includes(VISIBILITY_PATCH_MARKER)) {
    return currentSource;
  }

  let patchedSource = currentSource;
  const remoteConnectionsFunction = currentSource.includes("export{c as n") ? "c" : "d";
  const remoteControlConnectionsFunction = currentSource.includes("export{c as n,l as r") ? "l" : "f";
  patchedSource = patchFunctionReturnTrue(
    patchedSource,
    remoteConnectionsFunction,
    "remote connections",
  );
  patchedSource = patchFunctionReturnTrue(
    patchedSource,
    remoteControlConnectionsFunction,
    "remote control connections",
  );
  return patchedSource;
}

function replaceAll(source, replacements) {
  let patchedSource = source;
  for (const [from, to] of replacements) {
    patchedSource = patchedSource.split(from).join(to);
  }
  return patchedSource;
}

function applyRemoteConnectionsCopyPatch(currentSource) {
  if (currentSource.includes(COPY_PATCH_MARKER)) {
    return currentSource;
  }

  const patchedSource = replaceAll(currentSource, [
    ["Control this Mac", "Control this Linux host"],
    ["Control this PC", "Control this Linux host"],
    ["from this Mac", "from this Linux host"],
    ["from this PC", "from this Linux host"],
  ]);

  if (patchedSource === currentSource) {
    console.warn("WARN: Could not find Remote Connections settings copy - skipping Linux copy patch");
    return currentSource;
  }

  return `/* ${COPY_PATCH_MARKER} */${patchedSource}`;
}

module.exports = {
  descriptors: [
    {
      id: "visibility",
      name: "remote-connections-visibility",
      phase: "webview-asset",
      pattern: /^remote-connection-visibility-.*\.js$/,
      missingDescription: "remote connections visibility bundle",
      skipDescription: "Remote Connections visibility patch",
      apply: applyRemoteConnectionsVisibilityPatch,
    },
    {
      id: "settings-copy",
      name: "remote-connections-settings-copy",
      phase: "webview-asset",
      pattern: /^remote-connections-settings-.*\.js$/,
      missingDescription: "remote connections settings bundle",
      skipDescription: "Remote Connections Linux copy patch",
      apply: applyRemoteConnectionsCopyPatch,
    },
  ],
  applyRemoteConnectionsCopyPatch,
  applyRemoteConnectionsVisibilityPatch,
};
