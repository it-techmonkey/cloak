import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import type { Database } from "./database.types";
import { getSupabaseSecretEnv } from "./env";

export function isSupabaseAdminConfigured() {
  return getSupabaseSecretEnv().isConfigured;
}

export function createAdminClient() {
  const env = getSupabaseSecretEnv();

  if (!env.url || !env.key) {
    throw new Error("Missing Supabase secret environment variables.");
  }

  return createSupabaseClient<Database>(env.url, env.key, {
    auth: {
      persistSession: false,
    },
  });
}
