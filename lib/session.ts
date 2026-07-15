const VISITOR_KEY = "avs_visitor_id";
const SESSION_KEY = "avs_session_id";
const ATTRIBUTION_SESSION_KEY = "avs_attribution";
const FBCLID_VISITOR_KEY = "avs_fbclid";

function generateId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
}

/** Persistent anonymous visitor ID (localStorage). */
export function getVisitorId(): string {
  if (typeof window === "undefined") return "";

  try {
    let id = localStorage.getItem(VISITOR_KEY);
    if (!id) {
      id = generateId();
      localStorage.setItem(VISITOR_KEY, id);
    }
    return id;
  } catch {
    return generateId();
  }
}

/** Per-tab session ID (sessionStorage). */
export function getSessionId(): string {
  if (typeof window === "undefined") return "";

  try {
    let id = sessionStorage.getItem(SESSION_KEY);
    if (!id) {
      id = generateId();
      sessionStorage.setItem(SESSION_KEY, id);
    }
    return id;
  } catch {
    return generateId();
  }
}

/** Unique ID for each tracking event. */
export function generateEventId(): string {
  return generateId();
}

export interface StoredAttribution {
  utmSource: string;
  utmMedium: string;
  utmCampaign: string;
  utmContent: string;
  utmTerm: string;
  fbclid: string;
}

const EMPTY_ATTRIBUTION: StoredAttribution = {
  utmSource: "",
  utmMedium: "",
  utmCampaign: "",
  utmContent: "",
  utmTerm: "",
  fbclid: "",
};

function readUrlAttribution(): StoredAttribution {
  if (typeof window === "undefined") return { ...EMPTY_ATTRIBUTION };

  const params = new URLSearchParams(window.location.search);
  return {
    utmSource: params.get("utm_source") ?? "",
    utmMedium: params.get("utm_medium") ?? "",
    utmCampaign: params.get("utm_campaign") ?? "",
    utmContent: params.get("utm_content") ?? "",
    utmTerm: params.get("utm_term") ?? "",
    fbclid: params.get("fbclid") ?? "",
  };
}

function mergeFirstNonEmpty(
  stored: StoredAttribution,
  incoming: StoredAttribution
): StoredAttribution {
  return {
    utmSource: stored.utmSource || incoming.utmSource,
    utmMedium: stored.utmMedium || incoming.utmMedium,
    utmCampaign: stored.utmCampaign || incoming.utmCampaign,
    utmContent: stored.utmContent || incoming.utmContent,
    utmTerm: stored.utmTerm || incoming.utmTerm,
    fbclid: stored.fbclid || incoming.fbclid,
  };
}

/**
 * Capture UTM + fbclid on first load, persist for the session,
 * and keep fbclid with the visitor across sessions.
 * Call once before the first page_view event.
 */
export function captureAndPersistAttribution(): StoredAttribution {
  if (typeof window === "undefined") return { ...EMPTY_ATTRIBUTION };

  const fromUrl = readUrlAttribution();
  let sessionStored: StoredAttribution = { ...EMPTY_ATTRIBUTION };

  try {
    const raw = sessionStorage.getItem(ATTRIBUTION_SESSION_KEY);
    if (raw) {
      sessionStored = { ...EMPTY_ATTRIBUTION, ...JSON.parse(raw) };
    }
  } catch {
    sessionStored = { ...EMPTY_ATTRIBUTION };
  }

  let visitorFbclid = "";
  try {
    visitorFbclid = localStorage.getItem(FBCLID_VISITOR_KEY) ?? "";
  } catch {
    visitorFbclid = "";
  }

  const merged = mergeFirstNonEmpty(sessionStored, fromUrl);
  if (!merged.fbclid && visitorFbclid) {
    merged.fbclid = visitorFbclid;
  }

  try {
    sessionStorage.setItem(ATTRIBUTION_SESSION_KEY, JSON.stringify(merged));
  } catch {
    // ignore quota / private mode
  }

  if (merged.fbclid) {
    try {
      localStorage.setItem(FBCLID_VISITOR_KEY, merged.fbclid);
    } catch {
      // ignore
    }
  }

  return merged;
}

/** Read persisted attribution (does not re-parse URL unless nothing stored). */
export function getPersistedAttribution(): StoredAttribution {
  if (typeof window === "undefined") return { ...EMPTY_ATTRIBUTION };

  try {
    const raw = sessionStorage.getItem(ATTRIBUTION_SESSION_KEY);
    if (raw) {
      const parsed = { ...EMPTY_ATTRIBUTION, ...JSON.parse(raw) };
      if (!parsed.fbclid) {
        try {
          parsed.fbclid = localStorage.getItem(FBCLID_VISITOR_KEY) ?? "";
        } catch {
          // ignore
        }
      }
      return parsed;
    }
  } catch {
    // fall through
  }

  return captureAndPersistAttribution();
}
