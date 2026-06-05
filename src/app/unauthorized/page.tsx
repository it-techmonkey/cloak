import AuthStatePage from "@/components/auth/AuthStatePage";

export default function Page() {
  return (
    <AuthStatePage
      title="You do not have access"
      description="This page is protected by role-based access. Use an approved venue staff, venue manager, or platform admin account."
    />
  );
}
