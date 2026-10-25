import type { ChangeEvent, JSX } from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import {
  Check,
  ChevronDown,
  Code2,
  Copy,
  Download,
  Eye,
  Minimize2,
  Play,
  RotateCcw,
  Wand2,
  WrapText,
} from "lucide-react";
import { usePersistedToolState } from "@/core/storage/use-persisted-tool-state";
import { cn } from "@/shared/lib/cn";
import { ResizablePanes } from "@/shared/components/ResizablePanes";
import { NumberedTextarea } from "@/shared/components/NumberedTextarea";
import { Button } from "@/shared/ui/button";
import { Tooltip } from "@/shared/ui/tooltip";
import { HtmlPreviewStateSchema, type HtmlPreviewState } from "./html-preview.schema";
import {
  beautifyHtml,
  createHtmlPreviewDocument,
  createHtmlPreviewState,
  minifyHtml,
  normalizeHtmlPreviewState,
} from "./html-preview.service";

const indentOptions = Array.from({ length: 10 }, (_, index) => index + 1);
export function HtmlPreviewPage(): JSX.Element {
  const [formatting, setFormatting] = useState(false);
  const [formatError, setFormatError] = useState<string | null>(null);
  const formatRequest = useRef(0);
  useEffect(
    () => () => {
      formatRequest.current += 1;
    },
    [],
  );
  const [storedState, setState] = usePersistedToolState<HtmlPreviewState>(
    "html-preview",
    createHtmlPreviewState(),
  );
  const parsedState = HtmlPreviewStateSchema.safeParse(storedState);
  const state = parsedState.success
    ? normalizeHtmlPreviewState(parsedState.data)
    : createHtmlPreviewState();
  const previewDocument = useMemo(
    () => createHtmlPreviewDocument(state.previewHtml),
    [state.previewHtml],
  );
  useEffect(() => {
    if (
      !parsedState.success ||
      parsedState.data.indentSize !== state.indentSize ||
      parsedState.data.lineWrap !== state.lineWrap
    ) {
      setState(state);
    }
  }, [parsedState, setState, state]);

  useEffect(() => {
    if (!state.autoUpdate || state.previewHtml === state.html) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setState({
        ...state,
        previewHtml: state.html,
      });
    }, 250);

    return () => window.clearTimeout(timeoutId);
  }, [setState, state]);

  function updateHtml(nextHtml: string): void {
    formatRequest.current += 1;
    setFormatting(false);
    setFormatError(null);
    setState({
      ...state,
      html: nextHtml,
    });
  }

  function handleHtmlChange(event: ChangeEvent<HTMLTextAreaElement>): void {
    updateHtml(event.target.value);
  }

  function updateIndentSize(indentSize: number): void {
    formatRequest.current += 1;
    setFormatting(false);
    setState({
      ...state,
      indentSize,
    });
  }

  function runPreview(): void {
    setState({
      ...state,
      previewHtml: state.html,
    });
  }

  function toggleAutoUpdate(): void {
    setState({
      ...state,
      autoUpdate: !state.autoUpdate,
      previewHtml: !state.autoUpdate ? state.html : state.previewHtml,
    });
  }

  function toggleLineWrap(): void {
    setState({
      ...state,
      lineWrap: !state.lineWrap,
    });
  }

  function resetHtml(): void {
    formatRequest.current += 1;
    setFormatting(false);
    setFormatError(null);
    const nextState = createHtmlPreviewState();
    setState(nextState);
  }

  async function applyFormat(mode: "beautify" | "minify"): Promise<void> {
    const request = ++formatRequest.current;
    const input = state.html;
    setFormatting(true);
    setFormatError(null);
    try {
      const result = await (mode === "beautify"
        ? beautifyHtml(input, state.indentSize)
        : minifyHtml(input));
      if (request !== formatRequest.current) return;
      setState((current) =>
        current.html === input ? { ...current, html: result } : current,
      );
    } catch (error) {
      if (request === formatRequest.current)
        setFormatError(
          error instanceof Error
            ? error.message
            : "Could not format HTML. Check the markup and retry.",
        );
    } finally {
      if (request === formatRequest.current) setFormatting(false);
    }
  }

  async function copyHtml(): Promise<void> {
    await navigator.clipboard.writeText(state.html);
  }

  function downloadHtml(): void {
    const blob = new Blob([createHtmlPreviewDocument(state.html)], {
      type: "text/html;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");

    anchor.href = url;
    anchor.download = "forge-preview.html";
    anchor.click();
    URL.revokeObjectURL(url);
  }

  return (
    <section className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm shadow-slate-950/[0.03]">
      <div className="flex min-h-12 shrink-0 flex-wrap items-center gap-2 border-b border-slate-100 bg-white px-3 py-1.5">
        <div className="flex min-w-0 flex-1 items-center gap-2">
          <Button
            aria-label="Run preview"
            className="h-8 px-2.5 text-xs"
            onClick={runPreview}
            size="sm"
            variant="secondary"
          >
            <Play aria-hidden="true" className="h-4 w-4" />
            Run preview
          </Button>
        </div>

        <div className="flex flex-wrap items-center justify-end gap-1">
          <DropdownMenu.Root>
            <DropdownMenu.Trigger asChild>
              <button
                aria-label="Indent size"
                className="flex h-8 items-center gap-2 rounded-md border border-slate-200 bg-white px-2 text-[12px] font-semibold text-slate-600 shadow-sm transition hover:bg-slate-50 hover:text-slate-950"
                type="button"
              >
                <Code2 aria-hidden="true" className="h-4 w-4" />
                <span className="hidden sm:inline">Spaces</span>
                <span className="text-slate-950">{state.indentSize}</span>
                <ChevronDown aria-hidden="true" className="h-3.5 w-3.5" />
              </button>
            </DropdownMenu.Trigger>
            <DropdownMenu.Portal>
              <DropdownMenu.Content
                align="end"
                className="z-50 min-w-36 rounded-md border border-slate-200 bg-white p-1 shadow-lg shadow-slate-950/10"
                sideOffset={6}
              >
                {indentOptions.map((size) => (
                  <DropdownMenu.Item
                    className="markdown-menu-item justify-between"
                    key={size}
                    onSelect={() => updateIndentSize(size)}
                  >
                    <span>
                      {size} space{size > 1 ? "s" : ""}
                    </span>
                    {state.indentSize === size ? (
                      <Check aria-hidden="true" className="h-4 w-4 text-sky-600" />
                    ) : null}
                  </DropdownMenu.Item>
                ))}
              </DropdownMenu.Content>
            </DropdownMenu.Portal>
          </DropdownMenu.Root>

          <button
            className={cn(
              "flex h-8 items-center gap-2 rounded-md px-2.5 text-[12px] font-semibold transition",
              state.autoUpdate
                ? "bg-sky-50 text-sky-700 ring-1 ring-sky-100"
                : "text-slate-600 hover:bg-slate-100 hover:text-slate-950",
            )}
            aria-pressed={state.autoUpdate}
            onClick={toggleAutoUpdate}
            type="button"
          >
            <Eye aria-hidden="true" className="h-4 w-4" />
            Auto
          </button>

          <button
            className={cn(
              "flex h-8 items-center gap-2 rounded-md px-2.5 text-[12px] font-semibold transition",
              !state.lineWrap
                ? "bg-sky-50 text-sky-700 ring-1 ring-sky-100"
                : "text-slate-600 hover:bg-slate-100 hover:text-slate-950",
            )}
            aria-pressed={!state.lineWrap}
            onClick={toggleLineWrap}
            type="button"
          >
            <WrapText aria-hidden="true" className="h-4 w-4" />
            Disable line wrap
          </button>

          <Tooltip content="Beautify HTML" side="bottom">
            <Button
              aria-label="Beautify HTML"
              className="h-8 px-2.5 text-xs"
              disabled={formatting}
              onClick={() => {
                void applyFormat("beautify");
              }}
              size="sm"
              variant="ghost"
            >
              <Wand2 aria-hidden="true" className="h-4 w-4" />
              Beautify HTML
            </Button>
          </Tooltip>
          <Tooltip
            content="Compact tag spacing; preserve text, scripts and styles"
            side="bottom"
          >
            <Button
              aria-label="Minify HTML"
              className="h-8 px-2.5 text-xs"
              disabled={formatting}
              onClick={() => {
                void applyFormat("minify");
              }}
              size="sm"
              variant="ghost"
            >
              <Minimize2 aria-hidden="true" className="h-4 w-4" />
              Minify
            </Button>
          </Tooltip>
          <Tooltip content="Copy HTML" side="bottom">
            <Button
              aria-label="Copy HTML"
              onClick={() => {
                void copyHtml();
              }}
              size="icon"
              variant="ghost"
            >
              <Copy aria-hidden="true" className="h-4 w-4" />
            </Button>
          </Tooltip>
          <Tooltip content="Download HTML" side="bottom">
            <Button
              aria-label="Download HTML"
              onClick={downloadHtml}
              size="icon"
              variant="ghost"
            >
              <Download aria-hidden="true" className="h-4 w-4" />
            </Button>
          </Tooltip>
          <Tooltip content="Reset" side="bottom">
            <Button aria-label="Reset" onClick={resetHtml} size="icon" variant="ghost">
              <RotateCcw aria-hidden="true" className="h-4 w-4" />
            </Button>
          </Tooltip>
        </div>
      </div>

      {formatting ? (
        <p className="shrink-0 px-3 py-2 text-xs text-muted-foreground" role="status">
          Formatting HTML...
        </p>
      ) : null}
      {formatError ? (
        <p
          className="shrink-0 border-b border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700"
          role="alert"
        >
          {formatError} Your source was left unchanged.
        </p>
      ) : null}
      <ResizablePanes
        first={
          <NumberedTextarea
            label="HTML input"
            className="html-editor"
            lineWrap={state.lineWrap}
            onChange={handleHtmlChange}
            placeholder="Paste or write HTML..."
            style={{ tabSize: state.indentSize }}
            value={state.html}
          />
        }
        second={
          <iframe
            className="h-full w-full border-0 bg-white"
            sandbox="allow-scripts"
            srcDoc={previewDocument}
            title="HTML preview output"
          />
        }
      />
    </section>
  );
}
