import type { JSX } from "react";
import { Link, useLocation } from "react-router";
import { LockKeyhole, Mail, ScrollText } from "lucide-react";
import { MainLayout } from "@/layouts/MainLayout";

interface LegalSection {
  body: string[];
  title: string;
}

const privacySections: LegalSection[] = [
  {
    title: "Overview",
    body: [
      "Forge is designed as a local-first developer workstation for formatting, decoding, comparing, encoding, generating, and validating everyday developer input. This Privacy Policy explains how Forge is intended to handle information when you use the hosted application or a self-hosted copy.",
      "Forge does not require an account for its core tools. The product is built to keep common utility workflows in the browser whenever possible, especially for fragments that may be temporary or sensitive, such as JWTs, JSON payloads, source snippets, generated secrets, URLs, hashes, and passwords.",
    ],
  },
  {
    title: "Information processed in the browser",
    body: [
      "Most Forge tools process input directly in your browser. Examples include formatting JSON, converting JSON and YAML, decoding JWT header and payload data, generating UUIDs, creating passwords, generating JWT secrets, hashing text, testing regular expressions, encoding or decoding Base64, and encoding or decoding URLs.",
      "When a tool runs locally, the text you enter is used by the JavaScript application in your current browser session to produce the requested result. Forge is not designed to send that tool input to an application server for processing.",
    ],
  },
  {
    title: "Browser storage",
    body: [
      "Forge may use browser storage to remember preferences and workspace state. This can include theme preference, sidebar state, recently used tools, command palette behavior, and tool drafts where persistence makes the workflow more useful.",
      "Browser storage remains on the device and browser profile where Forge is used until it is cleared by the user, the browser, or site settings. Anyone with access to that device, browser profile, extensions, or developer tools may be able to inspect locally stored data.",
    ],
  },
  {
    title: "Sensitive developer data",
    body: [
      "Forge is useful for sensitive developer fragments, but local-first processing is not the same as a guarantee that all use is safe. You should avoid pasting production credentials, customer data, private source code, or regulated information unless you trust the device, browser, deployment, extensions, and network environment you are using.",
      "If you accidentally expose a secret in a screenshot, support message, public issue, shared machine, or untrusted environment, rotate that secret through the system that owns it.",
    ],
  },
  {
    title: "Hosted deployments and self-hosted copies",
    body: [
      "The public Forge deployment is hosted as a static web application. If you run Forge from another domain, fork, local build, preview environment, or internal deployment, the privacy behavior may depend on that environment and any analytics, proxies, headers, access logs, extensions, or platform services added around it.",
      "Self-hosted operators are responsible for understanding and communicating the privacy behavior of their own deployment.",
    ],
  },
  {
    title: "Support and external services",
    body: [
      "Forge may link to external services such as GitHub, email, or LinkedIn for support, feedback, issue reporting, and project information. Information you choose to send through those services is handled by the relevant provider and by the maintainers who receive it.",
      "Do not include private tokens, passwords, customer data, proprietary source code, or production secrets in public GitHub issues. Use redacted examples whenever possible.",
    ],
  },
  {
    title: "No account profiles or advertising model",
    body: [
      "Forge does not require a user account for core functionality and is not designed around advertising profiles. The product focus is utility work, not behavioral tracking.",
      "Future deployments may add operational telemetry or error reporting. If that happens, the privacy documentation should be updated to explain what is collected, why it is collected, and how users can control it.",
    ],
  },
  {
    title: "Your controls",
    body: [
      "You can clear Forge data through your browser's site data settings. You can also avoid persistence by using private browsing modes, disabling storage for the site, or using a trusted local deployment for sensitive work.",
      "You control what you paste into Forge, what you copy out, and what you send through support channels.",
    ],
  },
  {
    title: "Contact",
    body: [
      "For privacy questions, contact the project maintainer at cuthanhcam04@gmail.com or open a non-sensitive issue in the Forge repository.",
      "This policy may change as Forge evolves. Material changes should be reflected in the application and project documentation.",
    ],
  },
];

const termsSections: LegalSection[] = [
  {
    title: "Agreement to these terms",
    body: [
      "These Terms of Use describe the expectations for using Forge as a developer utility. By using the hosted application or a copy of Forge, you agree to use it responsibly and to review outputs before relying on them in production or security-sensitive environments.",
      "Forge is built to make everyday developer work calmer and faster. It is not a substitute for professional security review, legal review, compliance review, cryptographic review, or production validation.",
    ],
  },
  {
    title: "Description of the service",
    body: [
      "Forge provides browser-based tools for previewing Markdown and HTML, comparing text, formatting JSON, converting JSON and YAML, decoding JWTs, encoding and decoding values, generating secrets and passwords, hashing text, generating UUIDs, converting timestamps, converting case, creating slugs, and testing regular expressions.",
      "Features may change over time. Some functionality may be added, removed, renamed, or adjusted as the product matures.",
    ],
  },
  {
    title: "Your responsibility for input and output",
    body: [
      "You are responsible for the data you enter into Forge and for how you use the results. Generated passwords, JWT secrets, UUIDs, hashes, encodings, timestamps, slugs, regex matches, formatted payloads, decoded claims, and converted files should be checked against your own requirements before use.",
      "Do not rely on Forge as the sole control for security, compliance, authentication, authorization, data retention, or incident response decisions.",
    ],
  },
  {
    title: "Sensitive information",
    body: [
      "You should avoid entering production secrets, customer data, regulated data, proprietary source code, or other sensitive information unless you understand and trust the environment where Forge is running.",
      "If you share support requests, screenshots, examples, or issue reports, redact sensitive values first. Public issue trackers are not appropriate places for private credentials or customer information.",
    ],
  },
  {
    title: "Generated values and security",
    body: [
      "Forge may generate passwords, JWT secrets, UUIDs, hashes, and other values. These tools are intended to support developer workflows, but you remain responsible for selecting appropriate length, entropy, algorithms, storage practices, rotation policies, and access controls.",
      "A value that is generated locally can still become unsafe if it is copied into an insecure location, reused incorrectly, committed to source control, sent through chat, stored in browser history, or exposed through screenshots.",
    ],
  },
  {
    title: "Availability and changes",
    body: [
      "Forge may be unavailable, contain bugs, or produce unexpected results. The hosted application may change without notice, and self-hosted copies may behave differently depending on version, build configuration, hosting platform, and browser environment.",
      "You should keep critical workflows backed by appropriate tests, reviews, and production-grade tooling.",
    ],
  },
  {
    title: "Open source and third-party components",
    body: [
      "Forge is built with open-source libraries and browser platform APIs. Those components may have their own licenses, limitations, and update cycles.",
      "If you redistribute, modify, or self-host Forge, you are responsible for complying with applicable licenses and for reviewing the security and behavior of the version you deploy.",
    ],
  },
  {
    title: "No warranties",
    body: [
      "Forge is provided as a practical utility. To the maximum extent permitted by applicable law, it is provided without warranties of any kind, whether express or implied, including warranties of accuracy, fitness for a particular purpose, availability, security, or non-infringement.",
      "Use Forge at your own discretion and verify results before applying them to important systems.",
    ],
  },
  {
    title: "Contact",
    body: [
      "Questions about these terms can be sent to cuthanhcam04@gmail.com. Non-sensitive product issues can be reported through the Forge GitHub repository.",
      "These terms may be updated as Forge changes. Continued use of Forge after updates means you accept the revised terms.",
    ],
  },
];

export function LegalPage(): JSX.Element {
  const location = useLocation();
  const isTerms = location.pathname === "/terms";
  const sections = isTerms ? termsSections : privacySections;
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
      <div className="mx-auto grid max-w-5xl gap-8 lg:grid-cols-[minmax(0,1fr)_16rem]">
        <article className="rounded-lg border border-slate-200 bg-white px-6 py-7 shadow-sm shadow-slate-950/[0.03] md:px-9 md:py-9">
          <div className="flex items-center gap-3 border-b border-slate-200 pb-5">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-slate-100 text-slate-600">
              {isTerms ? (
                <ScrollText aria-hidden="true" className="h-5 w-5" />
              ) : (
                <LockKeyhole aria-hidden="true" className="h-5 w-5" />
              )}
            </div>
            <div>
              <p className="text-xs font-medium text-slate-400">Forge legal</p>
              <p className="mt-1 text-sm font-medium text-slate-600">
                Last updated: July 5, 2026
              </p>
            </div>
          </div>

          <div className="mt-7 space-y-8">
            {sections.map((section) => (
              <section key={section.title}>
                <h2 className="text-xl font-semibold tracking-normal text-slate-950">
                  {section.title}
                </h2>
                <div className="mt-3 space-y-3 text-[14px] leading-7 text-slate-600">
                  {section.body.map((paragraph) => (
                    <p key={paragraph}>{paragraph}</p>
                  ))}
                </div>
              </section>
            ))}
          </div>
        </article>

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
            </nav>
          </div>

          <div className="mt-4 rounded-lg border border-slate-200 bg-white p-5 shadow-sm shadow-slate-950/[0.03]">
            <div className="flex h-9 w-9 items-center justify-center rounded-md bg-sky-50 text-sky-700">
              <Mail aria-hidden="true" className="h-4 w-4" />
            </div>
            <h2 className="mt-4 text-base font-semibold text-slate-950">Contact</h2>
            <p className="mt-2 text-[13px] leading-6 text-slate-600">
              For questions about Forge privacy, terms, or responsible reporting.
            </p>
            <a
              className="mt-4 inline-flex h-9 items-center justify-center rounded-md border border-border bg-white px-3 text-xs font-semibold text-foreground shadow-sm transition hover:border-sky-200 hover:bg-sky-50"
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
