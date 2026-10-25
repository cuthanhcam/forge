import { parse, ErrorCodes, type DefaultTreeAdapterTypes } from "parse5";

type Element = DefaultTreeAdapterTypes.Element;
interface Edit {
  start: number;
  end: number;
  text: string;
}
interface VerbatimRange extends Edit {
  tagName: string;
}
const verbatimTags = new Set([
  "script",
  "style",
  "pre",
  "textarea",
  "title",
  "xmp",
  "iframe",
  "noembed",
  "noscript",
  "plaintext",
]);

function parseElements(source: string): Element[] {
  const errors: string[] = [];
  const root = parse(source, {
    sourceCodeLocationInfo: true,
    onParseError: (error) => {
      if (error.code !== ErrorCodes.missingDoctype) errors.push(error.code);
    },
  });
  if (errors.length)
    throw new Error(`Invalid HTML: ${errors[0]}. Fix the markup and retry.`);
  const elements: Element[] = [];
  function visit(node: DefaultTreeAdapterTypes.Node): void {
    if ("tagName" in node) elements.push(node);
    if ("childNodes" in node) node.childNodes.forEach(visit);
    if ("content" in node) visit(node.content);
  }
  visit(root);
  return elements;
}

function applyEdits(source: string, edits: Edit[]): string {
  const ordered = edits.sort((left, right) => right.start - left.start);
  let boundary = source.length;
  let output = source;
  for (const edit of ordered) {
    if (edit.start < 0 || edit.end > boundary || edit.start > edit.end) {
      throw new Error("Cannot safely format overlapping HTML ranges.");
    }
    output = output.slice(0, edit.start) + edit.text + output.slice(edit.end);
    boundary = edit.start;
  }
  return output;
}

/** Only compact parser-identified tag syntax. Text nodes, quoted attribute
 * values, comments, scripts and styles remain byte-for-byte unchanged. */
export function compactHtmlTags(source: string): string {
  const edits: Edit[] = [];
  const seen = new Set<number>();
  for (const element of parseElements(source)) {
    const location = element.sourceCodeLocation;
    if (!location) continue;
    const start = location.startTag;
    if (start && !seen.has(start.startOffset)) {
      seen.add(start.startOffset);
      const raw = source.slice(start.startOffset, start.endOffset);
      const name = /^<[^\s/>]+/.exec(raw)?.[0];
      if (!name) continue;
      const attributes = Object.values(location.attrs ?? {}).sort(
        (a, b) => a.startOffset - b.startOffset,
      );
      const values = attributes.map((attribute) =>
        source.slice(attribute.startOffset, attribute.endOffset),
      );
      const suffixStart = attributes.at(-1)?.endOffset ?? start.startOffset + name.length;
      // Keep a separator before a closing slash: removing it after an unquoted
      // attribute can accidentally append the slash to that attribute's value.
      const suffix = source.slice(suffixStart, start.endOffset).trim().startsWith("/")
        ? " />"
        : ">";
      edits.push({
        start: start.startOffset,
        end: start.endOffset,
        text: name + (values.length ? " " + values.join(" ") : "") + suffix,
      });
    }
    if (location.endTag) {
      const end = location.endTag;
      edits.push({
        start: end.startOffset,
        end: end.endOffset,
        text: source.slice(end.startOffset, end.endOffset).replace(/\s+>$/, ">"),
      });
    }
  }
  return applyEdits(source, edits);
}

function verbatimRanges(source: string): VerbatimRange[] {
  const ranges: VerbatimRange[] = [];
  let protectedUntil = -1;
  for (const element of parseElements(source).sort(
    (a, b) =>
      (a.sourceCodeLocation?.startOffset ?? -1) -
      (b.sourceCodeLocation?.startOffset ?? -1),
  )) {
    const location = element.sourceCodeLocation;
    if (!location?.startTag || location.startOffset < protectedUntil) continue;
    const preservesWhitespace =
      verbatimTags.has(element.tagName) ||
      element.attrs.some(
        (attribute) =>
          attribute.name === "style" &&
          /white-space\s*:\s*(pre|break-spaces)/i.test(attribute.value),
      );
    if (!preservesWhitespace) continue;
    const start = location.startTag.endOffset;
    const end = location.endTag?.startOffset ?? location.endOffset;
    ranges.push({ start, end, text: source.slice(start, end), tagName: element.tagName });
    protectedUntil = location.endOffset;
  }
  return ranges;
}

export async function formatHtml(source: string, indentSize: number): Promise<string> {
  const originals = verbatimRanges(source);
  const [{ format }, html] = await Promise.all([
    import("prettier/standalone"),
    import("prettier/plugins/html"),
  ]);
  const formatted = await format(source, {
    parser: "html",
    plugins: [html],
    tabWidth: Math.min(10, Math.max(1, Math.trunc(indentSize) || 2)),
    embeddedLanguageFormatting: "off",
    htmlWhitespaceSensitivity: "css",
  });
  const targets = verbatimRanges(formatted);
  if (
    targets.length !== originals.length ||
    targets.some((target, index) => target.tagName !== originals[index].tagName)
  )
    throw new Error("Cannot safely preserve raw HTML blocks. Source was left unchanged.");
  return applyEdits(
    formatted,
    targets.map((target, index) => ({ ...target, text: originals[index].text })),
  );
}
