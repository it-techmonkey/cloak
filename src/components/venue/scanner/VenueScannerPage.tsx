import AppHeader from "@/components/shared/AppHeader";
import { SecondaryLink } from "@/components/shared/ButtonLink";
import ScannerFrame from "./ScannerFrame";
import ScanOutcomes from "./ScanOutcomes";

export default function VenueScannerPage() {
  return (
    <div className="min-h-screen bg-night text-white">
      <AppHeader activePath="/venuescanner" venueRole="staff" />
      <main className="mx-auto flex w-full max-w-5xl flex-col gap-5 px-4 py-6 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-3">
          <h1 className="text-xl font-semibold">Scanner</h1>
          <SecondaryLink href="/venuedashboard">Back</SecondaryLink>
        </div>
        <div className="grid gap-5 lg:grid-cols-[1fr_0.65fr]">
          <ScannerFrame />
          <ScanOutcomes />
        </div>
      </main>
    </div>
  );
}
