import BookADemoPage from "@/components/marketing/BookADemoPage";

export const metadata = {
  title: "Book a Demo | Cloak",
  description: "Book a 20-minute demo call to see how Cloak can upgrade your cloakroom operations.",
};

type SearchParams = Promise<{ error?: string; success?: string }>;

export default async function Page({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  return (
    <BookADemoPage
      error={params.error}
      success={params.success === "1"}
    />
  );
}
