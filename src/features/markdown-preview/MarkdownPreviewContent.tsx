import {
  memo,
  useEffect,
  useLayoutEffect,
  useState,
  type JSX,
  type RefObject,
} from "react";
import { createPortal } from "react-dom";
import { MermaidDiagram } from "./MermaidDiagram";
import { renderMermaidDiagram } from "./mermaid-renderer";

interface MarkdownPreviewContentProps {
  html: string;
  contentRef: RefObject<HTMLDivElement | null>;
}

/** This component exclusively owns preview DOM. Parent toolbar/scroll updates
 * must not replace SVGs inserted asynchronously by Mermaid. */
export const MarkdownPreviewContent = memo(function MarkdownPreviewContent({
  html,
  contentRef,
}: MarkdownPreviewContentProps): JSX.Element {
  const [diagrams, setDiagrams] = useState<
    Array<{ node: HTMLElement; svg: string; number: number }>
  >([]);
  const [theme, setTheme] = useState<"default" | "dark">(() =>
    document.documentElement.classList.contains("dark") ? "dark" : "default",
  );
  useEffect(() => {
    const observer = new MutationObserver(() => {
      setTheme(document.documentElement.classList.contains("dark") ? "dark" : "default");
    });
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });
    return () => observer.disconnect();
  }, []);

  useLayoutEffect(() => {
    if (contentRef.current) {
      // `html` has already crossed the Markdown service's DOMPurify boundary.
      contentRef.current.innerHTML = html;
      setDiagrams([]);
    }
  }, [html, theme, contentRef]);

  useEffect(() => {
    const root = contentRef.current;
    if (!root) return;
    const nodes = Array.from(root.querySelectorAll<HTMLElement>(".mermaid"));
    if (nodes.length === 0) return;
    let cancelled = false;
    const timer = window.setTimeout(() => {
      for (const [index, node] of nodes.entries()) {
        const source = node.textContent ?? "";
        const isCurrent = (): boolean =>
          !cancelled && node.isConnected && root.contains(node);
        node.setAttribute("aria-busy", "true");
        void renderMermaidDiagram(source, theme, isCurrent)
          .then((svg) => {
            if (!svg || !isCurrent()) return;
            node.replaceChildren();
            setDiagrams((current) => [
              ...current.filter((diagram) => diagram.node !== node),
              { node, svg, number: index + 1 },
            ]);
            node.setAttribute("aria-busy", "false");
          })
          .catch(() => {
            if (!isCurrent()) return;
            const message = document.createElement("p");
            message.setAttribute("role", "alert");
            message.textContent =
              "Unable to render Mermaid diagram. Check the diagram syntax.";
            const code = document.createElement("pre");
            code.textContent = source;
            node.replaceChildren(message, code);
            node.setAttribute("aria-busy", "false");
          });
      }
    }, 150);
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [html, theme, contentRef]);

  return (
    <>
      <div
        className="forge-markdown min-h-full w-full px-6 py-5 sm:px-8 lg:px-10"
        ref={contentRef}
      />
      {diagrams.map((diagram) =>
        createPortal(
          <MermaidDiagram svg={diagram.svg} number={diagram.number} />,
          diagram.node,
          String(diagram.number),
        ),
      )}
    </>
  );
});
