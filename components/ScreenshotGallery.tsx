"use client";

import { useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { ImageIcon } from "lucide-react";
import type { Screenshot } from "@/lib/appData";

interface ScreenshotGalleryProps {
  screenshots: Screenshot[];
}

function ScreenshotCard({ screenshot }: { screenshot: Screenshot }) {
  const [hasError, setHasError] = useState(false);

  const placeholderPath =
    screenshot.sourcePath ||
    (screenshot.image
      ? `media/screenshots/${screenshot.image.split("/").pop()}`
      : "media/screenshots/");

  const showPlaceholder = screenshot.missing || hasError || !screenshot.image;

  return (
    <div className="glass-card flex w-[280px] shrink-0 flex-col sm:w-auto">
      <div className="relative mb-4 aspect-[390/844] overflow-hidden rounded-2xl bg-[var(--surface-elevated)]">
        {!showPlaceholder && screenshot.image ? (
          <Image
            src={screenshot.image}
            alt={screenshot.title}
            fill
            className="object-cover object-top"
            sizes="(max-width: 640px) 280px, 33vw"
            onError={() => setHasError(true)}
          />
        ) : (
          <div
            className="flex h-full flex-col items-center justify-center px-4 text-center"
            style={{ color: "var(--muted)" }}
          >
            <ImageIcon className="mb-2 h-8 w-8 opacity-50" />
            <span className="text-xs font-medium">Add screenshot:</span>
            <code className="mt-2 break-all text-[10px] leading-snug opacity-80">
              {placeholderPath}
            </code>
          </div>
        )}
      </div>
      <h3 className="font-semibold text-theme">{screenshot.title}</h3>
      {screenshot.description && (
        <p className="mt-1 text-sm leading-relaxed" style={{ color: "var(--muted)" }}>
          {screenshot.description}
        </p>
      )}
    </div>
  );
}

export default function ScreenshotGallery({ screenshots }: ScreenshotGalleryProps) {
  if (!screenshots.length) return null;

  return (
    <section id="screenshots" className="section-padding">
      <div className="section-container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-12 text-center"
        >
          <h2 className="section-heading">See it in action</h2>
          <p className="section-subheading mx-auto">
            A glimpse of the experience on iPhone.
          </p>
        </motion.div>

        <div className="hidden gap-6 md:grid md:grid-cols-2 lg:grid-cols-4">
          {screenshots.map((screenshot, index) => (
            <motion.div
              key={screenshot.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.08 }}
            >
              <ScreenshotCard screenshot={screenshot} />
            </motion.div>
          ))}
        </div>

        <div className="-mx-5 flex gap-4 overflow-x-auto px-5 pb-4 snap-x snap-mandatory md:hidden">
          {screenshots.map((screenshot) => (
            <div key={screenshot.title} className="snap-center">
              <ScreenshotCard screenshot={screenshot} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
