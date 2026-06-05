const steps = [
  {
    title: "Choose your venue",
    description:
      "Select the approved cloakroom location where your belongings will be stored.",
  },
  {
    title: "Create a QR pass",
    description:
      "Enter your contact details and receive a venue-bound QR code with a matching fallback code.",
  },
  {
    title: "Hand over at the counter",
    description:
      "Staff verify your pass, record item details, assign storage, and activate the ticket.",
  },
  {
    title: "Scan to collect",
    description:
      "Return to the same counter, scan your pass, and staff confirm the handover to close the ticket.",
  },
];

const trustItems = [
  {
    heading: "Venue-bound passes",
    body: "Each pass is cryptographically tied to one venue, preventing collection at the wrong location.",
  },
  {
    heading: "Fallback codes keep queues moving",
    body: "Every QR pass has a plain-text fallback code — staff can enter it manually if the camera struggles.",
  },
  {
    heading: "A clear record at every step",
    body: "Staff log item type, count, and storage location at drop-off, creating an auditable trail from start to finish.",
  },
];

export default function WorkflowHighlights() {
  return (
    <div className="bg-background">
      <section id="how-it-works" className="mx-auto w-full max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="max-w-2xl">
          <p className="text-sm font-semibold text-brand">For guests</p>
          <h2 className="mt-2 text-3xl font-semibold tracking-tight text-foreground">
            Drop-off to pick-up in four steps.
          </h2>
          <p className="mt-3 text-sm leading-6 text-muted">
            A short, paper-free flow designed around real venue counter operations.
          </p>
        </div>
        <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {steps.map((step, index) => (
            <article
              className="rounded-lg border border-line bg-white p-5 shadow-sm"
              key={step.title}
            >
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
        <div className="mx-auto grid w-full max-w-7xl gap-8 px-4 py-14 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:px-8">
          <div>
            <p className="text-sm font-semibold text-brand">Built for busy counters</p>
            <h2 className="mt-2 text-3xl font-semibold tracking-tight text-foreground">
              Fewer disputes. No lost tickets.
            </h2>
            <p className="mt-3 text-sm leading-6 text-muted">
              Every design decision in Cloak starts with one question: what makes a cloakroom counter run smoothly under pressure?
            </p>
          </div>
          <div className="grid gap-3">
            {trustItems.map((item) => (
              <div
                className="rounded-lg border border-line bg-slate-50 px-4 py-4"
                key={item.heading}
              >
                <p className="text-sm font-semibold text-foreground">{item.heading}</p>
                <p className="mt-1.5 text-sm leading-6 text-muted">{item.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
