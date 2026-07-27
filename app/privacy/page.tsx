import type { Metadata } from "next";
import LegalPageShell from "@/components/LegalPageShell";
import PrivacyPolicyContent from "@/components/PrivacyPolicyContent";
import { getAppConfig } from "@/lib/appData";

const config = getAppConfig();

export const metadata: Metadata = {
  title: `Privacy Policy — ${config.appName}`,
  description: `Privacy Policy for the ${config.appName} validation landing page.`,
};

export default function PrivacyPage() {
  return (
    <LegalPageShell config={config} title="Privacy Policy">
      <PrivacyPolicyContent config={config} />
    </LegalPageShell>
  );
}
