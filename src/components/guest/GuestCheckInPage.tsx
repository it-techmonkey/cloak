import GuestFormPreview from "./GuestFormPreview";
import QrValidityRules from "./QrValidityRules";
import type { PublicVenueOption } from "@/lib/tickets";

export default function GuestCheckInPage({
  error,
  venues,
}: {
  error?: string;
  venues: PublicVenueOption[];
}) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <main className="mx-auto flex min-h-screen w-full max-w-4xl flex-col items-center gap-5 px-4 py-8 sm:px-6">
        {/* Logo */}
        <div className="flex flex-col items-center text-center">
          <div className="grid h-12 w-12 place-items-center rounded-2xl bg-foreground text-sm font-bold text-white shadow">
            CL
          </div>
          <h1 className="mt-3 text-2xl font-semibold text-foreground">Cloak</h1>
          <p className="mt-0.5 text-sm text-muted">Digital cloakroom</p>
        </div>

        {/* Content — form on top on mobile, side-by-side on lg */}
        <div className="grid w-full items-start gap-5 lg:grid-cols-[1fr_0.9fr]">
          <GuestFormPreview error={error} venues={venues} />
          <QrValidityRules />
        </div>
      </main>
    </div>
  );
}
