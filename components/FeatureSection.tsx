"use client";

import { motion } from "framer-motion";
import type { Feature } from "@/lib/appData";

interface FeatureSectionProps {
  features: Feature[];
}

export default function FeatureSection({ features }: FeatureSectionProps) {
  if (!features.length) return null;

  return (
    <section id="features" className="section-padding">
      <div className="section-container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-12 text-center"
        >
          <h2 className="section-heading">Everything you need</h2>
          <p className="section-subheading mx-auto">
            Powerful features designed for a seamless experience.
          </p>
        </motion.div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: index * 0.08 }}
              className="glass-card"
            >
              <div
                className="mb-3 h-1 w-8 rounded-full"
                style={{ background: "var(--accent-gradient)" }}
              />
              <h3 className="text-lg font-semibold text-theme">{feature.title}</h3>
              {feature.description && (
                <p className="mt-2 text-sm leading-relaxed" style={{ color: "var(--muted)" }}>
                  {feature.description}
                </p>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
