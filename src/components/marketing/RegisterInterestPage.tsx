import Link from "next/link";
import { submitLeadForm } from "@/app/contact-us/actions";
import PublicHeader from "@/components/shared/PublicHeader";

const input =
  "w-full rounded-lg border border-line bg-white px-3 py-2.5 text-sm text-foreground outline-none transition placeholder:text-zinc-400 focus:border-foreground/40 focus:ring-2 focus:ring-foreground/8";

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="flex flex-col gap-1.5 text-sm font-medium text-foreground">
      <span>
        {label}
        {required && <span className="ml-0.5 text-red-500">*</span>}
      </span>
      {children}
    </label>
  );
}

export default function RegisterInterestPage({
  error,
  success,
}: {
  error?: string;
  success?: boolean;
}) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <PublicHeader />

      <main className="mx-auto flex w-full max-w-xl flex-col gap-6 px-4 py-12 sm:px-6">
        <div>
          <p className="text-sm font-semibold uppercase tracking-widest text-muted">Get in touch</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-foreground">Contact Us</h1>
          <p className="mt-2 text-sm leading-6 text-muted">
            Have a question or want to learn more? Drop us a message and we&apos;ll get back to you within one business day.
          </p>
        </div>

        {success ? (
          <div className="flex flex-col items-center gap-4 rounded-xl border border-emerald-200 bg-emerald-50 px-6 py-10 text-center">
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-2xl">✓</span>
            <div>
              <p className="font-semibold text-emerald-800">Message received</p>
              <p className="mt-1 text-sm text-emerald-700">
                Thanks for reaching out — we&apos;ll be in touch soon.
              </p>
            </div>
            <Link
              className="mt-2 rounded-lg bg-foreground px-5 py-2.5 text-sm font-semibold text-white transition hover:opacity-90"
              href="/"
            >
              Back to home
            </Link>
          </div>
        ) : (
          <div className="rounded-xl border border-line bg-panel p-6">
            {error && (
              <div className="mb-4 rounded-lg border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}
            <form action={submitLeadForm} className="grid gap-5">
              <div className="grid gap-5 sm:grid-cols-2">
                <Field label="Your name" required>
                  <input className={input} name="contactName" placeholder="Full name" required type="text" />
                </Field>
                <Field label="Email address" required>
                  <input className={input} name="email" placeholder="you@example.com" required type="email" />
                </Field>
                <Field label="Company / Venue name">
                  <input className={input} name="venueName" placeholder="e.g. The Grand Ballroom" type="text" />
                </Field>
                <Field label="Phone number">
                  <input className={input} name="capacity" placeholder="+44 7700 900000" type="tel" />
                </Field>
              </div>
              <Field label="Message" required>
                <textarea
                  className={`${input} min-h-32 resize-none`}
                  name="message"
                  placeholder="How can we help you?"
                  required
                />
              </Field>
              <button
                className="w-full rounded-xl bg-foreground py-3 text-sm font-semibold text-white transition hover:opacity-90"
                type="submit"
              >
                Send message
              </button>
            </form>
          </div>
        )}
      </main>
    </div>
  );
}
