import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import type { Database } from "./database.types";
import { getSupabaseEnv } from "./env";

export function isSupabaseConfigured() {
  return getSupabaseEnv().isConfigured;
}

export async function createClient() {
  const env = getSupabaseEnv();

  if (!env.url || !env.key) {
    throw new Error("Missing Supabase server environment variables.");
  }

  const cookieStore = await cookies();

  return createServerClient<Database>(env.url, env.key, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        } catch {
          // Server Components cannot always write cookies; src/proxy.ts refreshes sessions.
        }
      },
    },
  });
}
