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
  layout: string;
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
  layout,
  html,
}: ScrollOptions): {
  onEditorScroll: (event: UIEvent<HTMLTextAreaElement>) => void;
  onPreviewScroll: (event: UIEvent<HTMLDivElement>) => void;
  onEdit: () => void;
  onEditorIntent: () => void;
  onPreviewIntent: () => void;
} {
  const leader = useRef<Pane>("editor");
  const expected = useRef(new WeakMap<HTMLElement, number>());
  const progress = useRef(0);
  const metrics = useRef(
    new WeakMap<
      HTMLElement,
      { width: number; height: number; range: number; top: number }
    >(),
  );
  const positions = useRef(new Map<string, { editor: number; preview: number }>());

  const synchronize = useCallback((): void => {
    if (!enabled || !editor.current || !preview.current) return;
    const source = leader.current === "editor" ? editor.current : preview.current;
    const target = leader.current === "editor" ? preview.current : editor.current;
    const sourceRange = Math.max(0, source.scrollHeight - source.clientHeight);
    const previousSize = metrics.current.get(source);
    const resized =
      previousSize &&
      (previousSize.width !== source.clientWidth ||
        previousSize.height !== source.clientHeight ||
        (leader.current === "preview" && previousSize.range !== sourceRange));
    const nativeScrollMoved =
      previousSize && Math.abs(source.scrollTop - previousSize.top) > 1;
    if (resized && !nativeScrollMoved) {
      // Preserve progress only when the browser/user has not already moved the
      // source. A font/width update must not undo an in-flight caret scroll.
      source.scrollTop = progress.current * sourceRange;
      expected.current.set(source, source.scrollTop);
    }
    for (const element of [source, target]) {
      metrics.current.set(element, {
        width: element.clientWidth,
        height: element.clientHeight,
        range: Math.max(0, element.scrollHeight - element.clientHeight),
        top: element.scrollTop,
      });
    }
    // A short pane must not pull a long pane back to the top.
    if (sourceRange === 0) return;
    const ratio = Math.min(1, Math.max(0, source.scrollTop / sourceRange));
    progress.current = ratio;
    const nextTop = ratio * Math.max(0, target.scrollHeight - target.clientHeight);
    if (Math.abs(target.scrollTop - nextTop) < 1) return;
    target.scrollTop = nextTop;
    expected.current.set(target, target.scrollTop);
    const targetMetrics = metrics.current.get(target);
    if (targetMetrics)
      metrics.current.set(target, { ...targetMetrics, top: target.scrollTop });
  }, [editor, preview, enabled]);

  const handleScroll = useCallback(
    (pane: Pane, element: HTMLElement): void => {
      const previousSize = metrics.current.get(element);
      if (
        enabled &&
        previousSize &&
        (previousSize.width !== element.clientWidth ||
          previousSize.height !== element.clientHeight ||
          (pane === "preview" &&
            previousSize.range !== element.scrollHeight - element.clientHeight))
      ) {
        synchronize();
        return;
      }
      const pending = expected.current.get(element);
      if (pending !== undefined && Math.abs(element.scrollTop - pending) < 1) return;
      expected.current.delete(element);
      leader.current = pane;
      const range = element.scrollHeight - element.clientHeight;
      progress.current =
        range > 0 ? Math.min(1, Math.max(0, element.scrollTop / range)) : 0;
      synchronize();
    },
    [synchronize, enabled],
  );

  useLayoutEffect(() => {
    const savedPositions = positions.current;
    const saved = savedPositions.get(documentId);
    const editorElement = editor.current;
    const previewElement = preview.current;
    for (const [element, top] of [
      [editorElement, saved?.editor ?? 0],
      [previewElement, saved?.preview ?? 0],
    ] as const) {
      if (element) {
        element.scrollTop = top;
        expected.current.set(element, element.scrollTop);
        metrics.current.set(element, {
          width: element.clientWidth,
          height: element.clientHeight,
          range: Math.max(0, element.scrollHeight - element.clientHeight),
          top: element.scrollTop,
        });
      }
    }
    leader.current = editorElement ? "editor" : "preview";
    const source = editorElement ?? previewElement;
    const range = source ? source.scrollHeight - source.clientHeight : 0;
    progress.current = source && range > 0 ? source.scrollTop / range : 0;
    return () => {
      savedPositions.set(documentId, {
        editor: editorElement?.scrollTop ?? saved?.editor ?? 0,
        preview: previewElement?.scrollTop ?? saved?.preview ?? 0,
      });
    };
  }, [documentId, editor, preview, layout]);

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
    onEditorIntent: () => {
      leader.current = "editor";
      if (editor.current) expected.current.delete(editor.current);
    },
    onPreviewIntent: () => {
      leader.current = "preview";
      if (preview.current) expected.current.delete(preview.current);
    },
  };
}
