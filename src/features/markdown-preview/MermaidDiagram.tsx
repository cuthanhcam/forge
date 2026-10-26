import {
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type JSX,
} from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { Download, Maximize, X, Minus, Plus, RotateCcw, LocateFixed } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { Tooltip } from "@/shared/ui/tooltip";
import {
  clampDiagramScale,
  scopeDiagramSvg,
  zoomDiagram,
  type DiagramView,
} from "./diagram-viewer.service";

interface MermaidDiagramProps {
  svg: string;
  number: number;
}

export function MermaidDiagram({ svg, number }: MermaidDiagramProps): JSX.Element {
  const [open, setOpen] = useState(false);
  return (
    <Dialog.Root modal={false} open={open} onOpenChange={setOpen}>
      <DiagramCanvas svg={svg} expanded={false} number={number} />
      <Dialog.Portal>
        {open && (
          <div
            aria-hidden="true"
            className="pointer-events-none fixed inset-0 z-40 bg-slate-950/40"
          />
        )}
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 flex h-[80dvh] w-[80vw] min-h-0 min-w-0 -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-xl border border-border bg-white text-foreground shadow-xl">
          <div className="flex shrink-0 items-center justify-between border-b border-border px-4 py-2">
            <Dialog.Title className="text-sm font-semibold">Diagram</Dialog.Title>
            <Tooltip content="Close diagram" side="bottom">
              <Dialog.Close asChild>
                <Button
                  aria-label="Collapse diagram"
                  className="h-8 w-8"
                  size="icon"
                  variant="ghost"
                >
                  <X aria-hidden="true" className="h-4 w-4" />
                </Button>
              </Dialog.Close>
            </Tooltip>
          </div>
          <Dialog.Description className="sr-only">
            Zoom and pan the diagram. Escape closes this view. You can scroll the document
            outside this window.
          </Dialog.Description>
          <DiagramCanvas svg={svg} expanded number={number} />
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

function DiagramCanvas({
  svg,
  expanded,
  number,
}: MermaidDiagramProps & { expanded: boolean }): JSX.Element {
  const id = useId().replace(/[^a-zA-Z0-9-]/g, "");
  const artwork = useMemo(() => scopeDiagramSvg(svg, `diagram-${id}`), [svg, id]);
  const canvasRef = useRef<HTMLDivElement>(null);
  const [view, setView] = useState<DiagramView>({ x: 0, y: 0, scale: 1 });
  const viewRef = useRef(view);
  const fitMode = useRef(true);
  const [dragging, setDragging] = useState(false);
  const pointers = useRef(new Map<number, { x: number; y: number }>());
  const pinch = useRef<{
    view: DiagramView;
    x: number;
    y: number;
    distance: number;
  } | null>(null);
  const dragged = useRef(false);
  const apply = useCallback((next: DiagramView, userAction = true): void => {
    if (userAction) fitMode.current = false;
    viewRef.current = next;
    setView(next);
  }, []);
  const center = useCallback(
    (scale: number): void => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      apply({
        scale,
        x: (canvas.clientWidth - artwork.width * scale) / 2,
        y: (canvas.clientHeight - artwork.height * scale) / 2,
      });
    },
    [apply, artwork.width, artwork.height],
  );
  const fit = useCallback((): void => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    center(
      clampDiagramScale(
        Math.min(
          1,
          (canvas.clientWidth - 64) / artwork.width,
          (canvas.clientHeight - 112) / artwork.height,
        ),
      ),
    );
    fitMode.current = true;
  }, [artwork.width, artwork.height, center]);
  const zoom = (delta: number): void => {
    const canvas = canvasRef.current;
    if (canvas)
      apply(
        zoomDiagram(
          viewRef.current,
          Math.round((viewRef.current.scale + delta) * 100) / 100,
          {
            x: canvas.clientWidth / 2,
            y: canvas.clientHeight / 2,
          },
        ),
      );
  };
  useLayoutEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    fit();
    let width = canvas.clientWidth;
    let height = canvas.clientHeight;
    const observer = new ResizeObserver(() => {
      if (fitMode.current) fit();
      else
        apply(
          {
            ...viewRef.current,
            x: viewRef.current.x + (canvas.clientWidth - width) / 2,
            y: viewRef.current.y + (canvas.clientHeight - height) / 2,
          },
          false,
        );
      width = canvas.clientWidth;
      height = canvas.clientHeight;
    });
    observer.observe(canvas);
    return () => observer.disconnect();
  }, [fit, apply]);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const wheel = (event: WheelEvent): void => {
      if (!expanded && !event.ctrlKey && !event.metaKey) return;
      event.preventDefault();
      event.stopPropagation();
      const rect = canvas.getBoundingClientRect();
      const delta =
        event.deltaY *
        (event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? canvas.clientHeight : 1);
      apply(
        zoomDiagram(
          viewRef.current,
          viewRef.current.scale - Math.max(-100, Math.min(100, delta)) / 1000,
          { x: event.clientX - rect.left, y: event.clientY - rect.top },
        ),
      );
    };
    canvas.addEventListener("wheel", wheel, { passive: false });
    return () => canvas.removeEventListener("wheel", wheel);
  }, [expanded, apply]);
  const finishPointer = (pointerId: number): void => {
    pointers.current.delete(pointerId);
    pinch.current = null;
    setDragging(pointers.current.size > 0);
    if (canvasRef.current?.hasPointerCapture(pointerId))
      canvasRef.current.releasePointerCapture(pointerId);
  };
  const download = (): void => {
    const url = URL.createObjectURL(
      new Blob([artwork.svg], { type: "image/svg+xml;charset=utf-8" }),
    );
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `forge-diagram-${number}.svg`;
    anchor.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 0);
  };
  const control = (
    label: string,
    icon: JSX.Element,
    onClick: () => void,
    disabled = false,
  ): JSX.Element => (
    <Tooltip content={label} side="bottom">
      <Button
        aria-label={label}
        className="h-8 w-8 shrink-0"
        size="icon"
        variant="ghost"
        disabled={disabled}
        onClick={onClick}
      >
        {icon}
      </Button>
    </Tooltip>
  );
  return (
    <div
      className={expanded ? "relative flex min-h-0 flex-1 flex-col" : "relative min-w-0"}
      role="group"
      aria-label={`Diagram ${number}`}
    >
      {expanded ? (
        <div
          data-html2canvas-ignore="true"
          className="absolute bottom-3 right-3 z-10 flex max-w-[calc(100%-1.5rem)] flex-wrap items-center justify-center gap-1 rounded-lg border border-border bg-white/90 p-1.5 shadow-sm backdrop-blur"
          role="toolbar"
          aria-label="Diagram controls"
        >
          {control(
            "Zoom out",
            <Minus aria-hidden="true" className="h-4 w-4" />,
            () => zoom(-0.1),
            view.scale <= 0.01,
          )}
          <output
            className="min-w-12 text-center font-mono text-xs tabular-nums text-muted-foreground"
            aria-label="Diagram zoom"
          >
            {Math.round(view.scale * 100)}%
          </output>
          {control(
            "Zoom in",
            <Plus aria-hidden="true" className="h-4 w-4" />,
            () => zoom(0.1),
            view.scale >= 8,
          )}
          {control(
            "Fit diagram",
            <LocateFixed aria-hidden="true" className="h-4 w-4" />,
            fit,
          )}
          {control(
            "Reset to 100%",
            <RotateCcw aria-hidden="true" className="h-4 w-4" />,
            () => center(1),
          )}
          {control(
            "Download SVG",
            <Download aria-hidden="true" className="h-4 w-4" />,
            download,
          )}
        </div>
      ) : (
        <div data-html2canvas-ignore="true" className="absolute right-2 top-2 z-10">
          <Tooltip content="Expand diagram" side="bottom">
            <Dialog.Trigger asChild>
              <Button
                aria-label="Expand diagram"
                className="h-8 w-8 bg-white/90"
                size="icon"
                variant="ghost"
              >
                <Maximize aria-hidden="true" className="h-4 w-4" />
              </Button>
            </Dialog.Trigger>
          </Tooltip>
          <output className="sr-only" aria-label="Diagram zoom">
            {Math.round(view.scale * 100)}%
          </output>
        </div>
      )}
      <div
        ref={canvasRef}
        className={`relative min-h-0 min-w-0 overflow-hidden bg-background outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-accent-600 ${expanded ? "flex-1" : "h-[clamp(220px,40dvh,400px)]"}`}
        style={{
          cursor: dragging ? "grabbing" : "grab",
          touchAction: expanded ? "none" : "pan-y",
        }}
        tabIndex={0}
        role="region"
        aria-label="Interactive Mermaid diagram"
        aria-describedby={`diagram-help-${id}`}
        onKeyDown={(event) => {
          if (
            event.target !== event.currentTarget ||
            event.ctrlKey ||
            event.metaKey ||
            event.altKey
          )
            return;
          const amount = event.shiftKey ? 100 : 25;
          const changes: Record<string, { x: number; y: number }> = {
            ArrowLeft: { x: amount, y: 0 },
            ArrowRight: { x: -amount, y: 0 },
            ArrowUp: { x: 0, y: amount },
            ArrowDown: { x: 0, y: -amount },
          };
          if (changes[event.key]) {
            event.preventDefault();
            apply({
              ...viewRef.current,
              x: viewRef.current.x + changes[event.key].x,
              y: viewRef.current.y + changes[event.key].y,
            });
          } else if (["+", "=", "-", "0", "1"].includes(event.key)) {
            event.preventDefault();
            if (event.key === "0") fit();
            else if (event.key === "1") center(1);
            else zoom(event.key === "-" ? -0.1 : 0.1);
          }
        }}
        onPointerDown={(event) => {
          if (event.button !== 0) return;
          event.preventDefault();
          event.stopPropagation();
          event.currentTarget.focus({ preventScroll: true });
          event.currentTarget.setPointerCapture(event.pointerId);
          const rect = event.currentTarget.getBoundingClientRect();
          pointers.current.set(event.pointerId, {
            x: event.clientX - rect.left,
            y: event.clientY - rect.top,
          });
          dragged.current = false;
          setDragging(true);
          const points = [...pointers.current.values()];
          if (points.length === 2)
            pinch.current = {
              view: viewRef.current,
              x: (points[0].x + points[1].x) / 2,
              y: (points[0].y + points[1].y) / 2,
              distance: Math.max(
                1,
                Math.hypot(points[0].x - points[1].x, points[0].y - points[1].y),
              ),
            };
        }}
        onPointerMove={(event) => {
          const previous = pointers.current.get(event.pointerId);
          if (!previous) return;
          const rect = event.currentTarget.getBoundingClientRect();
          const point = { x: event.clientX - rect.left, y: event.clientY - rect.top };
          pointers.current.set(event.pointerId, point);
          dragged.current = true;
          const points = [...pointers.current.values()];
          const gesture = pinch.current;
          if (points.length === 2 && gesture) {
            const scale = clampDiagramScale(
              (gesture.view.scale *
                Math.hypot(points[0].x - points[1].x, points[0].y - points[1].y)) /
                gesture.distance,
            );
            const ratio = scale / gesture.view.scale;
            apply({
              scale,
              x: (points[0].x + points[1].x) / 2 - (gesture.x - gesture.view.x) * ratio,
              y: (points[0].y + points[1].y) / 2 - (gesture.y - gesture.view.y) * ratio,
            });
          } else
            apply({
              ...viewRef.current,
              x: viewRef.current.x + point.x - previous.x,
              y: viewRef.current.y + point.y - previous.y,
            });
        }}
        onPointerUp={(event) => finishPointer(event.pointerId)}
        onPointerCancel={(event) => finishPointer(event.pointerId)}
        onLostPointerCapture={(event) => finishPointer(event.pointerId)}
        onClickCapture={(event) => {
          if (dragged.current) {
            event.preventDefault();
            event.stopPropagation();
          }
        }}
      >
        <div
          className="absolute left-0 top-0"
          data-diagram-artwork=""
          style={{
            width: artwork.width,
            height: artwork.height,
            maxWidth: "none",
            transformOrigin: "0 0",
            transform: `translate(${view.x}px, ${view.y}px) scale(${view.scale})`,
          }}
          dangerouslySetInnerHTML={{ __html: artwork.svg }}
        />
      </div>
      <span id={`diagram-help-${id}`} className="sr-only">
        Focus the diagram: arrows pan, plus/minus zoom by 10 percentage points, 0 fits, 1
        resets to 100%. Expand for full touch panning. Escape closes the expanded view.
      </span>
    </div>
  );
}
