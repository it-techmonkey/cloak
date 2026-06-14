import type { ReactNode } from "react";

export type StatusTone = "blue" | "green" | "warning" | "danger" | "neutral";

const toneStyles: Record<StatusTone, string> = {
  blue: "bg-zinc-900 text-white ring-zinc-700",
  green: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  warning: "bg-amber-50 text-amber-700 ring-amber-200",
  danger: "bg-red-50 text-red-700 ring-red-200",
  neutral: "bg-zinc-100 text-zinc-600 ring-zinc-200",
};

export default function StatusPill({
  children,
  tone = "neutral",
}: {
  children: ReactNode;
  tone?: StatusTone;
}) {
  return (
    <span
      className={`inline-flex w-fit items-center rounded-full px-2.5 py-1 text-xs font-medium ring-1 ${toneStyles[tone]}`}
    >
      {children}
    </span>
  );
}
