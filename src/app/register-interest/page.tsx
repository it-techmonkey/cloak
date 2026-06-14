import RegisterInterestPage from "@/components/marketing/RegisterInterestPage";

type SearchParams = Promise<{ error?: string; success?: string }>;

export default async function Page({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  return (
    <RegisterInterestPage
      error={params.error}
      success={params.success === "1"}
    />
  );
}
