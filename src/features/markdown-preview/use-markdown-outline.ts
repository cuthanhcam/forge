import { useEffect, useLayoutEffect, useRef, useState, type RefObject } from "react";
import type { MarkdownHeading } from "./markdown-outline.service";

interface Options {
  preview: RefObject<HTMLDivElement | null>;
  content: RefObject<HTMLDivElement | null>;
  editor: RefObject<HTMLTextAreaElement | null>;
  headings: MarkdownHeading[];
  documentId: string;
  layout: string;
  visible: boolean;
  markPreviewIntent: () => void;
}

export function useMarkdownOutline({
  preview,
  content,
  editor,
  headings,
  documentId,
  layout,
  visible,
  markPreviewIntent,
}: Options): { activeId: string | null; navigate: (id: string) => void } {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [requested, request] = useState<{ id: string; documentId: string } | null>(null);
  const anchor = useRef<{ id: string; documentId: string } | null>(null);
  const intent = useRef(markPreviewIntent);
  useLayoutEffect(() => {
    intent.current = markPreviewIntent;
  }, [markPreviewIntent]);
  const find = (id: string): HTMLElement | null =>
    content.current?.querySelector(`#${CSS.escape(id)}`) ?? null;
  useEffect(() => {
    if (!requested || !visible) return;
    if (requested.documentId !== documentId) {
      request(null);
      return;
    }
    const node = content.current?.querySelector<HTMLElement>(
      `#${CSS.escape(requested.id)}`,
    );
    const scroll = preview.current;
    if (!node || !scroll) {
      request(null);
      return;
    }
    anchor.current = requested;
    intent.current();
    scroll.scrollTo({
      top:
        scroll.scrollTop +
        node.getBoundingClientRect().top -
        scroll.getBoundingClientRect().top -
        16,
      behavior: matchMedia("(prefers-reduced-motion: reduce)").matches
        ? "auto"
        : "smooth",
    });
    node.tabIndex = -1;
    node.focus({ preventScroll: true });
    setActiveId(requested.id);
    request(null);
  }, [requested, visible, documentId, headings, content, preview]);
  useEffect(() => {
    const scroll = preview.current,
      root = content.current,
      input = editor.current;
    if (!visible || !scroll || !root) {
      anchor.current = null;
      return;
    }
    if (anchor.current?.documentId !== documentId) anchor.current = null;
    let frame = 0;
    let firstChild: Element | null = null;
    let nodes: HTMLElement[] = [];
    const track = (): void => {
      // Theme rendering may replace the preview DOM without changing heading metadata.
      if (firstChild !== root.firstElementChild || nodes.length === 0) {
        firstChild = root.firstElementChild;
        nodes = headings
          .map((heading) => root.querySelector<HTMLElement>(`#${CSS.escape(heading.id)}`))
          .filter((node): node is HTMLElement => node !== null);
      }
      if (anchor.current && nodes.some((node) => node.id === anchor.current?.id)) {
        setActiveId(anchor.current.id);
        return;
      }
      anchor.current = null;
      const top = scroll.getBoundingClientRect().top + 32;
      let low = 0,
        high = nodes.length - 1,
        found = -1;
      while (low <= high) {
        const mid = (low + high) >>> 1;
        if (nodes[mid].getBoundingClientRect().top <= top) {
          found = mid;
          low = mid + 1;
        } else high = mid - 1;
      }
      if (
        scroll.scrollHeight > scroll.clientHeight + 2 &&
        scroll.scrollTop + scroll.clientHeight >= scroll.scrollHeight - 2
      )
        found = nodes.length - 1;
      setActiveId(found >= 0 ? nodes[found].id : (nodes[0]?.id ?? null));
    };
    const schedule = (): void => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(track);
    };
    const cancelAnchor = (): void => {
      anchor.current = null;
    };
    const resize = new ResizeObserver(() => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const target =
          anchor.current &&
          root.querySelector<HTMLElement>(`#${CSS.escape(anchor.current.id)}`);
        if (target) {
          intent.current();
          scroll.scrollTop +=
            target.getBoundingClientRect().top - scroll.getBoundingClientRect().top - 16;
        }
        track();
      });
    });
    resize.observe(root);
    scroll.addEventListener("scroll", schedule, { passive: true });
    for (const surface of [scroll, input])
      for (const event of ["wheel", "pointerdown", "keydown"])
        surface?.addEventListener(event, cancelAnchor, { passive: true });
    track();
    return () => {
      cancelAnimationFrame(frame);
      resize.disconnect();
      scroll.removeEventListener("scroll", schedule);
      for (const surface of [scroll, input])
        for (const event of ["wheel", "pointerdown", "keydown"])
          surface?.removeEventListener(event, cancelAnchor);
    };
  }, [preview, content, editor, headings, documentId, layout, visible]);
  return {
    activeId,
    navigate: (id: string): void => {
      if (find(id) || !visible) request({ id, documentId });
    },
  };
}
