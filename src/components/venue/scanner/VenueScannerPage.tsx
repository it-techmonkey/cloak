import AppHeader from "@/components/shared/AppHeader";
import { SecondaryLink } from "@/components/shared/ButtonLink";
import ScannerFrame from "./ScannerFrame";
import ScanOutcomes from "./ScanOutcomes";

export default function VenueScannerPage() {
  return (
    <div className="min-h-screen bg-night text-white">
      <AppHeader activePath="/venuedashboard" />
      <main className="mx-auto flex w-full max-w-5xl flex-col gap-5 px-4 py-5 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-sm text-white/60">Scanner</p>
            <h1 className="mt-1 text-2xl font-semibold">Verify ticket</h1>
          </div>
          <SecondaryLink href="/venuedashboard">Back</SecondaryLink>
        </div>
        <div className="grid gap-5 lg:grid-cols-[1fr_0.75fr]">
          <ScannerFrame />
          <ScanOutcomes />
        </div>
      </main>
    </div>
  );
}
