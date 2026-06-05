import type { ReactNode } from "react";

export type StatusTone = "blue" | "green" | "warning" | "danger" | "neutral";

const toneStyles: Record<StatusTone, string> = {
  blue: "bg-blue-50 text-blue-700 ring-blue-200",
  green: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  warning: "bg-amber-50 text-amber-700 ring-amber-200",
  danger: "bg-red-50 text-red-700 ring-red-200",
  neutral: "bg-slate-100 text-slate-700 ring-slate-200",
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
