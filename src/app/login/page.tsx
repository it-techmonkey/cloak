import LoginPage from "@/components/auth/LoginPage";

type SearchParams = Promise<{
  message?: string | string[];
  next?: string | string[];
}>;

const messages: Record<string, string> = {
  "signin-failed": "The email or password you entered is incorrect.",
  "supabase-not-configured": "Supabase environment variables are not configured yet.",
};

function getParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function safeNextPath(value: string | undefined) {
  if (!value || !value.startsWith("/") || value.startsWith("//")) {
    return "/";
  }

  return value;
}

export default async function Page({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const messageKey = getParam(params.message);

  return (
    <LoginPage
      message={messageKey ? messages[messageKey] : undefined}
      nextPath={safeNextPath(getParam(params.next))}
    />
  );
}
