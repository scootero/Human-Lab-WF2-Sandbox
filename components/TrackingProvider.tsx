"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  type ReactNode,
} from "react";
import type { TrackingConfig } from "@/lib/appData";
import {
  captureAndPersistAttribution,
  getSessionId,
  getVisitorId,
  type StoredAttribution,
} from "@/lib/session";
import {
  createTrackingPayload,
  postTrackingEvent,
  resolveWebhookUrl,
  TRACKING_EVENTS,
  type TrackingAttribution,
  type TrackingEventType,
} from "@/lib/tracking";

interface TrackingProviderProps {
  appId: string;
  appName: string;
  tracking: TrackingConfig;
  children: ReactNode;
}

interface TrackingContextValue {
  trackEvent: (params: {
    eventType: TrackingEventType;
    email?: string;
    price?: string;
  }) => Promise<{ ok: boolean; error?: string }>;
  markMockupInteracted: () => void;
}

const TrackingContext = createContext<TrackingContextValue | null>(null);

export function useTracking(): TrackingContextValue {
  const ctx = useContext(TrackingContext);
  if (!ctx) {
    throw new Error("useTracking must be used within TrackingProvider");
  }
  return ctx;
}

export default function TrackingProvider({
  appId,
  appName,
  tracking,
  children,
}: TrackingProviderProps) {
  const pageLoadTimeRef = useRef<number>(
    typeof performance !== "undefined" ? performance.now() : Date.now()
  );
  const mockupInteractedRef = useRef(false);
  const pageViewSentRef = useRef(false);
  const visitorIdRef = useRef(getVisitorId());
  const sessionIdRef = useRef(getSessionId());
  const storedAttributionRef = useRef<StoredAttribution | null>(null);

  if (storedAttributionRef.current === null && typeof window !== "undefined") {
    storedAttributionRef.current = captureAndPersistAttribution();
  }

  const attribution = useMemo<TrackingAttribution>(
    () => ({
      experimentId: tracking.experimentId,
      experimentRunId: tracking.experimentRunId,
      projectId: tracking.projectId,
      landingVersion: tracking.landingVersion,
      landingVariantId: tracking.landingVariantId,
      mockupVersionId: tracking.mockupVersionId,
      deploymentId: tracking.deploymentId,
      campaignName: tracking.campaignName,
    }),
    [tracking]
  );

  const getTimeOnPageSeconds = useCallback(() => {
    const elapsedMs =
      (typeof performance !== "undefined" ? performance.now() : Date.now()) -
      pageLoadTimeRef.current;
    return Math.max(0, Math.round(elapsedMs / 1000));
  }, []);

  const trackEvent = useCallback(
    async (params: {
      eventType: TrackingEventType;
      email?: string;
      price?: string;
    }) => {
      if (storedAttributionRef.current === null) {
        storedAttributionRef.current = captureAndPersistAttribution();
      }

      const payload = createTrackingPayload({
        eventType: params.eventType,
        appId,
        appName,
        email: params.email,
        price: params.price,
        attribution,
        session: {
          timeOnPageSeconds: getTimeOnPageSeconds(),
          mockupInteracted: mockupInteractedRef.current,
          visitorId: visitorIdRef.current,
          sessionId: sessionIdRef.current,
        },
        storedAttribution: storedAttributionRef.current,
      });

      const url = resolveWebhookUrl(tracking, params.eventType);
      return postTrackingEvent(url, payload);
    },
    [appId, appName, attribution, getTimeOnPageSeconds, tracking]
  );

  const markMockupInteracted = useCallback(() => {
    mockupInteractedRef.current = true;
  }, []);

  useEffect(() => {
    if (pageViewSentRef.current) return;
    pageViewSentRef.current = true;
    if (storedAttributionRef.current === null) {
      storedAttributionRef.current = captureAndPersistAttribution();
    }
    void trackEvent({ eventType: TRACKING_EVENTS.PAGE_VIEW });
  }, [trackEvent]);

  const value = useMemo<TrackingContextValue>(
    () => ({
      trackEvent,
      markMockupInteracted,
    }),
    [trackEvent, markMockupInteracted]
  );

  return (
    <TrackingContext.Provider value={value}>{children}</TrackingContext.Provider>
  );
}
