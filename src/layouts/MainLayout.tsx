import { HelperPageHeader } from "@/shared/components/HelperPageHeader";
import type { JSX, ReactNode } from "react";

interface MainLayoutProps {
  children: ReactNode;
  eyebrow?: string;
  subtitle?: string;
  title: string;
}

export function MainLayout({
  children,
  eyebrow,
  subtitle,
  title,
}: MainLayoutProps): JSX.Element {
  return (
    <main className="scrollbar-forge min-h-0 min-w-0 flex-1 overflow-auto px-4 py-6 md:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6">
          <HelperPageHeader eyebrow={eyebrow} title={title} subtitle={subtitle} />
        </div>
        {children}
      </div>
    </main>
  );
}
