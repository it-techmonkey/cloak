import Link from "next/link";
import { signInWithPassword } from "@/app/login/actions";
import Panel from "@/components/shared/Panel";
import StatusPill from "@/components/shared/StatusPill";
import SubmitButton from "@/components/shared/SubmitButton";

export default function LoginPage({
  message,
  nextPath,
}: {
  message?: string;
  nextPath: string;
}) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <main className="mx-auto flex min-h-screen w-full max-w-md flex-col justify-center px-4 py-8">
        <div className="mb-6 text-center">
          <Link
            className="mb-6 inline-flex items-center gap-1 text-sm text-muted hover:text-foreground"
            href="/"
          >
            ← Back to home
          </Link>
          <div className="mx-auto mt-4 grid h-12 w-12 place-items-center rounded-2xl bg-foreground text-sm font-bold text-white shadow">
            CL
          </div>
          <h1 className="mt-4 text-3xl font-semibold">Sign in</h1>
          <p className="mt-2 text-sm text-muted">
            Sign in to access your venue operations workspace.
          </p>
        </div>

        <Panel title="Staff and manager sign in">
          <form action={signInWithPassword} className="grid gap-4">
            <input name="next" type="hidden" value={nextPath} />
            <label className="grid gap-2 text-sm font-medium text-foreground">
              Email
              <input
                className="rounded-lg border border-line bg-white px-3 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-foreground/30 focus:ring-2 focus:ring-foreground/10"
                name="email"
                placeholder="you@example.com"
                required
                type="email"
              />
            </label>
            <label className="grid gap-2 text-sm font-medium text-foreground">
              Password
              <input
                className="rounded-lg border border-line bg-white px-3 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-foreground/30 focus:ring-2 focus:ring-foreground/10"
                name="password"
                placeholder="Enter your password"
                required
                type="password"
              />
            </label>
            <SubmitButton>Sign in</SubmitButton>
            {message ? (
              <p className="rounded-lg bg-red-50 px-3 py-2 text-center text-sm text-red-700">
                {message === "signin-failed"
                  ? "Incorrect email or password."
                  : "Sign in is temporarily unavailable."}
              </p>
            ) : null}
          </form>
        </Panel>
      </main>
    </div>
  );
}
