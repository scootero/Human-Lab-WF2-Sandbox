"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check } from "lucide-react";
import type { AppConfig } from "@/lib/appData";
import { getSafeBenefits } from "@/lib/appData";
import LiveMockupEmbed from "./LiveMockupEmbed";
import { StoreCtaLink } from "./StoreCta";

interface HeroProps {
  config: AppConfig;
}

export default function Hero({ config }: HeroProps) {
  const benefits = getSafeBenefits(config).slice(0, 3);
  const [mockupFocused, setMockupFocused] = useState(false);

  return (
    <section className="section-padding overflow-hidden">
      <div className="section-container">
        <div className="grid items-center gap-10 lg:grid-cols-[minmax(0,1fr)_auto] lg:gap-12 xl:gap-16">
          <AnimatePresence>
            {!mockupFocused && (
              <motion.div
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -40, transition: { duration: 0.25 } }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="order-1 lg:max-w-xl lg:py-4"
              >
                {config.badgeText && (
                  <span className="badge mb-6">{config.badgeText}</span>
                )}

                {config.heroHeadline && (
                  <h1 className="text-4xl font-semibold leading-[1.08] tracking-tight text-theme sm:text-5xl lg:text-[3.25rem] lg:leading-[1.06]">
                    {config.heroHeadline}
                  </h1>
                )}

                {config.heroSubheadline && (
                  <p className="mt-5 max-w-xl text-base leading-relaxed text-theme-muted sm:text-lg">
                    {config.heroSubheadline}
                  </p>
                )}

                {config.heroBody && (
                  <p className="mt-4 max-w-xl whitespace-pre-line text-sm leading-relaxed text-theme-muted sm:text-base">
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
                  <a href="#screenshots" className="btn-secondary">
                    {config.secondaryCtaText}
                  </a>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <motion.div
            initial={{ opacity: 0, y: 32 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.15, ease: "easeOut" }}
            className="order-2 flex justify-center lg:justify-end lg:py-4"
            id="live-mockup"
          >
            <LiveMockupEmbed mockup={config.mockup} onFocusChange={setMockupFocused} />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
