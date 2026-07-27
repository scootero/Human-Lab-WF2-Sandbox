import type { AppConfig } from "@/lib/appData";

interface FooterProps {
  config: AppConfig;
}

export default function Footer({ config }: FooterProps) {
  const year = new Date().getFullYear();
  const contactEmail = config.contactEmail?.trim() || "";

  return (
    <footer className="border-t border-[var(--border)] py-10">
      <div className="section-container flex flex-col items-center justify-between gap-6 sm:flex-row">
        <div className="flex items-center gap-3">
          <span
            className="flex h-8 w-8 items-center justify-center rounded-lg text-xs font-bold text-white"
            style={{ background: "var(--accent-gradient)" }}
          >
            {config.logo.text || config.appName.charAt(0)}
          </span>
          <span className="text-sm font-medium text-theme">{config.appName}</span>
        </div>

        <nav
          className="flex flex-wrap justify-center gap-6 text-sm"
          style={{ color: "var(--muted)" }}
        >
          <a href="#features" className="transition-colors hover:text-[var(--foreground)]">
            Features
          </a>
          <a href="#pricing" className="transition-colors hover:text-[var(--foreground)]">
            Pricing
          </a>
          <a href="#faq" className="transition-colors hover:text-[var(--foreground)]">
            FAQ
          </a>
          <a href="/privacy" className="transition-colors hover:text-[var(--foreground)]">
            Privacy Policy
          </a>
          <a
            href="/data-deletion"
            className="transition-colors hover:text-[var(--foreground)]"
          >
            Data Deletion
          </a>
          {contactEmail ? (
            <a
              href={`mailto:${contactEmail}`}
              className="transition-colors hover:text-[var(--foreground)]"
            >
              Contact
            </a>
          ) : null}
        </nav>

        <p className="text-xs" style={{ color: "var(--muted)" }}>
          {config.footer.text ||
            `\u00a9 ${year} ${config.appName}. All rights reserved.`}
        </p>
      </div>
    </footer>
  );
}
