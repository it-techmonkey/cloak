import { createVenueSignup } from "@/app/venuesignup/actions";
import Panel from "@/components/shared/Panel";
import SubmitButton from "@/components/shared/SubmitButton";
import UkAddressFields from "./UkAddressFields";

const inputClass =
  "w-full rounded-lg border border-line bg-white px-3 py-3 text-sm text-foreground outline-none transition placeholder:text-slate-400 focus:border-brand focus:ring-2 focus:ring-brand/15";

export default function VenueDetailsPreview({ error }: { error?: string }) {
  return (
    <Panel
      title="Venue details"
      description="Provide the operational details for platform review."
    >
      <form action={createVenueSignup} className="grid gap-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="grid gap-2 text-sm font-medium text-foreground">
            Venue name
            <input className={inputClass} name="venueName" placeholder="Venue name" required />
          </label>
          <label className="grid gap-2 text-sm font-medium text-foreground">
            Capacity
            <input className={inputClass} min={1} name="capacity" placeholder="100" required type="number" />
          </label>
          <UkAddressFields />
          <label className="grid gap-2 text-sm font-medium text-foreground">
            Manager email
            <input className={inputClass} name="contactEmail" placeholder="manager@example.com" required type="email" />
          </label>
          <label className="grid gap-2 text-sm font-medium text-foreground">
            Contact phone
            <input className={inputClass} name="contactPhone" placeholder="+44 20 0000 0000" required type="tel" />
          </label>
        </div>

        {error ? (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-sm font-medium text-red-700">
            {error}
          </p>
        ) : null}

        <SubmitButton>Continue</SubmitButton>
      </form>
    </Panel>
  );
}
