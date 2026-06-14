export default function FieldPreview({
  label,
  value,
  wide,
}: {
  label: string;
  value: string;
  wide?: boolean;
}) {
  return (
    <label className={wide ? "sm:col-span-2" : undefined}>
      <span className="text-sm font-medium text-foreground">{label}</span>
      <span className="mt-2 block rounded-md border border-line bg-zinc-50 px-3 py-2.5 text-sm text-muted">
        {value}
      </span>
    </label>
  );
}

