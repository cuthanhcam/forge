import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  type RefObject,
  type UIEvent,
} from "react";

type Pane = "editor" | "preview";
interface ScrollOptions {
  editor: RefObject<HTMLTextAreaElement | null>;
  preview: RefObject<HTMLDivElement | null>;
  content: RefObject<HTMLDivElement | null>;
  documentId: string;
  enabled: boolean;
  html: string;
}

/** Programmatic scroll events can arrive after animation frames. Suppress the
 * expected position, rather than unlocking both panes on the next frame. */
export function useMarkdownScroll({
  editor,
  preview,
  content,
  documentId,
  enabled,
  html,
}: ScrollOptions): {
  onEditorScroll: (event: UIEvent<HTMLTextAreaElement>) => void;
  onPreviewScroll: (event: UIEvent<HTMLDivElement>) => void;
  onEdit: () => void;
} {
  const leader = useRef<Pane>("editor");
  const expected = useRef(new WeakMap<HTMLElement, number>());
  const positions = useRef(new Map<string, { editor: number; preview: number }>());

  const synchronize = useCallback((): void => {
    if (!enabled || !editor.current || !preview.current) return;
    const source = leader.current === "editor" ? editor.current : preview.current;
    const target = leader.current === "editor" ? preview.current : editor.current;
    const sourceRange = Math.max(0, source.scrollHeight - source.clientHeight);
    // A short pane must not pull a long pane back to the top.
    if (sourceRange === 0) return;
    const ratio = Math.min(1, Math.max(0, source.scrollTop / sourceRange));
    const nextTop = ratio * Math.max(0, target.scrollHeight - target.clientHeight);
    if (Math.abs(target.scrollTop - nextTop) < 1) return;
    target.scrollTop = nextTop;
    expected.current.set(target, target.scrollTop);
  }, [editor, preview, enabled]);

  const handleScroll = useCallback(
    (pane: Pane, element: HTMLElement): void => {
      const pending = expected.current.get(element);
      if (pending !== undefined && Math.abs(element.scrollTop - pending) < 1) return;
      expected.current.delete(element);
      leader.current = pane;
      synchronize();
    },
    [synchronize],
  );

  useLayoutEffect(() => {
    const saved = positions.current.get(documentId);
    const editorElement = editor.current;
    const previewElement = preview.current;
    for (const [element, top] of [
      [editorElement, saved?.editor ?? 0],
      [previewElement, saved?.preview ?? 0],
    ] as const) {
      if (element) {
        element.scrollTop = top;
        expected.current.set(element, element.scrollTop);
      }
    }
    leader.current = "editor";
    return () => {
      positions.current.set(documentId, {
        editor: editorElement?.scrollTop ?? 0,
        preview: previewElement?.scrollTop ?? 0,
      });
    };
  }, [documentId, editor, preview]);

  useEffect(() => {
    let frame = 0;
    const schedule = (): void => {
      window.cancelAnimationFrame(frame);
      frame = window.requestAnimationFrame(synchronize);
    };
    schedule();
    // Images, diagrams and viewport changes alter ranges after Markdown renders.
    const observer = new ResizeObserver(schedule);
    for (const element of [editor.current, preview.current, content.current]) {
      if (element) observer.observe(element);
    }
    return () => {
      observer.disconnect();
      window.cancelAnimationFrame(frame);
    };
  }, [editor, preview, content, html, synchronize]);

  return {
    onEditorScroll: (event) => handleScroll("editor", event.currentTarget),
    onPreviewScroll: (event) => handleScroll("preview", event.currentTarget),
    onEdit: () => {
      leader.current = "editor";
    },
  };
}
