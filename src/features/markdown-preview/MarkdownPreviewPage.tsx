import "katex/dist/katex.min.css";

import type { ChangeEvent, FormEvent, JSX } from "react";
import { useDeferredValue, useMemo, useRef, useState } from "react";
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
  FileText,
  ImageDown,
  ListTree,
  Link2,
  Link2Off,
  PanelLeft,
  PanelRight,
  RotateCcw,
  SplitSquareHorizontal,
  Upload,
  X,
} from "lucide-react";
import { usePersistedToolState } from "@/core/storage/use-persisted-tool-state";
import { cn } from "@/shared/lib/cn";
import { ResizablePanes } from "@/shared/components/ResizablePanes";
import { NumberedTextarea } from "@/shared/components/NumberedTextarea";
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
  normalizeMarkdownPreviewState,
  renderMarkdownToHtml,
} from "./markdown-preview.service";

import { buildMarkdownOutline } from "./markdown-outline.service";
import { useMarkdownOutline } from "./use-markdown-outline";
import { MarkdownTabs } from "./MarkdownTabs";
import { MarkdownPreviewContent } from "./MarkdownPreviewContent";
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
  const renameInputRef = useRef<HTMLInputElement>(null);
  const activeTabButtonRef = useRef<HTMLButtonElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const editorRef = useRef<HTMLTextAreaElement>(null);
  const previewScrollRef = useRef<HTMLDivElement>(null);
  const previewContentRef = useRef<HTMLDivElement>(null);
  const activeTab =
    state.tabs.find((tab) => tab.id === state.activeTabId) ?? state.tabs[0];
  const previewSource = useDeferredValue(activeTab.content);
  const { html: renderedHtml, headings } = useMemo(
    () => buildMarkdownOutline(renderMarkdownToHtml(previewSource)),
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

  const { onEditorScroll, onPreviewScroll, onEdit, onEditorIntent, onPreviewIntent } =
    useMarkdownScroll({
      editor: editorRef,
      preview: previewScrollRef,
      content: previewContentRef,
      documentId: activeTab.id,
      enabled: syncScrollEnabled,
      layout: state.viewMode,
      html: renderedHtml,
    });

  const outline = useMarkdownOutline({
    preview: previewScrollRef,
    content: previewContentRef,
    editor: editorRef,
    headings,
    documentId: activeTab.id,
    layout: state.viewMode,
    visible: showPreview,
    markPreviewIntent: onPreviewIntent,
  });
  function navigateHeading(id: string): void {
    if (!showPreview) updateState({ ...state, viewMode: "split" });
    outline.navigate(id);
  }

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

    const deletedIndex = state.tabs.findIndex((tab) => tab.id === tabId);
    const nextTabs = state.tabs.filter((tab) => tab.id !== tabId);
    const nextActiveTab =
      nextTabs.find((tab) => tab.id === state.activeTabId) ??
      nextTabs[Math.min(deletedIndex, nextTabs.length - 1)];

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
      <NumberedTextarea
        label="Markdown input"
        className="markdown-editor"
        onChange={handleContentChange}
        onScroll={onEditorScroll}
        onKeyDown={onEditorIntent}
        onWheel={onEditorIntent}
        onPointerDown={onEditorIntent}
        placeholder="# Start writing Markdown..."
        textareaRef={editorRef}
        value={activeTab.content}
      />
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

          <div className="flex min-w-0 flex-wrap items-center gap-1">
            <Tooltip
              content={
                state.outlineOpen && !state.tabsCollapsed
                  ? "Hide outline"
                  : "Show outline"
              }
              side="bottom"
            >
              <Button
                aria-label={
                  state.outlineOpen && !state.tabsCollapsed
                    ? "Hide outline"
                    : "Show outline"
                }
                aria-expanded={state.outlineOpen && !state.tabsCollapsed}
                aria-controls="markdown-outline-items"
                size="icon"
                variant="ghost"
                onClick={() =>
                  updateState({
                    ...state,
                    tabsCollapsed: false,
                    outlineOpen: state.tabsCollapsed || !state.outlineOpen,
                  })
                }
              >
                <ListTree aria-hidden="true" className="h-4 w-4" />
              </Button>
            </Tooltip>
            <Tooltip
              content={state.syncScroll ? "Disable sync" : "Enable sync"}
              side="bottom"
            >
              <Button
                aria-label="Toggle sync"
                aria-pressed={state.syncScroll}
                className={cn(
                  "h-8 px-2.5 text-xs",
                  state.syncScroll &&
                    "bg-accent-50 text-accent-700 ring-1 ring-accent-100",
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

        {persistence === "unavailable" ? (
          <p
            className="shrink-0 border-b border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700"
            role="alert"
          >
            Draft could not be saved in this browser. Keep this tab open and export
            Markdown before leaving.
          </p>
        ) : null}
        <div
          className={cn(
            "grid min-h-0 min-w-0 flex-1 grid-cols-1 grid-rows-[auto_minmax(0,1fr)] overflow-hidden transition-[grid-template-columns] duration-200 ease-out motion-reduce:transition-none md:grid-rows-1",
            state.tabsCollapsed
              ? "md:grid-cols-[3rem_minmax(0,1fr)]"
              : "md:grid-cols-[11.5rem_minmax(0,1fr)] lg:grid-cols-[12rem_minmax(0,1fr)]",
          )}
        >
          <MarkdownTabs
            outline={{
              headings,
              open: state.outlineOpen,
              activeId: outline.activeId,
              onToggle: () => updateState({ ...state, outlineOpen: !state.outlineOpen }),
              onNavigate: navigateHeading,
            }}
            tabs={state.tabs}
            activeId={activeTab.id}
            collapsed={state.tabsCollapsed}
            activeButtonRef={activeTabButtonRef}
            onSelect={(id) => updateState({ ...state, activeTabId: id })}
            onAdd={addTab}
            onRename={openRenameDialog}
            onDuplicate={duplicateTab}
            onDelete={deleteTab}
            onToggleCollapsed={() =>
              updateState({ ...state, tabsCollapsed: !state.tabsCollapsed })
            }
          />

          <ResizablePanes
            first={showEditor ? renderMarkdownEditor() : null}
            second={
              showPreview ? (
                <div
                  className="scrollbar-forge h-full min-h-0 min-w-0 overflow-auto overscroll-contain bg-background outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-accent-600"
                  onClick={(event) => {
                    if (!(event.target instanceof Element)) return;
                    const link = event.target.closest('a[href^="#"]');
                    if (!link) return;
                    try {
                      const id = decodeURIComponent(link.getAttribute("href")!.slice(1));
                      if (headings.some((heading) => heading.id === id)) {
                        event.preventDefault();
                        outline.navigate(id);
                      }
                    } catch {
                      /* Preserve malformed author links. */
                    }
                  }}
                  onScroll={onPreviewScroll}
                  onKeyDown={onPreviewIntent}
                  onWheel={onPreviewIntent}
                  onPointerDown={onPreviewIntent}
                  tabIndex={0}
                  role="document"
                  aria-label="Rendered Markdown"
                  ref={previewScrollRef}
                >
                  <MarkdownPreviewContent
                    key={activeTab.id}
                    html={renderedHtml}
                    contentRef={previewContentRef}
                  />
                </div>
              ) : null
            }
          />
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
          <Dialog.Content
            onOpenAutoFocus={(event) => {
              event.preventDefault();
              renameInputRef.current?.focus();
              renameInputRef.current?.select();
            }}
            onCloseAutoFocus={(event) => {
              event.preventDefault();
              activeTabButtonRef.current?.focus();
            }}
            className="fixed left-1/2 top-1/2 z-50 w-[calc(100vw-2rem)] max-w-sm -translate-x-1/2 -translate-y-1/2 rounded-lg border border-slate-200 bg-white p-4 shadow-xl shadow-slate-950/20"
          >
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
                  ref={renameInputRef}
                  className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm font-medium text-slate-950 outline-none transition focus:border-accent-500 focus:ring-2 focus:ring-accent-100"
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
