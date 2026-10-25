import {
  useLayoutEffect,
  useMemo,
  useRef,
  type JSX,
  type RefObject,
  type TextareaHTMLAttributes,
  type UIEvent,
} from "react";
import { cn } from "@/shared/lib/cn";

interface NumberedTextareaProps extends Omit<
  TextareaHTMLAttributes<HTMLTextAreaElement>,
  "value" | "children" | "wrap"
> {
  label: string;
  value: string;
  lineWrap?: boolean;
  textareaRef?: RefObject<HTMLTextAreaElement | null>;
}

const typographyProperties = [
  "font-family",
  "font-size",
  "font-weight",
  "font-style",
  "font-stretch",
  "font-variant",
  "font-variant-ligatures",
  "font-kerning",
  "font-feature-settings",
  "line-height",
  "letter-spacing",
  "word-spacing",
  "tab-size",
  "text-transform",
  "text-indent",
  "direction",
] as const;

/** Native text remains the only editable/scrolling surface. A separate gutter
 * follows it; an invisible mirror measures soft-wrapped logical line heights.
 * No React state updates or document measurements occur during scrolling. */
export function NumberedTextarea({
  label,
  value,
  lineWrap = true,
  textareaRef,
  className,
  onScroll,
  style,
  ...props
}: NumberedTextareaProps): JSX.Element {
  const localRef = useRef<HTMLTextAreaElement>(null);
  const inputRef = textareaRef ?? localRef;
  const gutterRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const mirrorRef = useRef<HTMLDivElement>(null);
  const lines = useMemo(() => value.split(/\r\n|\r|\n/), [value]);

  useLayoutEffect(() => {
    const input = inputRef.current;
    const gutter = gutterRef.current;
    const track = trackRef.current;
    const mirror = mirrorRef.current;
    if (!input || !gutter || !track || !mirror) return;
    let frame = 0;
    let disposed = false;

    const measure = (): void => {
      if (disposed || input.clientWidth === 0) return;
      const computed = window.getComputedStyle(input);
      for (const property of typographyProperties) {
        mirror.style.setProperty(property, computed.getPropertyValue(property));
      }
      const paddingTop = Number.parseFloat(computed.paddingTop) || 0;
      const paddingBottom = Number.parseFloat(computed.paddingBottom) || 0;
      const horizontalPadding =
        (Number.parseFloat(computed.paddingLeft) || 0) +
        (Number.parseFloat(computed.paddingRight) || 0);
      const lineHeight = Number.parseFloat(computed.lineHeight) || 24;
      // clientWidth excludes the actual scrollbar, including classic OS scrollbars.
      mirror.style.width = `${Math.max(1, input.clientWidth - horizontalPadding)}px`;
      mirror.style.whiteSpace = lineWrap ? "pre-wrap" : "pre";
      mirror.style.overflowWrap = lineWrap ? "break-word" : "normal";
      mirror.style.wordBreak = "normal";
      const fragment = document.createDocumentFragment();
      for (const line of lines) {
        const row = document.createElement("div");
        row.textContent = line || "\u200b";
        fragment.append(row);
      }
      mirror.replaceChildren(fragment);
      const heights = Array.from(mirror.children, (row) =>
        Math.max(lineHeight, row.getBoundingClientRect().height),
      );
      // Batch all reads before writes to avoid a layout pass per line.
      Array.from(track.children).forEach((row, index) => {
        (row as HTMLElement).style.height = `${heights[index]}px`;
      });
      track.style.paddingTop = `${paddingTop}px`;
      track.style.paddingBottom = `${paddingBottom}px`;
      // Match the native scroll range, including bottom padding and horizontal bars.
      track.style.minHeight = `${input.scrollHeight}px`;
      gutter.style.height = `${input.clientHeight}px`;
      gutter.style.fontSize = computed.fontSize;
      gutter.style.lineHeight = computed.lineHeight;
      gutter.scrollTop = input.scrollTop;
    };
    const scheduleMeasure = (): void => {
      window.cancelAnimationFrame(frame);
      frame = window.requestAnimationFrame(measure);
    };
    measure();
    const resize =
      typeof ResizeObserver === "undefined" ? null : new ResizeObserver(scheduleMeasure);
    resize?.observe(input);
    const theme = new MutationObserver(scheduleMeasure);
    theme.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });
    document.fonts?.addEventListener("loadingdone", scheduleMeasure);
    const gutterArea = gutter.parentElement;
    const handleGutterWheel = (event: WheelEvent): void => {
      if (event.ctrlKey) return;
      const scale =
        event.deltaMode === 1
          ? Number.parseFloat(window.getComputedStyle(input).lineHeight) || 24
          : event.deltaMode === 2
            ? input.clientHeight
            : 1;
      input.scrollTop += event.deltaY * scale;
      input.scrollLeft += event.deltaX * scale;
      event.preventDefault();
    };
    gutterArea?.addEventListener("wheel", handleGutterWheel, { passive: false });
    return () => {
      disposed = true;
      window.cancelAnimationFrame(frame);
      resize?.disconnect();
      theme.disconnect();
      document.fonts?.removeEventListener("loadingdone", scheduleMeasure);
      gutterArea?.removeEventListener("wheel", handleGutterWheel);
    };
  }, [inputRef, lines, lineWrap, className, style]);

  function handleScroll(event: UIEvent<HTMLTextAreaElement>): void {
    if (gutterRef.current) gutterRef.current.scrollTop = event.currentTarget.scrollTop;
    onScroll?.(event);
  }

  return (
    <div
      className="relative flex h-full min-h-0 min-w-0 overflow-hidden bg-white"
      data-numbered-editor=""
    >
      <div
        className="h-full shrink-0 select-none font-mono text-[13px] border-r border-slate-100 bg-slate-50 text-slate-400"
        style={{ width: `calc(${String(lines.length).length}ch + 1.5rem)` }}
        aria-hidden="true"
      >
        <div
          className="pointer-events-none overflow-hidden font-mono text-[13px] leading-6"
          data-line-number-gutter=""
          ref={gutterRef}
        >
          <div ref={trackRef}>
            {lines.map((_, index) => (
              <div className="px-2 text-right" data-line-number={index + 1} key={index}>
                {index + 1}
              </div>
            ))}
          </div>
        </div>
      </div>
      <label className="flex min-h-0 min-w-0 flex-1 flex-col">
        <span className="sr-only">{label}</span>
        <textarea
          {...props}
          className={cn(
            "scrollbar-forge h-full min-h-0 w-full flex-1 resize-none overflow-auto border-0 bg-transparent px-4 py-0 font-mono text-[13px] leading-6 text-slate-900 caret-slate-950 outline-none placeholder:text-slate-400",
            className,
          )}
          onScroll={handleScroll}
          ref={inputRef}
          spellCheck={false}
          style={{
            ...style,
            whiteSpace: lineWrap ? "pre-wrap" : "pre",
            overflowWrap: lineWrap ? "break-word" : "normal",
            wordBreak: "normal",
          }}
          value={value}
          wrap={lineWrap ? "soft" : "off"}
        />
      </label>
      <div
        aria-hidden="true"
        className="pointer-events-none invisible absolute left-[-100000px] top-0"
        ref={mirrorRef}
      />
    </div>
  );
}
