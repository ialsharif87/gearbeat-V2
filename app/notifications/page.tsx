import Link from "next/link";
import { redirect } from "next/navigation";
import NotificationsPanel from "../../components/notifications-panel";
import { createClient } from "../../lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function NotificationsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <main className="gb-dashboard-page">
      <section className="gb-dashboard-header">
        <div>
          <p className="gb-eyebrow">GearBeat</p>
          <h1>Notifications</h1>
          <p className="gb-muted-text">
            Review important updates about bookings, marketplace orders,
            products, payments, and account activity.
          </p>
        </div>

        <Link href="/" className="gb-button gb-button-secondary">
          Back home
        </Link>
      </section>

      <NotificationsPanel />
    </main>
  );
}
