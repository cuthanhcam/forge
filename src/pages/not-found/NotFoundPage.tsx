import type { JSX } from "react";
import { Link } from "react-router";
import { MainLayout } from "@/layouts/MainLayout";
import { EmptyState } from "@/shared/components/EmptyState";

export function NotFoundPage(): JSX.Element {
  return (
    <MainLayout
      subtitle="The route does not match an available Forge page or tool."
      title="Page not found"
    >
      <EmptyState
        action={
          <Link
            className="inline-flex h-10 items-center justify-center rounded-md bg-accent-solid px-4 text-sm font-medium text-accent-on-solid shadow-sm transition hover:bg-accent-solid-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-600"
            to="/"
          >
            Back to home
          </Link>
        }
        description="Use the sidebar or return home to pick an available workspace surface."
        title="Nothing is registered here"
      />
    </MainLayout>
  );
}
