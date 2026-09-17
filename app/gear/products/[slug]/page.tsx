import { redirect } from "next/navigation";

export default async function LegacyGearProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  redirect(`/marketplace/products/${slug}`);
}
