import { projectLinks } from "@/core/config/project-links";
import { HelperPageHeader } from "@/shared/components/HelperPageHeader";
import type { JSX } from "react";
import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  Github,
  HeartHandshake,
  Linkedin,
  Mail,
  MessageCircle,
} from "lucide-react";
import { NavLink, useParams } from "react-router";
import { cn } from "@/shared/lib/cn";

const supportModes = [
  {
    description: "Ask how a tool should work, clarify a workflow, or request guidance.",
    icon: MessageCircle,
    id: "ask",
    title: "Ask a question",
  },
  {
    description: "Report broken behavior, incorrect output, or UI regressions.",
    icon: AlertTriangle,
    id: "issue",
    title: "Report an issue",
  },
  {
    description: "Suggest improvements, missing tools, or better defaults.",
    icon: HeartHandshake,
    id: "feedback",
    title: "Share feedback",
  },
];

const contact = {
  email: projectLinks.email,
  issues: projectLinks.issues,
  linkedin: "https://www.linkedin.com/in/cuthanhcam/",
  repository: projectLinks.repository,
};

export function SupportPage(): JSX.Element {
  const { mode } = useParams();
  const activeMode = supportModes.find((item) => item.id === mode) ?? supportModes[0];
  const ActiveIcon = activeMode.icon;
  const [subject, setSubject] = useState(`Forge - ${activeMode.title}`);
  const [message, setMessage] = useState("");
  const mailtoHref = useMemo(() => {
    const body = message || defaultMessage(activeMode.id);

    return `mailto:${contact.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  }, [activeMode.id, message, subject]);

  useEffect(() => {
    setSubject(`Forge - ${activeMode.title}`);
    setMessage("");
  }, [activeMode.title]);

  return (
    <main className="scrollbar-forge min-h-0 flex-1 overflow-auto px-4 py-6 md:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <section className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm shadow-slate-950/[0.03]">
          <HelperPageHeader
            eyebrow="Support"
            title="How can we help?"
            subtitle="Ask a question, report a reproducible issue, or help shape the next Forge improvement."
          />

          <div className="grid min-h-[560px] lg:grid-cols-[280px_minmax(0,1fr)]">
            <aside className="border-b border-slate-200 bg-slate-50 p-3 lg:border-b-0 lg:border-r">
              <nav className="space-y-1" aria-label="Support navigation">
                {supportModes.map((item) => {
                  const Icon = item.icon;

                  return (
                    <NavLink
                      className={({ isActive }) =>
                        cn(
                          "flex gap-3 rounded-lg p-3 transition",
                          isActive || (!mode && item.id === "ask")
                            ? "bg-white text-accent-700 shadow-sm ring-1 ring-accent-100"
                            : "text-slate-600 hover:bg-white hover:text-slate-950",
                        )
                      }
                      key={item.id}
                      to={`/support/${item.id}`}
                    >
                      <Icon aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0" />
                      <span>
                        <span className="block text-[13px] font-bold">{item.title}</span>
                        <span className="mt-1 block text-[12px] font-medium leading-5 text-slate-500">
                          {item.description}
                        </span>
                      </span>
                    </NavLink>
                  );
                })}
              </nav>
            </aside>

            <section className="p-5 md:p-6">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-accent-50 text-accent-600 ring-1 ring-accent-100">
                  <ActiveIcon aria-hidden="true" className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold tracking-normal text-slate-950">
                    {activeMode.title}
                  </h2>
                  <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
                    {activeMode.description}
                  </p>
                </div>
              </div>

              <div className="mt-5 rounded-md border border-border bg-slate-50 p-4 text-sm leading-6 text-muted-foreground">
                Use synthetic examples and redact tokens, secrets, personal data and
                screenshots before sharing. For a security vulnerability, email the
                maintainer privately instead of opening a public issue.{" "}
                <a
                  className="text-accent-700 underline underline-offset-4"
                  href="https://github.com/cuthanhcam/forge/blob/main/SECURITY.md"
                  target="_blank"
                  rel="noreferrer"
                >
                  Security policy
                </a>
                .
              </div>
              <div className="mt-6 grid gap-3 md:grid-cols-3">
                <ContactCard
                  description="Questions or private vulnerability reports. Never send live credentials."
                  href={mailtoHref}
                  icon={Mail}
                  label={contact.email}
                  title="Email"
                />
                <ContactCard
                  description="Best for bugs, reproducible cases, and public tracking."
                  href={contact.issues}
                  icon={Github}
                  label="github.com/cuthanhcam/forge/issues"
                  title="GitHub issues"
                />
                <ContactCard
                  description="Best for professional contact and roadmap conversations."
                  href={contact.linkedin}
                  icon={Linkedin}
                  label="linkedin.com/in/cuthanhcam"
                  title="LinkedIn"
                />
              </div>

              <div className="mt-6 grid gap-4 rounded-lg border border-slate-200 bg-slate-50 p-4 lg:grid-cols-[minmax(0,1fr)_280px]">
                <div>
                  <h3 className="text-[14px] font-semibold text-slate-950">
                    Compose an email
                  </h3>
                  <p className="mt-1 text-[13px] leading-5 text-slate-500">
                    Write a quick note here, then open it in your mail app. For
                    reproducible bugs, GitHub issues are better because they stay
                    trackable in the repository. This form does not submit or save your
                    message; Open email hands the draft to your mail app for review.
                  </p>
                  <label className="mt-4 block">
                    <span className="text-[12px] font-bold uppercase tracking-[0.08em] text-slate-400">
                      Subject
                    </span>
                    <input
                      className="mt-2 h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-[13px] font-medium text-slate-950 outline-none focus:border-accent-500 focus:ring-4 focus:ring-accent-100"
                      onChange={(event) => setSubject(event.target.value)}
                      value={subject}
                    />
                  </label>
                  <label className="mt-3 block">
                    <span className="text-[12px] font-bold uppercase tracking-[0.08em] text-slate-400">
                      Message
                    </span>
                    <textarea
                      className="scrollbar-forge mt-2 min-h-44 w-full resize-none rounded-md border border-slate-200 bg-white p-3 text-[13px] leading-6 text-slate-950 outline-none placeholder:text-slate-400 focus:border-accent-500 focus:ring-4 focus:ring-accent-100"
                      onChange={(event) => setMessage(event.target.value)}
                      placeholder={defaultMessage(activeMode.id)}
                      value={message}
                    />
                  </label>
                </div>
                <div className="grid content-start gap-3">
                  <a
                    className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-border bg-white px-4 text-sm font-medium text-foreground shadow-sm transition hover:border-accent-200 hover:bg-accent-50"
                    href={mailtoHref}
                  >
                    <Mail aria-hidden="true" className="h-4 w-4" />
                    Open email
                  </a>
                  <a
                    className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-border bg-white px-4 text-sm font-medium text-foreground shadow-sm transition hover:border-accent-200 hover:bg-accent-50"
                    href={contact.issues}
                    rel="noreferrer"
                    target="_blank"
                  >
                    <Github aria-hidden="true" className="h-4 w-4" />
                    Open issue
                  </a>
                  <a
                    className="rounded-lg border border-slate-200 bg-white p-3 text-[12px] font-semibold leading-5 text-slate-600 transition hover:border-accent-200 hover:bg-accent-50/40"
                    href={contact.repository}
                    rel="noreferrer"
                    target="_blank"
                  >
                    Repository:{" "}
                    <span className="font-mono text-accent-700">cuthanhcam/forge</span>
                  </a>
                </div>
              </div>
              <div className="mt-6 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                <span>
                  Forge is open source. Contributions and optional support help it grow.
                </span>
                <a
                  className="text-accent-700 underline underline-offset-4"
                  href={projectLinks.sponsors}
                  target="_blank"
                  rel="noreferrer"
                >
                  GitHub Sponsors
                </a>
                <a
                  className="text-accent-700 underline underline-offset-4"
                  href={projectLinks.kofi}
                  target="_blank"
                  rel="noreferrer"
                >
                  Ko-fi
                </a>
              </div>
            </section>
          </div>
        </section>
      </div>
    </main>
  );
}

interface ContactCardProps {
  description: string;
  href: string;
  icon: typeof Mail;
  label: string;
  title: string;
}

function ContactCard({
  description,
  href,
  icon: Icon,
  label,
  title,
}: ContactCardProps): JSX.Element {
  return (
    <a
      className="group rounded-lg border border-slate-200 bg-white p-4 transition hover:border-accent-200 hover:bg-accent-50/40"
      href={href}
      rel="noreferrer"
      target={href.startsWith("mailto:") ? undefined : "_blank"}
    >
      <div className="flex h-9 w-9 items-center justify-center rounded-md bg-slate-100 text-slate-600 group-hover:bg-accent-50 group-hover:text-accent-600">
        <Icon aria-hidden="true" className="h-4 w-4" />
      </div>
      <h3 className="mt-3 text-[14px] font-semibold text-slate-950">{title}</h3>
      <p className="mt-1 break-words font-mono text-[12px] leading-5 text-accent-700">
        {label}
      </p>
      <p className="mt-2 text-[12px] leading-5 text-slate-500">{description}</p>
    </a>
  );
}

function defaultMessage(mode: string): string {
  if (mode === "issue") {
    return "Tool or page:\nSteps to reproduce:\nExpected result:\nActual result:\nEnvironment:";
  }

  if (mode === "feedback") {
    return "Workflow:\nWhat feels unclear or slow:\nSuggested improvement:";
  }

  return "Question:\nContext:\nTool or page:\nWhat I tried:";
}
