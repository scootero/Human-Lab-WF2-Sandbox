const VISITOR_KEY = "avs_visitor_id";
const SESSION_KEY = "avs_session_id";

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
