# Codex Mobile Remote Control

This opt-in feature exposes the upstream Codex mobile remote-control setup gate
on Linux. It is intentionally narrower than full Remote Connections support:
SSH remote projects are not part of this feature.

Enable locally with:

```json
{
  "enabled": [
    "codex-mobile-remote-control"
  ]
}
```

The host-side mobile path also requires the upstream Codex app-server daemon to
run with remote control enabled:

```bash
codex app-server daemon enable-remote-control
codex app-server daemon start
codex app-server daemon version
```

On this host, mobile setup started working after the daemon registered a row in
`~/.codex/state_5.sqlite` table `remote_control_enrollments`.

Run the feature tests with:

```bash
node --test linux-features/codex-mobile-remote-control/test.js
```
