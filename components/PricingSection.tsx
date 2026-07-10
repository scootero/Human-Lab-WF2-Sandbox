"use client";

import { motion } from "framer-motion";
import { Check } from "lucide-react";
import type { Benefit, Feature, PricingConfig } from "@/lib/appData";
import { getPricingCtaText } from "@/lib/appData";
import BuyNowTracker from "./BuyNowTracker";

interface PricingSectionProps {
  pricing: PricingConfig;
  benefits: Benefit[];
  features: Feature[];
}

export default function PricingSection({
  pricing,
  benefits,
  features,
}: PricingSectionProps) {
  if (!pricing.enabled) return null;

  const valueBullets = [
    ...benefits.slice(0, 2).map((b) => b.title),
    ...features.slice(0, 2).map((f) => f.title),
  ].filter(Boolean).slice(0, 4);

  return (
    <section id="pricing" className="section-padding">
      <div className="section-container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mx-auto max-w-lg"
        >
          <div className="glass-card text-center">
            <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: "var(--accent)" }}>
              {pricing.headlineLabel || "Get for"}
            </p>

            {pricing.price && (
              <div className="mt-4 flex items-baseline justify-center gap-2">
                <span className="text-5xl font-semibold tracking-tight text-theme">{pricing.price}</span>
                {pricing.billingLabel && (
                  <span className="text-sm" style={{ color: "var(--muted)" }}>
                    / {pricing.billingLabel}
                  </span>
                )}
              </div>
            )}

            {valueBullets.length > 0 && (
              <ul className="mt-8 space-y-3 text-left">
                {valueBullets.map((bullet) => (
                  <li key={bullet} className="flex items-center gap-3 text-sm text-theme">
                    <span
                      className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full"
                      style={{
                        background: "color-mix(in srgb, var(--accent) 15%, transparent)",
                        color: "var(--accent)",
                      }}
                    >
                      <Check className="h-3 w-3" />
                    </span>
                    {bullet}
                  </li>
                ))}
              </ul>
            )}

            <div className="mt-8">
              <BuyNowTracker
                price={pricing.price}
                ctaText={getPricingCtaText(pricing)}
              />
            </div>

            {pricing.finePrint && (
              <p className="mt-4 text-xs" style={{ color: "var(--muted)" }}>
                {pricing.finePrint}
              </p>
            )}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
