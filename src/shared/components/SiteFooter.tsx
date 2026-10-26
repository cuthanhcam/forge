import type { JSX } from "react";
import { Facebook, Github, Instagram, Linkedin, Mail } from "lucide-react";
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
      className="mt-10 border-t border-border pb-2 pt-6 text-sm leading-6 text-muted-foreground"
    >
      <div className="flex flex-wrap items-center justify-between gap-x-8 gap-y-4">
        <div className="space-y-1">
          <p>&copy; {new Date().getFullYear()} cuthanhcam</p>
          <p>Vietnam &middot; Software Engineer</p>
        </div>
        <nav
          aria-label="Maintainer contacts"
          className="ml-auto flex flex-wrap items-center gap-1"
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
    </footer>
  );
}
