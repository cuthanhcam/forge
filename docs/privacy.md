# Privacy Model

Forge is designed around sensitive developer text.

Developers often paste JWTs, JSON payloads, snippets, generated secrets,
encoded URLs, and debugging output into utilities. Forge keeps those workflows
local-first whenever possible.

## Local Processing

Core tools run in the browser. Input is processed by client-side JavaScript
instead of being sent to a Forge backend.

Examples:

- JSON formatting
- YAML conversion
- JWT decoding
- Base64 and URL encoding
- hashing
- password and secret generation
- regex testing
- text diffing

## Browser Storage

Forge may store local workspace preferences in your browser:

- selected theme
- sidebar state
- recent tools
- persisted tool drafts where enabled

This storage is local to the browser profile and device.

## Preview documents

HTML scripts execute in a sandbox without same-origin access to Forge. This
isolation does not block network requests: HTML and Markdown can contain remote
images, styles, links or scripts. Opening such a document can contact external
servers. Inspect resource URLs before previewing confidential content. Exported
Markdown HTML currently links to external KaTeX styles.

## External Links

Some support flows open external services such as GitHub, email, or LinkedIn.
Do not paste private tokens, customer data, credentials, or proprietary source
code into public support channels.

## Self-hosting

If you deploy Forge yourself, your hosting provider, CDN, reverse proxy,
extensions, analytics, and browser environment may affect privacy. Review your
own deployment path before using it with sensitive data.

## Practical Safety Checklist

- Prefer a trusted local or self-hosted deployment for production secrets.
- Redact sensitive values before reporting bugs.
- Rotate any credential that was pasted into an untrusted environment.
- Validate generated secrets and passwords against your own policy.
