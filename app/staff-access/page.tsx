import { redirect } from "next/navigation";

export default async function StaffAccessPage({
  searchParams
}: {
  searchParams?: Promise<{ lang?: string }>;
}) {
  const params = searchParams ? await searchParams : {};
  const lang = params?.lang === "ar" ? "ar" : "en";

  redirect(`/login?next=/admin&lang=${lang}`);
}
