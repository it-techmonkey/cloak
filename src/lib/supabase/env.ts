export function getSupabaseEnv() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  return {
    isConfigured: Boolean(url && key),
    key,
    url,
  };
}

export function getSupabaseSecretEnv() {
  return {
    isConfigured: Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SECRET_KEY),
    key: process.env.SUPABASE_SECRET_KEY,
    url: process.env.NEXT_PUBLIC_SUPABASE_URL,
  };
}
