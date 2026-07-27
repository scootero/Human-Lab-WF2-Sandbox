import type { AppConfig } from "@/lib/appData";

interface DataDeletionContentProps {
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

export default function DataDeletionContent({
  config,
}: DataDeletionContentProps) {
  const appName = config.appName || "this app";
  const contactEmail = config.contactEmail?.trim() || "";
  const effectiveLabel = formatEffectiveDate(config.privacyEffectiveDate);

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
          {appName} is a landing-page and app-validation test. We do not maintain
          user accounts for this validation test. We do not store Meta profile
          data for this validation test.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-theme">How to request deletion</h2>
        <p>
          If you submitted information through this landing page, or you want
          validation/test data associated with your visit removed, you can email
          a deletion request
          {contactEmail ? (
            <>
              {" "}
              to{" "}
              <a
                href={`mailto:${contactEmail}`}
                className="underline underline-offset-2 transition-colors hover:text-[var(--foreground)]"
              >
                {contactEmail}
              </a>
            </>
          ) : (
            " using the contact email published for this site"
          )}
          .
        </p>
        <p>Please include:</p>
        <ul className="list-disc space-y-1 pl-5">
          <li>Your name</li>
          <li>The email address you used (if any)</li>
          <li>The app or site name ({appName})</li>
          <li>A clear request to delete your validation/test data</li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-theme">What we will do</h2>
        <p>
          We will delete applicable records where they are reasonably
          identifiable and where we are not legally required to keep them.
          Ordinary hosting or infrastructure logs may retain standard technical
          request metadata for a limited period according to those providers.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-theme">Related policy</h2>
        <p>
          See our{" "}
          <a
            href="/privacy"
            className="underline underline-offset-2 transition-colors hover:text-[var(--foreground)]"
          >
            Privacy Policy
          </a>{" "}
          for more detail on what this validation test may collect.
        </p>
      </section>
    </div>
  );
}
