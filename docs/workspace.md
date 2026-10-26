# Workspace settings

Open [Settings](https://forge.cuthanhcam.workers.dev/settings) to choose Light, Dark or System appearance. The same
preference is available in the header and follows device changes in System mode.
Theme, navigator collapse, category collapse, favorites and recent tools are
remembered in this browser. Markdown tabs/outline and Diff options have separate
remembered visibility. Mobile navigation starts closed after reload.

Markdown, HTML, Diff, JSON, JSON/YAML and Regex drafts can persist locally.
JWT tokens, verification secrets and generated passwords/secrets are not saved
by Forge. Saved drafts are not encrypted and browser storage is not a backup.
Blocked/full storage may prevent saving; export important work before leaving.

To reset saved data, use your browser's site-data settings for the current Forge
origin. This removes drafts and preferences together. Clearing a visible input
is not a complete browser-data deletion. Export anything you want to keep first.
Existing tabs may retain in-memory input until they are closed or reloaded.

Use [Support](https://forge.cuthanhcam.workers.dev/support/ask) for questions and [Report an issue](https://forge.cuthanhcam.workers.dev/support/issue)
for bugs. Redact credentials and use synthetic examples. Read
[Tokens, secrets and safe debugging](https://forge.cuthanhcam.workers.dev/docs/safety) before working with sensitive input.

## Loading and connection problems

Forge shows a visual startup loader and tool skeletons rather than a blank page.
If app files fail to load, use Reload page after checking your connection.
Reloading does not clear saved drafts, but unsaved changes in this tab can be lost.
The offline notice is informational: already-loaded tools remain editable; opening
an unloaded tool or external preview resource may require a connection.

If the initial website HTML cannot load at all, the browser may show its own
network error. Forge does not install an offline cache or silently reload your
workspace. Unknown page/document/support routes show a 404 with recovery links.
