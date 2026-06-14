import Link from "next/link";
import { submitLeadForm } from "@/app/register-interest/actions";

const input =
  "w-full rounded-lg border border-line bg-white px-3 py-2.5 text-sm text-foreground outline-none transition placeholder:text-zinc-400 focus:border-foreground/40 focus:ring-2 focus:ring-foreground/8";

export default function RegisterInterestPage({
  error,
  success,
}: {
  error?: string;
  success?: boolean;
}) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Slim header */}
      <header className="border-b border-line bg-white/95 backdrop-blur">
        <div className="mx-auto flex h-14 w-full max-w-4xl items-center justify-between gap-4 px-4 sm:px-6">
          <Link className="flex items-center gap-2.5" href="/">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-foreground text-xs font-bold text-white">CL</span>
            <span className="text-sm font-semibold text-foreground">Cloak</span>
          </Link>
          <Link className="text-sm font-medium text-muted hover:text-foreground" href="/">
            ← Back to home
          </Link>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-xl flex-col gap-6 px-4 py-12 sm:px-6">
        <div>
          <p className="text-sm font-semibold uppercase tracking-widest text-muted">Contact us</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-foreground">Register your interest</h1>
          <p className="mt-2 text-sm leading-6 text-muted">
            Tell us about your venue and we will get back to you within one business day.
          </p>
        </div>

        {success ? (
          <div className="flex flex-col items-center gap-4 rounded-xl border border-emerald-200 bg-emerald-50 px-6 py-10 text-center">
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-2xl">✓</span>
            <div>
              <p className="font-semibold text-emerald-800">Message received</p>
              <p className="mt-1 text-sm text-emerald-700">
                We will be in touch soon. In the meantime, you can{" "}
                <Link className="font-medium underline" href="/venuesignup">
                  register your venue directly
                </Link>
                .
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
                <label className="grid gap-1.5 text-sm font-medium text-foreground">
                  Venue name <span className="text-red-500">*</span>
                  <input
                    className={input}
                    name="venueName"
                    placeholder="e.g. The Grand Ballroom"
                    required
                    type="text"
                  />
                </label>
                <label className="grid gap-1.5 text-sm font-medium text-foreground">
                  Your name <span className="text-red-500">*</span>
                  <input
                    className={input}
                    name="contactName"
                    placeholder="Full name"
                    required
                    type="text"
                  />
                </label>
                <label className="grid gap-1.5 text-sm font-medium text-foreground">
                  Contact email <span className="text-red-500">*</span>
                  <input
                    className={input}
                    name="email"
                    placeholder="you@venue.com"
                    required
                    type="email"
                  />
                </label>
                <label className="grid gap-1.5 text-sm font-medium text-foreground">
                  Typical capacity
                  <input
                    className={input}
                    name="capacity"
                    placeholder="e.g. 200 items"
                    type="text"
                  />
                </label>
              </div>
              <label className="grid gap-1.5 text-sm font-medium text-foreground">
                Message
                <textarea
                  className={`${input} min-h-24 resize-none`}
                  name="message"
                  placeholder="Tell us about your setup, events, or any questions…"
                />
              </label>
              <button
                className="w-full rounded-xl bg-foreground py-3 text-sm font-semibold text-white transition hover:opacity-90"
                type="submit"
              >
                Send message
              </button>
              <p className="text-center text-xs text-muted">
                Or skip this and{" "}
                <Link className="font-medium text-foreground hover:underline" href="/venuesignup">
                  register your venue directly
                </Link>
                .
              </p>
            </form>
          </div>
        )}
      </main>
    </div>
  );
}

