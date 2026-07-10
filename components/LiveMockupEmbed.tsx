"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Smartphone, X, Maximize2 } from "lucide-react";
import type { MockupConfig } from "@/lib/appData";
import { useTracking } from "./TrackingProvider";
import { TRACKING_EVENTS } from "@/lib/tracking";

interface LiveMockupEmbedProps {
  mockup: MockupConfig;
  onFocusChange?: (focused: boolean) => void;
}

const FOCUS_INSET = 20;
const FOCUS_CLOSE_HEIGHT = 52;

function buildEmbedUrl(url: string): string {
  try {
    const parsed = new URL(url);
    parsed.searchParams.set("embed", "1");
    return parsed.toString();
  } catch {
    const separator = url.includes("?") ? "&" : "?";
    return `${url}${separator}embed=1`;
  }
}

function useMockupScale(
  containerRef: React.RefObject<HTMLDivElement | null>,
  baseWidth: number,
  maxScale = 1
) {
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const updateScale = () => {
      const available = container.clientWidth;
      const minScale = 0.5;
      const computed = Math.min(maxScale, available / baseWidth);
      setScale(Math.max(minScale, computed));
    };

    updateScale();
    const observer = new ResizeObserver(updateScale);
    observer.observe(container);
    return () => observer.disconnect();
  }, [baseWidth, maxScale]);

  return scale;
}

function computeScaleToFit(
  maxWidth: number,
  maxHeight: number,
  baseWidth: number,
  baseHeight: number,
  clipBottomPx: number
) {
  const visibleHeight = baseHeight - clipBottomPx;
  if (maxWidth <= 0 || maxHeight <= 0) return 1;
  return Math.min(maxWidth / baseWidth, maxHeight / visibleHeight);
}

interface MockupFrameProps {
  embedUrl: string;
  mockup: MockupConfig;
  scale: number;
  onClick?: () => void;
}

function MockupFrame({ embedUrl, mockup, scale, onClick }: MockupFrameProps) {
  const baseWidth = mockup.baseWidth || 375;
  const baseHeight = mockup.baseHeight || 820;
  const clipBottomPx = mockup.clipBottomPx ?? 0;
  const useFrame = mockup.useOuterDeviceFrame ?? false;
  const visibleHeight = baseHeight - clipBottomPx;
  const interactive = Boolean(onClick);

  const outerW = Math.round(baseWidth * scale);
  const outerH = Math.round(visibleHeight * scale);

  const frameClass = useFrame
    ? "rounded-[3rem] border-[10px] border-neutral-900 bg-neutral-900 p-1 shadow-2xl"
    : "rounded-[2rem] shadow-glow overflow-hidden";

  const frameShadow = !useFrame
    ? { boxShadow: "0 0 60px var(--accent-glow), 0 20px 60px rgba(0,0,0,0.12)" }
    : undefined;

  return (
    <div
      style={{ width: outerW, height: outerH, overflow: "hidden", flexShrink: 0 }}
      onClick={onClick}
      onKeyDown={
        interactive
          ? (e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onClick?.();
              }
            }
          : undefined
      }
      role={interactive ? "button" : undefined}
      tabIndex={interactive ? 0 : undefined}
      aria-label={interactive ? "Expand live app preview" : undefined}
    >
      <div
        className={frameClass}
        style={{
          ...frameShadow,
          width: baseWidth,
          height: baseHeight,
          transform: `scale(${scale})`,
          transformOrigin: "top left",
        }}
      >
        <iframe
          src={embedUrl}
          title="Live app preview"
          width={baseWidth}
          height={baseHeight}
          className="block rounded-[1.75rem] border-0 bg-transparent"
          loading="lazy"
          scrolling="no"
          sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
          style={{ pointerEvents: interactive ? "none" : "auto", overflow: "hidden" }}
        />
      </div>
    </div>
  );
}

function lockPageScroll() {
  const scrollY = window.scrollY;
  document.documentElement.style.overflow = "hidden";
  document.body.style.overflow = "hidden";
  document.body.style.position = "fixed";
  document.body.style.top = `-${scrollY}px`;
  document.body.style.left = "0";
  document.body.style.right = "0";
  return scrollY;
}

function unlockPageScroll(scrollY: number) {
  document.documentElement.style.overflow = "";
  document.body.style.overflow = "";
  document.body.style.position = "";
  document.body.style.top = "";
  document.body.style.left = "";
  document.body.style.right = "";
  window.scrollTo(0, scrollY);
}

export default function LiveMockupEmbed({ mockup, onFocusChange }: LiveMockupEmbedProps) {
  const { trackEvent, markMockupInteracted } = useTracking();
  const containerRef = useRef<HTMLDivElement>(null);
  const focusAreaRef = useRef<HTMLDivElement>(null);
  const scrollLockRef = useRef(0);
  const mockupEventSentRef = useRef(false);
  const [focused, setFocused] = useState(false);
  const [focusScale, setFocusScale] = useState(1);
  const [mounted, setMounted] = useState(false);

  const baseWidth = mockup.baseWidth || 375;
  const baseHeight = mockup.baseHeight || 820;
  const clipBottomPx = mockup.clipBottomPx ?? 0;
  const rawEmbedUrl = mockup.embedUrl?.trim();
  const embedUrl = rawEmbedUrl ? buildEmbedUrl(rawEmbedUrl) : "";
  const scale = useMockupScale(containerRef, baseWidth, 0.92);

  useEffect(() => setMounted(true), []);

  const updateFocusScale = useCallback(() => {
    const area = focusAreaRef.current;
    if (!area) return;
    const { width, height } = area.getBoundingClientRect();
    setFocusScale(
      computeScaleToFit(width, height, baseWidth, baseHeight, clipBottomPx)
    );
  }, [baseWidth, baseHeight, clipBottomPx]);

  const openFocus = useCallback(() => {
    if (!mockupEventSentRef.current) {
      mockupEventSentRef.current = true;
      markMockupInteracted();
      void trackEvent({ eventType: TRACKING_EVENTS.MOCKUP_INTERACTED });
    }
    setFocused(true);
    onFocusChange?.(true);
  }, [markMockupInteracted, onFocusChange, trackEvent]);

  const closeFocus = useCallback(() => {
    setFocused(false);
    onFocusChange?.(false);
  }, [onFocusChange]);

  useEffect(() => {
    if (!focused) return;
    requestAnimationFrame(updateFocusScale);
  }, [focused, updateFocusScale]);

  useEffect(() => {
    if (!focused) return;

    scrollLockRef.current = lockPageScroll();

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeFocus();
    };

    const area = focusAreaRef.current;
    let observer: ResizeObserver | undefined;
    if (area) {
      observer = new ResizeObserver(updateFocusScale);
      observer.observe(area);
      requestAnimationFrame(updateFocusScale);
    }

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("resize", updateFocusScale);

    return () => {
      unlockPageScroll(scrollLockRef.current);
      observer?.disconnect();
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("resize", updateFocusScale);
    };
  }, [focused, closeFocus, updateFocusScale]);

  if (!embedUrl) {
    return (
      <div className="glass-card flex aspect-[375/820] w-full max-w-[375px] flex-col items-center justify-center text-center">
        <div
          className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl"
          style={{
            background: "color-mix(in srgb, var(--accent) 12%, transparent)",
            color: "var(--accent)",
          }}
        >
          <Smartphone className="h-8 w-8" />
        </div>
        <p className="text-sm font-medium text-theme">Live preview coming soon</p>
        <p className="mt-2 max-w-[220px] text-xs text-theme-muted">
          Add your deployed mockup URL to app-config.json
        </p>
      </div>
    );
  }

  return (
    <>
      <div ref={containerRef} className="relative w-full max-w-[360px] lg:max-w-[340px]">
        <MockupFrame embedUrl={embedUrl} mockup={mockup} scale={scale} onClick={openFocus} />

        <button
          type="button"
          onClick={openFocus}
          className="absolute bottom-0 right-0 z-10 flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-medium backdrop-blur-md transition-opacity hover:opacity-90"
          style={{
            background: "color-mix(in srgb, var(--surface-elevated) 90%, transparent)",
            color: "var(--muted)",
            border: "1px solid var(--border)",
          }}
          aria-label="Expand live app preview"
        >
          <Maximize2 className="h-3 w-3" />
          Click to expand
        </button>
      </div>

      {mounted &&
        createPortal(
          <AnimatePresence>
            {focused && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="fixed inset-0 z-[100] touch-none overflow-hidden"
                onClick={closeFocus}
                role="dialog"
                aria-modal="true"
                aria-label="Expanded app preview"
              >
                <div
                  className="absolute inset-0 bg-black/50 backdrop-blur-md"
                  aria-hidden="true"
                />

                <div
                  className="absolute inset-0 flex flex-col overflow-hidden"
                  style={{
                    padding: FOCUS_INSET,
                    paddingTop: FOCUS_INSET,
                  }}
                >
                  <div className="flex shrink-0 justify-end" style={{ height: FOCUS_CLOSE_HEIGHT }}>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        closeFocus();
                      }}
                      className="flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium"
                      style={{
                        background: "var(--surface-elevated)",
                        color: "var(--foreground)",
                        border: "1px solid var(--border)",
                      }}
                      aria-label="Close expanded preview"
                    >
                      <X className="h-4 w-4" />
                      Close
                    </button>
                  </div>

                  <div
                    ref={focusAreaRef}
                    className="flex min-h-0 flex-1 items-center justify-center overflow-hidden"
                    onClick={closeFocus}
                  >
                    <div onClick={(e) => e.stopPropagation()}>
                      <MockupFrame embedUrl={embedUrl} mockup={mockup} scale={focusScale} />
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>,
          document.body
        )}
    </>
  );
}
