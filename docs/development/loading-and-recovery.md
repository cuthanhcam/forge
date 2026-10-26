# Loading and recovery

## Startup before JavaScript

index.html contains a small, self-contained Forge loader with inline styling.
It does not depend on the application bundle or web fonts. A module-load failure
or early script error switches it to a generic recovery screen with a manual
Reload page action. After 12 seconds a pending load offers a connection hint and
reload action without claiming the request has failed. JavaScript-disabled
browsers receive a noscript explanation. Startup colors follow the stored theme;
reduced-motion preferences disable animation.

The bootstrap markup is replaced when React mounts. Error messages and stacks
are not displayed, persisted or sent to a reporting service. The startup handler
ignores later errors once its markup is gone; React boundaries own app recovery.
If the HTML request itself cannot reach the browser, Forge cannot replace the
browser's own network error screen. No service worker or offline data cache has
been introduced.

## Tool loading and render failures

Suspense shows a layout-shaped skeleton while lazy tool modules load. Its status
is named for assistive technology, decorative lines are hidden from it, and
pulse animation respects reduced motion.

A route-keyed PageErrorBoundary keeps the shell/search/navigation usable after a
failed import or render. Navigating to another route creates a fresh boundary.
A separate outer boundary handles failures before providers/the shell mount.
Neither boundary renders exception text, which could include sensitive input.
Reload is deliberate: React.lazy caches rejected imports, so a page reload
requests a fresh module graph rather than pretending a boundary reset retries it.
Saved browser drafts are not cleared by reload; unsaved input may be lost and the
recovery UI says so. There is no automatic reload or background transmission.

## Connectivity and page states

OfflineNotice uses browser online/offline events as a hint, without probing an
external endpoint. It can be dismissed and never blocks loaded local tools. An
online flag is not a guarantee that every resource is reachable. A connection
change does not reset tool state or replace the editor.

Unknown pages, tool IDs, documentation IDs and support modes use the custom 404
with Home and Documentation actions. Do not add invented login/permission/server
error pages to this account-free static app.

## Footer layout

Informational page containers use a min-height flex column: the content grows
and the footer follows it. This keeps short 404/Settings pages at the viewport
bottom without a fixed overlay; long content scrolls naturally. Docs retains a
single page scroll owner and sticky, independently scrollable sidebars. Tool
workspaces, including tool-error recovery, keep the editor area without a footer.

Browser tests delay/abort startup and tool modules, recover by reload, emulate
offline/online while editing, disable JavaScript, inject a synthetic render error,
check reduced motion and verify short-page footer placement at a tall viewport.
Production build inspection remains necessary because HTML entry scripts are
rewritten by Vite; the startup listener targets module scripts rather than one
build-specific filename.
