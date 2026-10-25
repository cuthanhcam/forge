import type { JSX } from "react";
import { useMemo, useState } from "react";
import { Copy, Download, RotateCcw, TextCursorInput } from "lucide-react";
import { Button } from "@/shared/ui/button";
import {
  PaneHeader,
  ToolSurface,
  ToolTextarea,
  ToolToolbar,
} from "@/shared/components/ToolSurface";
import { convertCases } from "./case-converter.service";

const sampleInput = `Forge developer workstation
markdownPreview renderer
JWT secret generator`;

export function CaseConverterPage(): JSX.Element {
  const [input, setInput] = useState(sampleInput);
  const variants = useMemo(() => convertCases(input), [input]);

  async function copy(value: string): Promise<void> {
    await navigator.clipboard.writeText(value);
  }

  function download(): void {
    const blob = new Blob(
      [variants.map((variant) => `${variant.label}: ${variant.value}`).join("\n")],
      { type: "text/plain;charset=utf-8" },
    );
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");

    anchor.href = url;
    anchor.download = "forge-case-conversions.txt";
    anchor.click();
    URL.revokeObjectURL(url);
  }

  return (
    <ToolSurface>
      <ToolToolbar
        left={
          <div className="flex min-w-0 items-center gap-2 text-[12px] font-semibold text-sky-600">
            <TextCursorInput aria-hidden="true" className="h-4 w-4" />
            {variants.length} case styles
          </div>
        }
        right={
          <>
            <Button
              className="h-9 px-3"
              onClick={() => void copy(variants.map((item) => item.value).join("\n"))}
              size="sm"
              variant="secondary"
            >
              <Copy aria-hidden="true" className="h-4 w-4" />
              Copy all
            </Button>
            <Button
              aria-label="Download output"
              onClick={download}
              size="icon"
              variant="ghost"
            >
              <Download aria-hidden="true" className="h-4 w-4" />
            </Button>
            <Button
              aria-label="Clear input"
              onClick={() => setInput("")}
              size="icon"
              variant="ghost"
            >
              <RotateCcw aria-hidden="true" className="h-4 w-4" />
            </Button>
          </>
        }
      />
      <div className="grid min-h-0 flex-1 overflow-hidden xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
        <div className="flex min-h-0 flex-col">
          <PaneHeader
            actions={
              <span className="text-[12px] font-semibold normal-case tracking-normal text-sky-600">
                {input.length.toLocaleString()} chars
              </span>
            }
            title="Input"
            tone="blue"
          />
          <ToolTextarea
            className="selection:bg-sky-200/80 selection:text-slate-950"
            label="Case input"
            onChange={setInput}
            placeholder="Text to convert..."
            value={input}
          />
        </div>
        <div className="flex min-h-0 flex-col border-t border-slate-200 xl:border-l xl:border-t-0">
          <PaneHeader title="Converted cases" tone="emerald" />
          <div className="scrollbar-forge min-h-0 flex-1 overflow-auto bg-white p-4">
            <div className="grid gap-3">
              {variants.map((variant) => (
                <section
                  className="rounded-lg border border-slate-200 bg-slate-50 p-3"
                  key={variant.label}
                >
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-[13px] font-bold text-slate-950">
                      {variant.label}
                    </p>
                    <Button
                      className="shrink-0"
                      onClick={() => void copy(variant.value)}
                      size="sm"
                      variant="secondary"
                    >
                      <Copy aria-hidden="true" className="h-4 w-4" />
                      Copy
                    </Button>
                  </div>
                  <p className="mt-3 break-all font-mono text-[13px] leading-6 text-slate-950">
                    {variant.value || "-"}
                  </p>
                </section>
              ))}
            </div>
          </div>
        </div>
      </div>
    </ToolSurface>
  );
}
