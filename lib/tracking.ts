import type { TrackingConfig } from "@/lib/appData";

export const TRACKING_EVENTS = {
  BUY_NOW_CLICKED: "buy_now_clicked",
  EMAIL_CAPTURED: "email_captured",
  PAGE_VIEW: "page_view",
  MOCKUP_INTERACTED: "mockup_interacted",
} as const;

export type TrackingEventType =
  (typeof TRACKING_EVENTS)[keyof typeof TRACKING_EVENTS];

export interface UtmParams {
  utmSource: string;
  utmMedium: string;
  utmCampaign: string;
  utmContent: string;
  utmTerm: string;
}

export interface TrackingAttribution {
  experimentId: string;
  experimentRunId: string;
  projectId: string;
  landingVersion: string;
  landingVariantId: string;
  mockupVersionId: string;
  deploymentId: string;
  campaignName: string;
}

export interface SessionMetrics {
  timeOnPageSeconds: number;
  mockupInteracted: boolean;
  visitorId: string;
  sessionId: string;
}

export interface TrackingPayloadInput {
  eventType: TrackingEventType;
  appId: string;
  appName: string;
  email?: string;
  price?: string;
  attribution?: TrackingAttribution;
  session?: SessionMetrics;
}

export interface TrackingPayload {
  eventType: TrackingEventType;
  appId: string;
  appName: string;
  experimentId: string;
  experimentRunId: string;
  projectId: string;
  deploymentId: string;
  landingVersion: string;
  landingVariantId: string;
  mockupVersionId: string;
  campaignName: string;
  visitorId: string;
  sessionId: string;
  email: string;
  price: string;
  pageUrl: string;
  referrer: string;
  utmSource: string;
  utmMedium: string;
  utmCampaign: string;
  utmContent: string;
  utmTerm: string;
  timeOnPageSeconds: number;
  mockupInteracted: boolean;
  timestamp: string;
}

const EMPTY_ATTRIBUTION: TrackingAttribution = {
  experimentId: "",
  experimentRunId: "",
  projectId: "",
  landingVersion: "",
  landingVariantId: "",
  mockupVersionId: "",
  deploymentId: "",
  campaignName: "",
};

export function getUtmParams(): UtmParams {
  if (typeof window === "undefined") {
    return {
      utmSource: "",
      utmMedium: "",
      utmCampaign: "",
      utmContent: "",
      utmTerm: "",
    };
  }

  const params = new URLSearchParams(window.location.search);
  return {
    utmSource: params.get("utm_source") ?? "",
    utmMedium: params.get("utm_medium") ?? "",
    utmCampaign: params.get("utm_campaign") ?? "",
    utmContent: params.get("utm_content") ?? "",
    utmTerm: params.get("utm_term") ?? "",
  };
}

export function getReferrer(): string {
  if (typeof document === "undefined") return "";
  return document.referrer ?? "";
}

export function createTrackingPayload(
  input: TrackingPayloadInput
): TrackingPayload {
  const utm = getUtmParams();
  const attribution = input.attribution ?? EMPTY_ATTRIBUTION;
  const session = input.session ?? {
    timeOnPageSeconds: 0,
    mockupInteracted: false,
    visitorId: "",
    sessionId: "",
  };

  return {
    eventType: input.eventType,
    appId: input.appId,
    appName: input.appName,
    experimentId: attribution.experimentId,
    experimentRunId: attribution.experimentRunId,
    projectId: attribution.projectId,
    deploymentId: attribution.deploymentId,
    landingVersion: attribution.landingVersion,
    landingVariantId: attribution.landingVariantId,
    mockupVersionId: attribution.mockupVersionId,
    campaignName: attribution.campaignName,
    visitorId: session.visitorId,
    sessionId: session.sessionId,
    email: input.email ?? "",
    price: input.price ?? "",
    pageUrl: typeof window !== "undefined" ? window.location.href : "",
    referrer: getReferrer(),
    utmSource: utm.utmSource,
    utmMedium: utm.utmMedium,
    utmCampaign: utm.utmCampaign,
    utmContent: utm.utmContent,
    utmTerm: utm.utmTerm,
    timeOnPageSeconds: session.timeOnPageSeconds,
    mockupInteracted: session.mockupInteracted,
    timestamp: new Date().toISOString(),
  };
}

/** Resolve webhook URL: unified webhook wins; legacy URLs used per event type. */
export function resolveWebhookUrl(
  tracking: Pick<
    TrackingConfig,
    "webhookUrl" | "buyNowWebhookUrl" | "emailWebhookUrl"
  >,
  eventType: TrackingEventType
): string {
  const unified = tracking.webhookUrl?.trim();
  if (unified) return unified;

  switch (eventType) {
    case TRACKING_EVENTS.BUY_NOW_CLICKED:
      return tracking.buyNowWebhookUrl?.trim() ?? "";
    case TRACKING_EVENTS.EMAIL_CAPTURED:
      return tracking.emailWebhookUrl?.trim() ?? "";
    case TRACKING_EVENTS.PAGE_VIEW:
    case TRACKING_EVENTS.MOCKUP_INTERACTED:
      return (
        tracking.emailWebhookUrl?.trim() ||
        tracking.buyNowWebhookUrl?.trim() ||
        ""
      );
    default:
      return "";
  }
}

export async function postTrackingEvent(
  url: string,
  payload: TrackingPayload
): Promise<{ ok: boolean; error?: string }> {
  if (!url || url.trim() === "") {
    if (process.env.NODE_ENV === "development") {
      console.info("[tracking] No webhook URL configured. Event logged:", payload);
    }
    return { ok: true };
  }

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      return { ok: false, error: `Request failed (${response.status})` };
    }

    return { ok: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Network error";
    return { ok: false, error: message };
  }
}
