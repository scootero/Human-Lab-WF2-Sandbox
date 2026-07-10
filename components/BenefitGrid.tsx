"use client";

import { motion } from "framer-motion";
import {
  Check,
  Circle,
  Phone,
  Sparkles,
  Star,
  Zap,
  Shield,
  Heart,
  type LucideIcon,
} from "lucide-react";
import type { Benefit } from "@/lib/appData";

const iconMap: Record<string, LucideIcon> = {
  phone: Phone,
  sparkles: Sparkles,
  check: Check,
  star: Star,
  zap: Zap,
  shield: Shield,
  heart: Heart,
};

interface BenefitGridProps {
  benefits: Benefit[];
}

function getIcon(name: string): LucideIcon {
  return iconMap[name?.toLowerCase()] ?? Circle;
}

export default function BenefitGrid({ benefits }: BenefitGridProps) {
  if (!benefits.length) return null;

  return (
    <section className="section-padding">
      <div className="section-container">
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {benefits.slice(0, 4).map((benefit, index) => {
            const Icon = getIcon(benefit.icon);
            return (
              <motion.div
                key={benefit.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5, delay: index * 0.08 }}
                className="glass-card group transition-transform duration-300 hover:-translate-y-1"
              >
                <div
                  className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl transition-colors"
                  style={{
                    background: "color-mix(in srgb, var(--accent) 12%, transparent)",
                    color: "var(--accent)",
                  }}
                >
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-semibold tracking-tight text-theme">{benefit.title}</h3>
                {benefit.description && (
                  <p className="mt-2 text-sm leading-relaxed" style={{ color: "var(--muted)" }}>
                    {benefit.description}
                  </p>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
