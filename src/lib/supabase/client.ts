"use client";

import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "./database.types";
import { getSupabaseEnv } from "./env";

export function createClient() {
  const env = getSupabaseEnv();

  if (!env.url || !env.key) {
    throw new Error("Missing Supabase browser environment variables.");
  }

  return createBrowserClient<Database>(env.url, env.key);
}
