import { requireAdminLayoutAccess } from "@/lib/route-guards";
import { ManualOpsConsoleClient } from "./ManualOpsConsoleClient";

export const dynamic = "force-dynamic";

export default async function AdminManualOpsPage() {
  const { supabaseAdmin, user } = await requireAdminLayoutAccess();

  // 1. Fetch Studio Booking Review Queue (pending, payment_review, under_review)
  let studioBookings: any[] = [];
  try {
    const { data } = await supabaseAdmin
      .from("bookings")
      .select("*, studios(name)")
      .in("status", ["pending", "payment_review", "under_review"])
      .order("created_at", { ascending: false });
    studioBookings = data || [];
  } catch (e) {
    console.error("Failed to fetch studio bookings:", e);
  }

  // 2. Fetch Marketplace Order Review Queue (pending, pending_payment, payment_review, under_review)
  let marketplaceOrders: any[] = [];
  try {
    const { data } = await supabaseAdmin
      .from("marketplace_orders")
      .select("*, profiles!marketplace_orders_vendor_auth_user_id_fkey(full_name, email)")
      .in("status", ["pending", "pending_payment", "payment_review", "under_review"])
      .order("created_at", { ascending: false });
    marketplaceOrders = data || [];
  } catch (e) {
    console.error("Failed to fetch marketplace orders:", e);
  }

  // 3. Fetch Service Booking Review Queue
  let serviceBookings: any[] = [];
  try {
    const { data } = await supabaseAdmin
      .from("service_bookings")
      .select("*, service_listings(title)")
      .in("status", ["pending", "under_review"])
      .order("created_at", { ascending: false });
    serviceBookings = data || [];
  } catch (e) {
    console.error("Failed to fetch service bookings:", e);
  }

  // 4. Fetch Ticket Booking Review Queue
  let ticketBookings: any[] = [];
  try {
    const { data } = await supabaseAdmin
      .from("ticket_orders")
      .select("*, events(title)")
      .in("status", ["pending", "under_review"])
      .order("created_at", { ascending: false });
    ticketBookings = data || [];
  } catch (e) {
    console.error("Failed to fetch ticket bookings:", e);
  }

  // 5. Fetch Academy Lesson Review Queue (lessons or bookings under review)
  let academyLessons: any[] = [];
  try {
    const { data } = await supabaseAdmin
      .from("academy_lessons")
      .select("*, academy_instructors(profile_id)")
      .in("status", ["pending", "under_review"])
      .order("created_at", { ascending: false });
    academyLessons = data || [];
  } catch (e) {
    console.error("Failed to fetch academy lessons:", e);
  }

  let academyBookings: any[] = [];
  try {
    const { data } = await supabaseAdmin
      .from("academy_bookings")
      .select("*, academy_lessons(title)")
      .in("status", ["pending", "under_review"])
      .order("created_at", { ascending: false });
    academyBookings = data || [];
  } catch (e) {
    console.error("Failed to fetch academy bookings:", e);
  }

  // 6. Fetch Manual Payment Operations Logs
  let manualOperations: any[] = [];
  try {
    const { data } = await supabaseAdmin
      .from("manual_operations")
      .select("*")
      .order("created_at", { ascending: false });
    manualOperations = data || [];
  } catch (e) {
    console.error("Failed to fetch manual operations:", e);
  }

  // 7. Fetch Refund/Cancellation Review Status
  // Bookings or orders in cancelled/refunded/failed state
  let refundStudioBookings: any[] = [];
  try {
    const { data } = await supabaseAdmin
      .from("bookings")
      .select("*, studios(name)")
      .in("status", ["cancelled", "refunded", "failed", "disputed"])
      .order("created_at", { ascending: false });
    refundStudioBookings = data || [];
  } catch (e) {
    console.error("Failed to fetch refund studio bookings:", e);
  }

  let refundMarketplaceOrders: any[] = [];
  try {
    const { data } = await supabaseAdmin
      .from("marketplace_orders")
      .select("*, profiles!marketplace_orders_vendor_auth_user_id_fkey(full_name, email)")
      .in("status", ["cancelled", "refunded", "failed", "disputed"])
      .order("created_at", { ascending: false });
    refundMarketplaceOrders = data || [];
  } catch (e) {
    console.error("Failed to fetch refund marketplace orders:", e);
  }

  // 8. Fetch Founder Self-Test Blocker List (critical or high issues reported)
  let founderTestIssues: any[] = [];
  try {
    const { data } = await supabaseAdmin
      .from("founder_test_issues")
      .select("*")
      .in("status", ["pending", "under_review"])
      .order("created_at", { ascending: false });
    founderTestIssues = data || [];
  } catch (e) {
    console.error("Failed to fetch founder test issues:", e);
  }

  return (
    <ManualOpsConsoleClient
      adminEmail={user?.email || "Founder"}
      studioBookings={studioBookings}
      marketplaceOrders={marketplaceOrders}
      serviceBookings={serviceBookings}
      ticketBookings={ticketBookings}
      academyLessons={academyLessons}
      academyBookings={academyBookings}
      manualOperations={manualOperations}
      refundStudioBookings={refundStudioBookings}
      refundMarketplaceOrders={refundMarketplaceOrders}
      founderTestIssues={founderTestIssues}
    />
  );
}
