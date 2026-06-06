import Link from "next/link";
import AppHeader from "@/components/shared/AppHeader";
import ScannerFrame from "./ScannerFrame";

export default function VenueScannerPage() {
  return (
    <div className="min-h-screen bg-night text-white">
      <AppHeader activePath="/venuescanner" venueRole="staff" />
      <main className="mx-auto w-full max-w-5xl px-4 pb-12 pt-6 sm:px-6 lg:px-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-white/30">
              Scanner
            </p>
            <h1 className="mt-1 text-xl font-semibold">Verify ticket</h1>
          </div>
          <Link
            className="rounded-lg border border-white/10 px-4 py-2 text-sm font-medium text-white/50 transition hover:border-white/20 hover:text-white/80"
            href="/venuedashboard"
          >
            ← Dashboard
          </Link>
        </div>
        <ScannerFrame />
      </main>
    </div>
  );
}
