import Link from "next/link";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import type { AppConfig } from "@/lib/appData";
import type { ReactNode } from "react";

interface LegalPageShellProps {
  config: AppConfig;
  title: string;
  children: ReactNode;
}

export default function LegalPageShell({
  config,
  title,
  children,
}: LegalPageShellProps) {
  return (
    <>
      <Header config={config} />
      <main className="section-padding">
        <article className="section-container max-w-3xl">
          <p className="mb-6 text-sm" style={{ color: "var(--muted)" }}>
            <Link
              href="/"
              className="transition-colors hover:text-[var(--foreground)]"
            >
              ← Back to {config.appName}
            </Link>
          </p>
          <h1 className="section-heading mb-2">{title}</h1>
          {children}
        </article>
      </main>
      <Footer config={config} />
    </>
  );
}
