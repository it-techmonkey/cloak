const steps = [
  {
    title: "Choose your venue",
    description: "Select the approved cloakroom location where your items will be stored.",
  },
  {
    title: "Create a QR pass",
    description: "Add your contact details and receive a venue-bound QR with a matching fallback code.",
  },
  {
    title: "Confirm at the counter",
    description: "Staff verifies the pass, records your item details, and activates storage.",
  },
  {
    title: "Scan to collect",
    description: "Return to the same counter and scan again to complete checkout.",
  },
];

const trustItems = [
  "Venue-bound passes help prevent wrong-location collection.",
  "Fallback codes keep the flow moving when a camera cannot read the QR.",
  "Counter confirmation creates a clear storage and collection record.",
];

export default function WorkflowHighlights() {
  return (
    <div className="bg-background">
      <section id="how-it-works" className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="max-w-2xl">
          <p className="text-sm font-semibold text-brand">For guests</p>
          <h2 className="mt-2 text-3xl font-semibold tracking-normal text-foreground">
            A simple pass from drop-off to pickup.
          </h2>
          <p className="mt-3 text-sm leading-6 text-muted">
            Cloak keeps the guest flow short while giving venue staff the checks they need at the counter.
          </p>
        </div>
        <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {steps.map((step, index) => (
            <article className="rounded-lg border border-line bg-white p-5 shadow-sm" key={step.title}>
              <span className="grid h-8 w-8 place-items-center rounded-full bg-slate-100 text-sm font-semibold text-foreground">
                {index + 1}
              </span>
              <h3 className="mt-5 text-base font-semibold text-foreground">{step.title}</h3>
              <p className="mt-2 text-sm leading-6 text-muted">{step.description}</p>
            </article>
          ))}
        </div>
      </section>

      <section id="safety" className="bg-white">
        <div className="mx-auto grid w-full max-w-7xl gap-8 px-4 py-12 sm:px-6 lg:grid-cols-[0.85fr_1.15fr] lg:px-8">
          <div>
            <p className="text-sm font-semibold text-brand">Built for busy counters</p>
            <h2 className="mt-2 text-3xl font-semibold tracking-normal text-foreground">
              Clear checks without paper tickets.
            </h2>
          </div>
          <div className="grid gap-3">
            {trustItems.map((item) => (
              <div className="rounded-lg border border-line bg-slate-50 px-4 py-3 text-sm leading-6 text-muted" key={item}>
                {item}
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
