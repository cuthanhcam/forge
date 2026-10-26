import { useRef, type JSX, type KeyboardEvent, type RefObject } from "react";
import * as ContextMenu from "@radix-ui/react-context-menu";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import {
  Copy,
  FilePlus2,
  FileText,
  MoreVertical,
  PanelLeftClose,
  PanelLeftOpen,
  Pencil,
  Trash2,
} from "lucide-react";
import { cn } from "@/shared/lib/cn";
import { MarkdownOutline } from "./MarkdownOutline";
import type { MarkdownHeading } from "./markdown-outline.service";
import { Tooltip } from "@/shared/ui/tooltip";
import type { MarkdownPreviewTab } from "./markdown-preview.schema";

interface MarkdownTabsProps {
  outline: {
    headings: MarkdownHeading[];
    open: boolean;
    activeId: string | null;
    onToggle: () => void;
    onNavigate: (id: string) => void;
  };
  tabs: MarkdownPreviewTab[];
  activeId: string;
  collapsed: boolean;
  activeButtonRef: RefObject<HTMLButtonElement | null>;
  onSelect: (id: string) => void;
  onAdd: () => void;
  onRename: (tab: MarkdownPreviewTab) => void;
  onDuplicate: (tab: MarkdownPreviewTab) => void;
  onDelete: (id: string) => void;
  onToggleCollapsed: () => void;
}
const menuClass =
  "z-50 min-w-40 max-w-[calc(100vw-1rem)] rounded-md border border-slate-200 bg-white p-1 shadow-lg shadow-slate-950/10";
const focusClass =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-accent-600";

export function MarkdownTabs(props: MarkdownTabsProps): JSX.Element {
  return (
    <aside
      aria-label="Markdown tabs"
      className="grid min-h-0 min-w-0 grid-cols-[auto_minmax(0,1fr)_auto] items-center border-b border-slate-100 bg-slate-50/70 md:flex md:flex-col md:items-stretch md:border-b-0 md:border-r"
    >
      <div className="col-start-1 row-start-1 flex h-11 shrink-0 items-center justify-between px-2">
        <span
          aria-hidden={props.collapsed}
          className={cn(
            "hidden overflow-hidden whitespace-nowrap text-xs font-medium text-slate-500 transition-[max-width,opacity] duration-200 motion-reduce:transition-none md:block",
            props.collapsed ? "max-w-0 opacity-0" : "max-w-20 opacity-100",
          )}
        >
          Tabs
        </span>
        <Tooltip content="New tab" side="right">
          <button
            aria-label="New tab"
            className={cn(
              "flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-slate-500 hover:bg-white",
              focusClass,
            )}
            onClick={props.onAdd}
            type="button"
          >
            <FilePlus2 aria-hidden="true" className="h-4 w-4" />
          </button>
        </Tooltip>
      </div>
      <div className="scrollbar-forge contents md:flex md:min-h-0 md:flex-1 md:flex-col md:overflow-y-auto">
        <div
          aria-label="Markdown documents"
          role="group"
          className={cn(
            "scrollbar-forge col-start-2 row-start-1 flex min-h-0 min-w-0 shrink-0 gap-1 overflow-x-auto p-1 md:flex-col md:overflow-x-hidden",
            props.collapsed && "md:items-center",
          )}
        >
          {props.tabs.map((tab) => (
            <DocumentTab key={tab.id} {...props} tab={tab} />
          ))}
        </div>
        <div
          className={cn(
            "scrollbar-forge col-span-3 row-start-2 max-h-48 overflow-y-auto md:max-h-none md:overflow-visible",
            props.collapsed && "hidden",
          )}
          inert={props.collapsed}
          aria-hidden={props.collapsed}
        >
          <MarkdownOutline {...props.outline} />
        </div>
      </div>
      <div className="col-start-3 row-start-1 flex shrink-0 justify-end px-1.5 py-2 md:mt-auto">
        <Tooltip content={props.collapsed ? "Expand tabs" : "Collapse tabs"} side="right">
          <button
            aria-label={props.collapsed ? "Expand tabs" : "Collapse tabs"}
            aria-expanded={!props.collapsed}
            className={cn(
              "flex h-9 w-9 items-center justify-center rounded-md text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-950 motion-reduce:transition-none",
              focusClass,
            )}
            onClick={props.onToggleCollapsed}
            type="button"
          >
            {props.collapsed ? (
              <PanelLeftOpen aria-hidden="true" className="h-4 w-4" />
            ) : (
              <PanelLeftClose aria-hidden="true" className="h-4 w-4" />
            )}
          </button>
        </Tooltip>
      </div>
    </aside>
  );
}

function DocumentTab({
  tab,
  ...props
}: MarkdownTabsProps & { tab: MarkdownPreviewTab }): JSX.Element {
  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const openingDialog = useRef(false);
  const focusActive = useRef(false);
  const active = props.activeId === tab.id;
  function restoreFocus(event: Event): void {
    event.preventDefault();
    if (openingDialog.current) {
      openingDialog.current = false;
      // Let the menu focus scope unmount before opening a modal focus scope.
      window.requestAnimationFrame(() => props.onRename(tab));
      return;
    }
    const useActive = focusActive.current;
    focusActive.current = false;
    window.requestAnimationFrame(() => {
      const target =
        useActive || !buttonRef.current?.isConnected
          ? props.activeButtonRef.current
          : buttonRef.current;
      target?.focus();
    });
  }
  function openKeyboardMenu(event: KeyboardEvent<HTMLDivElement>): void {
    if (event.key !== "ContextMenu" && !(event.shiftKey && event.key === "F10")) return;
    event.preventDefault();
    const box = event.currentTarget.getBoundingClientRect();
    event.currentTarget.dispatchEvent(
      new MouseEvent("contextmenu", {
        bubbles: true,
        cancelable: true,
        clientX: box.left + 8,
        clientY: box.bottom,
      }),
    );
  }
  function actions(kind: "context" | "dropdown"): JSX.Element {
    const Item = kind === "context" ? ContextMenu.Item : DropdownMenu.Item;
    return (
      <>
        <Item
          className="markdown-menu-item"
          onSelect={() => {
            openingDialog.current = true;
          }}
        >
          <Pencil aria-hidden="true" className="h-4 w-4" />
          Rename
        </Item>
        <Item
          className="markdown-menu-item"
          onSelect={() => {
            focusActive.current = true;
            props.onDuplicate(tab);
          }}
        >
          <Copy aria-hidden="true" className="h-4 w-4" />
          Duplicate
        </Item>
        <Item
          className="markdown-menu-item text-red-600 focus:text-red-700"
          onSelect={() => {
            focusActive.current = true;
            props.onDelete(tab.id);
          }}
        >
          <Trash2 aria-hidden="true" className="h-4 w-4" />
          Delete
        </Item>
      </>
    );
  }
  return (
    <ContextMenu.Root>
      <ContextMenu.Trigger asChild>
        <div
          className={cn(
            "group flex shrink-0 items-center rounded-md text-[13px]",
            props.collapsed
              ? "h-8 w-8 justify-center"
              : "h-10 min-w-40 gap-1 px-1 md:min-w-0",
            active
              ? "bg-white text-accent-700 shadow-sm ring-1 ring-inset ring-accent-100"
              : "text-slate-500 hover:bg-white",
          )}
          onKeyDown={openKeyboardMenu}
        >
          <Tooltip
            content={`${tab.title} (right-click or Shift+F10 for actions)`}
            side="right"
          >
            <button
              aria-keyshortcuts="Shift+F10"
              aria-label={tab.title}
              aria-pressed={active}
              className={cn(
                "flex h-full min-w-0 flex-1 items-center gap-2 rounded-md",
                props.collapsed ? "justify-center" : "px-1 text-left",
                focusClass,
              )}
              data-markdown-document=""
              onClick={() => props.onSelect(tab.id)}
              ref={(node) => {
                buttonRef.current = node;
                if (active) props.activeButtonRef.current = node;
              }}
              type="button"
            >
              <FileText aria-hidden="true" className="h-4 w-4 shrink-0" />
              {!props.collapsed ? (
                <span className="min-w-0 flex-1 truncate font-medium">{tab.title}</span>
              ) : null}
            </button>
          </Tooltip>
          {!props.collapsed ? (
            <DropdownMenu.Root>
              <DropdownMenu.Trigger asChild>
                <button
                  aria-label={`${tab.title} actions`}
                  className={cn(
                    "inline-flex h-8 w-7 shrink-0 items-center justify-center rounded-md text-slate-400 hover:bg-slate-100",
                    focusClass,
                  )}
                  type="button"
                >
                  <MoreVertical aria-hidden="true" className="h-4 w-4" />
                </button>
              </DropdownMenu.Trigger>
              <DropdownMenu.Portal>
                <DropdownMenu.Content
                  align="end"
                  className={menuClass}
                  onCloseAutoFocus={restoreFocus}
                  sideOffset={6}
                >
                  {actions("dropdown")}
                </DropdownMenu.Content>
              </DropdownMenu.Portal>
            </DropdownMenu.Root>
          ) : null}
        </div>
      </ContextMenu.Trigger>
      <ContextMenu.Portal>
        <ContextMenu.Content
          aria-label={`${tab.title} actions`}
          className={menuClass}
          collisionPadding={8}
          onCloseAutoFocus={restoreFocus}
        >
          {actions("context")}
        </ContextMenu.Content>
      </ContextMenu.Portal>
    </ContextMenu.Root>
  );
}
