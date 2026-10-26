export interface MarkdownHeading {
  id: string;
  level: number;
  title: string;
}

/** Read only already-sanitized rendered HTML: code fences cannot become headings. */
export function buildMarkdownOutline(html: string): {
  html: string;
  headings: MarkdownHeading[];
} {
  const document = new DOMParser().parseFromString(html, "text/html");
  const nodes = Array.from(
    document.body.querySelectorAll<HTMLHeadingElement>("h1,h2,h3,h4,h5,h6"),
  );
  const reserved = new Set(
    Array.from(document.body.querySelectorAll("[id]"))
      .filter((node) => !nodes.includes(node as HTMLHeadingElement))
      .map((node) => node.id),
  );
  const slugs = new Set<string>();
  const links = new Map<string, string>();
  const headings = nodes.map((node) => {
    const label = node.cloneNode(true) as HTMLElement;
    label
      .querySelectorAll(".katex-mathml,style,script")
      .forEach((child) => child.remove());
    const title =
      (label.textContent ?? "").replace(/\s+/g, " ").trim() || "Untitled heading";
    const base =
      title
        .normalize("NFKC")
        .toLowerCase()
        .replace(/[^\p{L}\p{N}_\s-]/gu, "")
        .replace(/\s+/g, "-") || "heading";
    let slug = base,
      suffix = 0;
    while (slugs.has(slug)) slug = `${base}-${++suffix}`;
    slugs.add(slug);
    let id = node.id && !reserved.has(node.id) ? node.id : `forge-heading-${slug}`;
    const original = id;
    suffix = 0;
    while (reserved.has(id)) id = `${original}-${++suffix}`;
    reserved.add(id);
    node.id = id;
    links.set(slug, id);
    return { id, title, level: Number(node.tagName.slice(1)) };
  });
  // Support conventional Markdown heading links without exposing clobber-prone generated IDs.
  document.body.querySelectorAll<HTMLAnchorElement>('a[href^="#"]').forEach((link) => {
    try {
      const fragment = decodeURIComponent(link.getAttribute("href")!.slice(1));
      if (!reserved.has(fragment) && links.has(fragment))
        link.setAttribute("href", `#${links.get(fragment)}`);
    } catch {
      /* Preserve malformed author links verbatim. */
    }
  });
  return { html: document.body.innerHTML, headings };
}
