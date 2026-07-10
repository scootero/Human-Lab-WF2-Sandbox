"use client";

import { motion } from "framer-motion";
import type { HowItWorksStep } from "@/lib/appData";

interface HowItWorksProps {
  steps: HowItWorksStep[];
}

export default function HowItWorks({ steps }: HowItWorksProps) {
  if (!steps.length) return null;

  return (
    <section className="section-padding">
      <div className="section-container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-12 text-center"
        >
          <h2 className="section-heading">How it works</h2>
          <p className="section-subheading mx-auto">
            Three simple steps to get early access.
          </p>
        </motion.div>

        <div className="grid gap-6 md:grid-cols-3">
          {steps.map((step, index) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="glass-card relative text-center"
            >
              <div
                className="mx-auto mb-4 flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold text-white"
                style={{ background: "var(--accent-gradient)" }}
              >
                {index + 1}
              </div>
              <h3 className="text-lg font-semibold">{step.title}</h3>
              {step.description && (
                <p className="mt-2 text-sm leading-relaxed" style={{ color: "var(--muted)" }}>
                  {step.description}
                </p>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
