import type { AppConfig } from "@/lib/appData";
import {
  anyAdvertisingMeasurementEnabled,
  resolvePrivacyDisclosureFlags,
} from "@/lib/privacyDisclosures";

interface PrivacyPolicyContentProps {
  config: AppConfig;
}

function formatEffectiveDate(isoDate: string): string | null {
  const trimmed = isoDate?.trim();
  if (!trimmed || !/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) return null;
  const [y, m, d] = trimmed.split("-").map(Number);
  const date = new Date(Date.UTC(y, m - 1, d));
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  });
}

export default function PrivacyPolicyContent({
  config,
}: PrivacyPolicyContentProps) {
  const appName = config.appName || "this app";
  const contactEmail = config.contactEmail?.trim() || "";
  const effectiveLabel = formatEffectiveDate(config.privacyEffectiveDate);
  const disclosures = resolvePrivacyDisclosureFlags(config);
  const adsMeasurementOn = anyAdvertisingMeasurementEnabled(disclosures);

  return (
    <div
      className="mt-8 space-y-6 text-sm leading-relaxed sm:text-base"
      style={{ color: "var(--muted)" }}
    >
      {effectiveLabel && (
        <p>
          <span className="font-medium text-theme">Effective date:</span>{" "}
          {effectiveLabel}
        </p>
      )}

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-theme">Overview</h2>
        <p>
          {appName} is a landing-page and app-validation test. This site is used
          to present the product concept, measure interest, and run early
          advertising and referral tests. It is not a shipped consumer account
          product unless later implemented.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-theme">
          Information you may submit
        </h2>
        <p>
          If you voluntarily submit information through this landing page (for
          example an email address on a waitlist or purchase-intent form), we
          may collect and store that information so we can contact you about the
          validation test or a future launch.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-theme">
          Interaction, campaign, and analytics-style data
        </h2>
        <p>
          When you visit this site, our landing code may send basic interaction
          and attribution events to our workflow systems (for example n8n
          webhooks that append rows to Google Sheets or similar storage). Those
          events may include:
        </p>
        <ul className="list-disc space-y-1 pl-5">
          <li>Event type (such as page view, email capture, or button intent)</li>
          <li>App and experiment identifiers configured for this validation run</li>
          <li>
            Anonymous visitor and session identifiers stored in your browser
            (localStorage / sessionStorage), not as advertising cookies
          </li>
          <li>Page URL, HTTP referrer, and UTM campaign parameters when present</li>
          <li>Time on page and whether you interacted with an embedded mockup</li>
          <li>Email and displayed price when you submit a relevant form</li>
        </ul>

        {/* Phase A: all advertising measurement flags are false → accurate "not installed" copy only. */}
        {!adsMeasurementOn ? (
          <p>
            This site does not currently install Meta Pixel, Conversions API
            (CAPI), or similar advertising pixels, and it does not set advertising
            cookies from our landing code.
          </p>
        ) : (
          <div className="space-y-2">
            {disclosures.metaPixelEnabled ? (
              <p>
                This site may load Meta Pixel when configured for the validation
                run.
              </p>
            ) : null}
            {disclosures.metaCapiEnabled ? (
              <p>
                Server-side Meta Conversions API (CAPI) events may be sent when
                configured for the validation run.
              </p>
            ) : null}
            {disclosures.advertisingCookiesEnabled ? (
              <p>
                Advertising-related cookies or similar identifiers may be set by
                enabled measurement providers.
              </p>
            ) : (
              <p>
                Advertising cookies are not set by our landing code unless an
                enabled measurement provider requires them.
              </p>
            )}
          </div>
        )}
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-theme">
          Phone / device app data vs browser request data
        </h2>
        <p>
          For this validation test, we do not collect private phone or installed
          mobile-app data from your device (for example contacts, photos, or
          on-device app databases). This landing experience runs in a web browser.
        </p>
        <p>
          Separately, ordinary web hosting and request handling (for example
          Vercel, n8n, or similar infrastructure) may process standard technical
          request metadata such as IP address, user agent, browser type, or
          similar server-log fields. That is normal browser/server request
          information, not private data retrieved from a phone app by this
          validation test.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-theme">Accounts</h2>
        <p>
          We do not maintain user accounts for this validation test unless later
          implemented.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-theme">
          How we use information
        </h2>
        <p>
          We use the information described above to operate the landing page,
          measure validation interest, attribute visits from advertising or
          referral campaigns, and respond to contact or deletion requests. We do
          not sell personal information.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-theme">Third-party services</h2>
        <p>
          Depending on the validation setup, third-party services may include:
        </p>
        <ul className="list-disc space-y-1 pl-5">
          <li>
            Meta as an advertising or referral platform (for example when people
            arrive from Meta ads)
            {!disclosures.metaPixelEnabled && !disclosures.metaCapiEnabled
              ? "; this does not mean Meta Pixel or CAPI is installed on this site"
              : null}
          </li>
          {disclosures.metaPixelEnabled || disclosures.metaCapiEnabled ? (
            <li>
              Meta measurement tools when enabled for the run
              {disclosures.metaPixelEnabled ? " (Pixel)" : ""}
              {disclosures.metaPixelEnabled && disclosures.metaCapiEnabled
                ? " and "
                : ""}
              {disclosures.metaCapiEnabled ? "(CAPI)" : ""}
            </li>
          ) : null}
          <li>Vercel or similar hosting for this landing site</li>
          <li>n8n or similar workflow / webhook processing</li>
          <li>
            Google Sheets or similar workflow storage for event and signup rows
          </li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-theme">
          Data deletion requests
        </h2>
        <p>
          Instructions for requesting removal of validation/test data are on our{" "}
          <a
            href="/data-deletion"
            className="underline underline-offset-2 transition-colors hover:text-[var(--foreground)]"
          >
            Data Deletion
          </a>{" "}
          page.
        </p>
      </section>

      {contactEmail ? (
        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-theme">Contact</h2>
          <p>
            Questions about this policy or your information:{" "}
            <a
              href={`mailto:${contactEmail}`}
              className="underline underline-offset-2 transition-colors hover:text-[var(--foreground)]"
            >
              {contactEmail}
            </a>
            .
          </p>
        </section>
      ) : null}
    </div>
  );
}
