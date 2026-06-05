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
    <div className="min-h-screen bg-[#eef3fa] text-foreground">
      <main className="mx-auto flex min-h-screen w-full max-w-5xl flex-col items-center gap-5 px-4 py-7 sm:px-6">
        <div className="flex flex-col items-center text-center">
          <div className="grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-brand to-brand-dark text-lg font-semibold text-white shadow-lg">
            CL
          </div>
          <h1 className="mt-4 text-3xl font-semibold text-foreground">Cloak</h1>
          <p className="mt-1 text-sm text-muted">Digital Cloakroom</p>
        </div>

        <div className="grid w-full items-start gap-5 lg:grid-cols-[0.9fr_1.1fr]">
          <GuestFormPreview error={error} venues={venues} />
          <QrValidityRules />
        </div>
      </main>
    </div>
  );
}
