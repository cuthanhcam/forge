import {
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type JSX,
  type KeyboardEvent,
  type PointerEvent,
  type ReactNode,
} from "react";

interface ResizablePanesProps {
  first: ReactNode;
  second: ReactNode;
  firstLabel?: string;
  secondLabel?: string;
}
const minimum = 20;
const maximum = 80;
const clamp = (value: number): number => Math.max(minimum, Math.min(maximum, value));

/** One scroll owner per pane. Resizing changes tracks, never editor content.
 * Narrow containers stack vertically; keyboard arrows follow the divider axis. */
export function ResizablePanes({
  first,
  second,
  firstLabel = "Editor",
  secondLabel = "Preview",
}: ResizablePanesProps): JSX.Element {
  const rootRef = useRef<HTMLDivElement>(null);
  const dividerRef = useRef<HTMLDivElement>(null);
  const firstId = useId();
  const [horizontal, setHorizontal] = useState(false);
  const [ratio, setRatio] = useState(50);
  const [dragging, setDragging] = useState(false);
  const pointer = useRef<number | null>(null);
  const startingRatio = useRef(50);
  const queuedRatio = useRef(50);
  const frame = useRef(0);
  const split = first != null && second != null;

  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const measure = (): void => setHorizontal(root.clientWidth >= 640);
    measure();
    const observer =
      typeof ResizeObserver === "undefined" ? null : new ResizeObserver(measure);
    observer?.observe(root);
    return () => observer?.disconnect();
  }, []);
  useEffect(() => () => window.cancelAnimationFrame(frame.current), []);
  useEffect(() => {
    const id = pointer.current;
    pointer.current = null;
    window.cancelAnimationFrame(frame.current);
    if (id !== null && dividerRef.current?.hasPointerCapture(id))
      dividerRef.current.releasePointerCapture(id);
    setDragging(false);
  }, [horizontal, split]);

  function finishDrag(): void {
    if (pointer.current === null) return;
    const id = pointer.current;
    pointer.current = null;
    window.cancelAnimationFrame(frame.current);
    setRatio(queuedRatio.current);
    setDragging(false);
    if (dividerRef.current?.hasPointerCapture(id))
      dividerRef.current.releasePointerCapture(id);
  }
  function move(event: PointerEvent<HTMLDivElement>): void {
    if (pointer.current !== event.pointerId || !rootRef.current) return;
    const box = rootRef.current.getBoundingClientRect();
    const offset = horizontal ? event.clientX - box.left : event.clientY - box.top;
    const extent = (horizontal ? box.width : box.height) - 12;
    queuedRatio.current = clamp(((offset - 6) / Math.max(1, extent)) * 100);
    window.cancelAnimationFrame(frame.current);
    frame.current = window.requestAnimationFrame(() => setRatio(queuedRatio.current));
  }
  function onKeyDown(event: KeyboardEvent<HTMLDivElement>): void {
    let next: number | undefined;
    const step = event.shiftKey ? 10 : 2;
    if (event.key === (horizontal ? "ArrowLeft" : "ArrowUp")) next = ratio - step;
    if (event.key === (horizontal ? "ArrowRight" : "ArrowDown")) next = ratio + step;
    if (event.key === "Home") next = minimum;
    if (event.key === "End") next = maximum;
    if (event.key === "Enter") next = 50;
    if (event.key === "Escape" && pointer.current !== null) {
      queuedRatio.current = startingRatio.current;
      finishDrag();
      event.preventDefault();
    }
    if (next !== undefined) {
      event.preventDefault();
      setRatio(clamp(next));
    }
  }
  const tracks = `${ratio}fr 12px ${100 - ratio}fr`;
  return (
    <div
      className="relative flex min-h-0 min-w-0 flex-1 overflow-hidden"
      data-resizable-panes=""
      ref={rootRef}
    >
      <div
        className="grid h-full min-h-0 min-w-0 flex-1 overflow-hidden"
        style={{
          gridTemplateColumns: split && horizontal ? tracks : "minmax(0,1fr)",
          gridTemplateRows: split && !horizontal ? tracks : "minmax(0,1fr)",
        }}
      >
        {first != null ? (
          <div
            aria-label={firstLabel}
            className="min-h-0 min-w-0 overflow-hidden"
            id={firstId}
            key="first"
            role="region"
          >
            {first}
          </div>
        ) : null}
        {split ? (
          <div
            aria-controls={firstId}
            aria-label="Resize editor and preview"
            aria-orientation={horizontal ? "vertical" : "horizontal"}
            aria-valuemin={minimum}
            aria-valuemax={maximum}
            aria-valuenow={Math.round(ratio)}
            aria-valuetext={`${firstLabel} ${Math.round(ratio)}%, ${secondLabel} ${100 - Math.round(ratio)}%`}
            className="relative z-20 flex touch-none items-center justify-center bg-slate-50 text-slate-500 outline-none hover:bg-accent-50 focus-visible:bg-accent-50 focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-accent-600"
            key="divider"
            ref={dividerRef}
            role="separator"
            tabIndex={0}
            style={{ cursor: horizontal ? "col-resize" : "row-resize" }}
            onDoubleClick={() => setRatio(50)}
            onKeyDown={onKeyDown}
            onPointerDown={(event) => {
              if (event.button !== 0) return;
              event.preventDefault();
              event.currentTarget.focus();
              event.currentTarget.setPointerCapture(event.pointerId);
              pointer.current = event.pointerId;
              startingRatio.current = ratio;
              queuedRatio.current = ratio;
              setDragging(true);
            }}
            onPointerMove={move}
            onPointerUp={finishDrag}
            onPointerCancel={finishDrag}
            onLostPointerCapture={finishDrag}
          >
            <span
              aria-hidden="true"
              className="rounded-full bg-current"
              style={{ width: horizontal ? 3 : 28, height: horizontal ? 28 : 3 }}
            />
          </div>
        ) : null}
        {second != null ? (
          <div
            aria-label={secondLabel}
            className="min-h-0 min-w-0 overflow-hidden"
            key="second"
            role="region"
          >
            {second}
          </div>
        ) : null}
      </div>
      {/* Block iframe hit-testing while a captured pointer crosses the preview. */}
      {dragging ? (
        <div aria-hidden="true" className="absolute inset-0 z-10 select-none" />
      ) : null}
    </div>
  );
}
