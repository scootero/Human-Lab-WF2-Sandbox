import type { AppConfig } from "@/lib/appData";

/**
 * Privacy disclosure flags for landing legal pages.
 *
 * Phase A: all advertising/measurement providers default OFF.
 * Future: map from optional package config (recommended: tracking.providers[])
 * without rewriting PrivacyPolicyContent sections.
 */
export interface PrivacyDisclosureFlags {
  /** Meta Pixel (browser) — not used in Phase A */
  metaPixelEnabled: boolean;
  /** Meta Conversions API — not used in Phase A */
  metaCapiEnabled: boolean;
  /** Any advertising cookies set by our landing code — not used in Phase A */
  advertisingCookiesEnabled: boolean;
}

const PHASE_A_DEFAULTS: PrivacyDisclosureFlags = {
  metaPixelEnabled: false,
  metaCapiEnabled: false,
  advertisingCookiesEnabled: false,
};

/**
 * Resolve disclosure flags for the current app-config.
 * Ignores unknown/future fields safely until a typed mapping is added.
 */
export function resolvePrivacyDisclosureFlags(
  _config: AppConfig
): PrivacyDisclosureFlags {
  return { ...PHASE_A_DEFAULTS };
}

export function anyAdvertisingMeasurementEnabled(
  flags: PrivacyDisclosureFlags
): boolean {
  return (
    flags.metaPixelEnabled ||
    flags.metaCapiEnabled ||
    flags.advertisingCookiesEnabled
  );
}
