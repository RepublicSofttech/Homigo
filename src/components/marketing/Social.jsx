import { Facebook, Instagram, Linkedin, Youtube } from "lucide-react";
import { SOCIAL } from "../../content/site";

const XLogo = ({ className }) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true">
    <path d="M17.75 3h3.07l-6.7 7.66L22 21h-6.17l-4.83-6.32L5.47 21H2.4l7.17-8.2L2 3h6.33l4.37 5.78L17.75 3Zm-1.08 16.2h1.7L7.4 4.73H5.58L16.67 19.2Z" />
  </svg>
);
const ICONS = { Facebook, Instagram, Linkedin, X: XLogo, Youtube };
const linkProps = (href) => (href && href !== "#" ? { href, target: "_blank", rel: "noopener noreferrer" } : { href: "#", onClick: (e) => e.preventDefault() });

/** Floating vertical social bar on the left edge (desktop), like many corporate sites. */
export function SocialRail() {
  return (
    <nav aria-label="Homigo on social media" className="fixed left-3 top-1/2 z-30 hidden -translate-y-1/2 flex-col gap-2.5 lg:flex">
      {SOCIAL.map(({ name, href, icon }) => {
        const Icon = ICONS[icon];
        return (
          <a key={name} {...linkProps(href)} aria-label={name} title={name}
            className="group flex h-9 w-9 items-center justify-center rounded-full bg-white text-brand-600 shadow-md ring-1 ring-slate-200 transition hover:scale-110 hover:bg-brand-600 hover:text-white">
            <Icon className="h-4 w-4" />
          </a>
        );
      })}
    </nav>
  );
}

/** Horizontal row for the footer. */
export function SocialRow() {
  return (
    <div className="mt-5 flex gap-2.5">
      {SOCIAL.map(({ name, href, icon }) => {
        const Icon = ICONS[icon];
        return (
          <a key={name} {...linkProps(href)} aria-label={name} title={name}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-slate-200 transition hover:bg-brand-600 hover:text-white">
            <Icon className="h-4 w-4" />
          </a>
        );
      })}
    </div>
  );
}
