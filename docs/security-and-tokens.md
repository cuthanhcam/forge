# Tokens, secrets and safe debugging

## Decode is not validation

JWT Decoder reads three-part signed-token (JWS) header and payload JSON. Decoding
Base64URL does not authenticate a token and does not decrypt an encrypted JWT
(JWE). Treat decoded claims as untrusted input.

Forge can check HS256, HS384 and HS512 signatures with a shared secret supplied
in this browser. A matching signature only proves a match for that key and
algorithm. It does not establish the correct issuer, audience, intended token
use, expiration policy, revocation state or authorization. Asymmetric signature
verification and JWE decryption are not implemented. Example keys and tokens are
public test fixtures and must never be used in production.

Validate tokens in your application's trusted authentication stack: restrict
allowed algorithms, use trusted keys, validate issuer/audience and required time
claims, then apply your own authorization rules. Never trust the token's chosen
algorithm or a displayed role by itself. See [RFC 7519](https://www.rfc-editor.org/rfc/rfc7519)
and [JWT best current practices, RFC 8725](https://www.rfc-editor.org/rfc/rfc8725).

## Secrets, passwords and hashes

Generate secrets on a trusted HTTPS or localhost deployment with Web Crypto.
Length is not a complete security policy: use the required entropy/algorithm,
store secrets in your secret manager and rotate them through your application.
Do not use documentation examples or the built-in verification secret as real keys.
Ordinary digest hashes are not a password-storage scheme; use a purpose-built
password hashing implementation in your server stack. Base64 is encoding, not encryption.

## What stays in the browser

Forge does not persist JWT tokens, verification secrets, generated passwords or
generated JWT secrets. Inputs still exist in page memory while you use them;
clipboard contents, downloads, screenshots, extensions and developer tools are
outside this guarantee. Some other tools save drafts, including Markdown, HTML,
Diff, JSON, JSON/YAML and Regex. Those drafts can contain sensitive data too.

Browser storage is not an encrypted vault. Clear this site's data in browser
settings to remove saved drafts/preferences; export wanted drafts first.
Private browsing may reduce persistence but does not isolate unsafe previews,
extensions or an untrusted device. See [the privacy model](/privacy).

## Preview boundaries and reporting

Markdown is sanitized and Mermaid uses strict rendering. HTML Preview executes
scripts inside a sandbox without access to Forge's DOM/storage. This is not a
network firewall: external images, styles, scripts or links can contact their
hosts. Inspect document resources before previewing confidential content.

Use synthetic examples for support. Never send a live bearer token, signing
secret, credential or customer data to public issues, email or screenshots.
Report a vulnerability privately to cuthanhcam04@gmail.com; see
[SECURITY.md](https://github.com/cuthanhcam/forge/blob/main/SECURITY.md).
