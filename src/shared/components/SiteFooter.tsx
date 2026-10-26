import type { JSX } from "react";
import { Facebook, Github, Instagram, Linkedin, Mail } from "lucide-react";
import { Link } from "react-router";
import { projectLinks } from "@/core/config/project-links";
import { Tooltip } from "@/shared/ui/tooltip";

const contacts = [
  { label: "GitHub profile", href: projectLinks.maintainer.github, icon: Github },
  { label: "LinkedIn", href: projectLinks.maintainer.linkedin, icon: Linkedin },
  { label: "Email maintainer", href: `mailto:${projectLinks.email}`, icon: Mail },
  { label: "Facebook", href: projectLinks.maintainer.facebook, icon: Facebook },
  { label: "Instagram", href: projectLinks.maintainer.instagram, icon: Instagram },
];

/** Informational pages only: scroll with the page and leave tool workspaces full-height. */
export function SiteFooter(): JSX.Element {
  return (
    <footer
      role="contentinfo"
      aria-label="Forge footer"
      className="mt-10 border-t border-border pb-2 pt-6 text-xs leading-5 text-muted-foreground"
    >
      <div className="flex flex-wrap items-start justify-between gap-x-8 gap-y-4">
        <div className="space-y-1">
          <p>
            &copy; {new Date().getFullYear()} cuthanhcam <span aria-hidden="true">·</span>{" "}
            Forge
          </p>
          <p>Independent, open-source developer tools.</p>
        </div>
        <nav
          aria-label="Maintainer contacts"
          className="flex flex-wrap items-center gap-1"
        >
          {contacts.map(({ label, href, icon: Icon }) => (
            <Tooltip key={label} content={label} side="top">
              <a
                aria-label={label}
                href={href}
                target={href.startsWith("mailto:") ? undefined : "_blank"}
                rel={href.startsWith("mailto:") ? undefined : "noopener noreferrer"}
                className="inline-flex h-9 w-9 items-center justify-center rounded-md transition-colors hover:bg-slate-100 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-accent-600 motion-reduce:transition-none"
              >
                <Icon aria-hidden="true" className="h-4 w-4" />
              </a>
            </Tooltip>
          ))}
        </nav>
      </div>
      <nav aria-label="Forge information" className="mt-4 flex flex-wrap gap-x-4 gap-y-2">
        {[
          { to: "/docs", label: "Documentation" },
          { to: "/support/ask", label: "Support" },
          { to: "/privacy", label: "Privacy" },
          { to: "/terms", label: "Terms" },
        ].map(({ to, label }) => (
          <Link
            key={to}
            to={to}
            className="rounded underline-offset-4 hover:text-foreground hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-600"
          >
            {label}
          </Link>
        ))}
      </nav>
    </footer>
  );
}
