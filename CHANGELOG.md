# Changelog

User-visible changes are recorded here. Unreleased entries describe integrated
development work and are not a claim that a tagged release has shipped.

## Unreleased

### Added

- Remembered navigation/category collapse and Markdown outline visibility.
- Markdown heading outline with keyboard navigation and current-section tracking.
- Interactive Mermaid viewing with pan, pinch, fit/reset, 10-point button zoom,
  an 85% expanded window and complete PNG/SVG download.
- Light/Dark/System controls in Settings, synchronized with the header.
- Practical workspace/safety help, mobile documentation navigation and OSS guides.

### Improved

- Compact diagram controls, themed outline tooltips and smooth tab-rail collapse.
- Consistent helper-page brand treatment and redacted support-report guidance.
- Subtle Forge mark and drafting-grid background on the Home signature.
- Local support/help routing and shared icon tooltips across navigation/header.
- Repository links updated to `cuthanhcam/forge`.

### Known limits

- JWT signature checks support HMAC only; decoding is not authentication.
- Whole-document PNG/PDF exports capture the visible inline diagram viewport;
  standalone diagram PNG/SVG exports include the complete diagram.
- Chromium desktop/phone emulation is covered; Firefox/WebKit and physical-device
  accessibility reviews remain planned. See the development roadmap for details.
