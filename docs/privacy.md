# Privacy Policy

Last updated: October 26, 2026

## Scope and contact

This policy describes the Forge application maintained at
[cuthanhcam/forge](https://github.com/cuthanhcam/forge). Core tools do not require
an account. For privacy questions, contact cuthanhcam04@gmail.com. A fork or
self-hosted deployment can change this behavior; review the version you use.

## Local processing

Formatting, conversion, JWT inspection, encoding, hashing, text comparison,
regular-expression testing and generation run in client-side JavaScript. Forge
does not provide an application backend that receives tool input for processing.
This does not isolate page memory from your device, browser extensions, developer
tools or malicious preview content.

## Storage and retention

Forge uses browser local storage for theme, navigator/category collapse,
favorites, recent tools and tool preferences/drafts where enabled. Markdown,
HTML, Diff, JSON Formatter, JSON/YAML and Regex can save drafts. These drafts may
contain sensitive text and are not encrypted. Command-search queries are not
saved as a search history by Forge.

JWT tokens, verification secrets and generated passwords/JWT secrets are not
persisted by Forge. They remain in page memory while used. Clipboard contents,
exported files, screenshots and browser/extension behavior have separate
lifecycles and are not removed when Forge clears an input.

Storage belongs to the browser profile and origin until you, the browser or site
settings remove it. Forge does not set a fixed retention period for local drafts
or maintain a server copy/backup. Storage can be unavailable, full or evicted;
export important drafts before leaving or clearing data.

## Preview documents and network requests

Markdown is sanitized and Mermaid uses strict rendering. HTML Preview executes
scripts in a sandbox without same-origin access to Forge's DOM/storage. That
sandbox is not a network firewall: document images, styles, links and scripts
can contact external hosts, and untrusted scripts can make their own requests.
Review resource URLs and code before previewing confidential documents.
Exported Markdown HTML currently references an external KaTeX stylesheet.

The hosting provider, CDN or reverse proxy may process request metadata such as
IP addresses, requested routes and browser headers when delivering the app.
Their logs and retention are controlled by that operator. Local processing of
tool input does not mean that loading the website creates no network traffic.

## Analytics, external links and support

The maintained Forge application does not include an advertising profile or
application analytics workflow. A different deployment may add telemetry; its
operator must explain those changes rather than relying on this policy.

Repository, social, sponsorship and support links open external providers.
Those providers handle information under their own policies. Social icons are
links, not embedded feeds or tracking widgets. Forge does not process donations
or payment details.

The support form keeps its subject/message in the current page's memory. It
does not save a ticket or submit the message. Open email passes the draft to your
mail app for review; actually sending it shares the message with the recipient
and email providers. GitHub issues are public. Use synthetic examples and never
include live tokens, signing keys, passwords or customer data, including in email.

## Your controls

Clear this site's data in browser settings to remove saved drafts and preferences
for the current origin. Export wanted drafts first, then close or reload open
Forge tabs so they do not retain or rewrite in-memory state. Clearing visible
input is not a complete deletion of saved browser data or downloaded files.

Private browsing may reduce persistence but does not protect an untrusted device,
extension or preview. Use a trusted local/self-hosted build when appropriate.
If a credential is exposed, rotate it through the system that owns it.

## Changes and responsible reporting

The date above records the latest policy revision. Material behavior changes
should update this document and the in-app policy together. The in-app Privacy
page renders this maintained Markdown to avoid conflicting versions.

Report a vulnerability privately to cuthanhcam04@gmail.com using
[SECURITY.md](https://github.com/cuthanhcam/forge/blob/main/SECURITY.md). For
non-sensitive product problems, use the
[issue tracker](https://github.com/cuthanhcam/forge/issues).
