# Typography

Forge has two font roles, defined once in `src/app/styles.css`:

- `--font-ui`: self-hosted Inter Variable for navigation, controls, headings and
  prose. Tailwind `font-sans` resolves to this same token. Headings use size and
  weight for hierarchy rather than an additional display family. The home signature
  is an intentional exception to the restrained heading scale: the original
  large black-weight Inter lettering and brand gradient sit above the directory,
  paired with the existing Forge logo and wordmark. Keep real spaces between
  visual line breaks so the accessible heading reads as a sentence.
- `--font-code`: one system monospace stack for HTML/code editors, structured
  data, keyboard keys and rendered Markdown code blocks. Do not use monospace
  for decorative labels or marketing copy. Markdown source intentionally uses
  the same Inter 14px/1.7 reading typography as preview prose; both line-number
  gutters use the shared code font at 13px, with row heights following each
  editor's actual wrapping and line height.

Inter is bundled through `@fontsource-variable/inter`, including normal/italic
faces and Unicode subsets. Vite serves font assets from the application origin;
there are no Google Fonts or other runtime font-CDN requests. `font-display: swap`
keeps controls readable while the font loads. The complete redistribution
license is served at `/licenses/inter-OFL.txt` (SIL OFL 1.1).

Prefer 14px body text, 12px secondary labels, 16px section headings, and 28-32px
page headings. Dense tool surfaces may retain 13px body/editor text. Use regular
400, medium 500 and semibold 600 for ordinary UI hierarchy. Avoid adding tiny
uppercase tracking, extra font families or heavy display weights to new UI.
Document headings, author-supplied HTML styles and KaTeX math retain their own
rendering semantics. Mermaid defaults to the UI family.

When changing code typography, run the editor gutter browser tests. They compare
line offsets with native textarea wrapping for long lines, tabs, blank lines and
Unicode, and verify scroll alignment across viewport/theme changes.
