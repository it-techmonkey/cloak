"use client";

import { useAuth } from "@/components/auth/AuthProvider";

export default function AccountSignOutButton() {
  const { signOut } = useAuth();

  return (
    <button
      className="rounded-lg border border-line bg-white px-3 py-1.5 text-sm font-medium text-muted transition hover:border-foreground/20 hover:text-foreground"
      onClick={signOut}
      type="button"
    >
      Sign out
    </button>
  );
}
