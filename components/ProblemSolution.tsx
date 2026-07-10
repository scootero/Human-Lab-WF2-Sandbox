"use client";

import { motion } from "framer-motion";

interface ProblemSolutionProps {
  problem: string;
  solution: string;
  targetAudience: string;
}

export default function ProblemSolution({
  problem,
  solution,
  targetAudience,
}: ProblemSolutionProps) {
  if (!problem && !solution) return null;

  return (
    <section className="section-padding">
      <div className="section-container">
        <div className="grid gap-6 lg:grid-cols-2">
          {problem && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="glass-card"
            >
              <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: "var(--accent)" }}>
                The Problem
              </p>
              <p className="mt-4 text-lg leading-relaxed text-theme sm:text-xl">{problem}</p>
            </motion.div>
          )}

          {solution && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="glass-card"
              style={{
                background: "color-mix(in srgb, var(--accent) 6%, var(--surface))",
              }}
            >
              <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: "var(--accent)" }}>
                The Solution
              </p>
              <p className="mt-4 text-lg leading-relaxed text-theme sm:text-xl">{solution}</p>
            </motion.div>
          )}
        </div>

        {targetAudience && (
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="mt-8 text-center text-sm sm:text-base"
            style={{ color: "var(--muted)" }}
          >
            Built for {targetAudience}
          </motion.p>
        )}
      </div>
    </section>
  );
}
