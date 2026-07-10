"use client";

import { motion } from "framer-motion";
import type { TestimonialItem } from "@/lib/appData";

interface TestimonialSectionProps {
  items: TestimonialItem[];
  headline?: string;
}

export default function TestimonialSection({
  items,
  headline,
}: TestimonialSectionProps) {
  if (!items.length) return null;

  return (
    <section className="section-padding">
      <div className="section-container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-12 text-center"
        >
          <h2 className="section-heading">
            {headline?.trim() || "What people are saying"}
          </h2>
        </motion.div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {items.map((item, index) => (
            <motion.blockquote
              key={`${item.author}-${index}`}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.08 }}
              className="glass-card"
            >
              <p className="text-sm leading-relaxed sm:text-base">&ldquo;{item.quote}&rdquo;</p>
              <footer className="mt-4">
                <p className="text-sm font-semibold">{item.author}</p>
                {item.role && (
                  <p className="text-xs" style={{ color: "var(--muted)" }}>
                    {item.role}
                  </p>
                )}
              </footer>
            </motion.blockquote>
          ))}
        </div>
      </div>
    </section>
  );
}
