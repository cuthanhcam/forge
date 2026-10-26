# Maintainer guide

## Review and release

Use small branches from `develop`. Keep fixes, feature work and documentation
reviewable separately. Before pushing an integration tree, run `pnpm check:tools`,
`pnpm check` and relevant browser tests; use the full browser suite for shared
layout, theme or editor changes. Attach current screenshots for visual changes.
Open a release PR from `develop` to `main` and require Quality, Browser previews
and deployment checks. Configure branch protection in GitHub; CI files do not
enforce protection themselves. Do not force-push shared branches.

Update CHANGELOG.md under Unreleased with actual behavior and known limits.
A tag matching `v*.*.*` triggers the existing Release workflow to build an artifact
and create a GitHub release. Keep package version, tag and release notes aligned;
this guide does not create a release or publish a package.

## Security and dependencies

Preserve the local-input model and renderer sanitization boundaries. Review
changes to JWT verification, entropy, storage, sandboxing and export separately
from cosmetic work. Use synthetic fixtures. Follow SECURITY.md for private
reports; avoid disclosing reproduction details publicly before remediation.

Review dependency updates with the same build/browser gates and license checks.
Do not treat a successful audit or CI run as proof of security. The renderer and
editor bundles have known large-chunk warnings; browser-family coverage and
whole-document export readiness remain roadmap items.

## Community and documentation

FUNDING.yml already names the maintainer's GitHub Sponsors and Ko-fi accounts;
SPONSORING.md describes optional support without an SLA. Keep contact links in
project-links.ts aligned with README, support docs and package metadata.
The package retains the existing `@orcace/forge` identifier for compatibility;
repository ownership and public links now use `cuthanhcam/forge`.

The OSS audit used learn-dotnet as a structure reference. Forge already had an
MIT license, contributing guide, code of conduct, security policy, issue forms,
funding configuration and CI. Added onboarding, sponsorship explanation, changelog,
issue-routing links and this release guide rather than copying .NET-specific files.
In-app safety/workspace/support docs import maintained Markdown to reduce drift.

Follow-ups: Firefox/WebKit and physical-device/screen-reader review, link-check
and dependency-update automation, complete Markdown document export preparation,
and the phased design-language plan. These are not marked complete by this audit.
