import { SecondaryLink } from "@/components/shared/ButtonLink";
import Panel from "@/components/shared/Panel";
import StatusPill from "@/components/shared/StatusPill";

export default function AuthStatePage({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <main className="mx-auto flex min-h-screen w-full max-w-xl flex-col justify-center px-4 py-8">
        <Panel>
          <div className="flex flex-col items-start gap-4">
            <StatusPill tone="warning">Auth setup required</StatusPill>
            <div>
              <h1 className="text-2xl font-semibold text-foreground">{title}</h1>
              <p className="mt-2 text-sm leading-6 text-muted">{description}</p>
            </div>
            <SecondaryLink href="/">Back home</SecondaryLink>
          </div>
        </Panel>
      </main>
    </div>
  );
}
