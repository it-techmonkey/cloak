"use client";

import Link from "next/link";
import { useAuth } from "./AuthProvider";

export default function AuthButton({ className }: { className?: string }) {
  const { user, loading, openAuthModal } = useAuth();

  if (loading) return null;

  if (user) {
    const initials = (user.user_metadata?.full_name as string | undefined)
      ?.split(" ").map((w: string) => w[0]).slice(0, 2).join("").toUpperCase()
      ?? user.email?.[0]?.toUpperCase()
      ?? "?";

    return (
      <Link
        className={`flex items-center gap-2 rounded-lg border border-line bg-white px-2.5 py-1.5 text-sm font-medium text-foreground transition hover:bg-slate-50 ${className ?? ""}`}
        href="/account"
      >
        <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-foreground text-[10px] font-bold text-white">
          {initials}
        </span>
        <span className="hidden sm:block">My account</span>
      </Link>
    );
  }

  return (
    <button
      className={`rounded-lg border border-line bg-white px-3 py-1.5 text-sm font-medium text-foreground transition hover:bg-slate-50 ${className ?? ""}`}
      onClick={() => openAuthModal("signin")}
      type="button"
    >
      Sign in
    </button>
  );
}
