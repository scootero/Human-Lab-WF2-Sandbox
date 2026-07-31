"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowDown, ArrowRight, Check } from "lucide-react";
import type { AppConfig } from "@/lib/appData";
import { getSafeBenefits } from "@/lib/appData";
import LiveMockupEmbed from "./LiveMockupEmbed";
import { StoreCtaLink } from "./StoreCta";

interface HeroProps {
  config: AppConfig;
}

function TryItCue({ variant }: { variant: "mobile" | "desktop" }) {
  if (variant === "mobile") {
    return (
      <a
        href="#live-mockup"
        className="mb-3 flex items-center justify-center gap-2 text-sm font-semibold tracking-wide lg:hidden"
        style={{ color: "var(--accent)" }}
        onClick={(e) => {
          e.preventDefault();
          document.getElementById("live-mockup")?.scrollIntoView({ behavior: "smooth", block: "nearest" });
        }}
      >
        <span>Try it now — tap to expand</span>
        <ArrowDown className="h-4 w-4 animate-bounce" aria-hidden="true" />
      </a>
    );
  }

  return (
    <div
      className="mt-8 hidden items-center gap-3 lg:flex"
      style={{ color: "var(--accent)" }}
      aria-hidden="true"
    >
      <span className="text-base font-semibold tracking-wide">Try it out</span>
      <ArrowRight className="h-7 w-7 shrink-0" strokeWidth={2.5} />
    </div>
  );
}

export default function Hero({ config }: HeroProps) {
  const benefits = getSafeBenefits(config).slice(0, 3);
  const [mockupFocused, setMockupFocused] = useState(false);

  return (
    <section className="overflow-hidden pt-8 pb-12 sm:pt-10 sm:pb-16 lg:pt-16 lg:pb-24">
      <div className="section-container">
        <div className="grid items-center gap-6 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center lg:gap-12 xl:gap-16">
          <AnimatePresence>
            {!mockupFocused && (
              <motion.div
                key="hero-teaser"
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -40, transition: { duration: 0.25 } }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="order-1 lg:col-start-1 lg:row-start-1 lg:max-w-xl lg:pt-4"
              >
                {config.badgeText && (
                  <span className="badge mb-4 sm:mb-6">{config.badgeText}</span>
                )}

                {config.heroHeadline && (
                  <h1 className="text-4xl font-semibold leading-[1.08] tracking-tight text-theme sm:text-5xl lg:text-[3.25rem] lg:leading-[1.06]">
                    {config.heroHeadline}
                  </h1>
                )}

                {config.heroSubheadline && (
                  <p className="mt-4 max-w-xl text-base leading-relaxed text-theme-muted sm:mt-5 sm:text-lg">
                    {config.heroSubheadline}
                  </p>
                )}

                <TryItCue variant="desktop" />
              </motion.div>
            )}
          </AnimatePresence>

          <motion.div
            initial={{ opacity: 0, y: 32 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.15, ease: "easeOut" }}
            className="order-2 flex flex-col items-center px-2 sm:px-4 lg:col-start-2 lg:row-span-2 lg:row-start-1 lg:justify-end lg:px-0 lg:py-4"
            id="live-mockup"
          >
            {!mockupFocused && <TryItCue variant="mobile" />}
            <LiveMockupEmbed mockup={config.mockup} onFocusChange={setMockupFocused} />
          </motion.div>

          <AnimatePresence>
            {!mockupFocused && (
              <motion.div
                key="hero-details"
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -40, transition: { duration: 0.25 } }}
                transition={{ duration: 0.6, ease: "easeOut", delay: 0.05 }}
                className="order-3 lg:col-start-1 lg:row-start-2 lg:max-w-xl lg:pb-4"
              >
                {config.heroBody && (
                  <p className="max-w-xl whitespace-pre-line text-sm leading-relaxed text-theme-muted sm:text-base">
                    {config.heroBody}
                  </p>
                )}

                {benefits.length > 0 && (
                  <ul className="mt-8 space-y-3">
                    {benefits.map((benefit) => (
                      <li
                        key={benefit.title}
                        className="flex items-center gap-3 text-sm text-theme sm:text-base"
                      >
                        <span
                          className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full"
                          style={{
                            background: "color-mix(in srgb, var(--accent) 15%, transparent)",
                            color: "var(--accent)",
                          }}
                        >
                          <Check className="h-3 w-3" />
                        </span>
                        <span>{benefit.title}</span>
                      </li>
                    ))}
                  </ul>
                )}

                <div className="mt-10 flex flex-wrap items-center gap-4">
                  <StoreCtaLink href="#pricing">
                    {config.primaryCtaText}
                  </StoreCtaLink>
                  <a
                    href={
                      (config.screenshots ?? []).some((s) => s?.title)
                        ? "#screenshots"
                        : "#features"
                    }
                    className="btn-secondary"
                  >
                    {config.secondaryCtaText}
                  </a>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
