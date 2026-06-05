"use server";

import { redirect } from "next/navigation";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";

function safeNextPath(value: FormDataEntryValue | null) {
  const nextPath = typeof value === "string" ? value : "/";

  if (!nextPath.startsWith("/") || nextPath.startsWith("//")) {
    return "/";
  }

  return nextPath;
}

export async function signInWithPassword(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const nextPath = safeNextPath(formData.get("next"));

  if (!isSupabaseConfigured()) {
    redirect(`/login?next=${encodeURIComponent(nextPath)}&message=supabase-not-configured`);
  }

  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    redirect(`/login?next=${encodeURIComponent(nextPath)}&message=signin-failed`);
  }

  redirect(nextPath);
}
