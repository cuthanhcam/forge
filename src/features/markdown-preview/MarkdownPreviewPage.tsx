import "katex/dist/katex.min.css";

import type { ChangeEvent, FormEvent, JSX } from "react";
import { useDeferredValue, useEffect, useMemo, useRef, useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import {
  ChevronDown,
  Copy,
  BookOpen,
  Download,
  FileCode2,
  FileDown,
  FilePlus2,
  FileText,
  ImageDown,
  Link2,
  Link2Off,
  MoreVertical,
  PanelLeft,
  PanelLeftClose,
  PanelLeftOpen,
  PanelRight,
  Pencil,
  RotateCcw,
  SplitSquareHorizontal,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import { usePersistedToolState } from "@/core/storage/use-persisted-tool-state";
import { cn } from "@/shared/lib/cn";
import { Button } from "@/shared/ui/button";
import { Tooltip } from "@/shared/ui/tooltip";
import {
  MarkdownPreviewStateSchema,
  type MarkdownPreviewState,
  type MarkdownPreviewTab,
  type MarkdownPreviewViewMode,
} from "./markdown-preview.schema";
import {
  createMarkdownPreviewState,
  createMarkdownPreviewGuideTab,
  createMarkdownPreviewTab,
  estimateMarkdownReadTime,
  markdownPreviewGuide,
  normalizeMarkdownPreviewState,
  renderMarkdownToHtml,
} from "./markdown-preview.service";

import { useMarkdownScroll } from "./use-markdown-scroll";

const viewModes: Array<{
  icon: typeof PanelLeft;
  label: string;
  value: MarkdownPreviewViewMode;
}> = [
  { icon: PanelLeft, label: "Editor", value: "editor" },
  { icon: SplitSquareHorizontal, label: "Split", value: "split" },
  { icon: PanelRight, label: "Preview", value: "preview" },
];

function fileNameFromTitle(title: string): string {
  return (
    title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "") || "markdown-preview"
  );
}

function downloadBlob(blob: Blob, fileName: string): void {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");

  anchor.href = url;
  anchor.download = fileName;
  anchor.click();
  URL.revokeObjectURL(url);
}

export function MarkdownPreviewPage(): JSX.Element {
  const [renameTabId, setRenameTabId] = useState<string | null>(null);
  const [renameTitle, setRenameTitle] = useState("");
  const initialState = useMemo(createMarkdownPreviewState, []);
  const [storedState, setState, persistence] =
    usePersistedToolState<MarkdownPreviewState>("markdown-preview", initialState, {
      debounceMs: 250,
    });
  const state = useMemo(() => {
    const parsed = MarkdownPreviewStateSchema.safeParse(storedState);
    return parsed.success ? normalizeMarkdownPreviewState(parsed.data) : initialState;
  }, [storedState, initialState]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const editorRef = useRef<HTMLTextAreaElement>(null);
  const previewScrollRef = useRef<HTMLDivElement>(null);
  const previewContentRef = useRef<HTMLDivElement>(null);
  const activeTab =
    state.tabs.find((tab) => tab.id === state.activeTabId) ?? state.tabs[0];
  const previewSource = useDeferredValue(activeTab.content);
  const renderedHtml = useMemo(
    () => renderMarkdownToHtml(previewSource),
    [previewSource],
  );
  const readTime = useMemo(
    () => estimateMarkdownReadTime(activeTab.content),
    [activeTab.content],
  );
  const showEditor = state.viewMode !== "preview";
  const showPreview = state.viewMode !== "editor";
  const syncScrollEnabled = state.syncScroll && showEditor && showPreview;
  const activeViewMode =
    viewModes.find((mode) => mode.value === state.viewMode) ?? viewModes[1];
  const ActiveViewIcon = activeViewMode.icon;

  const { onEditorScroll, onPreviewScroll, onEdit } = useMarkdownScroll({
    editor: editorRef,
    preview: previewScrollRef,
    content: previewContentRef,
    documentId: activeTab.id,
    enabled: syncScrollEnabled,
    html: renderedHtml,
  });

  useEffect(() => {
    if (!previewContentRef.current || !showPreview) {
      return;
    }

    let cancelled = false;

    async function renderMermaid(): Promise<void> {
      const mermaid = await import("mermaid");

      if (cancelled) {
        return;
      }

      mermaid.default.initialize({
        securityLevel: "strict",
        startOnLoad: false,
        theme: "default",
      });
      await mermaid.default.run({
        nodes: previewContentRef.current?.querySelectorAll(".mermaid"),
        suppressErrors: true,
      });
    }

    void renderMermaid();

    return () => {
      cancelled = true;
    };
  }, [renderedHtml, showPreview]);

  function updateState(nextState: MarkdownPreviewState): void {
    setState(nextState);
  }

  function updateActiveTab(nextTab: MarkdownPreviewTab): void {
    updateState({
      ...state,
      tabs: state.tabs.map((tab) => (tab.id === nextTab.id ? nextTab : tab)),
    });
  }

  function handleContentChange(event: ChangeEvent<HTMLTextAreaElement>): void {
    updateActiveTab({
      ...activeTab,
      content: event.target.value,
      updatedAt: Date.now(),
    });

    onEdit();
  }

  function addTab(): void {
    const tab = createMarkdownPreviewTab(state.tabs.length + 1);

    updateState({
      ...state,
      activeTabId: tab.id,
      tabs: [...state.tabs, tab],
    });
  }

  function openGuide(): void {
    const existingGuide = state.tabs.find((tab) => tab.title === "Markdown Guide");

    if (existingGuide) {
      updateState({
        ...state,
        activeTabId: existingGuide.id,
        tabs: state.tabs.map((tab) =>
          tab.id === existingGuide.id
            ? { ...tab, content: markdownPreviewGuide, updatedAt: Date.now() }
            : tab,
        ),
      });
      return;
    }

    const guideTab = createMarkdownPreviewGuideTab();

    updateState({
      ...state,
      activeTabId: guideTab.id,
      tabs: [...state.tabs, guideTab],
    });
  }

  function openRenameDialog(tab: MarkdownPreviewTab): void {
    setRenameTabId(tab.id);
    setRenameTitle(tab.title);
  }

  function renameTab(event: FormEvent<HTMLFormElement>): void {
    event.preventDefault();
    const title = renameTitle.trim();

    if (!renameTabId || !title) {
      return;
    }

    updateState({
      ...state,
      tabs: state.tabs.map((item) =>
        item.id === renameTabId ? { ...item, title, updatedAt: Date.now() } : item,
      ),
    });
    setRenameTabId(null);
    setRenameTitle("");
  }

  function duplicateTab(tab: MarkdownPreviewTab): void {
    const copy: MarkdownPreviewTab = {
      ...tab,
      id: crypto.randomUUID(),
      title: `${tab.title} copy`,
      updatedAt: Date.now(),
    };
    const tabIndex = state.tabs.findIndex((item) => item.id === tab.id);
    const nextTabs = [...state.tabs];

    nextTabs.splice(tabIndex + 1, 0, copy);
    updateState({
      ...state,
      activeTabId: copy.id,
      tabs: nextTabs,
    });
  }

  function deleteTab(tabId: string): void {
    if (state.tabs.length === 1) {
      updateActiveTab({
        ...activeTab,
        content: "",
        title: "Untitled",
        updatedAt: Date.now(),
      });
      return;
    }

    const nextTabs = state.tabs.filter((tab) => tab.id !== tabId);
    const nextActiveTab =
      nextTabs.find((tab) => tab.id === state.activeTabId) ?? nextTabs[0];

    updateState({
      ...state,
      activeTabId: nextActiveTab.id,
      tabs: nextTabs,
    });
  }

  function resetActiveTab(): void {
    updateActiveTab({
      ...activeTab,
      content: "",
      updatedAt: Date.now(),
    });
  }

  function handleImportMarkdown(event: ChangeEvent<HTMLInputElement>): void {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    const reader = new FileReader();

    reader.addEventListener("load", () => {
      const content = typeof reader.result === "string" ? reader.result : "";
      const tab: MarkdownPreviewTab = {
        content,
        id: crypto.randomUUID(),
        title: file.name.replace(/\.(md|markdown|txt)$/i, "") || "Imported",
        updatedAt: Date.now(),
      };

      setState((previous) => {
        const parsed = MarkdownPreviewStateSchema.safeParse(previous);
        const current = parsed.success
          ? normalizeMarkdownPreviewState(parsed.data)
          : initialState;
        return { ...current, activeTabId: tab.id, tabs: [...current.tabs, tab] };
      });
    });
    reader.readAsText(file);
    event.target.value = "";
  }

  async function copyMarkdown(): Promise<void> {
    await navigator.clipboard.writeText(activeTab.content);
  }

  function createHtmlDocument(): string {
    return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${activeTab.title}</title>
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.17.0/dist/katex.min.css">
  <style>
    body { margin: 0; padding: 32px; color: #0f172a; font: 14px/1.7 Inter, system-ui, sans-serif; }
    pre { overflow: auto; border: 1px solid #e2e8f0; border-radius: 8px; background: #f8fafc; color: #1e293b; padding: 16px; }
    code { border-radius: 6px; background: #f8fafc; border: 1px solid #e2e8f0; padding: 2px 4px; font-family: "JetBrains Mono", "Cascadia Code", "SFMono-Regular", Consolas, monospace; }
    pre code { border: 0; padding: 0; }
    table { width: 100%; border-collapse: collapse; }
    th, td { border: 1px solid #e2e8f0; padding: 8px 10px; }
    blockquote { border-left: 3px solid #cbd5e1; background: #f8fafc; color: #475569; margin-left: 0; padding-left: 16px; }
  </style>
</head>
<body>
${renderedHtml}
</body>
</html>`;
  }

  function exportMarkdown(): void {
    downloadBlob(
      new Blob([activeTab.content], { type: "text/markdown;charset=utf-8" }),
      `${fileNameFromTitle(activeTab.title)}.md`,
    );
  }

  function exportHtml(): void {
    downloadBlob(
      new Blob([createHtmlDocument()], { type: "text/html;charset=utf-8" }),
      `${fileNameFromTitle(activeTab.title)}.html`,
    );
  }

  async function exportPng(): Promise<void> {
    if (!previewContentRef.current) {
      return;
    }

    const canvas = await html2canvas(previewContentRef.current, {
      backgroundColor: "#ffffff",
      scale: window.devicePixelRatio,
      useCORS: true,
    });

    canvas.toBlob((blob) => {
      if (blob) {
        downloadBlob(blob, `${fileNameFromTitle(activeTab.title)}.png`);
      }
    }, "image/png");
  }

  async function exportPdf(): Promise<void> {
    if (!previewContentRef.current) {
      return;
    }

    const canvas = await html2canvas(previewContentRef.current, {
      backgroundColor: "#ffffff",
      scale: 2,
      useCORS: true,
    });
    const image = canvas.toDataURL("image/png");
    const pdf = new jsPDF("p", "pt", "a4");
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const imageHeight = (canvas.height * pageWidth) / canvas.width;
    let remainingHeight = imageHeight;
    let y = 0;

    pdf.addImage(image, "PNG", 0, y, pageWidth, imageHeight);
    remainingHeight -= pageHeight;

    while (remainingHeight > 0) {
      y -= pageHeight;
      pdf.addPage();
      pdf.addImage(image, "PNG", 0, y, pageWidth, imageHeight);
      remainingHeight -= pageHeight;
    }

    pdf.save(`${fileNameFromTitle(activeTab.title)}.pdf`);
  }

  function renderMarkdownEditor(): JSX.Element {
    return (
      <label className="relative flex h-full min-h-0 min-w-0 flex-col overflow-hidden bg-white">
        <span className="sr-only">Markdown input</span>
        <textarea
          className={cn(
            "markdown-editor scrollbar-forge relative w-full resize-none border-0 bg-transparent py-0 px-4 text-[13px] leading-6 text-slate-900 caret-slate-950 outline-none placeholder:text-slate-400",
            "h-full min-h-0 flex-1 overflow-auto",
          )}
          onChange={handleContentChange}
          onScroll={onEditorScroll}
          placeholder="# Start writing Markdown..."
          ref={editorRef}
          spellCheck={false}
          value={activeTab.content}
          wrap="soft"
        />
      </label>
    );
  }

  return (
    <>
      <section className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm shadow-slate-950/[0.03]">
        <div className="flex min-h-12 shrink-0 flex-wrap items-center gap-2 border-b border-slate-100 px-3 py-1.5">
          <div className="flex min-w-0 flex-1 items-center gap-2">
            <DropdownMenu.Root>
              <DropdownMenu.Trigger asChild>
                <Button aria-label="Select editor layout" size="sm" variant="secondary">
                  <ActiveViewIcon aria-hidden="true" className="h-4 w-4" />
                  {activeViewMode.label}
                  <ChevronDown aria-hidden="true" className="h-3.5 w-3.5" />
                </Button>
              </DropdownMenu.Trigger>
              <DropdownMenu.Portal>
                <DropdownMenu.Content
                  align="start"
                  className="z-50 min-w-36 rounded-md border border-slate-200 bg-white p-1 shadow-lg shadow-slate-950/10"
                  sideOffset={6}
                >
                  {viewModes.map((mode) => {
                    const Icon = mode.icon;

                    return (
                      <DropdownMenu.Item
                        className="markdown-menu-item"
                        key={mode.value}
                        onSelect={() => updateState({ ...state, viewMode: mode.value })}
                      >
                        <Icon aria-hidden="true" className="h-4 w-4" />
                        {mode.label}
                      </DropdownMenu.Item>
                    );
                  })}
                </DropdownMenu.Content>
              </DropdownMenu.Portal>
            </DropdownMenu.Root>

            <p className="hidden truncate text-[12px] font-medium text-slate-500 md:block">
              {activeTab.content.length.toLocaleString()} chars / {readTime} min read
            </p>
          </div>

          <div className="flex items-center gap-1">
            <Tooltip
              content={state.syncScroll ? "Disable sync" : "Enable sync"}
              side="bottom"
            >
              <Button
                aria-label="Toggle sync"
                aria-pressed={state.syncScroll}
                className={cn(
                  "h-8 px-2.5 text-xs",
                  state.syncScroll && "bg-sky-50 text-sky-700 ring-1 ring-sky-100",
                )}
                onClick={() => updateState({ ...state, syncScroll: !state.syncScroll })}
                size="sm"
                variant="ghost"
              >
                {state.syncScroll ? (
                  <Link2 aria-hidden="true" className="h-4 w-4" />
                ) : (
                  <Link2Off aria-hidden="true" className="h-4 w-4" />
                )}
                Sync
              </Button>
            </Tooltip>

            <Tooltip content="Open Markdown guide" side="bottom">
              <Button
                aria-label="Open Markdown guide"
                className="h-8 px-2.5 text-xs"
                onClick={openGuide}
                size="sm"
                variant="ghost"
              >
                <BookOpen aria-hidden="true" className="h-4 w-4" />
                Open Guide
              </Button>
            </Tooltip>

            <Tooltip content="Import markdown" side="bottom">
              <Button
                aria-label="Import markdown"
                onClick={() => fileInputRef.current?.click()}
                size="icon"
                variant="ghost"
              >
                <Upload aria-hidden="true" className="h-4 w-4" />
              </Button>
            </Tooltip>

            <Tooltip content="Reset tab" side="bottom">
              <Button
                aria-label="Reset tab"
                onClick={resetActiveTab}
                size="icon"
                variant="ghost"
              >
                <RotateCcw aria-hidden="true" className="h-4 w-4" />
              </Button>
            </Tooltip>

            <DropdownMenu.Root>
              <DropdownMenu.Trigger asChild>
                <Button aria-label="Export options" size="sm" variant="secondary">
                  <Download aria-hidden="true" className="h-4 w-4" />
                  Export
                </Button>
              </DropdownMenu.Trigger>
              <DropdownMenu.Portal>
                <DropdownMenu.Content
                  align="end"
                  className="z-50 min-w-44 rounded-md border border-slate-200 bg-white p-1 shadow-lg shadow-slate-950/10"
                  sideOffset={6}
                >
                  <DropdownMenu.Item
                    className="markdown-menu-item"
                    onSelect={exportMarkdown}
                  >
                    <FileText aria-hidden="true" className="h-4 w-4" />
                    Markdown (.md)
                  </DropdownMenu.Item>
                  <DropdownMenu.Item className="markdown-menu-item" onSelect={exportHtml}>
                    <FileCode2 aria-hidden="true" className="h-4 w-4" />
                    HTML
                  </DropdownMenu.Item>
                  <DropdownMenu.Item
                    className="markdown-menu-item"
                    onSelect={(event) => {
                      event.preventDefault();
                      void exportPdf();
                    }}
                  >
                    <FileDown aria-hidden="true" className="h-4 w-4" />
                    PDF
                  </DropdownMenu.Item>
                  <DropdownMenu.Item
                    className="markdown-menu-item"
                    onSelect={(event) => {
                      event.preventDefault();
                      void exportPng();
                    }}
                  >
                    <ImageDown aria-hidden="true" className="h-4 w-4" />
                    PNG
                  </DropdownMenu.Item>
                  <DropdownMenu.Separator className="my-1 h-px bg-slate-100" />
                  <DropdownMenu.Item
                    className="markdown-menu-item"
                    onSelect={() => {
                      void copyMarkdown();
                    }}
                  >
                    <Copy aria-hidden="true" className="h-4 w-4" />
                    Copy Markdown
                  </DropdownMenu.Item>
                </DropdownMenu.Content>
              </DropdownMenu.Portal>
            </DropdownMenu.Root>
          </div>

          <input
            accept=".md,.markdown,.txt,text/markdown,text/plain"
            className="hidden"
            onChange={handleImportMarkdown}
            ref={fileInputRef}
            type="file"
          />
        </div>

        <p
          className={cn(
            "shrink-0 border-b border-slate-100 px-3 py-1 text-xs text-slate-500",
            persistence === "unavailable" && "text-red-700",
          )}
          role={persistence === "unavailable" ? "alert" : "status"}
        >
          {persistence === "unavailable"
            ? "Draft could not be saved in this browser. Keep this tab open and export Markdown before leaving."
            : persistence === "pending"
              ? "Saving draft locally?"
              : "Draft saved in this browser"}
        </p>
        <div
          className={cn(
            "grid min-h-0 min-w-0 flex-1 grid-cols-1 grid-rows-[auto_minmax(0,1fr)] overflow-hidden md:grid-rows-1",
            state.tabsCollapsed
              ? "md:grid-cols-[3rem_minmax(0,1fr)]"
              : "md:grid-cols-[11.5rem_minmax(0,1fr)] lg:grid-cols-[12rem_minmax(0,1fr)]",
          )}
        >
          <aside className="flex min-h-0 shrink-0 flex-col border-b border-slate-100 bg-slate-50/70 md:border-b-0 md:border-r">
            <div
              className={cn(
                "flex shrink-0 items-center px-2",
                state.tabsCollapsed
                  ? "h-auto flex-col justify-start gap-1 py-2"
                  : "h-11 justify-between",
              )}
            >
              {state.tabsCollapsed ? null : (
                <p className="text-[12px] font-semibold uppercase tracking-wide text-slate-500">
                  Tabs
                </p>
              )}
              <div
                className={cn(
                  "flex items-center gap-1",
                  state.tabsCollapsed && "flex-col gap-1",
                )}
              >
                <Tooltip
                  content={state.tabsCollapsed ? "Expand tabs" : "Collapse tabs"}
                  side="right"
                >
                  <Button
                    aria-label={state.tabsCollapsed ? "Expand tabs" : "Collapse tabs"}
                    className="h-8 w-8"
                    onClick={() =>
                      updateState({
                        ...state,
                        tabsCollapsed: !state.tabsCollapsed,
                      })
                    }
                    size="icon"
                    variant="ghost"
                  >
                    {state.tabsCollapsed ? (
                      <PanelLeftOpen aria-hidden="true" className="h-4 w-4" />
                    ) : (
                      <PanelLeftClose aria-hidden="true" className="h-4 w-4" />
                    )}
                  </Button>
                </Tooltip>
                <Tooltip content="New tab" side="right">
                  <Button
                    aria-label="New tab"
                    className="h-8 w-8"
                    onClick={addTab}
                    size="icon"
                    variant="ghost"
                  >
                    <FilePlus2 aria-hidden="true" className="h-4 w-4" />
                  </Button>
                </Tooltip>
              </div>
            </div>

            {state.tabsCollapsed ? (
              <div className="scrollbar-forge flex min-h-0 flex-1 flex-col items-center gap-1 overflow-y-auto overflow-x-hidden px-1 pb-2">
                {state.tabs.map((tab) => (
                  <Tooltip content={tab.title} key={tab.id} side="right">
                    <button
                      aria-label={tab.title}
                      className={cn(
                        "flex h-8 w-8 items-center justify-center rounded-md transition",
                        tab.id === activeTab.id
                          ? "bg-white text-sky-700 shadow-sm ring-1 ring-sky-100"
                          : "text-slate-500 hover:bg-white hover:text-slate-950",
                      )}
                      onClick={() => updateState({ ...state, activeTabId: tab.id })}
                      type="button"
                    >
                      <FileText aria-hidden="true" className="h-4 w-4" />
                    </button>
                  </Tooltip>
                ))}
              </div>
            ) : (
              <div className="scrollbar-forge flex shrink-0 gap-1 overflow-x-auto px-2 pb-2 md:min-h-0 md:flex-1 md:shrink md:flex-col md:overflow-y-auto md:overflow-x-hidden">
                {state.tabs.map((tab) => (
                  <div
                    className={cn(
                      "group flex h-10 min-w-44 items-center gap-1 rounded-md px-1 text-[13px] transition md:min-w-0",
                      tab.id === activeTab.id
                        ? "bg-white text-sky-700 shadow-sm ring-1 ring-sky-100"
                        : "text-slate-600 hover:bg-white hover:text-slate-950",
                    )}
                    key={tab.id}
                  >
                    <button
                      className="flex min-w-0 flex-1 items-center gap-2 px-1 text-left"
                      onClick={() => updateState({ ...state, activeTabId: tab.id })}
                      type="button"
                    >
                      <FileText aria-hidden="true" className="h-4 w-4 shrink-0" />
                      <span className="min-w-0 flex-1 truncate font-semibold">
                        {tab.title}
                      </span>
                    </button>
                    <DropdownMenu.Root>
                      <DropdownMenu.Trigger asChild>
                        <button
                          aria-label={`${tab.title} actions`}
                          className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                          type="button"
                        >
                          <MoreVertical aria-hidden="true" className="h-4 w-4" />
                        </button>
                      </DropdownMenu.Trigger>
                      <DropdownMenu.Portal>
                        <DropdownMenu.Content
                          align="end"
                          className="z-50 min-w-36 rounded-md border border-slate-200 bg-white p-1 shadow-lg shadow-slate-950/10"
                          sideOffset={6}
                        >
                          <DropdownMenu.Item
                            className="markdown-menu-item"
                            onSelect={() => openRenameDialog(tab)}
                          >
                            <Pencil aria-hidden="true" className="h-4 w-4" />
                            Rename
                          </DropdownMenu.Item>
                          <DropdownMenu.Item
                            className="markdown-menu-item"
                            onSelect={() => duplicateTab(tab)}
                          >
                            <Copy aria-hidden="true" className="h-4 w-4" />
                            Duplicate
                          </DropdownMenu.Item>
                          <DropdownMenu.Item
                            className="markdown-menu-item text-red-600 focus:text-red-700"
                            onSelect={() => deleteTab(tab.id)}
                          >
                            <Trash2 aria-hidden="true" className="h-4 w-4" />
                            Delete
                          </DropdownMenu.Item>
                        </DropdownMenu.Content>
                      </DropdownMenu.Portal>
                    </DropdownMenu.Root>
                  </div>
                ))}
              </div>
            )}
          </aside>

          <div
            className={cn(
              "grid h-full min-h-0 min-w-0 flex-1 overflow-hidden",
              showEditor && showPreview
                ? "grid-rows-2 lg:grid-cols-2 lg:grid-rows-1"
                : "grid-cols-1 grid-rows-1",
            )}
          >
            {showEditor ? renderMarkdownEditor() : null}

            {showPreview ? (
              <div
                className="scrollbar-forge h-full min-h-0 min-w-0 overflow-auto overscroll-contain border-t border-slate-100 bg-white lg:border-l lg:border-t-0"
                onScroll={onPreviewScroll}
                ref={previewScrollRef}
              >
                <div
                  className="forge-markdown min-h-full w-full px-6 py-5 sm:px-8 lg:px-10"
                  dangerouslySetInnerHTML={{ __html: renderedHtml }}
                  ref={previewContentRef}
                />
              </div>
            ) : null}
          </div>
        </div>
      </section>

      <Dialog.Root
        onOpenChange={(open) => {
          if (!open) {
            setRenameTabId(null);
            setRenameTitle("");
          }
        }}
        open={renameTabId !== null}
      >
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-50 bg-slate-950/30" />
          <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-[calc(100vw-2rem)] max-w-sm -translate-x-1/2 -translate-y-1/2 rounded-lg border border-slate-200 bg-white p-4 shadow-xl shadow-slate-950/20">
            <div className="flex items-start justify-between gap-4">
              <div>
                <Dialog.Title className="text-sm font-semibold text-slate-950">
                  Rename tab
                </Dialog.Title>
                <Dialog.Description className="mt-1 text-[12px] leading-5 text-slate-500">
                  Update the label shown in the markdown tab list.
                </Dialog.Description>
              </div>
              <Dialog.Close asChild>
                <Button aria-label="Close rename dialog" size="icon" variant="ghost">
                  <X aria-hidden="true" className="h-4 w-4" />
                </Button>
              </Dialog.Close>
            </div>

            <form className="mt-4 space-y-4" onSubmit={renameTab}>
              <label className="block">
                <span className="sr-only">Tab name</span>
                <input
                  autoFocus
                  className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm font-medium text-slate-950 outline-none transition focus:border-sky-300 focus:ring-2 focus:ring-sky-100"
                  onChange={(event) => setRenameTitle(event.target.value)}
                  value={renameTitle}
                />
              </label>

              <div className="flex justify-end gap-2">
                <Dialog.Close asChild>
                  <Button size="sm" variant="ghost">
                    Cancel
                  </Button>
                </Dialog.Close>
                <Button
                  disabled={renameTitle.trim().length === 0}
                  size="sm"
                  type="submit"
                >
                  Save
                </Button>
              </div>
            </form>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </>
  );
}
