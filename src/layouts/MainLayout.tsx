import { cn } from "@/shared/lib/cn";
import { SiteFooter } from "@/shared/components/SiteFooter";
import { HelperPageHeader } from "@/shared/components/HelperPageHeader";
import type { JSX, ReactNode } from "react";

interface MainLayoutProps {
  children: ReactNode;
  eyebrow?: string;
  subtitle?: string;
  title: string;
  contentClassName?: string;
  showFooter?: boolean;
}

export function MainLayout({
  children,
  eyebrow,
  subtitle,
  title,
  contentClassName,
  showFooter = true,
}: MainLayoutProps): JSX.Element {
  return (
    <main className="scrollbar-forge min-h-0 min-w-0 flex-1 overflow-auto px-4 py-6 md:px-6 lg:px-8">
      <div className="mx-auto flex min-h-full w-full max-w-7xl flex-col">
        <div className="mb-6">
          <HelperPageHeader eyebrow={eyebrow} title={title} subtitle={subtitle} />
        </div>
        <div className={cn("flex-1", contentClassName)}>{children}</div>
        {showFooter && <SiteFooter />}
      </div>
    </main>
  );
}
