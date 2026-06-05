import { signInWithPassword } from "@/app/login/actions";
import Panel from "@/components/shared/Panel";
import StatusPill from "@/components/shared/StatusPill";

export default function LoginPage({
  message,
  nextPath,
}: {
  message?: string;
  nextPath: string;
}) {
  return (
    <div className="min-h-screen bg-[#eef3fa] text-foreground">
      <main className="mx-auto flex min-h-screen w-full max-w-md flex-col justify-center px-4 py-8">
        <div className="mb-6 text-center">
          <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-brand to-brand-dark text-lg font-semibold text-white shadow-lg">
            CL
          </div>
          <h1 className="mt-4 text-3xl font-semibold">Sign in</h1>
          <p className="mt-2 text-sm text-muted">Access your Cloak operations workspace.</p>
        </div>

        <Panel title="Account sign in">
          <form action={signInWithPassword} className="grid gap-4">
            <input name="next" type="hidden" value={nextPath} />
            <label className="grid gap-2 text-sm font-medium text-foreground">
              Email
              <input
                className="rounded-lg border border-line bg-white px-3 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-brand focus:ring-2 focus:ring-brand/15"
                name="email"
                placeholder="you@example.com"
                required
                type="email"
              />
            </label>
            <label className="grid gap-2 text-sm font-medium text-foreground">
              Password
              <input
                className="rounded-lg border border-line bg-white px-3 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-brand focus:ring-2 focus:ring-brand/15"
                name="password"
                placeholder="Enter your password"
                required
                type="password"
              />
            </label>
            <button
              className="rounded-lg bg-gradient-to-r from-brand to-brand-dark px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:opacity-95"
              type="submit"
            >
              Sign in securely
            </button>
            {message ? <StatusPill tone="blue">{message}</StatusPill> : null}
          </form>
        </Panel>
      </main>
    </div>
  );
}
