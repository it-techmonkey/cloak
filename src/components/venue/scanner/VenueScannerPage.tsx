import Link from "next/link";
import AppHeader from "@/components/shared/AppHeader";
import ScannerFrame from "./ScannerFrame";

export default function VenueScannerPage() {
  return (
    <div className="min-h-screen bg-background">
      <AppHeader activePath="/venuescanner" venueRole="staff" />
      <main className="mx-auto w-full max-w-5xl px-4 pb-12 pt-6 sm:px-6 lg:px-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-muted">Scanner</p>
            <h1 className="mt-1 text-xl font-semibold text-foreground">Verify ticket</h1>
          </div>
          <div className="flex items-center gap-2">
            <Link
              className="rounded-lg border border-line bg-white px-4 py-2 text-sm font-medium text-muted transition hover:border-foreground/20 hover:text-foreground"
              href="/smsbackup"
              title="Find a ticket when the guest has no phone or code"
            >
              Phone lookup
            </Link>
            <Link
              className="rounded-lg border border-line bg-white px-4 py-2 text-sm font-medium text-muted transition hover:border-foreground/20 hover:text-foreground"
              href="/venuedashboard"
            >
              ← Dashboard
            </Link>
          </div>
        </div>
        <ScannerFrame />
      </main>
    </div>
  );
}
