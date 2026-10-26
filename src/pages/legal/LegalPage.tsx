import privacyMarkdown from "../../../docs/privacy.md?raw";
import termsMarkdown from "../../../docs/terms.md?raw";
import { DocsMarkdown } from "@/pages/docs/DocsMarkdown";
import { projectLinks } from "@/core/config/project-links";
import type { JSX } from "react";
import { Link, useLocation } from "react-router";
import { LockKeyhole, Mail, ScrollText } from "lucide-react";
import { MainLayout } from "@/layouts/MainLayout";

export function LegalPage(): JSX.Element {
  const location = useLocation();
  const isTerms = location.pathname === "/terms";
  const markdown = (isTerms ? termsMarkdown : privacyMarkdown).replace(/^# .+\r?\n/, "");
  const title = isTerms ? "Terms of Use" : "Privacy Policy";

  return (
    <MainLayout
      eyebrow="Trust"
      subtitle={
        isTerms
          ? "The expectations and responsibilities for using Forge as a developer utility."
          : "How Forge is designed to handle local workspace data and sensitive developer input."
      }
      title={title}
    >
      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_16rem]">
        <section
          aria-label={title}
          className="rounded-lg border border-slate-200 bg-white px-6 py-7 shadow-sm shadow-slate-950/[0.03] md:px-9 md:py-9"
        >
          <div className="flex items-center gap-3 border-b border-slate-200 pb-5">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-slate-100 text-slate-600">
              {isTerms ? (
                <ScrollText aria-hidden="true" className="h-5 w-5" />
              ) : (
                <LockKeyhole aria-hidden="true" className="h-5 w-5" />
              )}
            </div>
            <div>
              <p className="text-xs font-medium text-slate-400">Forge trust</p>
              <p className="mt-1 text-sm font-medium text-slate-600">
                Maintained with the source code.
              </p>
            </div>
          </div>

          <div className="mt-7">
            <DocsMarkdown markdown={markdown} />
          </div>
        </section>

        <aside className="lg:sticky lg:top-5 lg:self-start">
          <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm shadow-slate-950/[0.03]">
            <p className="text-xs font-medium text-slate-400">Related</p>
            <nav className="mt-4 grid gap-2 text-sm font-semibold">
              <Link
                className="text-slate-600 transition hover:text-slate-950"
                to="/privacy"
              >
                Privacy Policy
              </Link>
              <Link
                className="text-slate-600 transition hover:text-slate-950"
                to="/terms"
              >
                Terms of Use
              </Link>
              <Link className="text-slate-600 transition hover:text-slate-950" to="/docs">
                Product docs
              </Link>
              <Link
                className="text-slate-600 transition hover:text-slate-950"
                to="/docs/safety"
              >
                Tokens and safety
              </Link>
              <a
                className="text-slate-600 transition hover:text-slate-950"
                href={`${projectLinks.repository}/blob/main/LICENSE`}
                target="_blank"
                rel="noreferrer"
              >
                MIT license
              </a>
            </nav>
          </div>

          <div className="mt-4 rounded-lg border border-slate-200 bg-white p-5 shadow-sm shadow-slate-950/[0.03]">
            <div className="flex h-9 w-9 items-center justify-center rounded-md bg-accent-50 text-accent-700">
              <Mail aria-hidden="true" className="h-4 w-4" />
            </div>
            <h2 className="mt-4 text-base font-semibold text-slate-950">Contact</h2>
            <p className="mt-2 text-[13px] leading-6 text-slate-600">
              For questions about Forge privacy, terms, or responsible reporting.
            </p>
            <a
              className="mt-4 inline-flex h-9 items-center justify-center rounded-md border border-border bg-white px-3 text-xs font-semibold text-foreground shadow-sm transition hover:border-accent-200 hover:bg-accent-50"
              href="mailto:cuthanhcam04@gmail.com"
            >
              Email maintainer
            </a>
          </div>
        </aside>
      </div>
    </MainLayout>
  );
}
