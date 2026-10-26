import type { JSX } from "react";
import { Compass, ArrowLeft, BookOpen } from "lucide-react";
import { Link } from "react-router";
import { MainLayout } from "@/layouts/MainLayout";

export function NotFoundPage(): JSX.Element {
  return (
    <MainLayout
      eyebrow="404"
      title="Page not found"
      subtitle="This address may have changed, or the link may be out of date."
      contentClassName="flex items-center"
    >
      <section className="w-full rounded-lg border border-border bg-white px-6 py-10 text-center sm:py-14">
        <Compass aria-hidden="true" className="mx-auto h-9 w-9 text-accent-600" />
        <h2 className="mt-5 text-xl font-semibold text-foreground">
          Let&apos;s get you back to work.
        </h2>
        <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-muted-foreground">
          Return to the workspace or browse the documentation. Search tools is always
          available with Ctrl/Cmd + K.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link
            className="inline-flex min-h-10 items-center justify-center gap-2 rounded-md bg-accent-solid px-4 text-sm font-medium text-accent-on-solid transition-colors hover:bg-accent-solid-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-600"
            to="/"
          >
            <ArrowLeft aria-hidden="true" className="h-4 w-4" />
            Back to home
          </Link>
          <Link
            className="inline-flex min-h-10 items-center justify-center gap-2 rounded-md border border-border bg-white px-4 text-sm font-medium text-foreground transition-colors hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-600"
            to="/docs"
          >
            <BookOpen aria-hidden="true" className="h-4 w-4" />
            Browse documentation
          </Link>
        </div>
      </section>
    </MainLayout>
  );
}
