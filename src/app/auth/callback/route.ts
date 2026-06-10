import { NextResponse, type NextRequest } from "next/server";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";
import { resolvePostLoginRedirect } from "@/lib/auth/resolve-redirect";

function safeNextPath(value: string | null): string {
  if (!value || !value.startsWith("/") || value.startsWith("//")) return "/";
  return value;
}

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const explicitNext = safeNextPath(requestUrl.searchParams.get("next"));

  if (code && isSupabaseConfigured()) {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error && data.user) {
      // Role-based redirect — admin → /masterdashboard, venue → /venuedashboard, customer → explicit next or /
      const destination = await resolvePostLoginRedirect(data.user.id, explicitNext);
      return NextResponse.redirect(new URL(destination, request.url));
    }
  }

  // Fallback — send to home with modal trigger if something went wrong
  return NextResponse.redirect(new URL(explicitNext, request.url));
}
