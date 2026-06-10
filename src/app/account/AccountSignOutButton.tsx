"use client";

import { signOut } from "@/lib/auth/actions";

export default function AccountSignOutButton() {
  return (
    <form action={signOut}>
      <button
        className="rounded-lg border border-line bg-white px-3 py-1.5 text-sm font-medium text-muted transition hover:border-foreground/20 hover:text-foreground"
        type="submit"
      >
        Sign out
      </button>
    </form>
  );
}
