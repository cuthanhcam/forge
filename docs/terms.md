# Terms of Use

Last updated: October 26, 2026

## Scope

Forge is an open-source developer utility for inspecting and transforming data,
previewing documents and generating values. These terms explain the expectations
for the hosted application and the limitations of its output. Check the version
and operator of a fork or self-hosted copy before relying on its behavior.

## Open-source license

Forge's source code is distributed under the
[MIT license](https://github.com/cuthanhcam/forge/blob/main/LICENSE). That license
governs copying, modification, distribution and the software's warranty/liability
terms. This page does not replace or reduce the permissions granted by LICENSE.
Third-party components retain their own licenses; review those when redistributing
or modifying a build.

## Your input and results

You control the material you enter, export and share. Use content you are allowed
to process and check results against your own requirements. Formatting, decoding,
converting or generating a value does not certify that it is safe, correct,
compliant or suitable for a production system.

Forge does not claim ownership of your input or exported output merely because
you use a tool. You remain responsible for any third-party rights in that material.
No core tool requires submitting input to Forge for processing. See the
[Privacy Policy](https://forge.cuthanhcam.workers.dev/privacy) for storage and
network boundaries.

## Tokens and cryptographic checks

JWT decoding does not authenticate a token. Forge supports local HMAC signature
checks for HS256, HS384 and HS512; a match does not establish the intended issuer,
audience, time validity, revocation status, authorization or correct key choice.
Asymmetric signature verification and JWE decryption are not implemented.

Use your trusted authentication stack to validate tokens and apply authorization.
Built-in tokens and example signing secrets are public fixtures, never production
credentials. Generated secrets/passwords still need appropriate entropy, storage,
rotation and access controls. Hashing and encoding are not substitutes for a
password-storage scheme or encryption. See
[Tokens and safety](https://forge.cuthanhcam.workers.dev/docs/safety).

## Previews, drafts and exports

Do not run untrusted preview code without reviewing its resource/network behavior.
Sanitization and sandboxing have defined limits; previews may contact external
servers. Local storage is not an encrypted vault or backup. Export important
work before clearing site data, changing devices or relying on a saved draft.

Review exported files before publishing or executing them. Fonts, external
resources and renderer differences may affect the result. Whole-document PNG/PDF
capture currently records visible inline diagram viewports; standalone diagram
PNG/SVG export includes the complete diagram.

## Support and optional sponsorship

Use synthetic reproductions and redact sensitive data before opening a public
issue or sending email. Report security vulnerabilities privately under
[SECURITY.md](https://github.com/cuthanhcam/forge/blob/main/SECURITY.md).

Support and sponsorship providers are external services. Donations are optional
and do not purchase an SLA, guaranteed response, security certification or a
feature commitment. No account or payment is required for core tools.

## Availability and warranties

Forge can contain bugs, produce unexpected output or be unavailable. The software
is provided under the warranty disclaimer and liability terms in LICENSE.
The hosted service does not promise uninterrupted availability or an SLA. Review,
test and independently validate outputs before using them in important systems.

## Changes and contact

Features and these terms can evolve; the revision date above identifies this
version. Forks may differ. For questions, contact cuthanhcam04@gmail.com or open
a non-sensitive issue in
[cuthanhcam/forge](https://github.com/cuthanhcam/forge/issues).
