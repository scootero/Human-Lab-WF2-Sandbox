import type { Metadata } from "next";
import DataDeletionContent from "@/components/DataDeletionContent";
import LegalPageShell from "@/components/LegalPageShell";
import { getAppConfig } from "@/lib/appData";

const config = getAppConfig();

export const metadata: Metadata = {
  title: `Data Deletion — ${config.appName}`,
  description: `Data deletion instructions for the ${config.appName} validation landing page.`,
};

export default function DataDeletionPage() {
  return (
    <LegalPageShell config={config} title="Data Deletion Instructions">
      <DataDeletionContent config={config} />
    </LegalPageShell>
  );
}
