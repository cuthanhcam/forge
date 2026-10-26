import type { JSX } from "react";
import { CircleAlert, RotateCcw } from "lucide-react";
import { MainLayout } from "@/layouts/MainLayout";
import { Button } from "@/shared/ui/button";

export function PageErrorState({
  showFooter = true,
}: {
  showFooter?: boolean;
}): JSX.Element {
  return (
    <MainLayout
      eyebrow="Page unavailable"
      title="This page could not load"
      subtitle="A connection problem or an unexpected error interrupted the page."
      contentClassName="flex items-center"
      showFooter={showFooter}
    >
      <section
        role="alert"
        className="w-full rounded-lg border border-border bg-white px-6 py-10 text-center sm:py-14"
      >
        <CircleAlert aria-hidden="true" className="mx-auto h-9 w-9 text-accent-600" />
        <h2 className="mt-5 text-xl font-semibold text-foreground">
          Check your connection, then try again.
        </h2>
        <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-muted-foreground">
          Reload to request the latest app files. Saved drafts are not cleared by
          reloading, but unsaved changes in this tab may be lost.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Button variant="primary" onClick={() => window.location.reload()}>
            <RotateCcw aria-hidden="true" className="h-4 w-4" />
            Reload page
          </Button>
          <a
            className="inline-flex min-h-10 items-center justify-center rounded-md border border-border bg-white px-4 text-sm font-medium text-foreground hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-600"
            href="/"
          >
            Back to home
          </a>
        </div>
        <p className="mt-5 text-xs leading-5 text-muted-foreground">
          Still happening?{" "}
          <a
            className="text-accent-700 underline underline-offset-4"
            href="/support/issue"
          >
            Report an issue
          </a>{" "}
          with a synthetic example.
        </p>
      </section>
    </MainLayout>
  );
}
