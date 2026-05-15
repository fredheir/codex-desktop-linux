# Remote Connections

This opt-in feature exposes the upstream Codex Remote Connections settings
surface on Linux. It bypasses the upstream remote-connections visibility gates
and changes macOS-specific settings copy to Linux-specific copy.

Enable locally with:

```json
{
  "enabled": [
    "remote-connections"
  ]
}
```

This feature intentionally does not implement new host networking or a
background listener. If the upstream action handlers for SSH discovery, remote
control authorization, or inbound host setup are platform-gated deeper in the
bundle, the UI will surface those failures during testing.

Run the feature tests with:

```bash
node --test linux-features/remote-connections/test.js
```
