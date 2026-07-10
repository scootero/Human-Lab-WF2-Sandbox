"use client";

import Image from "next/image";
import type { AppConfig } from "@/lib/appData";
import { StoreCtaLink } from "./StoreCta";

interface HeaderProps {
  config: AppConfig;
}

const navLinks = [
  { label: "Features", href: "#features" },
  { label: "Screenshots", href: "#screenshots" },
  { label: "Pricing", href: "#pricing" },
  { label: "FAQ", href: "#faq" },
];

export default function Header({ config }: HeaderProps) {
  const { logo, icon, appName, primaryCtaText } = config;
  const brandImageUrl = logo.imageUrl || icon?.imageUrl || "";

  return (
    <header className="sticky top-0 z-50 border-b border-[var(--border)] bg-[color-mix(in_srgb,var(--surface)_80%,transparent)] backdrop-blur-xl">
      <div className="section-container flex h-16 items-center justify-between gap-4">
        <a href="#" className="flex items-center gap-3">
          {brandImageUrl ? (
            <Image
              src={brandImageUrl}
              alt={appName}
              width={36}
              height={36}
              className="rounded-xl"
            />
          ) : (
            <span
              className="flex h-9 w-9 items-center justify-center rounded-xl text-sm font-bold text-white"
              style={{ background: "var(--accent-gradient)" }}
            >
              {logo.text || appName.charAt(0)}
            </span>
          )}
          <span className="text-sm font-semibold tracking-tight text-theme sm:text-base">
            {appName}
          </span>
        </a>

        <nav className="hidden items-center gap-8 md:flex">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm font-medium transition-colors hover:text-[var(--accent)]"
              style={{ color: "var(--muted)" }}
            >
              {link.label}
            </a>
          ))}
        </nav>

        <StoreCtaLink href="#pricing" className="shrink-0 px-4 py-2 text-xs sm:px-5 sm:text-sm">
          {primaryCtaText}
        </StoreCtaLink>
      </div>
    </header>
  );
}
