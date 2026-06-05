export default function FeatureCard({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <article className="rounded-lg border border-line bg-panel p-5 shadow-sm">
      <h2 className="text-base font-semibold text-foreground">{title}</h2>
      <p className="mt-2 text-sm leading-6 text-muted">{description}</p>
    </article>
  );
}
